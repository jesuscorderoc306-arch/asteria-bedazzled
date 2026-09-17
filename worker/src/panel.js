// Panel de administracion ASTÉRIA v2 ("el taller").
// El HTML vive en panel/panel.html y se empaqueta en panel-html.js con
// `npm run build:panel`. Aqui solo se rellenan el logo y la lista de modelos.

import { LOGO_DATA_URI } from "./logo.js";
import { PANEL_HTML } from "./panel-html.js";

// Los modelos que ofrece el formulario publico. Si cambian ahi, cambian aqui.
export const MODELOS_IPHONE = [
  "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone 17e", "iPhone 17", "iPhone Air", "iPhone 17 Pro", "iPhone 17 Pro Max",
  "iPhone 18 Pro", "iPhone 18 Pro Max",
];

export function panelHtml() {
  return PANEL_HTML
    .split("__LOGO__").join(LOGO_DATA_URI)
    .replace("__MODELOS__", JSON.stringify(MODELOS_IPHONE));
}
