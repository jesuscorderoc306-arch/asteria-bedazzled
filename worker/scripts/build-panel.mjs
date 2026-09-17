// Empaqueta panel/panel.html dentro de src/panel-html.js para que el worker lo
// sirva sin leer archivos. El HTML se edita como HTML normal; esto corre solo
// antes de las pruebas y del despliegue (npm test / npm run deploy).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(raiz, "panel", "panel.html"), "utf8");
const salida = "// GENERADO por scripts/build-panel.mjs desde panel/panel.html. No editar a mano.\n" +
  "export const PANEL_HTML = " + JSON.stringify(html) + ";\n";
fs.writeFileSync(path.join(raiz, "src", "panel-html.js"), salida);
console.log("panel empaquetado:", Math.round(html.length / 1024) + " KB");
