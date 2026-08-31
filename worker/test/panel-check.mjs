// Chequeo del panel: que el HTML se genere completo y que su JS embebido
// tenga sintaxis valida (un error ahi deja el panel mudo, sin avisar).
import { panelHtml } from "../src/panel.js";
import vm from "node:vm";

const html = panelHtml();
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

if (scripts.length !== 1) throw new Error("se esperaba 1 script embebido, hay " + scripts.length);
new vm.Script(scripts[0]); // lanza si hay error de sintaxis

const requeridos = ["/admin/charms", "/admin/precios", "/admin/stock", "/admin/fotos/", "/admin/gastos", "/admin/rendimiento", "/admin/imagen", "/catalog"];
for (const r of requeridos) if (!html.includes(r)) throw new Error("falta la ruta " + r);
if (!html.includes("iPhone 17 Pro Max")) throw new Error("no se interpolo la lista de modelos");

console.log("panel OK:", html.length, "bytes,", scripts[0].split("\n").length, "lineas de JS");
