// Arma los DOS sitios visuales que se publican en GitHub Pages.
//
//   node scripts/build-borrador.mjs <carpeta-destino>
//
//   /            SITIO 1 — la base de la pagina principal, copiada de master.
//                Aqui se revisa un cambio antes de mandarlo a produccion.
//   /v2/         SITIO 2 — el borrador: como va quedando la v2.
//   /v2/sitio/   la pagina de la rama v2
//   /v2/panel/   el panel de administracion, funcionando sin servidor
//
// El sitio 1 sale de `git show master:...`, no del disco: asi siempre refleja
// master aunque estemos parados en otra rama.
//
// Todo lleva <meta name="robots" content="noindex">. Las dos copias son
// publicas (Pages de un repo publico lo es) y ninguna debe competir en Google
// con asteriamx.pages.dev, que es la tienda de verdad.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const destino = process.argv[2];
if (!destino) throw new Error("uso: node scripts/build-borrador.mjs <carpeta-destino>");

const NOINDEX = '<meta name="robots" content="noindex, nofollow">';
const PAGINAS = ["index.html", "pedido.html", "privacidad.html"];
const SUELTOS = ["favicon.svg", "favicon-32.png", "favicon-180.png", "og-image.jpg"];
// Solo existen en la rama del borrador; master no los tiene todavia.
const SUELTOS_V2 = SUELTOS.concat(["editor.js", "editor.css", "charms.js", "modelos.js"]);

const gitBuffer = (ref) => execFileSync("git", ["show", ref], { cwd: raiz, maxBuffer: 64 * 1024 * 1024 });
const gitTexto = (ref) => gitBuffer(ref).toString("utf8");
const gitLista = (ref, prefijo) =>
  execFileSync("git", ["ls-tree", "-r", "--name-only", ref, prefijo], { cwd: raiz, encoding: "utf8" })
    .split("\n").map((s) => s.trim()).filter(Boolean);

function escribe(salida, contenido) {
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  fs.writeFileSync(salida, contenido);
}

// El aviso va en la pagina misma: quien la abra debe saber en dos segundos que
// no esta viendo la tienda real.
function conAviso(html, texto, colorFondo) {
  let salida = /name="robots"/i.test(html) ? html : html.replace(/<head>/i, "<head>\n" + NOINDEX);
  const cinta = `<div style="background:${colorFondo};color:#f2efe9;font-family:'Oswald',system-ui,sans-serif;
text-transform:uppercase;letter-spacing:.22em;font-size:.62rem;text-align:center;padding:7px 14px;position:relative;z-index:999">${texto}</div>`;
  return salida.replace(/<body([^>]*)>/i, `<body$1>\n${cinta}`);
}

fs.rmSync(destino, { recursive: true, force: true });
fs.mkdirSync(destino, { recursive: true });

// ---------- SITIO 1: copia de master ----------
for (const f of PAGINAS) {
  escribe(path.join(destino, f), conAviso(gitTexto(`master:${f}`), "Copia de revisión · la tienda real está en asteriamx.pages.dev", "#472d1d"));
}
for (const f of SUELTOS) escribe(path.join(destino, f), gitBuffer(`master:${f}`));
for (const f of gitLista("master", "img/")) escribe(path.join(destino, f), gitBuffer(`master:${f}`));

const commitMaster = execFileSync("git", ["rev-parse", "--short", "master"], { cwd: raiz, encoding: "utf8" }).trim();

// ---------- SITIO 2: el borrador de esta rama ----------
const v2 = path.join(destino, "v2");
for (const f of PAGINAS) {
  escribe(path.join(v2, "sitio", f), conAviso(fs.readFileSync(path.join(raiz, f), "utf8"), "Borrador v2 · todavía no está en la tienda", "#922939"));
}
for (const f of SUELTOS_V2) escribe(path.join(v2, "sitio", f), fs.readFileSync(path.join(raiz, f)));
for (const f of fs.readdirSync(path.join(raiz, "img"))) {
  escribe(path.join(v2, "sitio", "img", f), fs.readFileSync(path.join(raiz, "img", f)));
}

fs.mkdirSync(path.join(v2, "panel"), { recursive: true });
execFileSync(process.execPath, [
  path.join(raiz, "worker", "test", "build-demo.mjs"),
  path.join(v2, "panel", "index.html"),
], { stdio: "inherit" });

// ---------- portada del borrador ----------
const commitV2 = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: raiz, encoding: "utf8" }).trim();
const fecha = new Date().toISOString().slice(0, 10);

escribe(path.join(v2, "index.html"), `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${NOINDEX}
<title>ASTÉRIA · Borrador v2</title>
<link rel="icon" href="sitio/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Oswald:wght@300;400;500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root{--ink:#050403;--char:#443f3b;--maroon:#922939;--brown:#472d1d;--stone:#c8c2ad;--taupe:#6b655e;
    --paper:#f2efe9;--paper-2:#eae4d9;--line:rgba(5,4,3,.14);
    --display:'Cormorant Garamond',Georgia,serif;--label:'Oswald',system-ui,sans-serif;--body:'Jost',system-ui,sans-serif}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:var(--body);background:var(--paper);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}
  .announce{background:var(--ink);color:var(--paper);font-family:var(--label);text-transform:uppercase;
    letter-spacing:.28em;font-size:.66rem;font-weight:300;text-align:center;padding:9px 14px}
  .announce .star{color:var(--stone);margin:0 .7em}
  main{max-width:900px;margin:0 auto;padding:70px 28px 90px}
  .eyebrow{font-family:var(--label);text-transform:uppercase;letter-spacing:.32em;font-size:.72rem;font-weight:500;color:var(--maroon)}
  h1{font-family:var(--display);font-weight:400;font-size:clamp(2.6rem,6vw,4rem);line-height:1;margin:16px 0 14px}
  .lead{color:var(--char);font-weight:300;max-width:52ch;margin-bottom:14px}
  .lead a{color:var(--maroon)}
  .stamp{font-family:var(--label);text-transform:uppercase;letter-spacing:.16em;font-size:.64rem;color:var(--taupe);margin-bottom:48px}
  .cards{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  a.card{display:block;text-decoration:none;color:inherit;border:1px solid var(--line);background:var(--paper-2);
    padding:30px 28px;transition:background .25s,transform .25s,border-color .25s,color .25s}
  a.card:hover,a.card:focus-visible{background:var(--ink);color:var(--paper);border-color:var(--ink);transform:translateY(-2px)}
  a.card:focus-visible{outline:2px solid var(--maroon);outline-offset:3px}
  a.card h2{font-family:var(--display);font-weight:400;font-size:1.9rem;line-height:1.1;margin-bottom:8px}
  a.card p{font-size:.92rem;font-weight:300;color:var(--taupe)}
  a.card:hover p,a.card:focus-visible p{color:var(--stone)}
  a.card .go{font-family:var(--label);text-transform:uppercase;letter-spacing:.16em;font-size:.68rem;color:var(--maroon);margin-top:18px;display:block}
  a.card:hover .go,a.card:focus-visible .go{color:var(--paper)}
  .nota{border:1px solid var(--line);padding:22px 24px;margin-top:44px;font-size:.9rem;font-weight:300;color:var(--char)}
  .nota b{font-weight:500}
  .nota a{color:var(--maroon)}
  code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.86em;background:var(--paper-2);padding:1px 5px}
  @media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="announce"><span class="star">★</span> Borrador · no es la tienda en vivo <span class="star">★</span></div>
<main>
  <p class="eyebrow">Rama v2</p>
  <h1>Borrador de ASTÉRIA</h1>
  <p class="lead">Aquí se ve lo que se está construyendo, antes de que llegue a la tienda.
     Para comparar contra lo que hay hoy, <a href="../">abre la copia de revisión</a>.</p>
  <p class="stamp">Actualizado ${fecha} · v2 en ${commitV2} · master en ${commitMaster}</p>

  <div class="cards">
    <a class="card" href="panel/">
      <h2>Panel de administración</h2>
      <p>Charms, precios, stock, fotos, gastos y rendimiento. Funciona de verdad: los datos son de ejemplo y viven solo en tu navegador.</p>
      <span class="go">Abrir el panel →</span>
    </a>
    <a class="card" href="sitio/">
      <h2>La página</h2>
      <p>El sitio tal como está en la rama v2, con el formulario de pedido. Todavía sin el personalizador de charms.</p>
      <span class="go">Abrir la página →</span>
    </a>
  </div>

  <div class="nota">
    <b>Cómo se actualiza:</b> cada vez que se termina un cambio en la rama <code>v2</code>, se regenera este borrador
    con <code>node scripts/publicar-borrador.mjs</code>. Lo que ves aquí siempre corresponde al commit de arriba.
  </div>
</main>
</body>
</html>
`);

console.log(`dos sitios listos en ${destino}\n  /      copia de master (${commitMaster})\n  /v2/   borrador (${commitV2})`);
