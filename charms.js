/* Catálogo de charms de ASTÉRIA.
 *
 * Nombres y medidas tomados del tablero "CHARMS AND PIECES" del taller.
 * `mm` es la medida real de la pieza: de ahí sale su tamaño sobre la funda en
 * el editor, para que lo que la clienta ve sea del tamaño que le va a llegar.
 * Cuando la medida viene en rango (2-3 cm) se usa el punto medio.
 *
 * `forma` es una silueta PROVISIONAL mientras llegan las fotos recortadas de
 * cada pieza. En cuanto el catálogo del worker traiga `imgId`, la foto real
 * sustituye a la silueta sin tocar este archivo.
 *
 * Nada de esto lleva precio: los precios viven en el panel, nunca en el código.
 */
window.ASTERIA_CHARMS = [
  { n: 1, id: "c01", nombre: "Ángel", mm: 27, forma: "angel", tono: "plata", cat: "Figuras" },
  { n: 2, id: "c02", nombre: "Pez plata", mm: 30, forma: "pez", tono: "plata", cat: "Mar" },
  { n: 3, id: "c03", nombre: "Concha de perla grande", mm: 45, forma: "vieira", tono: "perla", cat: "Mar" },
  { n: 4, id: "c04", nombre: "Concha clavígera", mm: 25, forma: "caracola", tono: "perla", cat: "Mar" },
  { n: 5, id: "c05", nombre: "Caracola pequeña", mm: 15, forma: "caracola", tono: "perla", cat: "Mar" },
  { n: 6, id: "c06", nombre: "Piedra ovalada azul cielo", mm: 15, forma: "piedra", tono: "turquesa", cat: "Piedras" },
  { n: 7, id: "c07", nombre: "Concha de perla chica", mm: 18, forma: "vieira", tono: "perla", cat: "Mar" },
  { n: 8, id: "c08", nombre: "Mano", mm: 25, forma: "mano", tono: "plata", cat: "Figuras" },
  { n: 9, id: "c09", nombre: "Aleta dorada", mm: 20, forma: "aleta", tono: "oro", cat: "Mar" },
  { n: 10, id: "c10", nombre: "Naipes", mm: 13, forma: "naipes", tono: "esmalte", cat: "Figuras" },
  { n: 11, id: "c11", nombre: "Corazón I", mm: 25, forma: "corazonSagrado", tono: "rojo", cat: "Corazones" },
  { n: 12, id: "c12", nombre: "Corazón II", mm: 25, forma: "corazonSagrado", tono: "rojo", cat: "Corazones" },
  { n: 13, id: "c13", nombre: "Cabeza de buey", mm: 20, forma: "buey", tono: "oro", cat: "Figuras" },
  { n: 14, id: "c14", nombre: "Tejana en plata u oro", mm: 20, forma: "sombrero", tono: "oro", cat: "Figuras" },
  { n: 15, id: "c15", nombre: "Concha cauri con detalle dorado", mm: 20, forma: "cauri", tono: "oro", cat: "Mar" },
  { n: 16, id: "c16", nombre: "Estrella dorada o plateada mini", mm: 10, forma: "estrella", tono: "oro", cat: "Estrellas" },
  { n: 17, id: "c17", nombre: "Tortuga dorada", mm: 25, forma: "tortuga", tono: "oro", cat: "Mar" },
  { n: 18, id: "c18", nombre: "Concha caracola en plata u oro", mm: 30, forma: "caracolaEspiral", tono: "oro", cat: "Mar" },
  { n: 19, id: "c19", nombre: "Estrella de mar dorada o plateada", mm: 30, forma: "estrellaMar", tono: "oro", cat: "Estrellas" },
  { n: 20, id: "c20", nombre: "Estrella de mar mini", mm: 20, forma: "estrellaMar", tono: "plata", cat: "Estrellas" },
  { n: 21, id: "c21", nombre: "Libélula", mm: 20, forma: "libelula", tono: "plata", cat: "Figuras" },
  { n: 22, id: "c22", nombre: "Bota vaquera en plata u oro", mm: 20, forma: "bota", tono: "oro", cat: "Figuras" },
  { n: 23, id: "c23", nombre: "Sol", mm: 40, forma: "sol", tono: "oro", cat: "Cielo" },
  { n: 24, id: "c24", nombre: "Estrella de mar dorada grande", mm: 40, forma: "estrellaMar", tono: "oro", cat: "Estrellas" },
  { n: 25, id: "c25", nombre: "Dije corazón con letra", mm: 15, forma: "corazonDije", tono: "negro", cat: "Corazones" },
  { n: 26, id: "c26", nombre: "Jaguar plata u oro", mm: 25, forma: "jaguar", tono: "oro", cat: "Figuras" },
  { n: 27, id: "c27", nombre: "Ala plateada", mm: 15, forma: "ala", tono: "plata", cat: "Figuras" },
  { n: 28, id: "c28", nombre: "Perlas asimétricas", mm: 10, forma: "perlaIrregular", tono: "perla", cat: "Perlas" },
  { n: 29, id: "c29", nombre: "Bola de billar", mm: 10, forma: "bola8", tono: "negro", cat: "Figuras" },
  { n: 30, id: "c30", nombre: "Letras color plata", mm: 10, forma: "letra", tono: "plata", cat: "Letras" },
  { n: 31, id: "c31", nombre: "Tipo cuarzo pequeño", mm: 12, forma: "piedra", tono: "cuarzo", cat: "Piedras" },
  { n: 32, id: "c32", nombre: "Ojo turco azul", mm: 7, forma: "ojoTurco", tono: "azul", cat: "Piedras" },
  { n: 33, id: "c33", nombre: "Piedras color dorado", mm: 8, forma: "perlaIrregular", tono: "oro", cat: "Piedras" },
  { n: 34, id: "c34", nombre: "Concha con detalle dorado", mm: 30, forma: "vieira", tono: "oro", cat: "Mar" },
  { n: 35, id: "c35", nombre: "Concha de río", mm: 20, forma: "piedra", tono: "cuarzo", cat: "Mar" },
  { n: 36, id: "c36", nombre: "Coral blanco, rojo o café", mm: 60, forma: "coral", tono: "rojo", cat: "Mar" },
  { n: 37, id: "c37", nombre: "Talavera", mm: 25, forma: "azulejo", tono: "azul", cat: "Piedras" },
  { n: 38, id: "c38", nombre: "Rosa", mm: 30, forma: "rosa", tono: "oro", cat: "Flores" },
  { n: 39, id: "c39", nombre: "Sirena", mm: 45, forma: "sirena", tono: "plata", cat: "Figuras" },
  { n: 40, id: "c40", nombre: "Letras color oro", mm: 10, forma: "letra", tono: "oro", cat: "Letras" },
  { n: 41, id: "c41", nombre: "Cubos de colores", mm: 10, forma: "cubo", tono: "azul", cat: "Piedras" },
  { n: 42, id: "c42", nombre: "Chile rojo", mm: 15, forma: "chile", tono: "rojo", cat: "Figuras" },
  { n: 43, id: "c43", nombre: "Daga", mm: 20, forma: "daga", tono: "plata", cat: "Figuras" },
  { n: 44, id: "c44", nombre: "Sol con rostro", mm: 15, forma: "solRostro", tono: "oro", cat: "Cielo" },
  { n: 45, id: "c45", nombre: "Luna", mm: 20, forma: "luna", tono: "oro", cat: "Cielo" },
  { n: 46, id: "c46", nombre: "Cerillo en plata u oro", mm: 45, forma: "cerillo", tono: "oro", cat: "Figuras" },
  { n: 47, id: "c47", nombre: "Granada", mm: 25, forma: "granada", tono: "rojo", cat: "Figuras" },
  { n: 48, id: "c48", nombre: "Serpiente dorada", mm: 30, forma: "serpiente", tono: "oro", cat: "Figuras" },
  { n: 49, id: "c49", nombre: "Flor plateada", mm: 30, forma: "flor", tono: "plata", cat: "Flores" },
  { n: 50, id: "c50", nombre: "Pez cerámico verde", mm: 15, forma: "pez", tono: "verde", cat: "Mar" },
  { n: 51, id: "c51", nombre: "Perla asimétrica grande", mm: 25, forma: "perlaIrregular", tono: "perla", cat: "Perlas" },
  { n: 52, id: "c52", nombre: "Tarot en plata u oro", mm: 20, forma: "tarot", tono: "oro", cat: "Figuras" },
  { n: 53, id: "c53", nombre: "Azulejo azul", mm: 10, forma: "cubo", tono: "azul", cat: "Piedras" },
  { n: 54, id: "c54", nombre: "Caracola plana", mm: 25, forma: "caracolaEspiral", tono: "plata", cat: "Mar" },
  { n: 55, id: "c55", nombre: "Cactus", mm: 20, forma: "cactus", tono: "oro", cat: "Figuras" },
  { n: 56, id: "c56", nombre: "Bola de billar 2D plata u oro", mm: 20, forma: "bola8", tono: "negro", cat: "Figuras" },
  { n: 57, id: "c57", nombre: "Herradura", mm: 15, forma: "herradura", tono: "oro", cat: "Figuras" },
  { n: 58, id: "c58", nombre: "Copa de vino", mm: 20, forma: "copa", tono: "rojo", cat: "Figuras" },
  { n: 59, id: "c59", nombre: "Concha cauri plateada", mm: 20, forma: "cauri", tono: "plata", cat: "Mar" },
  { n: 60, id: "c60", nombre: "Botón de perla con diamantes", mm: 30, forma: "botonPerla", tono: "perla", cat: "Perlas" },
];
