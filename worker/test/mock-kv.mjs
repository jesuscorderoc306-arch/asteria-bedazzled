// KV falso en memoria: suficiente para probar el worker sin tocar Cloudflare.
// Implementa lo que usamos: get, getWithMetadata, put, delete y list({prefix}).

export class MockKV {
  constructor() {
    this.store = new Map(); // clave -> { valor, metadata }
  }

  async get(key, opciones) {
    const rec = this.store.get(key);
    if (!rec) return null;
    const tipo = typeof opciones === "string" ? opciones : opciones && opciones.type;
    if (tipo === "arrayBuffer") return rec.valor;
    return typeof rec.valor === "string" ? rec.valor : new TextDecoder().decode(rec.valor);
  }

  async getWithMetadata(key, opciones) {
    const rec = this.store.get(key);
    if (!rec) return { value: null, metadata: null };
    return { value: await this.get(key, opciones), metadata: rec.metadata || null };
  }

  async put(key, valor, opciones = {}) {
    this.store.set(key, { valor, metadata: opciones.metadata || null });
  }

  async delete(key) {
    this.store.delete(key);
  }

  async list({ prefix = "", limit = 1000 } = {}) {
    const keys = [...this.store.keys()]
      .filter((k) => k.startsWith(prefix))
      .sort()
      .slice(0, limit)
      .map((name) => ({ name }));
    return { keys, list_complete: true };
  }
}

export function entorno(extra = {}) {
  return {
    ASTERIA_ORDERS: new MockKV(),
    ADMIN_KEY: "clave-de-prueba-123456",
    ALLOWED_ORIGINS: "https://asteriamx.pages.dev",
    TELEGRAM_CHAT_IDS: "1",
    TELEGRAM_TOKEN: "falso",
    TURNSTILE_SECRET: "falso",
    ...extra,
  };
}
