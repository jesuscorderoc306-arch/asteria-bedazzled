// Arma una version del panel que se puede abrir sin servidor: mete el codigo
// real del worker dentro de la misma pagina y hace que fetch() hable con un KV
// en memoria. Lo que se ve es el panel real, no una maqueta; solo los datos son
// de ejemplo (con fotos reales de fundas y charms del sitio).
//
//   node worker/test/build-demo.mjs <archivo-de-salida.html>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

// sharp solo hace falta para las fotos de ejemplo; vive en la carpeta de
// herramientas de imagenes si no esta instalado aqui.
let sharp;
try { sharp = (await import("sharp")).default; }
catch { sharp = createRequire("C:/Claude/asteria-optimize/package.json")("sharp"); }

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raizWorker = path.join(aqui, "..");
const raizSitio = path.join(raizWorker, "..");
execFileSync(process.execPath, [path.join(raizWorker, "scripts", "build-panel.mjs")], { stdio: "inherit" });
const { panelHtml } = await import("../src/panel.js");
const src = (f) => fs.readFileSync(path.join(raizWorker, "src", f), "utf8");

// Quita import/export para poder concatenar los modulos en un script clasico.
function aplanar(codigo) {
  return codigo
    .replace(/^import[\s\S]*?from\s+["'][^"']+["'];\s*$/gm, "")
    .replace(/^export\s+default\s*\{/m, "const workerV2 = {")
    .replace(/^export\s+/gm, "");
}

const bundle = [
  aplanar(src("catalog.js")),
  aplanar(src("admin.js")),
  aplanar(src("sesion.js")),
  aplanar(src("orders.js")),
  '// El panel ya es esta pagina; /panel nunca se pide desde aqui.\nconst panelHtml = () => "";',
  aplanar(src("index.js")),
].join("\n\n");

/* ---------- imagenes de ejemplo, hechas con fotos reales del sitio ---------- */
const charmPng = (f, lado) => sharp(path.join(raizSitio, "img", "charms", f)).resize(lado, lado, { fit: "inside" }).png().toBuffer();

// Un "diseno" como el que manda el editor: funda + charms acomodados.
async function diseno(funda, piezas) {
  const base = sharp(path.join(raizSitio, "img", "fundas", funda)).resize({ width: 520 });
  const buf = await base.png().toBuffer();
  const meta = await sharp(buf).metadata();
  const height = meta.height;
  const capas = [];
  for (const [f, x, y, lado, giro] of piezas) {
    const img = await sharp(await charmPng(f, lado)).rotate(giro || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const m = await sharp(img).metadata();
    capas.push({ input: img, left: Math.max(0, Math.round(x * meta.width - m.width / 2)), top: Math.max(0, Math.round(y * height - m.height / 2)) });
  }
  return sharp({ create: { width: meta.width, height, channels: 3, background: "#f2efe9" } })
    .composite([{ input: buf }, ...capas]).jpeg({ quality: 82 }).toBuffer();
}

const disenos = {
  d1: await diseno("iphone-15-pro-blanco.webp", [
    ["estrella-de-mar-dorada-grande-oro.webp", .30, .52, 120, -12], ["concha-con-detalle-oro.webp", .68, .66, 92, 8],
    ["perla-asimetrica-grande-i-perla.webp", .40, .80, 70, 0], ["sol-con-rostro-oro.webp", .78, .40, 70, 15],
  ]),
  d2: await diseno("iphone-16-negro.webp", [
    ["corazon-i-rojo.webp", .32, .45, 98, -8], ["chile-rojo-rojo.webp", .70, .58, 96, 25], ["copa-de-vino-rojo.webp", .45, .78, 86, 0],
  ]),
  d3: await diseno("iphone-17-pro-blanco.webp", [
    ["ojo-turco-azul-azul.webp", .30, .55, 84, 0], ["talavera-azul.webp", .66, .72, 96, -10], ["piedra-ovalada-azul-cielo-turquesa.webp", .60, .45, 80, 20],
  ]),
};
const catalogo = [
  ["c1", "Estrella de mar dorada", "Mar", 45, 12, "estrella-de-mar-dorada-grande-oro.webp"],
  ["c2", "Concha con detalle", "Mar", 40, 6, "concha-con-detalle-oro.webp"],
  ["c3", "Perla asimétrica", "Perlas", 35, 0, "perla-asimetrica-grande-i-perla.webp"],
  ["c4", "Corazón sagrado", "Amor", 55, 4, "corazon-i-rojo.webp"],
  ["c5", "Ojo turco", "Suerte", 30, 18, "ojo-turco-azul-azul.webp"],
  ["c6", "Bota vaquera", "Western", 50, 3, "bota-vaquera-en-oro-oro.webp"],
  ["c7", "Chile rojo", "Mexicano", 35, 9, "chile-rojo-rojo.webp"],
  ["c8", "Sol con rostro", "Celeste", 45, 7, "sol-con-rostro-oro.webp"],
];
const fotosCharm = {};
for (const [id, , , , , f] of catalogo) fotosCharm[id] = await sharp(path.join(raizSitio, "img", "charms", f)).resize(360, 360, { fit: "inside" }).webp({ quality: 82 }).toBuffer();
const fotoSeccion = [];
for (const f of ["i3.webp", "i10.webp", "i22.webp", "i23.webp"]) {
  const p = path.join(raizSitio, "img", f);
  if (fs.existsSync(p)) fotoSeccion.push(await sharp(p).resize(420, 420, { fit: "cover" }).webp({ quality: 78 }).toBuffer());
}
const b64 = (b) => Buffer.from(b).toString("base64");

/* ---------- datos: pedidos de este mes y del anterior ---------- */
const ahora = new Date();
const mes = (d) => new Date(ahora.getFullYear(), ahora.getMonth() + d, 1);
const fecha = (dMes, dia, hora) => { const m = mes(dMes); return new Date(m.getFullYear(), m.getMonth(), Math.min(dia, ahora.getDate() + (dMes ? 31 : 0)), hora).toISOString(); };
const pedidos = [
  { orderId: "AST-4821", ig: "valeria.rmz", nombre: "Valeria", tipo: "charms", modelo: "iPhone 15 Pro", funda: "Blanca", pasta: "Blanca", total: 690, estado: "nuevo", img: "d1",
    piezas: ["Estrella de mar dorada", "Concha con detalle", "Perla asimétrica", "Sol con rostro"], cuando: fecha(0, ahora.getDate(), 10) },
  { orderId: "AST-4819", ig: "fer.guadalajara", tipo: "bedazzled", style: "Pasta blanca/negra", pasta: "Negra", modelo: "iPhone 16 Pro Max", dens: "Maximalista", prio: "Corazones", estado: "nuevo", cuando: fecha(0, ahora.getDate() - 1, 18) },
  { orderId: "AST-4815", ig: "sofi_cortes", nombre: "Sofía", tipo: "charms", modelo: "iPhone 16", funda: "Negra", pasta: "Negra", total: 620, estado: "armando", img: "d2",
    piezas: ["Corazón sagrado", "Chile rojo", "Copa de vino"], cuando: fecha(0, ahora.getDate() - 2, 13) },
  { orderId: "AST-4810", ig: "andy.mtz", tipo: "bedazzled", style: "Transparente", modelo: "iPhone 14", dens: "Minimalista", totalManual: 480, estado: "listo", cuando: fecha(0, ahora.getDate() - 4, 12) },
  { orderId: "AST-4806", ig: "mariana.lopz", tipo: "charms", modelo: "iPhone 17 Pro", funda: "Blanca", pasta: "Negra", total: 710, estado: "listo", img: "d3",
    piezas: ["Ojo turco", "Talavera", "Piedra azul cielo"], cuando: fecha(0, ahora.getDate() - 6, 16) },
  { orderId: "AST-4799", ig: "regina.ss", tipo: "bedazzled", style: "Pasta blanca/negra", pasta: "Blanca", modelo: "iPhone 13", dens: "Minimalista", estado: "entregado", totalManual: 450, cuando: fecha(0, 2, 11) },
  { orderId: "AST-4795", ig: "karla.ochoa", tipo: "bedazzled", style: "Pasta blanca/negra", pasta: "Negra", modelo: "iPhone 15", dens: "Maximalista", estado: "cancelado", cuando: fecha(0, 1, 9) },
  { orderId: "AST-4770", ig: "dani.hdz", tipo: "bedazzled", style: "Transparente", modelo: "iPhone 12", dens: "Maximalista", estado: "entregado", totalManual: 520, cuando: fecha(-1, 20, 15) },
];
const gastos = [
  ["g1", 0, 3, "Gemas AB de 6 mm", "Material", 480], ["g2", 0, 3, "Charms dorados surtidos", "Charms", 760],
  ["g3", 0, 6, "Fundas de silicón (10)", "Fundas", 650], ["g4", 0, 9, "Cajas y papel seda", "Empaque", 210],
  ["g5", 0, 9, "Guías de envío", "Envíos", 330], ["g6", 0, 12, "Anuncio en Instagram", "Publicidad", 250],
  ["g7", -1, 14, "Pegamento B-7000", "Material", 180],
];
const isoDia = (dMes, dia) => { const m = mes(dMes); return new Date(m.getFullYear(), m.getMonth(), Math.min(dia, dMes ? 28 : ahora.getDate())).toISOString().slice(0, 10); };

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
const bytes = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer;
const env = { ASTERIA_ORDERS: new MockKV(), ADMIN_KEY: "demo", ALLOWED_ORIGINS: "*",
  TELEGRAM_CHAT_IDS: "1", TELEGRAM_TOKEN: "x", TURNSTILE_SECRET: "x" };
const kv = env.ASTERIA_ORDERS;

kv.put("catalog:precios", JSON.stringify({ moneda: "MXN",
  base: { "Pasta blanca/negra": 400, "Transparente": 380 },
  densidad: { Maximalista: 150, Minimalista: 80 }, envio: 120, actualizado: new Date().toISOString() }));
const DISENOS = ${JSON.stringify(Object.fromEntries(Object.entries(disenos).map(([k, v]) => [k, b64(v)])))};
for (const k in DISENOS) kv.put("img:" + k, bytes(DISENOS[k]), { metadata: { tipo: "image/jpeg" } });
const FOTOS = ${JSON.stringify(Object.fromEntries(Object.entries(fotosCharm).map(([k, v]) => [k, b64(v)])))};
for (const k in FOTOS) kv.put("img:foto_" + k, bytes(FOTOS[k]), { metadata: { tipo: "image/webp" } });
kv.put("catalog:charms", JSON.stringify(${JSON.stringify(catalogo.map(([id, nombre, categoria, precio, stock]) => ({ id, nombre, categoria, precio, stock, imgId: "foto_" + id, activo: id !== "c6" })))}));
const SECCION = ${JSON.stringify(fotoSeccion.map(b64))};
SECCION.forEach((s, i) => kv.put("img:sec" + i, bytes(s), { metadata: { tipo: "image/webp" } }));
kv.put("catalog:fotos:comunidad", JSON.stringify(SECCION.map((s, i) => "sec" + i)));
kv.put("catalog:stock", JSON.stringify({ Transparente: { "iPhone 13": 0, "iPhone 12": 2 }, "Pasta blanca/negra": { "iPhone 16 Pro Max": 1 } }));
for (const g of ${JSON.stringify(gastos.map(([id, dMes, dia, concepto, categoria, monto]) => ({ id, fecha: isoDia(dMes, dia), concepto, categoria, monto })))}) {
  kv.put("expense:" + g.fecha + ":" + g.id, JSON.stringify({ ...g, registrado: g.fecha }));
}
for (const p of ${JSON.stringify(pedidos)}) {
  const rec = { ...p, receivedAt: p.cuando, telegramOk: true, disenoImg: p.img || null,
    diseno: p.piezas ? { piezas: p.piezas.map((nombre, i) => ({ id: "x" + i, nombre, x: 30, y: 40, rot: 0 })) } : null };
  delete rec.img; delete rec.piezas; delete rec.cuando;
  kv.put("order:" + p.cuando + ":" + p.orderId, JSON.stringify(rec));
}

// ---- fetch falso: las mismas rutas, contra el worker de arriba ----
// La vista previa entra con la clave de scripts: no hay cookies en un KV de memoria.
const fetchReal = window.fetch.bind(window);
window.fetch = function (entrada, opciones) {
  const url = typeof entrada === "string" ? entrada : entrada.url;
  if (/^https?:/i.test(url)) return fetchReal(entrada, opciones);
  opciones = Object.assign({}, opciones || {});
  opciones.headers = Object.assign({}, opciones.headers || {}, { "X-Admin-Key": "demo" });
  return workerV2.fetch(new Request(new URL(url, "https://demo.local"), opciones), env, {});
};
// Las <img src="/img/..."> no pasan por fetch: se cambian por blobs del KV.
const cacheImg = {};
function blobDe(id){
  if (cacheImg[id]) return cacheImg[id];
  const r = kv.store.get("img:" + id);
  if (!r) return "";
  return cacheImg[id] = URL.createObjectURL(new Blob([r.valor], { type: (r.metadata && r.metadata.tipo) || "image/webp" }));
}
new MutationObserver((ms) => {
  for (const m of ms) for (const n of m.addedNodes) {
    if (n.nodeType !== 1) continue;
    const imgs = n.matches && n.matches("img") ? [n] : n.querySelectorAll ? n.querySelectorAll("img") : [];
    for (const img of imgs) { const s = img.getAttribute("src") || ""; if (s.startsWith("/img/")) img.src = blobDe(s.slice(5)); }
  }
}).observe(document.documentElement, { childList: true, subtree: true });
`;

let html = panelHtml();
html = html.replace("<script>", "<script>\n" + bundle + "\n" + seed + "\n</script>\n<script>");

const salida = process.argv[2];
if (!salida) throw new Error("falta la ruta de salida");
fs.writeFileSync(salida, html);
console.log("demo escrita:", salida, Math.round(html.length / 1024) + " KB");
