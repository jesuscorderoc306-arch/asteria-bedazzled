// Worker ASTÉRIA v2 — router.
//
// Este worker es un SUPERCONJUNTO del de produccion (`asteria-orders`):
// mantiene tal cual las rutas que ya existen (POST /, /orders, /order, /event,
// /check-ig, delegadas a orders.js) y agrega la capa v2:
//
//   GET  /catalog                      publico  — charms, precios, stock, fotos
//   POST /precio                       publico  — total calculado en el servidor
//   GET  /img/:id                      publico  — imagen guardada en KV
//   GET  /panel                        panel (HTML; pide usuario y contrasena)
//   POST /admin/login | /admin/logout  sesion por cookie (ver sesion.js)
//   GET|POST|PUT|DELETE /admin/*       API protegida por sesion
//
// No se despliega sobre produccion: wrangler.toml de esta carpeta apunta a un
// worker y un KV distintos.

import { ordersHandler } from "./orders.js";
import { catalogoPublico, calcularPrecio, getCharms, getPrecios, getStock } from "./catalog.js";
import { quienEs, entrar, salir } from "./sesion.js";
import {
  json, pedidosCrud, charmsCrud, preciosCrud, stockCrud, fotosCrud,
  gastosCrud, rendimiento, subirImagen, servirImagen,
} from "./admin.js";
import { panelHtml } from "./panel.js";

function corsHeaders(origin, allowedOrigins) {
  const list = (allowedOrigins || "").split(",").map((s) => s.trim()).filter(Boolean);
  const allow = list.includes(origin) ? origin : list[0] || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function cuerpoJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function rutasAdmin(request, url, env, partes, usuario) {
  const kv = env.ASTERIA_ORDERS;
  const method = request.method;
  const seccion = partes[1] || "";
  const id = partes[2] || "";
  // La subida de imagen manda bytes crudos: su cuerpo lo lee subirImagen, no aqui
  // (un cuerpo solo se puede leer una vez).
  const esJson = (request.headers.get("Content-Type") || "").includes("application/json");
  const body = esJson && (method === "POST" || method === "PUT") ? await cuerpoJson(request) : null;

  switch (seccion) {
    case "yo":
      return json({ ok: true, usuario });
    case "pedidos":
      return pedidosCrud(kv, method, body, url);
    case "charms":
      return charmsCrud(kv, method, body, id);
    case "precios":
      return preciosCrud(kv, method, body);
    case "stock":
      return stockCrud(kv, method, body);
    case "fotos":
      return fotosCrud(kv, method, body, id);
    case "gastos":
      return gastosCrud(kv, method, body, id);
    case "rendimiento":
      return json(await rendimiento(kv, url.searchParams.get("desde"), url.searchParams.get("hasta")));
    case "imagen":
      if (method !== "POST") return json({ ok: false, error: "metodo_no_permitido" }, 405);
      return subirImagen(kv, request);
    default:
      return json({ ok: false, error: "ruta_desconocida" }, 404);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const headers = corsHeaders(request.headers.get("Origin") || "", env.ALLOWED_ORIGINS);
    const partes = url.pathname.split("/").filter(Boolean);

    if (request.method === "OPTIONS") return new Response(null, { headers });

    // --- publico ---

    if (request.method === "GET" && url.pathname === "/catalog") {
      const catalogo = await catalogoPublico(env.ASTERIA_ORDERS);
      return json(catalogo, 200, {
        ...headers,
        // Corto: el panel puede cambiar precios o stock en cualquier momento.
        "Cache-Control": "public, max-age=60",
      });
    }

    if (request.method === "POST" && url.pathname === "/precio") {
      const kv = env.ASTERIA_ORDERS;
      const sel = await cuerpoJson(request);
      const [charms, precios, stock] = await Promise.all([getCharms(kv), getPrecios(kv), getStock(kv)]);
      const precio = calcularPrecio(sel, { charms, precios, stock });
      return json(precio, precio.ok ? 200 : 200, headers); // 200 siempre: el error es de negocio, no de red
    }

    if (request.method === "GET" && partes[0] === "img") {
      return servirImagen(env.ASTERIA_ORDERS, partes[1]);
    }

    // --- administracion ---

    // El HTML del panel no trae ningun dato: sin sesion solo muestra la entrada.
    if (url.pathname === "/panel") {
      return new Response(panelHtml(), {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex",
          "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer",
        },
      });
    }

    if (partes[0] === "admin") {
      // Sin CORS: el panel vive en este mismo dominio y nadie mas debe hablarle.
      if (request.method === "POST" && partes[1] === "login") return entrar(request, env);
      if (request.method === "POST" && partes[1] === "logout") return salir(request, env);
      const usuario = await quienEs(request, env);
      if (!usuario) return json({ ok: false, error: "no_autorizado" }, 401);
      return rutasAdmin(request, url, env, partes, usuario);
    }

    // --- todo lo demas: comportamiento identico al worker de produccion ---
    return ordersHandler.fetch(request, env, ctx);
  },
};
