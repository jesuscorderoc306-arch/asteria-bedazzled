// Catalogo v2: charms, precios, stock y fotos por seccion.
// Regla dura del proyecto: los precios NUNCA se inventan en el codigo ni en el
// navegador. Viven en KV, los edita la duena desde el panel, y el total siempre
// se recalcula aqui (servidor) al recibir el pedido.

export const KEY_CHARMS = "catalog:charms";
export const KEY_PRECIOS = "catalog:precios";
export const KEY_STOCK = "catalog:stock";
export const KEY_FOTOS = (seccion) => `catalog:fotos:${seccion}`;

// Estilos y densidades: son los que ya usa el formulario publico. Si cambian ahi,
// cambian aqui. No se inventan opciones nuevas desde el panel.
export const ESTILOS = ["Pasta blanca/negra", "Transparente"];
export const DENSIDADES = ["Maximalista", "Minimalista"];
export const SECCIONES_FOTO = ["hero", "galeria", "charms", "estilos"];

// Estructura vacia, no un precio inventado: mientras la duena no capture precios,
// el sitio debe decir "precio a confirmar" en vez de mostrar un numero falso.
export function preciosVacios() {
  return {
    moneda: "MXN",
    base: Object.fromEntries(ESTILOS.map((e) => [e, null])),
    densidad: Object.fromEntries(DENSIDADES.map((d) => [d, null])),
    envio: null,
    actualizado: null,
  };
}

async function readJSON(kv, key, fallback) {
  if (!kv) return fallback;
  try {
    const raw = await kv.get(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getCharms(kv) {
  const list = await readJSON(kv, KEY_CHARMS, []);
  return Array.isArray(list) ? list : [];
}

export async function getPrecios(kv) {
  const p = await readJSON(kv, KEY_PRECIOS, null);
  if (!p || typeof p !== "object") return preciosVacios();
  return { ...preciosVacios(), ...p, base: { ...preciosVacios().base, ...(p.base || {}) }, densidad: { ...preciosVacios().densidad, ...(p.densidad || {}) } };
}

export async function getStock(kv) {
  const s = await readJSON(kv, KEY_STOCK, {});
  return s && typeof s === "object" ? s : {};
}

export async function getFotos(kv, seccion) {
  const f = await readJSON(kv, KEY_FOTOS(seccion), []);
  return Array.isArray(f) ? f : [];
}

// Un precio esta "completo" cuando cada estilo y cada densidad tienen numero.
// Con precios incompletos el sitio publico no muestra total.
export function preciosCompletos(precios) {
  const num = (v) => typeof v === "number" && isFinite(v) && v >= 0;
  return (
    ESTILOS.every((e) => num(precios.base?.[e])) &&
    DENSIDADES.every((d) => num(precios.densidad?.[d]))
  );
}

export function charmDisponible(charm) {
  return !!charm && charm.activo !== false && (charm.stock ?? 0) > 0;
}

// Stock de fundas: { "<estilo>": { "<modelo>": cantidad } }.
// Sin registro para un modelo asumimos disponible: la duena solo captura lo que
// se le agota, no las 24 combinaciones de iPhone.
export function fundaDisponible(stock, estilo, modelo) {
  const porEstilo = stock?.[estilo];
  if (!porEstilo || !(modelo in porEstilo)) return true;
  const n = porEstilo[modelo];
  return typeof n === "number" ? n > 0 : !!n;
}

/**
 * Calcula el total de un pedido. Es la unica autoridad de precio.
 * seleccion: { style, dens, modelo, charms: [{ id, qty }] }
 * Devuelve { ok, error?, total, moneda, desglose[] }.
 */
export function calcularPrecio(seleccion, { charms, precios, stock }) {
  const sel = seleccion || {};
  const desglose = [];

  if (!ESTILOS.includes(sel.style)) return { ok: false, error: "estilo_invalido" };
  if (!DENSIDADES.includes(sel.dens)) return { ok: false, error: "densidad_invalida" };
  if (!sel.modelo) return { ok: false, error: "modelo_faltante" };
  if (!preciosCompletos(precios)) return { ok: false, error: "precios_no_capturados" };
  if (!fundaDisponible(stock, sel.style, sel.modelo)) return { ok: false, error: "modelo_agotado" };

  const base = precios.base[sel.style];
  const dens = precios.densidad[sel.dens];
  desglose.push({ concepto: `Funda ${sel.style}`, monto: base });
  desglose.push({ concepto: `Densidad ${sel.dens}`, monto: dens });

  const porId = new Map(charms.map((c) => [c.id, c]));
  const pedidos = Array.isArray(sel.charms) ? sel.charms : [];
  for (const item of pedidos) {
    const charm = porId.get(item?.id);
    const qty = Math.max(0, Math.floor(Number(item?.qty) || 0));
    if (!charm) return { ok: false, error: "charm_desconocido", id: item?.id };
    if (qty === 0) continue;
    if (!charmDisponible(charm)) return { ok: false, error: "charm_agotado", id: charm.id };
    if (qty > (charm.stock ?? 0)) return { ok: false, error: "charm_sin_stock_suficiente", id: charm.id };
    if (typeof charm.precio !== "number" || !isFinite(charm.precio) || charm.precio < 0) {
      return { ok: false, error: "charm_sin_precio", id: charm.id };
    }
    desglose.push({ concepto: `${charm.nombre} x${qty}`, monto: charm.precio * qty });
  }

  const envio = typeof precios.envio === "number" ? precios.envio : 0;
  if (envio > 0) desglose.push({ concepto: "Envio", monto: envio });

  const total = desglose.reduce((acc, l) => acc + l.monto, 0);
  return { ok: true, total, moneda: precios.moneda || "MXN", desglose };
}

// Vista publica del catalogo: sin stock crudo de charms (solo disponible si/no),
// y sin precios cuando estan incompletos.
export async function catalogoPublico(kv) {
  const [charms, precios, stock] = await Promise.all([getCharms(kv), getPrecios(kv), getStock(kv)]);
  const fotos = {};
  for (const s of SECCIONES_FOTO) fotos[s] = await getFotos(kv, s);
  const completos = preciosCompletos(precios);
  return {
    charms: charms
      .filter((c) => c.activo !== false)
      .map((c) => ({
        id: c.id,
        nombre: c.nombre,
        categoria: c.categoria || "",
        imgId: c.imgId || null,
        precio: completos && typeof c.precio === "number" ? c.precio : null,
        disponible: charmDisponible(c),
        max: Math.max(0, Math.min(20, c.stock ?? 0)),
      })),
    precios: completos ? precios : null,
    preciosListos: completos,
    stock,
    fotos,
    estilos: ESTILOS,
    densidades: DENSIDADES,
  };
}
