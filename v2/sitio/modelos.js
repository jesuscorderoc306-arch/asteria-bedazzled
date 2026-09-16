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
    Blanco: { img: "img/fundas/iphone-11-blanco.webp", proporcion: 0.471, cam: { x1: 0.505, y1: 0.28 } },
    Negro: { img: "img/fundas/iphone-11-negro.webp", proporcion: 0.474, cam: { x1: 0.502, y1: 0.263 } },
  } },
  "iPhone 11 Pro": { alto: 140, ancho: 71.4, camara: "esquina", colores: {
    Gris: { img: "img/fundas/iphone-11-pro-gris.webp", proporcion: 0.506, cam: { x1: 0.456, y1: 0.241 } },
    Beige: { img: "img/fundas/iphone-11-pro-beige.webp", proporcion: 0.515, cam: { x1: 0.45, y1: 0.262 } },
  } },
  "iPhone 11 Pro Max": { alto: 158, ancho: 77.8, camara: "esquina", colores: {
    Negro: { img: "img/fundas/iphone-11-pro-max-negro.webp", proporcion: 0.51, cam: { x1: 0.888, y1: 0.241 } },
  } },
  "iPhone 12 Pro Max": { alto: 160, ancho: 78, camara: "esquina", colores: {
    Negro: { img: "img/fundas/iphone-12-pro-max-negro.webp", proporcion: 0.51, cam: { x1: 0.888, y1: 0.241 } },
  } },
  "iPhone 13": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-13-blanco.webp", proporcion: 0.511, cam: { x1: 0.576, y1: 0.292 } },
    Negro: { img: "img/fundas/iphone-13-negro.webp", proporcion: 0.508, cam: { x1: 0.494, y1: 0.26 } },
  } },
  "iPhone 13 Pro": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Negro: { img: "img/fundas/iphone-13-pro-negro.webp", proporcion: 0.506, cam: { x1: 0.588, y1: 0.301 } },
    Gris: { img: "img/fundas/iphone-13-pro-gris.webp", proporcion: 0.503, cam: { x1: 0.549, y1: 0.294 } },
    Beige: { img: "img/fundas/iphone-13-pro-beige.webp", proporcion: 0.503, cam: { x1: 0.552, y1: 0.296 } },
  } },
  "iPhone 13 Pro Max": { alto: 160, ancho: 78.1, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-13-pro-max-blanco.webp", proporcion: 0.504, cam: { x1: 0.553, y1: 0.295 } },
    Gris: { img: "img/fundas/iphone-13-pro-max-gris.webp", proporcion: 0.503, cam: { x1: 0.549, y1: 0.294 } },
    Beige: { img: "img/fundas/iphone-13-pro-max-beige.webp", proporcion: 0.503, cam: { x1: 0.552, y1: 0.295 } },
  } },
  "iPhone 14": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-14-blanco.webp", proporcion: 0.511, cam: { x1: 0.576, y1: 0.292 } },
    Negro: { img: "img/fundas/iphone-14-negro.webp", proporcion: 0.508, cam: { x1: 0.494, y1: 0.26 } },
  } },
  "iPhone 14 Plus": { alto: 160, ancho: 78.1, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-14-plus-blanco.webp", proporcion: 0.5, cam: { x1: 0.497, y1: 0.255 } },
    Negro: { img: "img/fundas/iphone-14-plus-negro.webp", proporcion: 0.5, cam: { x1: 0.502, y1: 0.253 } },
  } },
  "iPhone 14 Pro": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-14-pro-blanco.webp", proporcion: 0.504, cam: { x1: 0.553, y1: 0.295 } },
    Negro: { img: "img/fundas/iphone-14-pro-negro.webp", proporcion: 0.506, cam: { x1: 0.588, y1: 0.301 } },
    Gris: { img: "img/fundas/iphone-14-pro-gris.webp", proporcion: 0.503, cam: { x1: 0.549, y1: 0.294 } },
    Beige: { img: "img/fundas/iphone-14-pro-beige.webp", proporcion: 0.503, cam: { x1: 0.552, y1: 0.295 } },
  } },
  "iPhone 14 Pro Max": { alto: 160, ancho: 78.1, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-14-pro-max-blanco.webp", proporcion: 0.504, cam: { x1: 0.553, y1: 0.295 } },
    Negro: { img: "img/fundas/iphone-14-pro-max-negro.webp", proporcion: 0.493, cam: { x1: 0.585, y1: 0.298 } },
  } },
  "iPhone 15": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-15-blanco.webp", proporcion: 0.511, cam: { x1: 0.576, y1: 0.292 } },
    Negro: { img: "img/fundas/iphone-15-negro.webp", proporcion: 0.508, cam: { x1: 0.494, y1: 0.26 } },
    Gris: { img: "img/fundas/iphone-15-gris.webp", proporcion: 0.508, cam: { x1: 0.486, y1: 0.248 } },
  } },
  "iPhone 15 Plus": { alto: 160, ancho: 78.1, camara: "esquina", colores: {
    Gris: { img: "img/fundas/iphone-15-plus-gris.webp", proporcion: 0.5, cam: { x1: 0.502, y1: 0.253 } },
    Beige: { img: "img/fundas/iphone-15-plus-beige.webp", proporcion: 0.5, cam: { x1: 0.497, y1: 0.255 } },
  } },
  "iPhone 15 Pro": { alto: 146.7, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-15-pro-blanco.webp", proporcion: 0.504, cam: { x1: 0.553, y1: 0.295 } },
    Negro: { img: "img/fundas/iphone-15-pro-negro.webp", proporcion: 0.506, cam: { x1: 0.588, y1: 0.301 } },
    Gris: { img: "img/fundas/iphone-15-pro-gris.webp", proporcion: 0.503, cam: { x1: 0.549, y1: 0.294 } },
  } },
  "iPhone 15 Pro Max": { alto: 163, ancho: 77.6, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-15-pro-max-blanco.webp", proporcion: 0.504, cam: { x1: 0.553, y1: 0.295 } },
    Negro: { img: "img/fundas/iphone-15-pro-max-negro.webp", proporcion: 0.493, cam: { x1: 0.585, y1: 0.298 } },
    Gris: { img: "img/fundas/iphone-15-pro-max-gris.webp", proporcion: 0.503, cam: { x1: 0.552, y1: 0.296 } },
  } },
  "iPhone 16": { alto: 147.6, ancho: 71.6, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-16-blanco.webp", proporcion: 0.496, cam: { x1: 0.352, y1: 0.284 } },
    Negro: { img: "img/fundas/iphone-16-negro.webp", proporcion: 0.501, cam: { x1: 0.44, y1: 0.276 } },
  } },
  "iPhone 16 Plus": { alto: 160, ancho: 77.6, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-16-plus-blanco.webp", proporcion: 0.5, cam: { x1: 0.369, y1: 0.289 } },
    Negro: { img: "img/fundas/iphone-16-plus-negro.webp", proporcion: 0.5, cam: { x1: 0.441, y1: 0.274 } },
  } },
  "iPhone 16 Pro": { alto: 149.6, ancho: 71.5, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-16-pro-blanco.webp", proporcion: 0.504, cam: { x1: 0.553, y1: 0.295 } },
    Negro: { img: "img/fundas/iphone-16-pro-negro.webp", proporcion: 0.506, cam: { x1: 0.588, y1: 0.301 } },
    Beige: { img: "img/fundas/iphone-16-pro-beige.webp", proporcion: 0.503, cam: { x1: 0.552, y1: 0.295 } },
  } },
  "iPhone 16 Pro Max": { alto: 163, ancho: 77.6, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-16-pro-max-blanco.webp", proporcion: 0.504, cam: { x1: 0.553, y1: 0.295 } },
    Negro: { img: "img/fundas/iphone-16-pro-max-negro.webp", proporcion: 0.493, cam: { x1: 0.585, y1: 0.298 } },
  } },
  "iPhone 17": { alto: 149.6, ancho: 71.6, camara: "esquina", colores: {
    Blanco: { img: "img/fundas/iphone-17-blanco.webp", proporcion: 0.496, cam: { x1: 0.352, y1: 0.284 } },
    Negro: { img: "img/fundas/iphone-17-negro.webp", proporcion: 0.501, cam: { x1: 0.44, y1: 0.276 } },
  } },
  "iPhone 17 Pro": { alto: 150, ancho: 71.9, camara: "barra", colores: {
    Blanco: { img: "img/fundas/iphone-17-pro-blanco.webp", proporcion: 0.503, cam: { x1: 1, y1: 0.324 } },
    Negro: { img: "img/fundas/iphone-17-pro-negro.webp", proporcion: 0.503, cam: { x1: 1, y1: 0.324 } },
  } },
  "iPhone 17 Pro Max": { alto: 163, ancho: 77.8, camara: "barra", colores: {
    Blanco: { img: "img/fundas/iphone-17-pro-max-blanco.webp", proporcion: 0.497, cam: { x1: 1, y1: 0.298 } },
    Negro: { img: "img/fundas/iphone-17-pro-max-negro.webp", proporcion: 0.497, cam: { x1: 1, y1: 0.299 } },
  } },
  /* No hay iPhone 18 normal: la linea empieza en el 18 Pro. Este no traia
     ficha propia en la carpeta y usa la funda del 17 Pro, que el usuario
     confirmo que es la misma. */
  "iPhone 18 Pro": { alto: 150, ancho: 71.9, camara: "barra", colores: {
    Blanco: { img: "img/fundas/iphone-17-pro-blanco.webp", proporcion: 0.503, cam: { x1: 1, y1: 0.324 } },
    Negro: { img: "img/fundas/iphone-17-pro-negro.webp", proporcion: 0.503, cam: { x1: 1, y1: 0.324 } },
  } },
  "iPhone 18 Pro Max": { alto: 163, ancho: 77.8, camara: "barra", colores: {
    Blanco: { img: "img/fundas/iphone-18-pro-max-blanco.webp", proporcion: 0.497, cam: { x1: 1, y1: 0.298 } },
    Negro: { img: "img/fundas/iphone-18-pro-max-negro.webp", proporcion: 0.497, cam: { x1: 1, y1: 0.299 } },
  } },
};

/* Las medidas de arriba ya son de la funda: no se agrega silicon. */
window.ASTERIA_GROSOR_FUNDA_MM = 0;
