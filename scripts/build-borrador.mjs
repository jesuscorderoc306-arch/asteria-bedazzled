// Arma el sitio de borrador que se publica en GitHub Pages.
//
//   node scripts/build-borrador.mjs <carpeta-destino>
//
// Produce tres cosas:
//   /            portada del borrador con los enlaces
//   /sitio/      copia del sitio de esta rama (index, pedido, privacidad, img)
//   /panel/      el panel de administracion, funcionando sin servidor
//
// Todo lleva <meta name="robots" content="noindex"> inyectado: el borrador es
// publico (Pages de un repo publico lo es) pero no debe competir en Google con
// asteriamx.pages.dev ni aparecer en resultados como si fuera la tienda real.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const destino = process.argv[2];
if (!destino) throw new Error("uso: node scripts/build-borrador.mjs <carpeta-destino>");

const NOINDEX = '<meta name="robots" content="noindex, nofollow">';

function copiaConNoindex(origen, salida) {
  let html = fs.readFileSync(origen, "utf8");
  if (!/name="robots"/i.test(html)) {
    html = html.replace(/<head>/i, "<head>\n" + NOINDEX);
  }
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  fs.writeFileSync(salida, html);
}

function copiaTal(origen, salida) {
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  fs.copyFileSync(origen, salida);
}

// --- limpiar destino ---
fs.rmSync(destino, { recursive: true, force: true });
fs.mkdirSync(destino, { recursive: true });

// --- /sitio: la pagina de esta rama ---
for (const f of ["index.html", "pedido.html", "privacidad.html"]) {
  copiaConNoindex(path.join(raiz, f), path.join(destino, "sitio", f));
}
for (const f of fs.readdirSync(path.join(raiz, "img"))) {
  copiaTal(path.join(raiz, "img", f), path.join(destino, "sitio", "img", f));
}
for (const f of ["favicon.svg", "favicon-32.png", "favicon-180.png", "og-image.jpg"]) {
  copiaTal(path.join(raiz, f), path.join(destino, "sitio", f));
}

// --- /panel: el panel real, con el worker corriendo dentro de la pagina ---
fs.mkdirSync(path.join(destino, "panel"), { recursive: true });
execFileSync(process.execPath, [
  path.join(raiz, "worker", "test", "build-demo.mjs"),
  path.join(destino, "panel", "index.html"),
], { stdio: "inherit" });

// --- portada del borrador ---
const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: raiz }).toString().trim();
const fecha = new Date().toISOString().slice(0, 10);

fs.writeFileSync(path.join(destino, "index.html"), `<!doctype html>
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
  :root{--ink:#050403;--char:#443f3b;--maroon:#922939;--stone:#c8c2ad;--taupe:#6b655e;
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
  .stamp{font-family:var(--label);text-transform:uppercase;letter-spacing:.16em;font-size:.64rem;color:var(--taupe);margin-bottom:48px}
  .cards{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  a.card{display:block;text-decoration:none;color:inherit;border:1px solid var(--line);background:var(--paper-2);
    padding:30px 28px;transition:background .25s,transform .25s,border-color .25s}
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
  @media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="announce"><span class="star">★</span> Borrador · no es la tienda en vivo <span class="star">★</span></div>
<main>
  <p class="eyebrow">Rama v2</p>
  <h1>Borrador de ASTÉRIA</h1>
  <p class="lead">Aquí se ve lo que se está construyendo antes de que llegue a la tienda.
     Nada de esto afecta a <a href="https://asteriamx.pages.dev">asteriamx.pages.dev</a>, que sigue saliendo de la rama master.</p>
  <p class="stamp">Actualizado ${fecha} · commit ${commit}</p>

  <div class="cards">
    <a class="card" href="panel/">
      <h2>Panel de administración</h2>
      <p>Charms, precios, stock, fotos, gastos y rendimiento. Funciona de verdad: los datos son de ejemplo y viven solo en tu navegador.</p>
      <span class="go">Abrir el panel →</span>
    </a>
    <a class="card" href="sitio/">
      <h2>La página</h2>
      <p>El sitio tal como está en esta rama, con el formulario de pedido. Todavía sin el personalizador de charms.</p>
      <span class="go">Abrir la página →</span>
    </a>
  </div>

  <div class="nota">
    <b>Cómo se actualiza:</b> cada vez que se termina un cambio en la rama <code>v2</code>, se vuelve a generar este borrador
    con <code>node scripts/build-borrador.mjs</code> y se publica. Lo que ves aquí siempre corresponde al commit de arriba.
  </div>
</main>
</body>
</html>
`);

console.log("borrador listo en", destino, "· commit", commit);
