// API de administracion (v2). Todo pasa por ADMIN_KEY.
// Nada de esto toca las rutas de produccion: vive en /admin/* y /panel.

import {
  KEY_CHARMS, KEY_PRECIOS, KEY_STOCK, KEY_FOTOS,
  ESTILOS, DENSIDADES, SECCIONES_FOTO,
  getCharms, getPrecios, getStock, getFotos, preciosVacios,
} from "./catalog.js";

export const MAX_IMG_BYTES = 800 * 1024; // tope acordado: 800 KB por imagen
const TIPOS_IMG = ["image/webp", "image/jpeg", "image/png"];

export function autorizado(request, url, env) {
  if (!env.ADMIN_KEY) return false;
  const key = url.searchParams.get("key") || request.headers.get("X-Admin-Key") || "";
  // Comparacion de tiempo constante para no filtrar la clave por tiempo de respuesta.
  if (key.length !== env.ADMIN_KEY.length) return false;
  let diff = 0;
  for (let i = 0; i < key.length; i++) diff |= key.charCodeAt(i) ^ env.ADMIN_KEY.charCodeAt(i);
  return diff === 0;
}

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "no-store", ...extra },
  });
}

const nuevoId = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const texto = (v, max = 80) => String(v ?? "").trim().slice(0, max);

function numeroOpcional(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

function entero(v, min = 0) {
  const n = Math.floor(Number(v));
  return isFinite(n) && n >= min ? n : min;
}

// ---------- charms ----------

function normalizaCharm(body, previo) {
  const nombre = texto(body.nombre, 60) || previo?.nombre || "";
  if (!nombre) return null;
  return {
    id: previo?.id || nuevoId("charm"),
    nombre,
    categoria: texto(body.categoria, 40) || previo?.categoria || "",
    precio: numeroOpcional(body.precio ?? previo?.precio),
    stock: entero(body.stock ?? previo?.stock ?? 0),
    imgId: body.imgId === null ? null : texto(body.imgId, 60) || previo?.imgId || null,
    activo: body.activo === undefined ? previo?.activo !== false : !!body.activo,
    creado: previo?.creado || new Date().toISOString(),
  };
}

export async function charmsCrud(kv, method, body, id) {
  const charms = await getCharms(kv);

  if (method === "GET") return json({ charms });

  if (method === "POST") {
    const charm = normalizaCharm(body || {}, null);
    if (!charm) return json({ ok: false, error: "nombre_requerido" }, 400);
    charms.push(charm);
    await kv.put(KEY_CHARMS, JSON.stringify(charms));
    return json({ ok: true, charm });
  }

  if (method === "PUT") {
    const i = charms.findIndex((c) => c.id === id);
    if (i === -1) return json({ ok: false, error: "no_encontrado" }, 404);
    charms[i] = normalizaCharm(body || {}, charms[i]);
    await kv.put(KEY_CHARMS, JSON.stringify(charms));
    return json({ ok: true, charm: charms[i] });
  }

  if (method === "DELETE") {
    const restantes = charms.filter((c) => c.id !== id);
    if (restantes.length === charms.length) return json({ ok: false, error: "no_encontrado" }, 404);
    await kv.put(KEY_CHARMS, JSON.stringify(restantes));
    return json({ ok: true });
  }

  return json({ ok: false, error: "metodo_no_permitido" }, 405);
}

// ---------- precios ----------

export async function preciosCrud(kv, method, body) {
  if (method === "GET") return json({ precios: await getPrecios(kv) });
  if (method !== "PUT") return json({ ok: false, error: "metodo_no_permitido" }, 405);

  const actual = await getPrecios(kv);
  const b = body || {};
  const precios = {
    moneda: "MXN",
    base: { ...actual.base },
    densidad: { ...actual.densidad },
    envio: b.envio === undefined ? actual.envio : numeroOpcional(b.envio),
    actualizado: new Date().toISOString(),
  };
  for (const e of ESTILOS) if (b.base && e in b.base) precios.base[e] = numeroOpcional(b.base[e]);
  for (const d of DENSIDADES) if (b.densidad && d in b.densidad) precios.densidad[d] = numeroOpcional(b.densidad[d]);

  await kv.put(KEY_PRECIOS, JSON.stringify({ ...preciosVacios(), ...precios }));
  return json({ ok: true, precios });
}

// ---------- stock de fundas ----------

export async function stockCrud(kv, method, body) {
  if (method === "GET") return json({ stock: await getStock(kv) });
  if (method !== "PUT") return json({ ok: false, error: "metodo_no_permitido" }, 405);

  const actual = await getStock(kv);
  const b = body || {};
  if (!ESTILOS.includes(b.estilo)) return json({ ok: false, error: "estilo_invalido" }, 400);
  const modelo = texto(b.modelo, 40);
  if (!modelo) return json({ ok: false, error: "modelo_requerido" }, 400);

  const siguiente = { ...actual, [b.estilo]: { ...(actual[b.estilo] || {}) } };
  if (b.cantidad === null || b.cantidad === "") {
    delete siguiente[b.estilo][modelo]; // sin registro = disponible
  } else {
    siguiente[b.estilo][modelo] = entero(b.cantidad);
  }
  await kv.put(KEY_STOCK, JSON.stringify(siguiente));
  return json({ ok: true, stock: siguiente });
}

// ---------- imagenes ----------

export async function subirImagen(kv, request) {
  const tipo = (request.headers.get("Content-Type") || "").split(";")[0].trim();
  if (!TIPOS_IMG.includes(tipo)) return json({ ok: false, error: "tipo_no_permitido", tipo }, 415);

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0) return json({ ok: false, error: "imagen_vacia" }, 400);
  if (bytes.byteLength > MAX_IMG_BYTES) {
    return json({ ok: false, error: "imagen_muy_grande", max: MAX_IMG_BYTES, bytes: bytes.byteLength }, 413);
  }

  const id = nuevoId("img");
  await kv.put(`img:${id}`, bytes, { metadata: { tipo, bytes: bytes.byteLength, subida: new Date().toISOString() } });
  return json({ ok: true, id, url: `/img/${id}`, bytes: bytes.byteLength });
}

export async function servirImagen(kv, id) {
  const limpio = String(id || "").replace(/[^a-zA-Z0-9_]/g, "");
  if (!limpio) return new Response("No encontrada", { status: 404 });
  const { value, metadata } = await kv.getWithMetadata(`img:${limpio}`, { type: "arrayBuffer" });
  if (!value) return new Response("No encontrada", { status: 404 });
  return new Response(value, {
    status: 200,
    headers: {
      "Content-Type": (metadata && metadata.tipo) || "image/webp",
      // Las imagenes son inmutables: cambiar una genera un id nuevo.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

// ---------- fotos por seccion ----------

export async function fotosCrud(kv, method, body, seccion) {
  if (!SECCIONES_FOTO.includes(seccion)) {
    return json({ ok: false, error: "seccion_invalida", validas: SECCIONES_FOTO }, 400);
  }
  if (method === "GET") return json({ seccion, fotos: await getFotos(kv, seccion) });
  if (method !== "PUT") return json({ ok: false, error: "metodo_no_permitido" }, 405);

  const lista = Array.isArray(body?.fotos)
    ? body.fotos.map((f) => texto(f, 60)).filter(Boolean).slice(0, 40)
    : [];
  await kv.put(KEY_FOTOS(seccion), JSON.stringify(lista));
  return json({ ok: true, seccion, fotos: lista });
}

// ---------- gastos ----------

export async function gastosCrud(kv, method, body, id) {
  if (method === "GET") {
    const list = await kv.list({ prefix: "expense:", limit: 1000 });
    const gastos = (
      await Promise.all(list.keys.map(async (k) => {
        try { return JSON.parse(await kv.get(k.name)); } catch { return null; }
      }))
    ).filter(Boolean).reverse();
    return json({ gastos });
  }

  if (method === "POST") {
    const b = body || {};
    const monto = numeroOpcional(b.monto);
    if (monto === null || monto === 0) return json({ ok: false, error: "monto_requerido" }, 400);
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(b.fecha || "") ? b.fecha : new Date().toISOString().slice(0, 10);
    const gasto = {
      id: nuevoId("gasto"),
      fecha,
      concepto: texto(b.concepto, 80) || "Sin concepto",
      categoria: texto(b.categoria, 40) || "General",
      monto,
      registrado: new Date().toISOString(),
    };
    await kv.put(`expense:${fecha}:${gasto.id}`, JSON.stringify(gasto));
    return json({ ok: true, gasto });
  }

  if (method === "DELETE") {
    const list = await kv.list({ prefix: "expense:", limit: 1000 });
    const clave = list.keys.find((k) => k.name.endsWith(`:${id}`));
    if (!clave) return json({ ok: false, error: "no_encontrado" }, 404);
    await kv.delete(clave.name);
    return json({ ok: true });
  }

  return json({ ok: false, error: "metodo_no_permitido" }, 405);
}

// ---------- rendimiento ----------
// Ingresos derivados de los pedidos guardados (campo `total`, que solo existe en
// pedidos v2). Un pedido viejo sin total cuenta como pedido, no como ingreso:
// preferimos un ingreso subestimado antes que un numero inventado.

export async function rendimiento(kv, desde, hasta) {
  const dentro = (iso) => (!desde || iso >= desde) && (!hasta || iso <= hasta);

  const pedidosList = await kv.list({ prefix: "order:", limit: 1000 });
  let ingresos = 0, pedidos = 0, pedidosSinPrecio = 0;
  for (const k of pedidosList.keys) {
    const iso = k.name.slice("order:".length, "order:".length + 10);
    if (!dentro(iso)) continue;
    let rec;
    try { rec = JSON.parse(await kv.get(k.name)); } catch { continue; }
    if (!rec) continue;
    pedidos++;
    if (typeof rec.total === "number" && isFinite(rec.total)) ingresos += rec.total;
    else pedidosSinPrecio++;
  }

  const gastosList = await kv.list({ prefix: "expense:", limit: 1000 });
  let gastos = 0;
  const porCategoria = {};
  for (const k of gastosList.keys) {
    const iso = k.name.slice("expense:".length, "expense:".length + 10);
    if (!dentro(iso)) continue;
    let g;
    try { g = JSON.parse(await kv.get(k.name)); } catch { continue; }
    if (!g) continue;
    gastos += g.monto || 0;
    porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + (g.monto || 0);
  }

  return {
    desde: desde || null,
    hasta: hasta || null,
    moneda: "MXN",
    pedidos,
    pedidosSinPrecio,
    ingresos: Math.round(ingresos * 100) / 100,
    gastos: Math.round(gastos * 100) / 100,
    utilidad: Math.round((ingresos - gastos) * 100) / 100,
    gastosPorCategoria: porCategoria,
  };
}
