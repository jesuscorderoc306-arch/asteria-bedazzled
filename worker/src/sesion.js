// Entrada al panel con usuario y contrasena.
//
// La contrasena nunca se guarda: en Cloudflare vive solo su huella PBKDF2
// (secreto ADMIN_PASS_HASH, generado con `node scripts/hash-contrasena.mjs`).
// Al entrar se crea una sesion aleatoria en KV y el navegador recibe una cookie
// HttpOnly + SameSite=Strict: ningun script ni otro sitio puede leerla o usarla.
//
// X-Admin-Key sigue sirviendo para scripts y pruebas, pero ya no se acepta en
// la URL: un ?key= queda en el historial y en capturas de pantalla.

const COOKIE = "ast_sesion";
const DURACION_S = 7 * 24 * 60 * 60;
const INTENTOS_MAX = 5;
const VENTANA_BLOQUEO_S = 15 * 60;
// Workers limita PBKDF2 a 100 000 iteraciones.
export const ITERACIONES = 100000;

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const deB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derivar(contrasena, sal, iteraciones) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(contrasena), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: sal, iterations: iteraciones }, base, 256);
}

export async function huellaContrasena(contrasena, sal = crypto.getRandomValues(new Uint8Array(16))) {
  const bits = await derivar(contrasena, sal, ITERACIONES);
  return `pbkdf2-sha256$${ITERACIONES}$${b64(sal)}$${b64(bits)}`;
}

function igualSeguro(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function contrasenaValida(contrasena, huella) {
  const partes = String(huella || "").split("$");
  if (partes.length !== 4 || partes[0] !== "pbkdf2-sha256") return false;
  const iteraciones = Number(partes[1]);
  if (!Number.isInteger(iteraciones) || iteraciones < 1 || iteraciones > ITERACIONES) return false;
  const bits = await derivar(contrasena, deB64(partes[2]), iteraciones);
  return igualSeguro(b64(bits), partes[3]);
}

function leerCookie(request) {
  const m = (request.headers.get("Cookie") || "").match(new RegExp(`(?:^|;\s*)${COOKIE}=([a-f0-9]{64})`));
  return m ? m[1] : null;
}

function cookie(valor, maxAge) {
  return `${COOKIE}=${valor}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

function responder(data, status, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "no-store", ...extra },
  });
}

/** Sesion valida por cookie, o clave de scripts por cabecera. Devuelve el usuario o null. */
export async function quienEs(request, env) {
  const token = leerCookie(request);
  if (token && env.ASTERIA_ORDERS) {
    const raw = await env.ASTERIA_ORDERS.get(`sesion:${token}`);
    if (raw) {
      try { return JSON.parse(raw).usuario || null; } catch { return null; }
    }
  }
  const clave = request.headers.get("X-Admin-Key") || "";
  if (env.ADMIN_KEY && clave && igualSeguro(clave, env.ADMIN_KEY)) return "script";
  return null;
}

export async function entrar(request, env) {
  const kv = env.ASTERIA_ORDERS;
  if (!env.ADMIN_USER || !env.ADMIN_PASS_HASH) {
    return responder({ ok: false, error: "acceso_sin_configurar" }, 503);
  }
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const claveIntentos = `rl:login:${ip}`;
  const intentos = parseInt((await kv.get(claveIntentos)) || "0", 10) || 0;
  if (intentos >= INTENTOS_MAX) {
    return responder({ ok: false, error: "demasiados_intentos", minutos: VENTANA_BLOQUEO_S / 60 }, 429);
  }

  let body = null;
  try { body = await request.json(); } catch { /* cuerpo invalido: cuenta como intento fallido */ }
  const usuario = String((body && body.usuario) || "").trim().toLowerCase();
  const contrasena = String((body && body.contrasena) || "");

  // Siempre se calcula la huella, aunque el usuario no coincida: asi el tiempo
  // de respuesta no revela si el usuario existe.
  const passOk = await contrasenaValida(contrasena, env.ADMIN_PASS_HASH);
  const userOk = igualSeguro(usuario, String(env.ADMIN_USER).trim().toLowerCase());

  if (!passOk || !userOk) {
    await kv.put(claveIntentos, String(intentos + 1), { expirationTtl: VENTANA_BLOQUEO_S });
    return responder({ ok: false, error: "datos_incorrectos", restantes: INTENTOS_MAX - intentos - 1 }, 401);
  }

  await kv.delete(claveIntentos);
  const token = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join("");
  await kv.put(`sesion:${token}`, JSON.stringify({ usuario, creada: new Date().toISOString() }), { expirationTtl: DURACION_S });
  return responder({ ok: true, usuario }, 200, { "Set-Cookie": cookie(token, DURACION_S) });
}

export async function salir(request, env) {
  const token = leerCookie(request);
  if (token) await env.ASTERIA_ORDERS.delete(`sesion:${token}`);
  return responder({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
}
