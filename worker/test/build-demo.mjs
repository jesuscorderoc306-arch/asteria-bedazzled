// Arma una version del panel que se puede abrir sin servidor: mete el codigo
// real del worker (catalog.js, admin.js, index.js) dentro de la misma pagina y
// hace que fetch() hable con un KV en memoria. Lo que se ve es el panel real,
// no una maqueta; solo los datos son de ejemplo.
//
//   node worker/test/build-demo.mjs <archivo-de-salida.html>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { panelHtml } from "../src/panel.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const src = (f) => fs.readFileSync(path.join(aqui, "..", "src", f), "utf8");

// Quita import/export para poder concatenar los modulos en un script clasico,
// que corre antes que el script del panel y alcanza a instalar el fetch falso.
function aplanar(codigo) {
  return codigo
    .replace(/^import[\s\S]*?from\s+["'][^"']+["'];\s*$/gm, "")
    .replace(/^export\s+default\s*\{/m, "const workerV2 = {")
    .replace(/^export\s+/gm, "");
}

const bundle = [
  aplanar(src("catalog.js")),
  aplanar(src("admin.js")),
  aplanar(src("orders.js")),
  '// El panel ya es esta pagina; /panel nunca se pide desde aqui.\nconst panelHtml = () => "";',
  aplanar(src("index.js")),
].join("\n\n");

const seed = `
// ---- KV en memoria + datos de ejemplo ----
class MockKV {
  constructor(){ this.store = new Map(); }
  async get(key, op){ const r = this.store.get(key); if(!r) return null;
    const t = typeof op === "string" ? op : op && op.type;
    if (t === "arrayBuffer") return r.valor;
    return typeof r.valor === "string" ? r.valor : new TextDecoder().decode(r.valor); }
  async getWithMetadata(key, op){ const r = this.store.get(key);
    return r ? { value: await this.get(key, op), metadata: r.metadata || null } : { value: null, metadata: null }; }
  async put(key, valor, op = {}){ this.store.set(key, { valor, metadata: op.metadata || null }); }
  async delete(key){ this.store.delete(key); }
  async list({ prefix = "", limit = 1000 } = {}){
    return { keys: [...this.store.keys()].filter(k => k.startsWith(prefix)).sort().slice(0, limit).map(name => ({ name })), list_complete: true }; }
}

const env = { ASTERIA_ORDERS: new MockKV(), ADMIN_KEY: "demo", ALLOWED_ORIGINS: "*",
  TELEGRAM_CHAT_IDS: "1", TELEGRAM_TOKEN: "x", TURNSTILE_SECRET: "x" };

env.ASTERIA_ORDERS.put("catalog:precios", JSON.stringify({ moneda: "MXN",
  base: { "Pasta blanca/negra": 400, "Transparente": 380 },
  densidad: { Maximalista: 150, Minimalista: 80 }, envio: 120, actualizado: new Date().toISOString() }));
env.ASTERIA_ORDERS.put("catalog:charms", JSON.stringify([
  { id: "c1", nombre: "Estrella dorada", categoria: "Gemas", precio: 25, stock: 12, imgId: null, activo: true },
  { id: "c2", nombre: "Perla blanca", categoria: "Perlas", precio: 15, stock: 0, imgId: null, activo: true },
  { id: "c3", nombre: "Moño rosa", categoria: "Charms", precio: 45, stock: 4, imgId: null, activo: true },
  { id: "c4", nombre: "Corazón bicolor", categoria: "Gemas", precio: 30, stock: 7, imgId: null, activo: true }
]));
env.ASTERIA_ORDERS.put("catalog:stock", JSON.stringify({ Transparente: { "iPhone 13": 0 } }));
env.ASTERIA_ORDERS.put("expense:2026-08-12:g1", JSON.stringify({ id: "g1", fecha: "2026-08-12", concepto: "Gemas AB 6mm", categoria: "Material", monto: 480, registrado: "2026-08-12" }));
env.ASTERIA_ORDERS.put("expense:2026-08-20:g2", JSON.stringify({ id: "g2", fecha: "2026-08-20", concepto: "Cajas y listón", categoria: "Empaque", monto: 260, registrado: "2026-08-20" }));
for (const [folio, total, fecha] of [["A1", 605, "2026-08-15"], ["A2", 530, "2026-08-19"], ["A3", 700, "2026-08-24"]]) {
  env.ASTERIA_ORDERS.put("order:" + fecha + "T12:00:00.000Z:" + folio,
    JSON.stringify({ orderId: folio, total, receivedAt: fecha + "T12:00:00.000Z", telegramOk: true }));
}

// ---- fetch falso: las mismas rutas, contra el worker de arriba ----
const fetchReal = window.fetch.bind(window);
window.fetch = function (entrada, opciones) {
  const url = typeof entrada === "string" ? entrada : entrada.url;
  if (!/^https?:/i.test(url)) {
    return workerV2.fetch(new Request(new URL(url, "https://demo.local"), opciones || {}), env, {});
  }
  return fetchReal(entrada, opciones);
};
`;

let html = panelHtml();

// El archivo del Artifact se publica sin envoltura: fuera doctype, html, head y body.
html = html
  .replace(/^<!doctype html>\s*/i, "")
  .replace(/<\/?(html|head|body)[^>]*>\s*/gi, "")
  .replace(/<meta[^>]*>\s*/gi, "");

// La clave se lee de la URL; en la vista previa no hay ninguna, asi que la damos.
html = html.replace(
  'var KEY = new URLSearchParams(location.search).get("key") || "";',
  'var KEY = "demo"; // vista previa: el worker de esta pagina vive en memoria'
);

// Aviso honesto en la barra superior: esto es una vista previa con datos de ejemplo.
html = html.replace(
  "Panel interno · ASTÉRIA",
  "Vista previa del panel · datos de ejemplo"
);

html = html.replace("<script>", "<script>\n" + bundle + "\n" + seed + "\n</script>\n<script>");

const salida = process.argv[2];
if (!salida) throw new Error("falta la ruta de salida");
fs.writeFileSync(salida, html);
console.log("demo escrita:", salida, Math.round(html.length / 1024) + " KB");
