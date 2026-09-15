/* Fundas de silicon de ASTERIA: modelos, colores en stock y medidas.
 *
 * Sale de las fichas del taller (carpeta "Modelos de iPhone"): cada foto trae
 * modelo, color, alto y ancho de la FUNDA. Por eso aqui no se suma grosor:
 * estas ya son las medidas por fuera.
 *
 * img: foto recortada de la funda. cam: donde termina la camara en esa foto
 * (fraccion del ancho y del alto de la imagen), detectada sobre la foto misma.
 * camara: "esquina" deja franja libre a un lado; "barra" ocupa todo el ancho.
 *
 * Nota: la ficha del 14 Pro beige dice 14.96 cm de alto; se usa 14.67 como el
 * resto de sus colores. La del 15 Pro Max gris dice 16 x 7.81; se usa 16.30 x
 * 7.76 como el blanco y el negro.
 */
window.ASTERIA_MODELOS = {
  "iPhone 11": { alto: 150, ancho: 75.7, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-11-blanco.webp", proporcion: 0.539, cam: { x1: 0.512, y1: 0.305 } },
    Negro: { img: "img/fundas/iphone-11-negro.webp", proporcion: 0.521, cam: { x1: 0.502, y1: 0.288 } },
  } },
  "iPhone 11 Pro": { alto: 140, ancho: 71.4, camara: "esquina", colores: {
    Gris: { img: "img/fundas/iphone-11-pro-gris.webp", proporcion: 0.542, cam: { x1: 0.448, y1: 0.255 } },
    Beige: { img: "img/fundas/iphone-11-pro-beige.webp", proporcion: 0.515, cam: { x1: 0.45, y1: 0.262 } },
  } },
  "iPhone 11 Pro Max": { alto: 158, ancho: 77.8, camara: "esquina", colores: {
    Negro: { img: "img/fundas/iphone-11-pro-max-negro.webp", proporcion: 0.536, cam: { x1: 0.46, y1: 0.262 } },
  } },
  "iPhone 12 Pro Max": { alto: 160, ancho: 78, camara: "esquina", colores: {
    Negro: { img: "img/fundas/iphone-12-pro-max-negro.webp", proporcion: 0.536, cam: { x1: 0.46, y1: 0.262 } },
  } },
  "iPhone 13": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-13-blanco.webp", proporcion: 0.542, cam: { x1: 0.592, y1: 0.312 } },
    Negro: { img: "img/fundas/iphone-13-negro.webp", proporcion: 0.54, cam: { x1: 0.498, y1: 0.276 } },
  } },
  "iPhone 13 Pro": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Negro: { img: "img/fundas/iphone-13-pro-negro.webp", proporcion: 0.544, cam: { x1: 0.576, y1: 0.323 } },
    Gris: { img: "img/fundas/iphone-13-pro-gris.webp", proporcion: 0.542, cam: { x1: 0.548, y1: 0.314 } },
    Beige: { img: "img/fundas/iphone-13-pro-beige.webp", proporcion: 0.542, cam: { x1: 0.553, y1: 0.317 } },
  } },
  "iPhone 13 Pro Max": { alto: 160, ancho: 78.1, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-13-pro-max-blanco.webp", proporcion: 0.54, cam: { x1: 0.554, y1: 0.307 } },
    Gris: { img: "img/fundas/iphone-13-pro-max-gris.webp", proporcion: 0.542, cam: { x1: 0.548, y1: 0.314 } },
    Beige: { img: "img/fundas/iphone-13-pro-max-beige.webp", proporcion: 0.535, cam: { x1: 0.552, y1: 0.313 } },
  } },
  "iPhone 14": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-14-blanco.webp", proporcion: 0.542, cam: { x1: 0.592, y1: 0.312 } },
    Negro: { img: "img/fundas/iphone-14-negro.webp", proporcion: 0.54, cam: { x1: 0.498, y1: 0.276 } },
  } },
  "iPhone 14 Plus": { alto: 160, ancho: 78.1, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-14-plus-blanco.webp", proporcion: 0.549, cam: { x1: 0.496, y1: 0.262 } },
    Negro: { img: "img/fundas/iphone-14-plus-negro.webp", proporcion: 0.532, cam: { x1: 0.49, y1: 0.269 } },
  } },
  "iPhone 14 Pro": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-14-pro-blanco.webp", proporcion: 0.54, cam: { x1: 0.554, y1: 0.307 } },
    Negro: { img: "img/fundas/iphone-14-pro-negro.webp", proporcion: 0.544, cam: { x1: 0.576, y1: 0.323 } },
    Gris: { img: "img/fundas/iphone-14-pro-gris.webp", proporcion: 0.543, cam: { x1: 0.549, y1: 0.314 } },
    Beige: { img: "img/fundas/iphone-14-pro-beige.webp", proporcion: 0.542, cam: { x1: 0.551, y1: 0.317 } },
  } },
  "iPhone 14 Pro Max": { alto: 160, ancho: 78.1, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-14-pro-max-blanco.webp", proporcion: 0.54, cam: { x1: 0.554, y1: 0.307 } },
    Negro: { img: "img/fundas/iphone-14-pro-max-negro.webp", proporcion: 0.533, cam: { x1: 0.585, y1: 0.321 } },
  } },
  "iPhone 15": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-15-blanco.webp", proporcion: 0.542, cam: { x1: 0.592, y1: 0.312 } },
    Negro: { img: "img/fundas/iphone-15-negro.webp", proporcion: 0.54, cam: { x1: 0.498, y1: 0.276 } },
    Gris: { img: "img/fundas/iphone-15-gris.webp", proporcion: 0.539, cam: { x1: 0.486, y1: 0.263 } },
  } },
  "iPhone 15 Plus": { alto: 160, ancho: 78.1, camara: "esquina", colores: {
    Gris: { img: "img/fundas/iphone-15-plus-gris.webp", proporcion: 0.532, cam: { x1: 0.49, y1: 0.269 } },
    Beige: { img: "img/fundas/iphone-15-plus-beige.webp", proporcion: 0.54, cam: { x1: 0.495, y1: 0.273 } },
  } },
  "iPhone 15 Pro": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-15-pro-blanco.webp", proporcion: 0.54, cam: { x1: 0.554, y1: 0.307 } },
    Negro: { img: "img/fundas/iphone-15-pro-negro.webp", proporcion: 0.544, cam: { x1: 0.576, y1: 0.323 } },
    Gris: { img: "img/fundas/iphone-15-pro-gris.webp", proporcion: 0.542, cam: { x1: 0.551, y1: 0.314 } },
  } },
  "iPhone 15 Pro Max": { alto: 163, ancho: 77.6, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-15-pro-max-blanco.webp", proporcion: 0.54, cam: { x1: 0.554, y1: 0.307 } },
    Negro: { img: "img/fundas/iphone-15-pro-max-negro.webp", proporcion: 0.533, cam: { x1: 0.585, y1: 0.321 } },
    Gris: { img: "img/fundas/iphone-15-pro-max-gris.webp", proporcion: 0.535, cam: { x1: 0.552, y1: 0.313 } },
  } },
  "iPhone 16": { alto: 147.6, ancho: 71.6, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-16-blanco.webp", proporcion: 0.526, cam: { x1: 0.426, y1: 0.285 } },
    Negro: { img: "img/fundas/iphone-16-negro.webp", proporcion: 0.55, cam: { x1: 0.444, y1: 0.299 } },
  } },
  "iPhone 16 Plus": { alto: 160, ancho: 77.6, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-16-plus-blanco.webp", proporcion: 0.522, cam: { x1: 0.346, y1: 0.301 } },
    Negro: { img: "img/fundas/iphone-16-plus-negro.webp", proporcion: 0.535, cam: { x1: 0.446, y1: 0.292 } },
  } },
  "iPhone 16 Pro": { alto: 149.6, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-16-pro-blanco.webp", proporcion: 0.54, cam: { x1: 0.554, y1: 0.307 } },
    Negro: { img: "img/fundas/iphone-16-pro-negro.webp", proporcion: 0.544, cam: { x1: 0.576, y1: 0.323 } },
    Beige: { img: "img/fundas/iphone-16-pro-beige.webp", proporcion: 0.542, cam: { x1: 0.551, y1: 0.317 } },
  } },
  "iPhone 16 Pro Max": { alto: 163, ancho: 77.6, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-16-pro-max-blanco.webp", proporcion: 0.54, cam: { x1: 0.554, y1: 0.307 } },
    Negro: { img: "img/fundas/iphone-16-pro-max-negro.webp", proporcion: 0.533, cam: { x1: 0.585, y1: 0.321 } },
  } },
  "iPhone 17": { alto: 149.6, ancho: 71.6, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-17-blanco.webp", proporcion: 0.526, cam: { x1: 0.426, y1: 0.285 } },
    Negro: { img: "img/fundas/iphone-17-negro.webp", proporcion: 0.55, cam: { x1: 0.444, y1: 0.299 } },
  } },
  "iPhone 17 Pro": { alto: 150, ancho: 71.9, camara: "barra", colores: {
    Blanco: { img: "img/fundas/iphone-17-pro-blanco.webp", proporcion: 0.554, cam: { x1: 1, y1: 0.335 } },
    Negro: { img: "img/fundas/iphone-17-pro-negro.webp", proporcion: 0.549, cam: { x1: 1, y1: 0.352 } },
  } },
  "iPhone 17 Pro Max": { alto: 163, ancho: 77.8, camara: "barra", colores: {
    Blanco: { img: "img/fundas/iphone-17-pro-max-blanco.webp", proporcion: 0.508, cam: { x1: 1, y1: 0.302 } },
    Negro: { img: "img/fundas/iphone-17-pro-max-negro.webp", proporcion: 0.535, cam: { x1: 1, y1: 0.32 } },
  } },
  "iPhone 18 Pro Max": { alto: 163, ancho: 77.8, camara: "barra", colores: {
    Blanco: { img: "img/fundas/iphone-18-pro-max-blanco.webp", proporcion: 0.508, cam: { x1: 1, y1: 0.302 } },
    Negro: { img: "img/fundas/iphone-18-pro-max-negro.webp", proporcion: 0.535, cam: { x1: 1, y1: 0.32 } },
  } },
};

/* Las medidas de arriba ya son de la funda: no se agrega silicon. */
window.ASTERIA_GROSOR_FUNDA_MM = 0;
