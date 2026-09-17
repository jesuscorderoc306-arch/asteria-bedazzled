// Pruebas del worker v2 contra un KV en memoria. `node --test worker/test`.
// Cubren lo que puede costar dinero si se rompe: autorizacion, precios,
// stock, imagenes y rendimiento.

import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";
import { entorno } from "./mock-kv.mjs";
import { calcularPrecio, preciosVacios } from "../src/catalog.js";
import { huellaContrasena } from "../src/sesion.js";

const BASE = "https://w.test";
const KEY = "clave-de-prueba-123456";

function pedir(ruta, { method = "GET", json, tipo, body, key, cookie, ip } = {}) {
  const headers = {};
  if (cookie) headers.Cookie = cookie;
  if (ip) headers["CF-Connecting-IP"] = ip;
  if (json !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
  if (tipo) headers["Content-Type"] = tipo;
  if (key) headers["X-Admin-Key"] = key;
  return new Request(BASE + ruta, { method, headers, body });
}

const llamar = (env, ruta, opciones) => worker.fetch(pedir(ruta, opciones), env, {});
const leer = async (res) => JSON.parse(await res.text());

test("/admin exige sesion o la clave de scripts", async () => {
  const env = entorno();
  assert.equal((await llamar(env, "/admin/charms")).status, 401);
  assert.equal((await llamar(env, "/admin/charms", { key: "otra-clave-invalida" })).status, 401);
  assert.equal((await llamar(env, "/admin/charms?key=" + KEY)).status, 401, "la clave en la URL ya no sirve");
  assert.equal((await llamar(env, "/admin/charms", { key: KEY })).status, 200);
});

test("/panel es solo la puerta: HTML sin datos, con modelos y sin marcadores sin llenar", async () => {
  const env = entorno();
  await env.ASTERIA_ORDERS.put("order:2026-08-01T10:00:00.000Z:SECRETO", JSON.stringify({ orderId: "SECRETO", ig: "clienta_privada" }));
  const res = await llamar(env, "/panel");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type"), /text\/html/);
  assert.equal(res.headers.get("X-Frame-Options"), "DENY");
  const html = await res.text();
  assert.ok(!html.includes("clienta_privada") && !html.includes("SECRETO"));
  assert.ok(!html.includes("__LOGO__") && !html.includes("__MODELOS__"));
  assert.ok(html.includes("iPhone 18 Pro Max"));
});

async function entornoConUsuario() {
  return entorno({ ADMIN_USER: "Asteria", ADMIN_PASS_HASH: await huellaContrasena("una-contrasena-larga") });
}

test("entrar con usuario y contrasena da una cookie segura que abre /admin", async () => {
  const env = await entornoConUsuario();
  const mal = await llamar(env, "/admin/login", { method: "POST", json: { usuario: "asteria", contrasena: "otra" } });
  assert.equal(mal.status, 401);
  assert.equal(mal.headers.get("Set-Cookie"), null);

  const ok = await llamar(env, "/admin/login", { method: "POST", json: { usuario: " ASTERIA ", contrasena: "una-contrasena-larga" } });
  assert.equal(ok.status, 200);
  const galleta = ok.headers.get("Set-Cookie");
  assert.match(galleta, /HttpOnly/); assert.match(galleta, /Secure/); assert.match(galleta, /SameSite=Strict/);
  const cookie = galleta.split(";")[0];

  const yo = await leer(await llamar(env, "/admin/yo", { cookie }));
  assert.equal(yo.usuario, "asteria");

  const fuera = await llamar(env, "/admin/logout", { method: "POST", cookie });
  assert.match(fuera.headers.get("Set-Cookie"), /Max-Age=0/);
  assert.equal((await llamar(env, "/admin/yo", { cookie })).status, 401, "cerrar sesion la invalida en el servidor");
});

test("cinco intentos fallidos bloquean la entrada aunque despues se atine", async () => {
  const env = await entornoConUsuario();
  for (let i = 0; i < 5; i++) {
    assert.equal((await llamar(env, "/admin/login", { method: "POST", ip: "9.9.9.9", json: { usuario: "asteria", contrasena: "x" + i } })).status, 401);
  }
  const bloqueado = await llamar(env, "/admin/login", { method: "POST", ip: "9.9.9.9", json: { usuario: "asteria", contrasena: "una-contrasena-larga" } });
  assert.equal(bloqueado.status, 429);
  const otraIp = await llamar(env, "/admin/login", { method: "POST", ip: "8.8.8.8", json: { usuario: "asteria", contrasena: "una-contrasena-larga" } });
  assert.equal(otraIp.status, 200);
});

test("sin usuario configurado nadie entra", async () => {
  const env = entorno();
  const r = await llamar(env, "/admin/login", { method: "POST", json: { usuario: "", contrasena: "" } });
  assert.equal(r.status, 503);
});

test("pedidos: estados, precio a mano y rendimiento", async () => {
  const env = entorno();
  const kv = env.ASTERIA_ORDERS;
  await kv.put("order:2026-08-01T10:00:00.000Z:A1", JSON.stringify({ orderId: "A1", ig: "ana", total: 500, receivedAt: "2026-08-01T10:00:00.000Z", ip: "1.2.3.4" }));
  await kv.put("order:2026-08-02T10:00:00.000Z:A2", JSON.stringify({ orderId: "A2", ig: "lu", receivedAt: "2026-08-02T10:00:00.000Z" }));
  await kv.put("order:2026-09-02T10:00:00.000Z:A3", JSON.stringify({ orderId: "A3", ig: "mar", total: 300, receivedAt: "2026-09-02T10:00:00.000Z" }));

  const agosto = await leer(await llamar(env, "/admin/pedidos?mes=2026-08", { key: KEY }));
  assert.deepEqual(agosto.pedidos.map((p) => p.orderId), ["A2", "A1"], "solo el mes pedido, el mas nuevo primero");
  assert.ok(agosto.pedidos.every((p) => p.estado === "nuevo"), "los pedidos viejos entran como nuevos");
  assert.ok(agosto.pedidos.every((p) => p.ip === undefined), "la IP de la clienta no sale al panel");

  const clave = agosto.pedidos[0].clave;
  assert.equal((await llamar(env, "/admin/pedidos", { method: "PUT", key: KEY, json: { clave, estado: "volando" } })).status, 400);
  assert.equal((await llamar(env, "/admin/pedidos", { method: "PUT", key: KEY, json: { clave: "expense:x", estado: "listo" } })).status, 400);
  const puesto = await leer(await llamar(env, "/admin/pedidos", { method: "PUT", key: KEY, json: { clave, estado: "listo", totalManual: "450", nota: "paga al entregar" } }));
  assert.equal(puesto.pedido.estado, "listo");
  assert.equal(puesto.pedido.totalManual, 450);
  assert.equal(JSON.parse(await kv.get("orderid:A2")).estado, "listo", "el indice por folio queda igual");

  let r = await leer(await llamar(env, "/admin/rendimiento?desde=2026-08-01&hasta=2026-08-31", { key: KEY }));
  assert.equal(r.ingresos, 950);
  assert.equal(r.pedidosSinPrecio, 0);

  const a1 = agosto.pedidos[1].clave;
  await llamar(env, "/admin/pedidos", { method: "PUT", key: KEY, json: { clave: a1, estado: "cancelado" } });
  r = await leer(await llamar(env, "/admin/rendimiento?desde=2026-08-01&hasta=2026-08-31", { key: KEY }));
  assert.equal(r.ingresos, 450, "un pedido cancelado no es ingreso");
  assert.equal(r.pedidos, 1);
});

test("el pedido guarda las posiciones y la foto del diseno, y nunca falla por la foto", async () => {
  const env = entorno();
  const fetchReal = globalThis.fetch;
  globalThis.fetch = async (url) => new Response(JSON.stringify(String(url).includes("turnstile") ? { success: true } : { ok: true }), { status: 200 });
  try {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]).toString("base64");
    const base = { ig: "ana", tipo: "charms", modelo: "iPhone 15", funda: "Blanca", pasta: "Negra", turnstileToken: "t" };
    const ok = await llamar(env, "/", { method: "POST", ip: "5.5.5.5", json: { ...base, orderId: "F1",
      diseno: { color: "Blanca", piezas: [{ id: "p1", nombre: "Estrella", x: 140, y: 20, rot: 45, extra: "<script>" }] },
      disenoImg: "data:image/jpeg;base64," + jpeg } });
    assert.equal(ok.status, 200);
    const rec = JSON.parse(await env.ASTERIA_ORDERS.get("orderid:F1"));
    assert.equal(rec.tipo, "charms");
    assert.equal(rec.estado, "nuevo");
    assert.deepEqual(rec.diseno.piezas[0], { id: "p1", nombre: "Estrella", x: 100, y: 20, rot: 45 }, "posiciones acotadas y sin campos extra");
    assert.match(rec.disenoImg, /^diseno_/);
    const img = await llamar(env, "/img/" + rec.disenoImg);
    assert.equal(img.headers.get("Content-Type"), "image/jpeg");

    const sinFoto = await llamar(env, "/", { method: "POST", ip: "6.6.6.6", json: { ...base, orderId: "F2", disenoImg: "data:text/html;base64,PHNjcmlwdD4=" } });
    assert.equal(sinFoto.status, 200, "una foto invalida no tumba el pedido");
    assert.equal(JSON.parse(await env.ASTERIA_ORDERS.get("orderid:F2")).disenoImg, null);
  } finally {
    globalThis.fetch = fetchReal;
  }
});

test("catalogo vacio no inventa precios", async () => {
  const env = entorno();
  const cat = await leer(await llamar(env, "/catalog"));
  assert.deepEqual(cat.charms, []);
  assert.equal(cat.precios, null);
  assert.equal(cat.preciosListos, false);
});

test("alta, edicion y baja de charms", async () => {
  const env = entorno();
  const alta = await leer(await llamar(env, "/admin/charms", { method: "POST", key: KEY, json: { nombre: "Estrella", precio: 25, stock: 10, categoria: "Gemas" } }));
  assert.equal(alta.ok, true);
  assert.equal(alta.charm.nombre, "Estrella");

  const id = alta.charm.id;
  const edit = await leer(await llamar(env, `/admin/charms/${id}`, { method: "PUT", key: KEY, json: { nombre: "Estrella dorada", stock: 3 } }));
  assert.equal(edit.charm.nombre, "Estrella dorada");
  assert.equal(edit.charm.stock, 3);
  assert.equal(edit.charm.precio, 25, "el precio previo se conserva si no se manda");

  assert.equal((await llamar(env, "/admin/charms/no-existe", { method: "DELETE", key: KEY })).status, 404);
  const baja = await leer(await llamar(env, `/admin/charms/${id}`, { method: "DELETE", key: KEY }));
  assert.equal(baja.ok, true);
  assert.deepEqual((await leer(await llamar(env, "/admin/charms", { key: KEY }))).charms, []);
});

test("un charm agotado no se ofrece al publico", async () => {
  const env = entorno();
  await llamar(env, "/admin/charms", { method: "POST", key: KEY, json: { nombre: "Corazon", precio: 20, stock: 0 } });
  const cat = await leer(await llamar(env, "/catalog"));
  assert.equal(cat.charms.length, 1);
  assert.equal(cat.charms[0].disponible, false);
});

test("el precio se calcula en el servidor y respeta el stock", async () => {
  const env = entorno();
  await llamar(env, "/admin/precios", {
    method: "PUT", key: KEY,
    json: { base: { "Pasta blanca/negra": 400, "Transparente": 380 }, densidad: { Maximalista: 150, Minimalista: 80 }, envio: 120 },
  });
  const charm = (await leer(await llamar(env, "/admin/charms", { method: "POST", key: KEY, json: { nombre: "Perla", precio: 15, stock: 2 } }))).charm;

  const ok = await leer(await llamar(env, "/precio", {
    method: "POST",
    json: { style: "Transparente", dens: "Minimalista", modelo: "iPhone 15", charms: [{ id: charm.id, qty: 2 }] },
  }));
  assert.equal(ok.ok, true);
  assert.equal(ok.total, 380 + 80 + 30 + 120);

  const demasiados = await leer(await llamar(env, "/precio", {
    method: "POST",
    json: { style: "Transparente", dens: "Minimalista", modelo: "iPhone 15", charms: [{ id: charm.id, qty: 9 }] },
  }));
  assert.equal(demasiados.ok, false);
  assert.equal(demasiados.error, "charm_sin_stock_suficiente");

  const inventado = await leer(await llamar(env, "/precio", {
    method: "POST",
    json: { style: "Transparente", dens: "Minimalista", modelo: "iPhone 15", charms: [{ id: "charm_falso", qty: 1 }] },
  }));
  assert.equal(inventado.error, "charm_desconocido");
});

test("sin precios capturados no hay total, nunca un numero inventado", () => {
  const r = calcularPrecio(
    { style: "Transparente", dens: "Minimalista", modelo: "iPhone 15", charms: [] },
    { charms: [], precios: preciosVacios(), stock: {} }
  );
  assert.equal(r.ok, false);
  assert.equal(r.error, "precios_no_capturados");
  assert.equal(r.total, undefined);
});

test("un modelo en cero deja de venderse; los no capturados siguen disponibles", async () => {
  const env = entorno();
  await llamar(env, "/admin/precios", {
    method: "PUT", key: KEY,
    json: { base: { "Pasta blanca/negra": 400, "Transparente": 380 }, densidad: { Maximalista: 150, Minimalista: 80 } },
  });
  await llamar(env, "/admin/stock", { method: "PUT", key: KEY, json: { estilo: "Transparente", modelo: "iPhone 13", cantidad: 0 } });

  const agotado = await leer(await llamar(env, "/precio", { method: "POST", json: { style: "Transparente", dens: "Minimalista", modelo: "iPhone 13" } }));
  assert.equal(agotado.error, "modelo_agotado");

  const libre = await leer(await llamar(env, "/precio", { method: "POST", json: { style: "Transparente", dens: "Minimalista", modelo: "iPhone 16" } }));
  assert.equal(libre.ok, true);
});

test("imagenes: se guardan, se sirven con cache larga y se rechaza lo que no es imagen", async () => {
  const env = entorno();
  const bytes = new Uint8Array([82, 73, 70, 70, 1, 2, 3, 4]);
  const subida = await leer(await llamar(env, "/admin/imagen", { method: "POST", key: KEY, tipo: "image/webp", body: bytes }));
  assert.equal(subida.ok, true);

  const img = await llamar(env, "/img/" + subida.id);
  assert.equal(img.status, 200);
  assert.equal(img.headers.get("Content-Type"), "image/webp");
  assert.match(img.headers.get("Cache-Control"), /immutable/);
  assert.equal((await llamar(env, "/img/no_existe")).status, 404);

  const mal = await llamar(env, "/admin/imagen", { method: "POST", key: KEY, tipo: "application/pdf", body: bytes });
  assert.equal(mal.status, 415);
});

test("fotos por seccion: solo secciones conocidas", async () => {
  const env = entorno();
  const ok = await leer(await llamar(env, "/admin/fotos/galeria", { method: "PUT", key: KEY, json: { fotos: ["img_a", "img_b"] } }));
  assert.deepEqual(ok.fotos, ["img_a", "img_b"]);
  assert.deepEqual((await leer(await llamar(env, "/catalog"))).fotos.galeria, ["img_a", "img_b"]);
  assert.equal((await llamar(env, "/admin/fotos/inventada", { method: "PUT", key: KEY, json: { fotos: [] } })).status, 400);
});

test("gastos y rendimiento: ingresos solo de pedidos con precio", async () => {
  const env = entorno();
  await env.ASTERIA_ORDERS.put("order:2026-08-01T10:00:00.000Z:A1", JSON.stringify({ orderId: "A1", total: 500, receivedAt: "2026-08-01T10:00:00.000Z" }));
  await env.ASTERIA_ORDERS.put("order:2026-08-02T10:00:00.000Z:A2", JSON.stringify({ orderId: "A2", receivedAt: "2026-08-02T10:00:00.000Z" }));

  await llamar(env, "/admin/gastos", { method: "POST", key: KEY, json: { fecha: "2026-08-01", concepto: "Gemas", categoria: "Material", monto: 180 } });
  const r = await leer(await llamar(env, "/admin/rendimiento", { key: KEY }));
  assert.equal(r.ingresos, 500);
  assert.equal(r.gastos, 180);
  assert.equal(r.utilidad, 320);
  assert.equal(r.pedidos, 2);
  assert.equal(r.pedidosSinPrecio, 1, "el pedido viejo cuenta como pedido pero no como ingreso");

  const filtrado = await leer(await llamar(env, "/admin/rendimiento?desde=2026-08-02", { key: KEY }));
  assert.equal(filtrado.ingresos, 0);
  assert.equal(filtrado.pedidos, 1);
});

test("las rutas de produccion siguen respondiendo igual", async () => {
  const env = entorno();
  assert.equal((await llamar(env, "/orders")).status, 403);
  assert.equal((await llamar(env, "/orders?key=" + KEY)).status, 200);

  const noEncontrado = await leer(await llamar(env, "/order?folio=XXXX"));
  assert.equal(noEncontrado.found, false);

  assert.equal((await llamar(env, "/event", { method: "POST", json: { event: "form_open" } })).status, 204);
  assert.equal(await env.ASTERIA_ORDERS.get(`stat:${new Date().toISOString().slice(0, 10)}:form_open`), "1");

  assert.equal((await llamar(env, "/ruta-inexistente")).status, 405, "GET desconocido sigue cayendo en el handler de pedidos");
});
