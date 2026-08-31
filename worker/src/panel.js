// Panel de administracion ASTÉRIA v2.
// HTML autocontenido servido por el worker en /panel?key=ADMIN_KEY.
// Usa los mismos tokens, fuentes y botones que index.html: es la trastienda de
// la misma tienda. Sin librerias. La clave nunca se guarda en localStorage;
// vive en memoria mientras la pestana este abierta.

import { LOGO_DATA_URI } from "./logo.js";

export function panelHtml() {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Panel ASTÉRIA</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Oswald:wght@300;400;500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  /* Tokens y patrones tomados tal cual de index.html: mismo papel, misma tinta,
     mismas tres fuentes, mismos botones. El panel es la trastienda de la misma
     tienda, no otra marca. */
  :root{
    --ink:#050403;--char:#443f3b;--maroon:#922939;--blue:#2d70ad;
    --stone:#c8c2ad;--taupe:#6b655e;--paper:#f2efe9;--paper-2:#eae4d9;
    --line:rgba(5,4,3,.14);
    --font-display:'Cormorant Garamond', Georgia, serif;
    --font-label:'Oswald', system-ui, sans-serif;
    --font-body:'Jost', system-ui, -apple-system, sans-serif;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:var(--font-body);background:var(--paper);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}
  img{display:block;max-width:100%}

  .announce{background:var(--ink);color:var(--paper);font-family:var(--font-label);text-transform:uppercase;letter-spacing:.28em;font-size:.66rem;font-weight:300;text-align:center;padding:9px 14px}
  .announce .star{color:var(--stone);margin:0 .7em}

  header.nav{position:sticky;top:0;z-index:50;background:rgba(242,239,233,.9);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
  .nav-inner{max-width:1180px;margin:0 auto;padding:0 28px;display:flex;align-items:center;justify-content:space-between;gap:24px;height:76px}
  .nav-brand{display:flex;align-items:center;gap:12px}
  .nav-brand img{height:38px;width:38px}
  .nav-brand b{font-family:var(--font-display);font-weight:400;font-size:1.35rem;letter-spacing:.06em}
  .nav-brand span{font-family:var(--font-label);text-transform:uppercase;letter-spacing:.24em;font-size:.62rem;color:var(--taupe)}
  nav.tabs{display:flex;gap:30px;overflow-x:auto;scrollbar-width:none}
  nav.tabs::-webkit-scrollbar{display:none}
  nav.tabs button{flex:0 0 auto;background:none;border:none;cursor:pointer;position:relative;padding:4px 0;
    font-family:var(--font-label);text-transform:uppercase;letter-spacing:.18em;font-size:.76rem;color:var(--char);transition:color .2s}
  /* Mismo subrayado que .nav-links del sitio, pero animado con transform en vez
     de width: se ve identico y no obliga al navegador a recalcular layout. */
  nav.tabs button::after{content:"";position:absolute;left:0;bottom:-2px;height:1px;width:100%;background:var(--maroon);
    transform:scaleX(0);transform-origin:left center;transition:transform .28s}
  nav.tabs button:hover{color:var(--ink)}
  nav.tabs button:hover::after{transform:scaleX(1)}
  nav.tabs button[aria-selected="true"]{color:var(--ink)}
  nav.tabs button[aria-selected="true"]::after{transform:scaleX(1)}
  /* El foco se ve distinto de la pestana activa: si no, parecen dos activas. */
  nav.tabs button:focus-visible{outline:1px solid var(--maroon);outline-offset:4px}

  main{max-width:1180px;margin:0 auto;padding:44px 28px 90px}
  section[hidden]{display:none}
  .eyebrow{font-family:var(--font-label);text-transform:uppercase;letter-spacing:.32em;font-size:.72rem;font-weight:500;color:var(--maroon)}
  h2{font-family:var(--font-display);font-weight:400;font-size:clamp(2.1rem,4vw,2.9rem);line-height:1.05;margin:14px 0 10px}
  .sub{color:var(--char);font-weight:300;max-width:56ch;margin-bottom:34px}

  .card{border:1px solid var(--line);background:var(--paper-2);padding:26px 24px;margin-bottom:20px}
  .card h3{font-family:var(--font-label);text-transform:uppercase;letter-spacing:.16em;font-size:.7rem;font-weight:400;color:var(--maroon);margin-bottom:20px}

  label{display:block;font-family:var(--font-label);text-transform:uppercase;letter-spacing:.14em;font-size:.7rem;color:var(--char);margin-bottom:9px}
  input,select{width:100%;padding:13px 15px;border:1px solid var(--line);background:var(--paper);font-family:var(--font-body);font-size:.98rem;color:var(--ink);transition:border-color .2s,box-shadow .2s}
  input:focus,select:focus{outline:none;border-color:var(--maroon);box-shadow:0 0 0 3px rgba(146,41,57,.1)}
  input[type=file]{padding:10px 12px;font-size:.86rem;cursor:pointer}
  select{appearance:none;-webkit-appearance:none;cursor:pointer;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%23443f3b' stroke-width='1.5'><path d='M5 8l5 5 5-5'/></svg>");
    background-repeat:no-repeat;background-position:right 15px center;background-size:14px}
  .grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}
  .row{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end}

  .btn{font-family:var(--font-label);text-transform:uppercase;letter-spacing:.16em;font-size:.74rem;padding:13px 26px;cursor:pointer;
    border:1px solid var(--ink);display:inline-flex;align-items:center;gap:10px;transition:all .25s;background:none;color:var(--ink)}
  .btn-solid{background:var(--ink);color:var(--paper)}
  .btn-solid:hover{background:var(--maroon);border-color:var(--maroon);transform:translateY(-2px)}
  .btn-ghost:hover{background:var(--ink);color:var(--paper)}
  .btn-small{padding:9px 16px;font-size:.68rem}
  .btn-danger{border-color:var(--line);color:var(--taupe)}
  .btn-danger:hover{background:var(--maroon);border-color:var(--maroon);color:var(--paper)}

  .list{display:grid;gap:14px}
  .item{display:grid;grid-template-columns:64px 1fr auto;gap:18px;align-items:center;border:1px solid var(--line);background:var(--paper);padding:14px 18px}
  .item img{width:64px;height:64px;object-fit:cover;background:var(--paper-2)}
  .item .ph{width:64px;height:64px;background:var(--paper-2);display:grid;place-items:center;color:var(--stone);font-size:1.3rem}
  .item .nm{font-family:var(--font-display);font-size:1.25rem;line-height:1.2}
  .item .meta{color:var(--taupe);font-size:.84rem;font-weight:300;margin-top:2px}
  .tag{display:inline-block;font-family:var(--font-label);text-transform:uppercase;letter-spacing:.16em;font-size:.6rem;color:var(--taupe);margin-left:12px;vertical-align:middle}
  .tag.out{color:var(--maroon)}
  .acts{display:flex;gap:8px}

  .kpis{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
  .kpi{border:1px solid var(--line);background:var(--paper-2);padding:24px 22px}
  /* Cormorant trae numeros de estilo antiguo por defecto y el "1" se lee como
     una I mayuscula. En cifras de dinero eso no se perdona: forzamos lining. */
  .kpi .n{font-family:var(--font-display);font-size:2.6rem;line-height:1;letter-spacing:.01em;font-variant-numeric:lining-nums;font-feature-settings:"lnum" 1}
  .kpi .n.neg{color:var(--maroon)}
  .kpi .l{font-family:var(--font-label);text-transform:uppercase;letter-spacing:.16em;font-size:.64rem;color:var(--taupe);margin-top:8px}

  table{width:100%;border-collapse:collapse;font-size:.92rem;font-weight:300}
  th{font-family:var(--font-label);text-transform:uppercase;letter-spacing:.14em;font-size:.64rem;font-weight:400;color:var(--maroon);text-align:left;padding:0 0 12px}
  td{padding:12px 0;border-bottom:1px dashed var(--line)}
  tr:last-child td{border-bottom:none}
  td:last-child,th:last-child{text-align:right}
  .empty{color:var(--taupe);font-weight:300;font-size:.92rem;padding:10px 0}

  .warn{border:1px solid var(--maroon);color:var(--maroon);background:var(--paper);padding:18px 20px;font-size:.92rem;margin-bottom:20px}
  .warn b{font-weight:500}

  #toast{position:fixed;left:50%;transform:translateX(-50%) translateY(20px);bottom:28px;background:var(--ink);color:var(--paper);
    font-family:var(--font-label);text-transform:uppercase;letter-spacing:.14em;font-size:.7rem;padding:14px 26px;
    opacity:0;pointer-events:none;transition:opacity .22s,transform .22s;z-index:60;max-width:90vw;text-align:center}
  #toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
  #toast.err{background:var(--maroon)}

  @media(max-width:900px){
    .nav-inner{height:auto;flex-direction:column;align-items:flex-start;gap:10px;padding:14px 20px}
    .nav-brand span{display:none}
    nav.tabs{gap:22px;width:100%;padding-bottom:4px}
    main{padding:30px 20px 80px}
    .item{grid-template-columns:52px 1fr;row-gap:12px}
    .item img,.item .ph{width:52px;height:52px}
    .acts{grid-column:1/-1}
  }
  @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
</head>
<body>
<div class="announce"><span class="star">★</span> Panel interno · ASTÉRIA <span class="star">★</span></div>
<header class="nav">
  <div class="nav-inner">
    <div class="nav-brand">
      <img src="${LOGO_DATA_URI}" alt="" width="38" height="38">
      <b>ASTÉRIA</b><span>Administración</span>
    </div>
    <nav class="tabs" id="tabs" role="tablist">
      <button role="tab" data-tab="charms" aria-selected="true">Charms</button>
      <button role="tab" data-tab="precios" aria-selected="false">Precios</button>
      <button role="tab" data-tab="stock" aria-selected="false">Stock</button>
      <button role="tab" data-tab="fotos" aria-selected="false">Fotos</button>
      <button role="tab" data-tab="gastos" aria-selected="false">Gastos</button>
      <button role="tab" data-tab="rendimiento" aria-selected="false">Rendimiento</button>
    </nav>
  </div>
</header>

<main>
  <!-- CHARMS -->
  <section id="tab-charms">
    <p class="eyebrow">Catálogo</p>
    <h2>Charms</h2>
    <p class="sub">Lo que la clienta puede elegir al personalizar su funda. Sin stock, el charm deja de ofrecerse.</p>
    <div class="card">
      <h3>Agregar charm</h3>
      <div class="grid">
        <div><label for="c-nombre">Nombre</label><input id="c-nombre" placeholder="Estrella dorada"></div>
        <div><label for="c-categoria">Categoría</label><input id="c-categoria" placeholder="Gemas"></div>
        <div><label for="c-precio">Precio (MXN)</label><input id="c-precio" type="number" min="0" step="1" inputmode="numeric"></div>
        <div><label for="c-stock">Stock</label><input id="c-stock" type="number" min="0" step="1" inputmode="numeric" value="0"></div>
        <div><label for="c-img">Foto</label><input id="c-img" type="file" accept="image/*"></div>
      </div>
      <div class="row" style="margin-top:14px"><button class="btn btn-solid" id="c-add">Agregar charm</button></div>
    </div>
    <div class="list" id="charms-list"></div>
  </section>

  <!-- PRECIOS -->
  <section id="tab-precios" hidden>
    <p class="eyebrow">Lista de precios</p>
    <h2>Precios</h2>
    <p class="sub">Mientras falte un precio, el sitio muestra “precio a confirmar” en vez de un número inventado.</p>
    <div class="card">
      <h3>Precio base por estilo</h3>
      <div class="grid" id="p-base"></div>
    </div>
    <div class="card">
      <h3>Extra por densidad</h3>
      <div class="grid" id="p-dens"></div>
    </div>
    <div class="card">
      <h3>Envío</h3>
      <div class="grid"><div><label for="p-envio">Costo de envío (MXN, 0 = gratis)</label><input id="p-envio" type="number" min="0" step="1" inputmode="numeric"></div></div>
    </div>
    <button class="btn btn-solid" id="p-save">Guardar precios</button>
  </section>

  <!-- STOCK -->
  <section id="tab-stock" hidden>
    <p class="eyebrow">Inventario</p>
    <h2>Stock de fundas</h2>
    <p class="sub">Solo hace falta capturar lo que se agota. Un modelo sin registro se considera disponible.</p>
    <div class="card">
      <h3>Marcar disponibilidad</h3>
      <div class="grid">
        <div><label for="s-estilo">Estilo</label><select id="s-estilo"></select></div>
        <div><label for="s-modelo">Modelo</label><select id="s-modelo"></select></div>
        <div><label for="s-cantidad">Piezas (vacío = quitar límite)</label><input id="s-cantidad" type="number" min="0" step="1" inputmode="numeric"></div>
      </div>
      <div class="row" style="margin-top:14px"><button class="btn btn-solid" id="s-save">Guardar</button></div>
    </div>
    <div class="card"><h3>Registros actuales</h3><div id="stock-list"></div></div>
  </section>

  <!-- FOTOS -->
  <section id="tab-fotos" hidden>
    <p class="eyebrow">Imágenes</p>
    <h2>Fotos del sitio</h2>
    <p class="sub">Sube imágenes y ordénalas por sección. Se sirven desde el worker con caché larga.</p>
    <div class="card">
      <h3>Subir a una sección</h3>
      <div class="grid">
        <div><label for="f-seccion">Sección</label><select id="f-seccion"></select></div>
        <div><label for="f-file">Imagen (máx. 800 KB tras comprimir)</label><input id="f-file" type="file" accept="image/*" multiple></div>
      </div>
    </div>
    <div class="list" id="fotos-list"></div>
  </section>

  <!-- GASTOS -->
  <section id="tab-gastos" hidden>
    <p class="eyebrow">Egresos</p>
    <h2>Gastos</h2>
    <p class="sub">Cada egreso del taller: material, envíos, publicidad, empaque.</p>
    <div class="card">
      <h3>Registrar gasto</h3>
      <div class="grid">
        <div><label for="g-fecha">Fecha</label><input id="g-fecha" type="date"></div>
        <div><label for="g-concepto">Concepto</label><input id="g-concepto" placeholder="Gemas AB 6mm"></div>
        <div><label for="g-categoria">Categoría</label><input id="g-categoria" placeholder="Material" list="cats"><datalist id="cats"><option>Material</option><option>Envíos</option><option>Empaque</option><option>Publicidad</option><option>Herramienta</option></datalist></div>
        <div><label for="g-monto">Monto (MXN)</label><input id="g-monto" type="number" min="0" step="0.01" inputmode="decimal"></div>
      </div>
      <div class="row" style="margin-top:14px"><button class="btn btn-solid" id="g-add">Registrar gasto</button></div>
    </div>
    <div class="card"><h3>Historial</h3><div id="gastos-list"></div></div>
  </section>

  <!-- RENDIMIENTO -->
  <section id="tab-rendimiento" hidden>
    <p class="eyebrow">Números del taller</p>
    <h2>Rendimiento</h2>
    <p class="sub">Ingresos tomados de los pedidos con precio calculado; los pedidos antiguos sin precio se cuentan aparte.</p>
    <div class="card">
      <div class="row">
        <div><label for="r-desde">Desde</label><input id="r-desde" type="date"></div>
        <div><label for="r-hasta">Hasta</label><input id="r-hasta" type="date"></div>
        <button class="btn btn-ghost" id="r-load">Actualizar</button>
      </div>
    </div>
    <div class="kpis" id="r-kpis"></div>
    <div class="card" style="margin-top:18px"><h3>Gastos por categoría</h3><div id="r-cats"></div></div>
  </section>
</main>

<div id="toast" role="status" aria-live="polite"></div>

<script>
(function(){
  "use strict";
  var KEY = new URLSearchParams(location.search).get("key") || "";
  var MODELOS = ${JSON.stringify(MODELOS_IPHONE)};
  var estado = { charms: [], precios: null, stock: {}, estilos: [], densidades: [], secciones: [], fotos: {} };

  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function money(n){ return n==null ? "—" : "$" + Number(n).toLocaleString("es-MX"); }

  var toastEl = document.getElementById("toast"), toastT;
  function toast(msg, esError){
    toastEl.textContent = msg;
    toastEl.className = "on" + (esError ? " err" : "");
    clearTimeout(toastT);
    toastT = setTimeout(function(){ toastEl.className = ""; }, 3200);
  }

  function api(ruta, opciones){
    opciones = opciones || {};
    var headers = { "X-Admin-Key": KEY };
    if (opciones.json !== undefined) { headers["Content-Type"] = "application/json"; opciones.body = JSON.stringify(opciones.json); }
    if (opciones.tipo) headers["Content-Type"] = opciones.tipo;
    return fetch(ruta, { method: opciones.method || "GET", headers: headers, body: opciones.body })
      .then(function(r){ return r.json().then(function(d){ return { ok: r.ok, status: r.status, data: d }; }); })
      .then(function(res){
        if (res.status === 403) { toast("Clave de administrador inválida.", true); throw new Error("403"); }
        if (res.data && res.data.ok === false) { toast("No se pudo guardar: " + (res.data.error || "error"), true); throw new Error(res.data.error); }
        return res.data;
      });
  }

  /* ---------- pestanas ---------- */
  var tabs = document.getElementById("tabs");
  tabs.addEventListener("click", function(e){
    var b = e.target.closest("button[data-tab]"); if(!b) return;
    Array.prototype.forEach.call(tabs.querySelectorAll("button"), function(x){ x.setAttribute("aria-selected", String(x === b)); });
    ["charms","precios","stock","fotos","gastos","rendimiento"].forEach(function(t){
      document.getElementById("tab-" + t).hidden = (t !== b.dataset.tab);
    });
    if (b.dataset.tab === "gastos") cargarGastos();
    if (b.dataset.tab === "rendimiento") cargarRendimiento();
    if (b.dataset.tab === "fotos") pintarFotos();
  });

  /* ---------- imagenes: se redimensionan en el navegador antes de subir ---------- */
  function comprimir(file, maxLado){
    return new Promise(function(resolve, reject){
      var img = new Image();
      img.onload = function(){
        var escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.round(img.width * escala); c.height = Math.round(img.height * escala);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function(b){ b ? resolve(b) : reject(new Error("canvas")); }, "image/webp", 0.85);
        URL.revokeObjectURL(img.src);
      };
      img.onerror = function(){ reject(new Error("no_es_imagen")); };
      img.src = URL.createObjectURL(file);
    });
  }

  function subir(file){
    return comprimir(file, 1200).then(function(blob){
      if (blob.size > 800*1024) throw new Error("imagen_muy_grande");
      return fetch("/admin/imagen", { method:"POST", headers:{ "X-Admin-Key": KEY, "Content-Type": "image/webp" }, body: blob })
        .then(function(r){ return r.json(); })
        .then(function(d){ if(!d.ok) throw new Error(d.error||"upload"); return d.id; });
    });
  }

  /* ---------- charms ---------- */
  function pintarCharms(){
    var cont = document.getElementById("charms-list");
    if (!estado.charms.length) { cont.innerHTML = '<p class="empty">Todavía no hay charms. Agrega el primero arriba.</p>'; return; }
    cont.innerHTML = estado.charms.map(function(c){
      var agotado = !c.stock || c.activo === false;
      return '<div class="item" data-id="' + esc(c.id) + '">' +
        (c.imgId ? '<img src="/img/' + esc(c.imgId) + '" alt="">' : '<div class="ph">★</div>') +
        '<div><span class="nm">' + esc(c.nombre) + '</span>' +
          (c.categoria ? '<span class="tag">' + esc(c.categoria) + '</span>' : '') +
          (agotado ? '<span class="tag out">' + (c.activo === false ? 'oculto' : 'agotado') + '</span>' : '') +
          '<div class="meta">' + money(c.precio) + ' · ' + (c.stock||0) + ' pzas</div></div>' +
        '<div class="acts">' +
          '<button class="btn btn-ghost btn-small" data-act="editar">Editar</button>' +
          '<button class="btn btn-danger btn-small" data-act="borrar">Borrar</button>' +
        '</div></div>';
    }).join("");
  }

  document.getElementById("charms-list").addEventListener("click", function(e){
    var b = e.target.closest("button[data-act]"); if(!b) return;
    var id = b.closest(".item").dataset.id;
    var charm = estado.charms.filter(function(c){ return c.id === id; })[0];
    if (!charm) return;

    if (b.dataset.act === "borrar") {
      if (!confirm("¿Borrar “" + charm.nombre + "”? Esto no se puede deshacer.")) return;
      api("/admin/charms/" + id, { method:"DELETE" }).then(function(){
        estado.charms = estado.charms.filter(function(c){ return c.id !== id; });
        pintarCharms(); toast("Charm borrado.");
      }).catch(function(){});
      return;
    }

    var nombre = prompt("Nombre", charm.nombre); if (nombre === null) return;
    var precio = prompt("Precio en MXN (vacío = sin precio)", charm.precio == null ? "" : charm.precio); if (precio === null) return;
    var stock = prompt("Piezas en stock", charm.stock); if (stock === null) return;
    api("/admin/charms/" + id, { method:"PUT", json:{ nombre: nombre, precio: precio, stock: stock, categoria: charm.categoria, imgId: charm.imgId, activo: charm.activo } })
      .then(function(d){
        estado.charms = estado.charms.map(function(c){ return c.id === id ? d.charm : c; });
        pintarCharms(); toast("Charm actualizado.");
      }).catch(function(){});
  });

  document.getElementById("c-add").addEventListener("click", function(){
    var nombre = document.getElementById("c-nombre").value.trim();
    if (!nombre) { toast("Ponle nombre al charm.", true); return; }
    var file = document.getElementById("c-img").files[0];
    var paso = file ? subir(file) : Promise.resolve(null);
    paso.then(function(imgId){
      return api("/admin/charms", { method:"POST", json:{
        nombre: nombre,
        categoria: document.getElementById("c-categoria").value,
        precio: document.getElementById("c-precio").value,
        stock: document.getElementById("c-stock").value,
        imgId: imgId
      }});
    }).then(function(d){
      estado.charms.push(d.charm); pintarCharms();
      ["c-nombre","c-categoria","c-precio","c-img"].forEach(function(id){ document.getElementById(id).value = ""; });
      document.getElementById("c-stock").value = "0";
      toast("Charm agregado.");
    }).catch(function(err){ toast("No se pudo agregar: " + err.message, true); });
  });

  /* ---------- precios ---------- */
  function pintarPrecios(){
    document.getElementById("p-base").innerHTML = estado.estilos.map(function(e){
      var v = estado.precios && estado.precios.base ? estado.precios.base[e] : null;
      return '<div><label>' + esc(e) + '</label><input data-base="' + esc(e) + '" type="number" min="0" step="1" inputmode="numeric" value="' + (v==null?"":v) + '"></div>';
    }).join("");
    document.getElementById("p-dens").innerHTML = estado.densidades.map(function(d){
      var v = estado.precios && estado.precios.densidad ? estado.precios.densidad[d] : null;
      return '<div><label>' + esc(d) + '</label><input data-dens="' + esc(d) + '" type="number" min="0" step="1" inputmode="numeric" value="' + (v==null?"":v) + '"></div>';
    }).join("");
    document.getElementById("p-envio").value = estado.precios && estado.precios.envio != null ? estado.precios.envio : "";
  }

  document.getElementById("p-save").addEventListener("click", function(){
    var base = {}, dens = {};
    Array.prototype.forEach.call(document.querySelectorAll("[data-base]"), function(i){ base[i.dataset.base] = i.value; });
    Array.prototype.forEach.call(document.querySelectorAll("[data-dens]"), function(i){ dens[i.dataset.dens] = i.value; });
    api("/admin/precios", { method:"PUT", json:{ base: base, densidad: dens, envio: document.getElementById("p-envio").value } })
      .then(function(d){ estado.precios = d.precios; pintarPrecios(); toast("Precios guardados."); }).catch(function(){});
  });

  /* ---------- stock ---------- */
  function pintarStock(){
    var cont = document.getElementById("stock-list");
    var filas = [];
    Object.keys(estado.stock || {}).forEach(function(estilo){
      Object.keys(estado.stock[estilo] || {}).forEach(function(modelo){
        filas.push('<tr><td>' + esc(estilo) + '</td><td>' + esc(modelo) + '</td><td>' + estado.stock[estilo][modelo] + '</td></tr>');
      });
    });
    cont.innerHTML = filas.length
      ? '<table><tr><th>Estilo</th><th>Modelo</th><th>Piezas</th></tr>' + filas.join("") + '</table>'
      : '<p class="empty">Sin límites capturados: todos los modelos se ofrecen como disponibles.</p>';
  }

  document.getElementById("s-save").addEventListener("click", function(){
    api("/admin/stock", { method:"PUT", json:{
      estilo: document.getElementById("s-estilo").value,
      modelo: document.getElementById("s-modelo").value,
      cantidad: document.getElementById("s-cantidad").value
    }}).then(function(d){ estado.stock = d.stock; pintarStock(); toast("Stock actualizado."); }).catch(function(){});
  });

  /* ---------- fotos ---------- */
  function pintarFotos(){
    var seccion = document.getElementById("f-seccion").value;
    var lista = estado.fotos[seccion] || [];
    var cont = document.getElementById("fotos-list");
    cont.innerHTML = lista.length ? lista.map(function(id){
      return '<div class="item" data-img="' + esc(id) + '"><img src="/img/' + esc(id) + '" alt="">' +
        '<div class="meta">' + esc(id) + '</div>' +
        '<div class="acts"><button class="btn btn-danger btn-small" data-act="quitar">Quitar</button></div></div>';
    }).join("") : '<p class="empty">Sin fotos en esta sección.</p>';
  }

  function guardarFotos(seccion, lista){
    return api("/admin/fotos/" + seccion, { method:"PUT", json:{ fotos: lista } })
      .then(function(d){ estado.fotos[seccion] = d.fotos; pintarFotos(); });
  }

  document.getElementById("f-seccion").addEventListener("change", pintarFotos);
  document.getElementById("f-file").addEventListener("change", function(e){
    var files = Array.prototype.slice.call(e.target.files);
    if (!files.length) return;
    var seccion = document.getElementById("f-seccion").value;
    toast("Subiendo " + files.length + " imagen(es)…");
    files.reduce(function(p, f){
      return p.then(function(acc){ return subir(f).then(function(id){ return acc.concat(id); }); });
    }, Promise.resolve([])).then(function(ids){
      return guardarFotos(seccion, (estado.fotos[seccion] || []).concat(ids));
    }).then(function(){ toast("Fotos agregadas."); e.target.value = ""; })
      .catch(function(err){ toast("No se pudo subir: " + err.message, true); });
  });

  document.getElementById("fotos-list").addEventListener("click", function(e){
    var b = e.target.closest('button[data-act="quitar"]'); if(!b) return;
    var id = b.closest(".item").dataset.img;
    var seccion = document.getElementById("f-seccion").value;
    guardarFotos(seccion, (estado.fotos[seccion] || []).filter(function(x){ return x !== id; }))
      .then(function(){ toast("Foto quitada de la sección."); }).catch(function(){});
  });

  /* ---------- gastos ---------- */
  function cargarGastos(){
    api("/admin/gastos").then(function(d){
      var cont = document.getElementById("gastos-list");
      if (!d.gastos.length) { cont.innerHTML = '<p class="empty">Sin gastos registrados.</p>'; return; }
      cont.innerHTML = '<table><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Monto</th><th></th></tr>' +
        d.gastos.map(function(g){
          return '<tr><td>' + esc(g.fecha) + '</td><td>' + esc(g.concepto) + '</td><td>' + esc(g.categoria) + '</td><td>' + money(g.monto) + '</td>' +
            '<td><button class="btn btn-danger btn-small" data-gasto="' + esc(g.id) + '">Borrar</button></td></tr>';
        }).join("") + '</table>';
    }).catch(function(){});
  }

  document.getElementById("gastos-list").addEventListener("click", function(e){
    var b = e.target.closest("button[data-gasto]"); if(!b) return;
    if (!confirm("¿Borrar este gasto?")) return;
    api("/admin/gastos/" + b.dataset.gasto, { method:"DELETE" }).then(function(){ cargarGastos(); toast("Gasto borrado."); }).catch(function(){});
  });

  document.getElementById("g-add").addEventListener("click", function(){
    api("/admin/gastos", { method:"POST", json:{
      fecha: document.getElementById("g-fecha").value,
      concepto: document.getElementById("g-concepto").value,
      categoria: document.getElementById("g-categoria").value,
      monto: document.getElementById("g-monto").value
    }}).then(function(){
      ["g-concepto","g-monto"].forEach(function(id){ document.getElementById(id).value = ""; });
      cargarGastos(); toast("Gasto registrado.");
    }).catch(function(){});
  });

  /* ---------- rendimiento ---------- */
  function cargarRendimiento(){
    var q = [];
    var d1 = document.getElementById("r-desde").value, d2 = document.getElementById("r-hasta").value;
    if (d1) q.push("desde=" + d1);
    if (d2) q.push("hasta=" + d2);
    api("/admin/rendimiento" + (q.length ? "?" + q.join("&") : "")).then(function(r){
      // Solo la utilidad negativa se marca: en el sitio el maroon es acento, no adorno.
      var clase = r.utilidad < 0 ? "neg" : "";
      document.getElementById("r-kpis").innerHTML =
        '<div class="kpi"><div class="n">' + money(r.ingresos) + '</div><div class="l">Ingresos</div></div>' +
        '<div class="kpi"><div class="n">' + money(r.gastos) + '</div><div class="l">Gastos</div></div>' +
        '<div class="kpi"><div class="n ' + clase + '">' + money(r.utilidad) + '</div><div class="l">Utilidad</div></div>' +
        '<div class="kpi"><div class="n">' + r.pedidos + '</div><div class="l">Pedidos</div></div>';
      var cats = Object.keys(r.gastosPorCategoria || {});
      document.getElementById("r-cats").innerHTML = cats.length
        ? '<table><tr><th>Categoría</th><th>Total</th></tr>' + cats.map(function(c){
            return '<tr><td>' + esc(c) + '</td><td>' + money(r.gastosPorCategoria[c]) + '</td></tr>'; }).join("") + '</table>'
        : '<p class="empty">Sin gastos en el periodo.</p>';
      var main = document.querySelector("#tab-rendimiento .sub");
      main.textContent = r.pedidosSinPrecio
        ? r.pedidosSinPrecio + " pedido(s) del sistema anterior no traen precio, así que no suman a los ingresos."
        : "Ingresos tomados de los pedidos con precio calculado por el servidor.";
    }).catch(function(){});
  }
  document.getElementById("r-load").addEventListener("click", cargarRendimiento);

  /* ---------- arranque ---------- */
  if (!KEY) { document.querySelector("main").innerHTML = '<div class="warn">Falta la clave: entra con <b>/panel?key=TU_ADMIN_KEY</b>.</div>'; return; }
  document.getElementById("g-fecha").value = new Date().toISOString().slice(0,10);

  fetch("/catalog").then(function(r){ return r.json(); }).then(function(cat){
    estado.estilos = cat.estilos; estado.densidades = cat.densidades;
    estado.stock = cat.stock || {}; estado.fotos = cat.fotos || {};
    estado.secciones = Object.keys(estado.fotos);
    document.getElementById("s-estilo").innerHTML = estado.estilos.map(function(e){ return '<option>' + esc(e) + '</option>'; }).join("");
    document.getElementById("s-modelo").innerHTML = MODELOS.map(function(m){ return '<option>' + esc(m) + '</option>'; }).join("");
    document.getElementById("f-seccion").innerHTML = estado.secciones.map(function(s){ return '<option>' + esc(s) + '</option>'; }).join("");
    pintarStock(); pintarFotos();
    return Promise.all([ api("/admin/charms"), api("/admin/precios") ]);
  }).then(function(res){
    estado.charms = res[0].charms; estado.precios = res[1].precios;
    pintarCharms(); pintarPrecios();
  }).catch(function(){ toast("No se pudo cargar el catálogo.", true); });
})();
</script>
</body>
</html>`;
}

// Los modelos que ya ofrece el formulario publico. Si cambian ahi, cambian aqui.
const MODELOS_IPHONE = [
  "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone 17e", "iPhone 17", "iPhone Air", "iPhone 17 Pro", "iPhone 17 Pro Max",
];
