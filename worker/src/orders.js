// Worker v2: recibe el pedido del formulario de ASTERIA y lo reenvia a Telegram.
// El token del bot vive solo aqui (secret de Cloudflare), nunca en el sitio publico.

import { calcularPrecio, getCharms, getPrecios, getStock } from "./catalog.js";

// Limite de tasa simple por IP usando el mismo KV de pedidos (prefijo "rl:").
// No es perfectamente atomico bajo carga simultanea, pero para el trafico de
// esta tienda es mas que suficiente como segunda barrera junto con Turnstile.
async function rateLimit(kv, key, limit, windowSeconds) {
  if (!kv) return true; // si no hay KV disponible, no bloqueamos por esto
  const k = `rl:${key}`;
  let count = 0;
  try {
    const current = await kv.get(k);
    count = current ? parseInt(current, 10) || 0 : 0;
  } catch {
    return true; // KV con problemas: no bloqueamos al usuario por esto
  }
  if (count >= limit) return false;
  try {
    await kv.put(k, String(count + 1), { expirationTtl: windowSeconds });
  } catch {
    // si no se pudo guardar el contador, dejamos pasar de todas formas
  }
  return true;
}

// Eventos del embudo del formulario: contador diario por evento, sin datos
// personales (ni IP, ni IG) -- solo cuantas veces paso cada cosa cada dia.
const FUNNEL_EVENTS = ["form_open", "step2", "step3", "submit"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function logEvent(kv, eventName) {
  if (!kv || !FUNNEL_EVENTS.includes(eventName)) return;
  const key = `stat:${todayISO()}:${eventName}`;
  try {
    const current = await kv.get(key);
    const count = current ? parseInt(current, 10) || 0 : 0;
    await kv.put(key, String(count + 1));
  } catch {
    // metrica perdida no es grave, no interrumpimos nada por esto
  }
}

async function renderFunnelSummary(kv, days) {
  const totals = Object.fromEntries(FUNNEL_EVENTS.map((e) => [e, 0]));
  const d = new Date();
  for (let i = 0; i < days; i++) {
    const iso = d.toISOString().slice(0, 10);
    for (const ev of FUNNEL_EVENTS) {
      const v = await kv.get(`stat:${iso}:${ev}`);
      if (v) totals[ev] += parseInt(v, 10) || 0;
    }
    d.setDate(d.getDate() - 1);
  }
  const pct = (n, base) => (base > 0 ? Math.round((n / base) * 100) : 0);
  const rows = [
    ["Abrieron el formulario", totals.form_open, 100],
    ["Llegaron a paso 2 (estilo)", totals.step2, pct(totals.step2, totals.form_open)],
    ["Llegaron a paso 3 (diseño)", totals.step3, pct(totals.step3, totals.form_open)],
    ["Enviaron el pedido", totals.submit, pct(totals.submit, totals.form_open)],
  ];
  return `
    <h2>Embudo del formulario (${days} dias)</h2>
    <table>
      <tr><th>Paso</th><th>Personas</th><th>% vs. abrieron el form</th></tr>
      ${rows.map(([label, n, p]) => `<tr><td>${escapeHtml(label)}</td><td>${n}</td><td>${p}%</td></tr>`).join("\n")}
    </table>`;
}

function corsHeaders(origin, allowedOrigins) {
  const list = (allowedOrigins || "").split(",").map((s) => s.trim()).filter(Boolean);
  const allow = list.includes(origin) ? origin : list[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Consulta no oficial de Instagram: no requiere login para perfiles publicos.
// Si algo falla o Instagram nos limita, regresamos null (inconcluso) en vez de
// arriesgarnos a bloquear a un cliente real.
async function checkInstagramExists(username) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          "x-ig-app-id": "936619743392459",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
          Accept: "*/*",
        },
        signal: ctrl.signal,
      }
    );
    clearTimeout(t);
    if (res.status === 404) return false;
    if (!res.ok) return null;
    const data = await res.json();
    return !!(data && data.data && data.data.user);
  } catch {
    return null;
  }
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function buildMessage(o, precio, charmsCat) {
  const lines = ["🌟 <b>Nuevo pedido ASTERIA</b>"];
  if (o.orderId) lines.push(`<b>Folio:</b> ${escapeHtml(o.orderId)}`);
  lines.push("", `<b>Instagram:</b> @${escapeHtml(o.ig || "")}`);
  if (o.nombre) lines.push(`<b>Nombre:</b> ${escapeHtml(o.nombre)}`);
  lines.push(`<b>Estilo:</b> ${escapeHtml(o.style || "")}`);
  if (o.pasta) lines.push(`<b>Color de pasta:</b> ${escapeHtml(o.pasta)}`);
  lines.push(`<b>Modelo:</b> ${escapeHtml(o.modelo || "")}`);
  lines.push(`<b>Densidad:</b> ${escapeHtml(o.dens || "")}`);
  lines.push(`<b>Priorizar:</b> ${escapeHtml(o.prio || "Ninguna")}`);
  lines.push(`<b>No incluir:</b> ${escapeHtml(o.excl || "Ninguna")}`);

  const porId = new Map((charmsCat || []).map((c) => [c.id, c]));
  const pedidos = (Array.isArray(o.charms) ? o.charms : []).filter((c) => Number(c && c.qty) > 0);
  if (pedidos.length) {
    lines.push("", "<b>Charms:</b>");
    for (const item of pedidos) {
      const nombre = (porId.get(item.id) || {}).nombre || item.id;
      lines.push(`• ${escapeHtml(nombre)} x${Math.floor(Number(item.qty))}`);
    }
  }
  if (precio && precio.ok) {
    lines.push("", `<b>Total:</b> $${precio.total} ${escapeHtml(precio.moneda)}`);
  } else if (precio && precio.error) {
    lines.push("", `<b>Total:</b> por confirmar (${escapeHtml(precio.error)})`);
  }
  return lines.join("\n");
}

async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json();
  return !!data.success;
}

async function sendToChat(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.log("telegram_error", chatId, res.status, body, "token_len", (token || "").length);
  }
  return res.ok;
}

// Respaldo del pedido en KV: para que un fallo de Telegram (rate limit, chat_id
// invalido, caida del servicio) nunca signifique perder el pedido por completo.
async function saveOrderBackup(kv, order, ip, telegramOk, precio) {
  if (!kv) return;
  const receivedAt = new Date().toISOString();
  const record = {
    orderId: order.orderId || null,
    ig: order.ig || "",
    nombre: order.nombre || "",
    style: order.style || "",
    pasta: order.pasta || "",
    modelo: order.modelo || "",
    dens: order.dens || "",
    prio: order.prio || "",
    excl: order.excl || "",
    charms: Array.isArray(order.charms) ? order.charms : [],
    // El total lo calcula el servidor (calcularPrecio). Si el catalogo aun no
    // tiene precios capturados, se guarda null en vez de un numero inventado.
    total: precio && precio.ok ? precio.total : null,
    desglose: precio && precio.ok ? precio.desglose : null,
    ip: ip || "",
    telegramOk,
    receivedAt,
  };
  const key = `order:${receivedAt}:${order.orderId || crypto.randomUUID()}`;
  try {
    await kv.put(key, JSON.stringify(record));
    // Indice secundario por folio, para que el cliente pueda consultar su
    // pedido directamente (GET /order?folio=...) sin exponer el listado completo.
    if (order.orderId) {
      await kv.put(`orderid:${order.orderId}`, JSON.stringify(record));
    }
  } catch (e) {
    console.log("kv_backup_error", e && e.message);
  }
}

// Lo que el cliente ve al consultar su folio: nada de IP, nada de datos de
// otros pedidos, solo el resumen de lo que el eligio.
function publicOrderView(record) {
  return {
    orderId: record.orderId,
    ig: record.ig,
    nombre: record.nombre,
    style: record.style,
    pasta: record.pasta,
    modelo: record.modelo,
    dens: record.dens,
    prio: record.prio,
    excl: record.excl,
    receivedAt: record.receivedAt,
    total: typeof record.total === "number" ? record.total : null,
    notificado: !!record.telegramOk,
  };
}

async function renderOrdersPage(kv) {
  const list = await kv.list({ prefix: "order:", limit: 500 });
  const records = await Promise.all(
    list.keys.map(async (k) => {
      const v = await kv.get(k.name);
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    })
  );
  const rows = records
    .filter(Boolean)
    .reverse() // mas reciente primero (las keys ordenan por fecha ascendente)
    .map(
      (o) => `<tr class="${o.telegramOk ? "" : "fail"}">
      <td>${escapeHtml(o.receivedAt.replace("T", " ").slice(0, 19))}</td>
      <td>${escapeHtml(o.orderId || "-")}</td>
      <td>@${escapeHtml(o.ig)}</td>
      <td>${escapeHtml(o.nombre || "-")}</td>
      <td>${escapeHtml(o.style)}${o.pasta ? " (" + escapeHtml(o.pasta) + ")" : ""}</td>
      <td>${escapeHtml(o.modelo)}</td>
      <td>${escapeHtml(o.dens)}</td>
      <td>${escapeHtml(o.prio || "Ninguna")}</td>
      <td>${escapeHtml(o.excl || "Ninguna")}</td>
      <td>${o.telegramOk ? "✅" : "⚠️ no llego a Telegram"}</td>
    </tr>`
    )
    .join("\n");

  const funnel = await renderFunnelSummary(kv, 7);

  return `<!doctype html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pedidos ASTERIA</title>
<meta name="robots" content="noindex">
<style>
  body{font-family:system-ui,sans-serif;background:#f2efe9;color:#050403;margin:0;padding:20px}
  h1{font-size:1.3rem;margin-bottom:4px}
  h2{font-size:1.05rem;margin:30px 0 10px}
  p.sub{color:#848079;margin-top:0;margin-bottom:18px;font-size:.9rem}
  table{border-collapse:collapse;width:100%;font-size:.82rem;background:#fff;margin-bottom:8px}
  th,td{border:1px solid #e0dbd0;padding:6px 8px;text-align:left;white-space:nowrap}
  th{background:#eae4d9;position:sticky;top:0}
  tr.fail{background:#fdeceb}
  .wrap{overflow-x:auto}
</style></head><body>
<h1>★ Pedidos ASTERIA — respaldo</h1>
<p class="sub">${records.filter(Boolean).length} pedidos guardados. Los marcados en rojo no llegaron a Telegram: contacta a ese cliente manualmente.</p>
${funnel}
<div class="wrap"><table>
<tr><th>Fecha</th><th>Folio</th><th>Instagram</th><th>Nombre</th><th>Estilo</th><th>Modelo</th><th>Densidad</th><th>Priorizar</th><th>No incluir</th><th>Telegram</th></tr>
${rows || '<tr><td colspan="10">Sin pedidos todavia.</td></tr>'}
</table></div>
</body></html>`;
}

export const ordersHandler = {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin, env.ALLOWED_ORIGINS);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method === "GET" && url.pathname === "/orders") {
      const key = url.searchParams.get("key") || "";
      if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
        return new Response("No autorizado", { status: 403 });
      }
      const html = await renderOrdersPage(env.ASTERIA_ORDERS);
      return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=UTF-8" } });
    }

    if (request.method === "GET" && url.pathname === "/order") {
      const ipOrder = request.headers.get("CF-Connecting-IP") || "unknown";
      const allowedLookup = await rateLimit(env.ASTERIA_ORDERS, `orderlookup:${ipOrder}`, 20, 60);
      if (!allowedLookup) {
        return new Response(JSON.stringify({ found: false, error: "rate_limited" }), {
          status: 429,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }
      const folio = (url.searchParams.get("folio") || "").trim().toUpperCase();
      if (!folio || !env.ASTERIA_ORDERS) {
        return new Response(JSON.stringify({ found: false }), {
          status: 200,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }
      const raw = await env.ASTERIA_ORDERS.get(`orderid:${folio}`);
      if (!raw) {
        return new Response(JSON.stringify({ found: false }), {
          status: 200,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }
      let record;
      try {
        record = JSON.parse(raw);
      } catch {
        return new Response(JSON.stringify({ found: false }), {
          status: 200,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ found: true, order: publicOrderView(record) }), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    if (request.method === "POST" && url.pathname === "/event") {
      const ipEvent = request.headers.get("CF-Connecting-IP") || "unknown";
      const allowedEvent = await rateLimit(env.ASTERIA_ORDERS, `event:${ipEvent}`, 40, 60);
      if (allowedEvent) {
        try {
          const body = await request.json();
          await logEvent(env.ASTERIA_ORDERS, body && body.event);
        } catch {
          // evento mal formado: lo ignoramos, no es critico
        }
      }
      // Siempre 204: es una metrica de fondo, nunca debe romper la experiencia del sitio.
      return new Response(null, { status: 204, headers });
    }

    if (request.method === "GET" && url.pathname === "/check-ig") {
      const ipCheck = request.headers.get("CF-Connecting-IP") || "unknown";
      const allowed = await rateLimit(env.ASTERIA_ORDERS, `checkig:${ipCheck}`, 20, 60);
      if (!allowed) {
        return new Response(JSON.stringify({ exists: null }), {
          status: 429,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }
      const username = (url.searchParams.get("u") || "").trim();
      const exists = username ? await checkInstagramExists(username) : null;
      return new Response(JSON.stringify({ exists }), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
        status: 405,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    let order;
    try {
      order = await request.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "bad_json" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    if (!order || !order.ig) {
      return new Response(JSON.stringify({ ok: false, error: "missing_fields" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const ipPost = request.headers.get("CF-Connecting-IP") || "unknown";
    const allowedToOrder = await rateLimit(env.ASTERIA_ORDERS, `order:${ipPost}`, 8, 600);
    if (!allowedToOrder) {
      return new Response(JSON.stringify({ ok: false, error: "rate_limited" }), {
        status: 429,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Honeypot: si un campo que ningun humano deberia llenar viene con algo, es un bot.
    // Respondemos "ok" para no delatar el filtro, pero nunca mandamos el mensaje.
    if (order.website) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Turnstile: verifica que quien envia sea humano.
    const human = await verifyTurnstile(env.TURNSTILE_SECRET, order.turnstileToken, ipPost);
    if (!human) {
      return new Response(JSON.stringify({ ok: false, error: "captcha_failed" }), {
        status: 403,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Precio: siempre recalculado aqui a partir del catalogo en KV. Lo que el
    // navegador haya mostrado no es autoridad y nunca se guarda tal cual.
    const kv = env.ASTERIA_ORDERS;
    const [charmsCat, preciosCat, stockCat] = await Promise.all([getCharms(kv), getPrecios(kv), getStock(kv)]);
    const precio = calcularPrecio(
      { style: order.style, dens: order.dens, modelo: order.modelo, charms: order.charms },
      { charms: charmsCat, precios: preciosCat, stock: stockCat }
    );

    const text = buildMessage(order, precio, charmsCat);
    const chatIds = (env.TELEGRAM_CHAT_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);

    const results = await Promise.all(chatIds.map((id) => sendToChat(env.TELEGRAM_TOKEN, id, text)));
    const allOk = results.every(Boolean);

    await saveOrderBackup(env.ASTERIA_ORDERS, order, ipPost, allOk, precio);

    return new Response(JSON.stringify({ ok: allOk, total: precio.ok ? precio.total : null }), {
      status: allOk ? 200 : 502,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  },
};
