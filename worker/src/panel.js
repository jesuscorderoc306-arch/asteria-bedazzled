// Panel de administracion ASTÉRIA v2.
// HTML autocontenido servido por el worker en /panel?key=ADMIN_KEY.
// Sin dependencias externas: ni fuentes remotas ni librerias. La clave nunca se
// guarda en localStorage; vive en memoria mientras la pestana este abierta.

export function panelHtml() {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Panel ASTÉRIA</title>
<style>
  :root{
    --ink:#050403;--char:#443f3b;--taupe:#6b655e;--maroon:#922939;--green:#2f6b47;
    --paper:#f2efe9;--paper-2:#eae4d9;--card:#fffdfa;--line:rgba(5,4,3,.14);
    --label:'Oswald',system-ui,sans-serif;
    --body:'Jost',system-ui,-apple-system,'Segoe UI',sans-serif;
    --display:'Cormorant Garamond',Georgia,serif;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--body);line-height:1.55;-webkit-font-smoothing:antialiased}
  header{position:sticky;top:0;z-index:10;background:var(--ink);color:var(--paper);padding:14px 20px 0}
  .brand{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
  .brand h1{font-family:var(--display);font-weight:400;font-size:1.5rem;margin:0;letter-spacing:.04em}
  .brand span{font-family:var(--label);text-transform:uppercase;letter-spacing:.24em;font-size:.62rem;opacity:.7}
  nav{display:flex;gap:2px;overflow-x:auto;margin-top:12px;scrollbar-width:none}
  nav::-webkit-scrollbar{display:none}
  nav button{flex:0 0 auto;background:none;border:0;border-bottom:2px solid transparent;color:rgba(242,239,233,.62);
    font-family:var(--label);text-transform:uppercase;letter-spacing:.16em;font-size:.72rem;padding:10px 14px;cursor:pointer;transition:color .18s,border-color .18s}
  nav button:hover{color:var(--paper)}
  nav button[aria-selected="true"]{color:var(--paper);border-bottom-color:var(--paper)}
  /* El foco se ve distinto de la pestana activa: si no, quedan dos "seleccionadas". */
  nav button:focus-visible{outline:2px solid var(--paper);outline-offset:-4px}
  main{max-width:1000px;margin:0 auto;padding:24px 20px 80px}
  section[hidden]{display:none}
  h2{font-family:var(--display);font-weight:400;font-size:1.6rem;margin:0 0 4px}
  .sub{color:var(--taupe);font-size:.88rem;margin:0 0 20px}
  .card{background:var(--card);border:1px solid var(--line);padding:18px;margin-bottom:18px}
  .card h3{font-family:var(--label);text-transform:uppercase;letter-spacing:.18em;font-size:.72rem;font-weight:500;margin:0 0 14px;color:var(--taupe)}
  label{display:block;font-family:var(--label);text-transform:uppercase;letter-spacing:.12em;font-size:.66rem;color:var(--taupe);margin-bottom:5px}
  input,select,textarea{width:100%;font-family:var(--body);font-size:.95rem;padding:9px 11px;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:0}
  input:focus,select:focus,textarea:focus{outline:2px solid var(--ink);outline-offset:-1px}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
  .row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
  button.btn{font-family:var(--label);text-transform:uppercase;letter-spacing:.14em;font-size:.72rem;padding:10px 18px;
    border:1px solid var(--ink);background:var(--ink);color:var(--paper);cursor:pointer;transition:background .2s,color .2s}
  button.btn:hover{background:transparent;color:var(--ink)}
  button.ghost{background:transparent;color:var(--ink)}
  button.ghost:hover{background:var(--ink);color:var(--paper)}
  button.danger{border-color:var(--maroon);background:transparent;color:var(--maroon)}
  button.danger:hover{background:var(--maroon);color:#fff}
  .list{display:grid;gap:10px}
  .item{display:grid;grid-template-columns:56px 1fr auto;gap:12px;align-items:center;background:var(--card);border:1px solid var(--line);padding:10px 12px}
  .item img{width:56px;height:56px;object-fit:cover;background:var(--paper-2)}
  .item .ph{width:56px;height:56px;background:var(--paper-2);display:grid;place-items:center;color:var(--taupe);font-size:1.1rem}
  .item b{font-weight:500}
  .meta{color:var(--taupe);font-size:.82rem}
  .tag{display:inline-block;font-family:var(--label);text-transform:uppercase;letter-spacing:.12em;font-size:.6rem;padding:2px 7px;border:1px solid var(--line);color:var(--taupe);margin-left:6px}
  .tag.out{color:var(--maroon);border-color:var(--maroon)}
  .kpis{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}
  .kpi{background:var(--card);border:1px solid var(--line);padding:16px}
  .kpi .n{font-family:var(--display);font-size:2rem;line-height:1.1}
  .kpi .n.neg{color:var(--maroon)}
  .kpi .n.pos{color:var(--green)}
  .kpi .l{font-family:var(--label);text-transform:uppercase;letter-spacing:.14em;font-size:.62rem;color:var(--taupe)}
  table{width:100%;border-collapse:collapse;font-size:.88rem}
  th,td{border-bottom:1px solid var(--line);padding:8px 6px;text-align:left}
  th{font-family:var(--label);text-transform:uppercase;letter-spacing:.12em;font-size:.62rem;color:var(--taupe);font-weight:500}
  .empty{color:var(--taupe);font-size:.9rem;padding:14px 0}
  .warn{border:1px solid var(--maroon);color:var(--maroon);background:var(--card);padding:14px 16px;font-size:.88rem;margin-bottom:18px}
  #toast{position:fixed;left:50%;transform:translateX(-50%) translateY(20px);bottom:24px;background:var(--ink);color:var(--paper);
    padding:12px 20px;font-size:.86rem;opacity:0;pointer-events:none;transition:opacity .22s,transform .22s;z-index:50;max-width:90vw}
  #toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
  #toast.err{background:var(--maroon)}
  @media (max-width:560px){ .item{grid-template-columns:44px 1fr}.item .acts{grid-column:1/-1;display:flex;gap:8px} .item img,.item .ph{width:44px;height:44px} }
</style>
</head>
<body>
<header>
  <div class="brand"><h1>★ ASTÉRIA</h1><span>Panel de administración</span></div>
  <nav id="tabs" role="tablist">
    <button role="tab" data-tab="charms" aria-selected="true">Charms</button>
    <button role="tab" data-tab="precios" aria-selected="false">Precios</button>
    <button role="tab" data-tab="stock" aria-selected="false">Stock</button>
    <button role="tab" data-tab="fotos" aria-selected="false">Fotos</button>
    <button role="tab" data-tab="gastos" aria-selected="false">Gastos</button>
    <button role="tab" data-tab="rendimiento" aria-selected="false">Rendimiento</button>
  </nav>
</header>

<main>
  <!-- CHARMS -->
  <section id="tab-charms">
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
      <div class="row" style="margin-top:14px"><button class="btn" id="c-add">Agregar</button></div>
    </div>
    <div class="list" id="charms-list"></div>
  </section>

  <!-- PRECIOS -->
  <section id="tab-precios" hidden>
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
    <button class="btn" id="p-save">Guardar precios</button>
  </section>

  <!-- STOCK -->
  <section id="tab-stock" hidden>
    <h2>Stock de fundas</h2>
    <p class="sub">Solo hace falta capturar lo que se agota. Un modelo sin registro se considera disponible.</p>
    <div class="card">
      <h3>Marcar disponibilidad</h3>
      <div class="grid">
        <div><label for="s-estilo">Estilo</label><select id="s-estilo"></select></div>
        <div><label for="s-modelo">Modelo</label><select id="s-modelo"></select></div>
        <div><label for="s-cantidad">Piezas (vacío = quitar límite)</label><input id="s-cantidad" type="number" min="0" step="1" inputmode="numeric"></div>
      </div>
      <div class="row" style="margin-top:14px"><button class="btn" id="s-save">Guardar</button></div>
    </div>
    <div class="card"><h3>Registros actuales</h3><div id="stock-list"></div></div>
  </section>

  <!-- FOTOS -->
  <section id="tab-fotos" hidden>
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
      <div class="row" style="margin-top:14px"><button class="btn" id="g-add">Registrar</button></div>
    </div>
    <div class="card"><h3>Historial</h3><div id="gastos-list"></div></div>
  </section>

  <!-- RENDIMIENTO -->
  <section id="tab-rendimiento" hidden>
    <h2>Rendimiento</h2>
    <p class="sub">Ingresos tomados de los pedidos con precio calculado; los pedidos antiguos sin precio se cuentan aparte.</p>
    <div class="card">
      <div class="row">
        <div><label for="r-desde">Desde</label><input id="r-desde" type="date"></div>
        <div><label for="r-hasta">Hasta</label><input id="r-hasta" type="date"></div>
        <button class="btn ghost" id="r-load">Actualizar</button>
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
        '<div><b>' + esc(c.nombre) + '</b>' +
          (c.categoria ? '<span class="tag">' + esc(c.categoria) + '</span>' : '') +
          (agotado ? '<span class="tag out">' + (c.activo === false ? 'oculto' : 'agotado') + '</span>' : '') +
          '<div class="meta">' + money(c.precio) + ' · ' + (c.stock||0) + ' pzas</div></div>' +
        '<div class="acts">' +
          '<button class="btn ghost" data-act="editar">Editar</button> ' +
          '<button class="btn danger" data-act="borrar">Borrar</button>' +
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
        '<div class="acts"><button class="btn danger" data-act="quitar">Quitar</button></div></div>';
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
            '<td><button class="btn danger" data-gasto="' + esc(g.id) + '">Borrar</button></td></tr>';
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
      var clase = r.utilidad > 0 ? "pos" : (r.utilidad < 0 ? "neg" : "");
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
