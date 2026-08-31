// Servidor local para probar el worker v2 sin Cloudflare y sin tocar produccion.
//   node test/servidor-local.mjs
//   -> http://localhost:8788/panel?key=local
// Los datos viven en memoria: al cerrar el proceso desaparecen.

import http from "node:http";
import worker from "../src/index.js";
import { MockKV } from "./mock-kv.mjs";

const PUERTO = Number(process.env.PUERTO || 8788);
const env = {
  ASTERIA_ORDERS: new MockKV(),
  ADMIN_KEY: "local",
  ALLOWED_ORIGINS: "http://localhost:" + PUERTO,
  TELEGRAM_CHAT_IDS: "1",
  TELEGRAM_TOKEN: "falso",
  TURNSTILE_SECRET: "falso",
};

// Semilla de ejemplo para poder ver el panel con contenido. Los precios son
// inventados A PROPOSITO solo aqui: es un entorno de prueba en memoria, nunca
// se sube a KV real.
await env.ASTERIA_ORDERS.put("catalog:precios", JSON.stringify({
  moneda: "MXN",
  base: { "Pasta blanca/negra": 400, "Transparente": 380 },
  densidad: { Maximalista: 150, Minimalista: 80 },
  envio: 120,
  actualizado: new Date().toISOString(),
}));
await env.ASTERIA_ORDERS.put("catalog:charms", JSON.stringify([
  { id: "charm_demo1", nombre: "Estrella dorada", categoria: "Gemas", precio: 25, stock: 12, imgId: null, activo: true },
  { id: "charm_demo2", nombre: "Perla blanca", categoria: "Perlas", precio: 15, stock: 0, imgId: null, activo: true },
  { id: "charm_demo3", nombre: "Moño rosa", categoria: "Charms", precio: 45, stock: 4, imgId: null, activo: true },
]));
await env.ASTERIA_ORDERS.put("catalog:stock", JSON.stringify({ Transparente: { "iPhone 13": 0 } }));
await env.ASTERIA_ORDERS.put("expense:2026-08-12:gasto_demo", JSON.stringify({
  id: "gasto_demo", fecha: "2026-08-12", concepto: "Gemas AB 6mm", categoria: "Material", monto: 480, registrado: new Date().toISOString(),
}));
await env.ASTERIA_ORDERS.put("order:2026-08-15T12:00:00.000Z:DEMO1", JSON.stringify({
  orderId: "DEMO1", ig: "cliente", style: "Transparente", modelo: "iPhone 15", dens: "Minimalista",
  total: 605, receivedAt: "2026-08-15T12:00:00.000Z", telegramOk: true,
}));

http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const cuerpo = chunks.length ? Buffer.concat(chunks) : undefined;
  const request = new Request("http://localhost:" + PUERTO + req.url, {
    method: req.method,
    headers: req.headers,
    body: cuerpo,
  });
  const out = await worker.fetch(request, env, {});
  res.writeHead(out.status, Object.fromEntries(out.headers));
  res.end(Buffer.from(await out.arrayBuffer()));
}).listen(PUERTO, () => {
  console.log("Panel:    http://localhost:" + PUERTO + "/panel?key=local");
  console.log("Catalogo: http://localhost:" + PUERTO + "/catalog");
});
