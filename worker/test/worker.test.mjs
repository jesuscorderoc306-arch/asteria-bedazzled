// Pruebas del worker v2 contra un KV en memoria. `node --test worker/test`.
// Cubren lo que puede costar dinero si se rompe: autorizacion, precios,
// stock, imagenes y rendimiento.

import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";
import { entorno } from "./mock-kv.mjs";
import { calcularPrecio, preciosVacios } from "../src/catalog.js";

const BASE = "https://w.test";
const KEY = "clave-de-prueba-123456";

function pedir(ruta, { method = "GET", json, tipo, body, key } = {}) {
  const headers = {};
  if (json !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
  if (tipo) headers["Content-Type"] = tipo;
  if (key) headers["X-Admin-Key"] = key;
  return new Request(BASE + ruta, { method, headers, body });
}

const llamar = (env, ruta, opciones) => worker.fetch(pedir(ruta, opciones), env, {});
const leer = async (res) => JSON.parse(await res.text());

test("/admin exige la clave correcta", async () => {
  const env = entorno();
  assert.equal((await llamar(env, "/admin/charms")).status, 403);
  assert.equal((await llamar(env, "/admin/charms", { key: "otra-clave-invalida" })).status, 403);
  assert.equal((await llamar(env, "/admin/charms", { key: KEY })).status, 200);
});

test("/panel sin clave no expone nada", async () => {
  const env = entorno();
  const res = await llamar(env, "/panel");
  assert.equal(res.status, 403);
  const ok = await llamar(env, "/panel?key=" + KEY);
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get("Content-Type"), /text\/html/);
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
