/* Medidas reales de cada iPhone, en milimetros.
 *
 * Sirven para dos cosas en el editor:
 *   1. la funda se dibuja con la proporcion del telefono de verdad;
 *   2. los charms se escalan contra el ancho real, asi que una estrella de
 *      4 cm ocupa mucho mas en un 13 mini que en un 17 Pro Max. Es la unica
 *      forma de que la clienta vea cuantas piezas le caben de verdad.
 *
 * `camara`: "esquina" = modulo cuadrado, deja franja libre a un lado.
 *           "barra"   = plateau de lado a lado, arriba no queda nada.
 *
 * Fuentes: fichas tecnicas de Apple para 12, 16, 17 Pro, 17 Pro Max y Air;
 * medidas publicadas para el resto. Revisadas en agosto de 2026.
 */
window.ASTERIA_MODELOS = {
  "iPhone 12":            { alto: 146.7, ancho: 71.5, camara: "esquina" },
  "iPhone 12 Pro":        { alto: 146.7, ancho: 71.5, camara: "esquina" },
  "iPhone 12 Pro Max":    { alto: 160.8, ancho: 78.1, camara: "esquina" },
  "iPhone 13 mini":       { alto: 131.5, ancho: 64.2, camara: "esquina" },
  "iPhone 13":            { alto: 146.7, ancho: 71.5, camara: "esquina" },
  "iPhone 13 Pro":        { alto: 146.7, ancho: 71.5, camara: "esquina" },
  "iPhone 13 Pro Max":    { alto: 160.8, ancho: 78.1, camara: "esquina" },
  "iPhone 14":            { alto: 146.7, ancho: 71.5, camara: "esquina" },
  "iPhone 14 Plus":       { alto: 160.8, ancho: 78.1, camara: "esquina" },
  "iPhone 14 Pro":        { alto: 147.5, ancho: 71.5, camara: "esquina" },
  "iPhone 14 Pro Max":    { alto: 160.7, ancho: 77.6, camara: "esquina" },
  "iPhone 15":            { alto: 147.6, ancho: 71.6, camara: "esquina" },
  "iPhone 15 Plus":       { alto: 160.9, ancho: 77.8, camara: "esquina" },
  "iPhone 15 Pro":        { alto: 146.6, ancho: 70.6, camara: "esquina" },
  "iPhone 15 Pro Max":    { alto: 159.9, ancho: 76.7, camara: "esquina" },
  "iPhone 16":            { alto: 147.6, ancho: 71.6, camara: "esquina" },
  "iPhone 16 Plus":       { alto: 160.9, ancho: 77.8, camara: "esquina" },
  "iPhone 16 Pro":        { alto: 149.6, ancho: 71.5, camara: "esquina" },
  "iPhone 16 Pro Max":    { alto: 163.0, ancho: 77.6, camara: "esquina" },
  "iPhone 17e":           { alto: 146.7, ancho: 71.5, camara: "esquina" },
  "iPhone 17":            { alto: 149.6, ancho: 71.5, camara: "esquina" },
  "iPhone Air":           { alto: 156.2, ancho: 74.7, camara: "barra" },
  "iPhone 17 Pro":        { alto: 150.0, ancho: 71.9, camara: "barra" },
  "iPhone 17 Pro Max":    { alto: 163.4, ancho: 78.0, camara: "barra" },
};

/* La funda es un poco mas grande que el telefono: unos 2 mm de silicon por
   lado. Se suma para que la escala de los charms no salga optimista. */
window.ASTERIA_GROSOR_FUNDA_MM = 2;
