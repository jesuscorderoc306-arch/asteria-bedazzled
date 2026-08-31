/* Editor de charms de ASTÉRIA.
 *
 * La clienta coloca cada charm donde lo quiere sobre la funda. No es un canvas:
 * cada charm es un elemento posicionado en porcentaje sobre la caja de la funda,
 * asi que el diseño se guarda como numeros (x, y, giro) y el taller lo puede
 * reproducir igual en cualquier pantalla.
 *
 * Las piezas de aqui son PROVISIONALES: siluetas dibujadas mientras llegan las
 * fotos y medidas reales de los charms. Cuando el catalogo del worker responda
 * con `imgId` y `mm`, cada pieza usa su foto y su tamaño real.
 */
(function (global) {
  "use strict";

  /* ---------- piezas ----------
   * Los nombres y las medidas son los reales del taller (charms.js). Las
   * siluetas son provisionales: dibujan la pieza a su tamano real mientras
   * llegan las fotos recortadas. La que no tiene silueta propia se dibuja como
   * dije con argolla, que es lo que es.
   */
  /* Cada iPhone mide distinto y por eso no a todos les caben los mismos
     charms. La escala sale del ancho real del modelo (mas el silicon), no de
     un numero fijo: en un 13 mini una estrella de 4 cm se come la funda, y en
     un 17 Pro Max se ve holgada. */
  const MODELOS = window.ASTERIA_MODELOS || {};
  const GROSOR = window.ASTERIA_GROSOR_FUNDA_MM || 2;
  const MEDIDA_POR_DEFECTO = { alto: 147, ancho: 71.5, camara: "esquina" };

  function medidas(modelo) {
    return MODELOS[String(modelo || "")] || MEDIDA_POR_DEFECTO;
  }
  // Lo que mide la funda por fuera: el telefono mas el silicon de cada lado.
  const anchoFunda = (modelo) => medidas(modelo).ancho + GROSOR * 2;
  const altoFunda = (modelo) => medidas(modelo).alto + GROSOR * 2;

  const TONOS = {
    oro: ["#dcbe73", "#9d7a2c"],
    plata: ["#dcdcd6", "#8f8f8a"],
    perla: ["#fdfbf6", "#d3cabb"],
    rojo: ["#c8354a", "#7d1b2a"],
    negro: ["#2c2926", "#0c0b0a"],
    azul: ["#4b7fc4", "#22406e"],
    turquesa: ["#4fb3ad", "#1f6f6b"],
    verde: ["#7fa864", "#456031"],
    cuarzo: ["#e3d5d8", "#a98e95"],
    esmalte: ["#f4f1ea", "#9c968a"],
  };

  const FORMAS = {
    estrella: "M12 2.6l2.6 6 6.5.6-4.9 4.3 1.5 6.4L12 16.5 6.3 19.9l1.5-6.4L2.9 9.2l6.5-.6z",
    estrellaMar: "M12 2.4l2.1 6.1 6.4-.6-4.6 4.6 3 5.7-6.9-2.6-6.9 2.6 3-5.7L3.5 7.9l6.4.6z",
    corazon: "M12 20.4S3.6 14.8 3.6 9.2A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.4 2.5c0 5.6-8.4 11.2-8.4 11.2z",
    corazonSagrado: "M12 21S4 15.4 4 9.9A4.4 4.4 0 0 1 12 7.6 4.4 4.4 0 0 1 20 9.9C20 15.4 12 21 12 21zM12 3.2l1.1 3.1M12 3.2l-1.1 3.1",
    corazonDije: "M12 20S4.4 14.7 4.4 9.6A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.6 2.2C19.6 14.7 12 20 12 20zM12 2.6v2.2",
    luna: "M15.7 3.5a8.6 8.6 0 1 0 4.7 12.8 9.3 9.3 0 0 1-4.7-12.8z",
    sol: "M12 8.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2zM12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4M4.8 4.8l2.4 2.4M16.8 16.8l2.4 2.4M19.2 4.8l-2.4 2.4M7.2 16.8l-2.4 2.4",
    solRostro: "M12 7.6a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8zM12 2.2l1.4 3.2M12 21.8l1.4-3.2M2.2 12l3.2 1.4M21.8 12l-3.2 1.4M5 5l2.6 2.2M19 19l-2.6-2.2M19 5l-2.6 2.2M5 19l2.6-2.2",
    flor: "M12 8.4a3 3 0 1 1 2.9 3.7 3 3 0 1 1-2.9 3.9 3 3 0 1 1-2.9-3.9A3 3 0 1 1 12 8.4z",
    rosa: "M12 6.5a3.2 3.2 0 1 1-2.4 5.3c-.5 1.4.4 2.9 2.4 2.9M12 15v6.4M12 18.4l2.8-1.6M12 19.6l-2.8-1.6",
    perla: "M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8z",
    perlaIrregular: "M8.6 4.4c3.6-1.9 8.4-.3 9.6 3.6 1.3 4.1-1.2 9-5.3 10.2-3.9 1.2-7.9-1.6-8.3-5.6-.4-3.6 1.1-6.7 4-8.2z",
    piedra: "M7.2 5.4c3-1.6 7.2-1 9 1.8 1.9 3 1.1 7.5-1.8 9.6-2.9 2-7.4 1.3-9.1-1.6-1.7-2.9-1-8 1.9-9.8z",
    vieira: "M12 3.6c4.7 0 8.4 5 8.4 10.2 0 3.2-3.8 5.4-8.4 5.4s-8.4-2.2-8.4-5.4C3.6 8.6 7.3 3.6 12 3.6zM12 19.2V4.2M8 18.4l-1.6-12M16 18.4l1.6-12",
    caracola: "M13.4 3.2c3.9 1 6.2 4.9 5 8.8-1.3 4.2-6 8.2-9.8 8.2-2.6 0-4.2-1.8-3.4-4.2.7-2.3 3-3.6 4.6-2.7 1.2.7 1.2 2.3 0 3",
    caracolaEspiral: "M12 3.6a8.4 8.4 0 1 1-8.4 8.4c0-3.6 2.7-6.2 5.8-6.2 2.6 0 4.5 1.9 4.5 4.2 0 1.9-1.4 3.2-3 3.2-1.3 0-2.2-.9-2.2-2",
    cauri: "M12 4.2c3.6 0 6.4 3.5 6.4 7.8s-2.8 7.8-6.4 7.8-6.4-3.5-6.4-7.8S8.4 4.2 12 4.2zM9.4 8.6l5.2 6.8M9.4 15.4l5.2-6.8",
    coral: "M12 21.4V9.6M12 12.4L8.2 8.6M12 15.2l3.6-3.4M8.2 8.6V5.2M8.2 8.6H5M15.6 11.8V7.4M15.6 11.8h3.2",
    cubo: "M5.6 5.6h12.8v12.8H5.6z",
    azulejo: "M5.6 5.6h12.8v12.8H5.6zM12 8.4l2.4 3.6-2.4 3.6-2.4-3.6z",
    ojoTurco: "M12 3.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4zM12 7.4a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2zM12 10.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z",
    letra: "M6.4 19.2l4.4-13.4h2.4l4.4 13.4M8.6 14.6h6.8",
    ala: "M15.4 3.4c1.6 4.2 1 10.6-3 17.2-1.4-.8-4-2.6-4.6-4.4-.6-1.9 1.4-2.4 2.6-1.6M13.6 8.2c-1.6.4-3.4 1.4-4.4 2.6M14 12.4c-1.8.4-3.6 1.4-4.8 2.8",
    bola8: "M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8zM12 7.8a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4z",
    naipes: "M6.4 6.2l5.2-1.6 5.8 12.6-5.6 2z",
    bota: "M9.6 3.6h3.8v9.2l4.6 2.2v5.4H6.6v-4.6l3-2z",
    herradura: "M7.2 20V12a4.8 4.8 0 1 1 9.6 0v8M7.2 20h2.6M14.2 20h2.6",
    copa: "M8 4.4h8l-1 5.2a3 3 0 0 1-6 0zM12 12.8v6.4M9 19.6h6",
    daga: "M12 2.6l2 4.4v6l-2 8.4-2-8.4v-6zM7.6 8.4h8.8",
    cerillo: "M12 3.2c1.4 0 2 1 2 2.2 0 1.6-1.2 2-2 3.4-.8-1.4-2-1.8-2-3.4 0-1.2.6-2.2 2-2.2zM12 9.2v11.6",
    serpiente: "M9 3.8c3.2 0 3.2 3.6 0 3.6s-3.2 3.6 0 3.6 3.4 3.4.2 3.4M9.2 14.4c-2.6.4-3.6 2.4-2 4.2 1.6 1.8 4.8 1.4 6-.6",
    cactus: "M12 21.2V6.4M12 12.6c-2.6 0-3.6-1.4-3.6-3.4M12 15c2.6 0 3.6-1.6 3.6-3.8M8.4 9.2v3M15.6 11.2v3",
    chile: "M13.4 5.2c3.2 1.2 4.4 5.4 2.4 8.8-2 3.4-6 4.8-8.4 3-1.8-1.4-1.2-3.6.6-4M13.4 5.2c-.8-1.6-2.2-2.4-3.6-2",
    granada: "M12 4.6a6.4 6.4 0 1 1 0 12.8 6.4 6.4 0 0 1 0-12.8zM12 2.6v2M10 7.6l.1.1M14 8.6l.1.1M11 11.6l.1.1M13.4 12.6l.1.1",
    tarot: "M7.4 4.6h9.2v14.8H7.4zM12 8l1.6 2.8-1.6 2.8-1.6-2.8z",
    tortuga: "M12 6.6c3.4 0 6 2.6 6 5.6s-2.6 5.4-6 5.4-6-2.4-6-5.4 2.6-5.6 6-5.6zM12 6.6v11M6.4 11h11.2M6 5.6l2.2 2M18 5.6l-2.2 2M6 18.4l2.2-2M18 18.4l-2.2-2",
    jaguar: "M4.6 13.6c1.4-2.6 4-4 7.4-4 3.4 0 5.8 1.4 7.4 4M6 13.6v4.8M10.4 14.4v4M13.6 14.4v4M18 13.6v4.8M19.4 13.6l1.6-2.4M4.6 13.6L3 12.4",
    libelula: "M12 4.2v15.6M12 9c-2.4-3-7.4-3.6-8.2-1-.7 2.2 3.6 3.4 8.2 1zM12 9c2.4-3 7.4-3.6 8.2-1 .7 2.2-3.6 3.4-8.2 1zM12 5.6a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8z",
    mano: "M9 20.4V12M9 12V5.6a1.3 1.3 0 0 1 2.6 0V11M11.6 11V4.8a1.3 1.3 0 0 1 2.6 0V11M14.2 11V6.4a1.3 1.3 0 0 1 2.6 0v7.4c0 4-2.2 6.6-5.6 6.6H9",
    aleta: "M12 20.4c-3.6-3-6-8-6-12.4 2.6 1.4 4.4 2.4 6 4 1.6-1.6 3.4-2.6 6-4 0 4.4-2.4 9.4-6 12.4z",
    pez: "M4.4 12c2.4-3.4 5.4-5 8.6-5 2.8 0 4.8 1.6 6.6 5-1.8 3.4-3.8 5-6.6 5-3.2 0-6.2-1.6-8.6-5zM16.6 10.4l.1.1",
    sirena: "M12 3.4a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM12 7v6.4c0 2.6-1.4 4.2-3.4 5.2M12 13.4c0 2.6 1.4 4.2 3.4 5.2M8.6 18.6c1.4 1.6 5.4 1.6 6.8 0",
    angel: "M12 3.2a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM12 7.2c2.4 0 4 2 4 4.8v3.4l2 5.4H6l2-5.4V12c0-2.8 1.6-4.8 4-4.8zM8 9.4C5.4 8 3.4 9 4 11.6M16 9.4c2.6-1.4 4.6-.4 4 2.2",
    buey: "M4.6 7.2c1.4 4.4 3.8 6.6 7.4 6.6s6-2.2 7.4-6.6M12 13.8v5.4M9.4 17.4h5.2M4.6 7.2C3 6 3 4.4 4.4 4M19.4 7.2C21 6 21 4.4 19.6 4",
    sombrero: "M4.4 15.6c0-1.4 1.6-2.6 4-3.2l.6-4.6c.2-1.6 1.4-2.6 3-2.6s2.8 1 3 2.6l.6 4.6c2.4.6 4 1.8 4 3.2 0 2-3.4 3-7.6 3s-7.6-1-7.6-3zM8.4 12.4c2.4.6 4.8.6 7.2 0",
    botonPerla: "M12 4.2a7.8 7.8 0 1 1 0 15.6 7.8 7.8 0 0 1 0-15.6zM12 8.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2z",
    dije: "M12 6.2a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2zM12 6.2V4.6M12 2a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z",
  };

  // Formas que se leen mejor solo con linea: rellenarlas las emborrona.
  const SOLO_TRAZO = ["sol", "solRostro", "coral", "cactus", "serpiente", "letra",
    "libelula", "mano", "jaguar", "sirena", "rosa", "herradura", "copa", "cerillo",
    "corazonSagrado", "corazonDije", "caracola", "caracolaEspiral", "buey", "tortuga", "ala"];

  function svgPieza(pieza, tamano) {
    const tono = TONOS[pieza.tono] || TONOS.oro;
    const gid = "g" + String(pieza.id).replace(/[^a-z0-9]/gi, "");
    const trazo = SOLO_TRAZO.indexOf(pieza.forma) !== -1;
    const d = FORMAS[pieza.forma] || FORMAS.dije;
    return '<svg viewBox="0 0 24 24" width="' + (tamano || 24) + '" height="' + (tamano || 24) + '" aria-hidden="true">'
      + '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="' + tono[0] + '"/><stop offset="1" stop-color="' + tono[1] + '"/>'
      + '</linearGradient></defs>'
      + '<path d="' + d + '" fill="' + (trazo ? "none" : "url(#" + gid + ")") + '"'
      + ' stroke="' + (trazo ? "url(#" + gid + ")" : tono[1]) + '" stroke-width="' + (trazo ? 1.5 : 0.5) + '"'
      + ' stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }

  /* El catalogo del taller. Si por lo que sea no carga, el editor no se rompe. */
  const PIEZAS_BASE = (window.ASTERIA_CHARMS || []).map(function (c) {
    return { id: c.id, nombre: c.nombre, categoria: c.cat || "Charms",
      mm: c.mm, forma: c.forma, tono: c.tono, n: c.n };
  });

  /* ---------- la funda ----------
   * Dos capas, como en el taller: el silicon (blanco o negro) y encima la pasta
   * (blanca o negra) donde se asientan los charms. Pueden ser de colores
   * contrarios, y por eso se dibujan por separado.
   *
   * La camara cambia la zona util:
   *   - del 12 al 16 el modulo es un cuadro en la esquina, asi que a su derecha
   *     queda una franja donde tambien se pueden poner charms;
   *   - del 17 en adelante la camara es una barra de lado a lado y arriba no
   *     queda nada libre.
   */
  const SILICON = {
    Blanca: { cuerpo: "#fbfaf7", borde: "rgba(5,4,3,.2)", lente: "#eceae4", aro: "#cfc9bd" },
    Negra: { cuerpo: "#1b1917", borde: "#413d38", lente: "#0d0c0b", aro: "#33302c" },
  };
  const PASTA = {
    Blanca: { base: "#f4f1ea", sombra: "rgba(5,4,3,.16)" },
    Negra: { base: "#151311", sombra: "rgba(0,0,0,.5)" },
  };

  const esBarra = (modelo) => medidas(modelo).camara === "barra";

  /* Zona prohibida (la camara) en coordenadas de la caja de charms, en %.
     La caja va de 6% a 94% a lo ancho y de 4% a 96% a lo alto de la funda. */
  function zonaCamara(modelo) {
    return esBarra(modelo)
      ? { x0: -2, y0: -2, x1: 102, y1: 21 }   // barra: todo el ancho de arriba
      : { x0: -2, y0: -2, x1: 51, y1: 23 };   // modulo: solo la esquina
  }

  function dentroDeCamara(zona, x, y, margen) {
    const m = margen || 0;
    return x > zona.x0 - m && x < zona.x1 + m && y > zona.y0 - m && y < zona.y1 + m;
  }

  /* Saca un punto de la camara por el lado mas cercano: hacia abajo o, cuando
     hay franja libre al lado (modelos 12-16), hacia la derecha. */
  function fueraDeCamara(zona, x, y, margen) {
    if (!dentroDeCamara(zona, x, y, margen)) return { x: x, y: y };
    const m = margen || 0;
    const bajar = zona.y1 + m;
    const derecha = zona.x1 + m;
    if (zona.x1 < 90 && (derecha - x) < (bajar - y)) return { x: Math.min(94, derecha), y: y };
    return { x: x, y: Math.min(96, bajar) };
  }

  function svgFunda(color, pasta, modelo) {
    const s = SILICON[color] || SILICON.Blanca;
    const p = PASTA[pasta || color] || PASTA.Blanca;
    const barra = esBarra(modelo);
    // El alto del lienzo sale de la proporcion real del modelo.
    const alto = Math.round(500 * (altoFunda(modelo) / anchoFunda(modelo)));
    const pastaAlto = alto - 356;

    // La pasta llega hasta donde la camara lo permite.
    const pastaPrincipal = barra
      ? '<rect x="52" y="276" width="396" height="' + pastaAlto + '" rx="26" fill="' + p.base + '"/>'
      : '<rect x="52" y="276" width="396" height="' + pastaAlto + '" rx="26" fill="' + p.base + '"/>'
        + '<rect x="272" y="60" width="176" height="216" rx="24" fill="' + p.base + '"/>';

    const camara = barra
      ? '<rect x="46" y="46" width="408" height="164" rx="60" fill="' + s.lente + '" stroke="' + s.aro + '" stroke-width="2"/>'
        + '<circle cx="112" cy="128" r="36" fill="' + s.aro + '"/><circle cx="112" cy="128" r="21" fill="' + s.lente + '"/>'
        + '<circle cx="228" cy="128" r="36" fill="' + s.aro + '"/><circle cx="228" cy="128" r="21" fill="' + s.lente + '"/>'
        + '<circle cx="344" cy="128" r="36" fill="' + s.aro + '"/><circle cx="344" cy="128" r="21" fill="' + s.lente + '"/>'
        + '<circle cx="412" cy="90" r="13" fill="' + s.aro + '"/>'
      : '<rect x="52" y="52" width="196" height="196" rx="52" fill="' + s.lente + '" stroke="' + s.aro + '" stroke-width="2"/>'
        + '<circle cx="106" cy="106" r="34" fill="' + s.aro + '"/><circle cx="106" cy="106" r="20" fill="' + s.lente + '"/>'
        + '<circle cx="194" cy="106" r="34" fill="' + s.aro + '"/><circle cx="194" cy="106" r="20" fill="' + s.lente + '"/>'
        + '<circle cx="106" cy="194" r="34" fill="' + s.aro + '"/><circle cx="106" cy="194" r="20" fill="' + s.lente + '"/>'
        + '<circle cx="196" cy="196" r="14" fill="' + s.aro + '"/>';

    return '<svg viewBox="0 0 500 ' + alto + '" role="img" aria-label="Vista trasera de tu funda">'
      + '<defs><filter id="pastaTex" x="-10%" y="-10%" width="120%" height="120%">'
      + '<feTurbulence type="fractalNoise" baseFrequency="0.022 0.03" numOctaves="3" seed="7" result="n"/>'
      + '<feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G"/>'
      + '</filter>'
      + '<clipPath id="cuerpoFunda"><rect x="6" y="6" width="488" height="' + (alto - 12) + '" rx="112"/></clipPath>'
      + '</defs>'
      + '<rect x="6" y="6" width="488" height="' + (alto - 12) + '" rx="112" fill="' + s.cuerpo + '" stroke="' + s.borde + '" stroke-width="3"/>'
      + '<rect x="26" y="26" width="448" height="' + (alto - 52) + '" rx="94" fill="none" stroke="' + s.borde + '" stroke-width="1.4" opacity=".5"/>'
      // La textura desplaza los bordes: sin recortar, la pasta se sale de la funda.
      + '<g clip-path="url(#cuerpoFunda)"><g filter="url(#pastaTex)">' + pastaPrincipal + '</g></g>'
      + '<g>' + camara + '</g>'
      + '<rect x="494" y="' + Math.round(alto * 0.30) + '" width="8" height="86" rx="4" fill="' + s.aro + '"/>'
      + '<rect x="494" y="' + Math.round(alto * 0.41) + '" width="8" height="86" rx="4" fill="' + s.aro + '"/>'
      + '<rect x="-2" y="' + Math.round(alto * 0.33) + '" width="8" height="58" rx="4" fill="' + s.aro + '"/>'
      + '</svg>';
  }

  /* ---------- editor ---------- */
  function crear(opciones) {
    const cont = opciones.mount;
    const alCambiar = opciones.onChange || function () {};
    let piezas = PIEZAS_BASE.slice();
    let sonEjemplo = true;
    let colorFunda = opciones.color || "Blanca";
    let colorPasta = opciones.pasta || colorFunda;
    let modelo = opciones.modelo || "";
    let camara = zonaCamara(modelo);
    let puestos = [];          // { uid, id, x, y, rot }
    let seleccion = null;      // uid
    let categoria = "Todas";
    let historial = [];
    let contador = 0;

    cont.innerHTML = `
      <div class="ed">
        <div class="ed-stage">
          <div class="ed-case" id="edCase">
            ${svgFunda(colorFunda, colorPasta, modelo)}
            <div class="ed-area" id="edArea"></div>
          </div>
        </div>
        <p class="ed-ayuda" id="edAyuda">Toca un charm para ponerlo. Arrástralo donde te guste.</p>
        <div>
          <div class="ed-acciones">
            <button type="button" class="ed-btn principal" id="edAuto">Acomodar por mí</button>
            <button type="button" class="ed-btn" id="edUndo" disabled>Deshacer</button>
            <button type="button" class="ed-btn" id="edClear" disabled>Vaciar</button>
          </div>
          <div class="ed-bandeja">
            <div class="ed-cats" id="edCats" role="group" aria-label="Categorías de charms"></div>
            <div class="ed-tira" id="edTira"></div>
            <p class="ed-aviso" id="edAviso"></p>
          </div>
          <div class="ed-resumen" id="edResumen" hidden></div>
        </div>
      </div>`;

    const area = cont.querySelector("#edArea");
    function ajustarProporcion() {
      const caja = cont.querySelector("#edCase");
      if (caja) caja.style.aspectRatio = anchoFunda(modelo) + " / " + altoFunda(modelo);
    }
    const caseBox = cont.querySelector("#edCase");
    const tira = cont.querySelector("#edTira");
    const cats = cont.querySelector("#edCats");
    const resumen = cont.querySelector("#edResumen");
    const aviso = cont.querySelector("#edAviso");
    const btnAuto = cont.querySelector("#edAuto");
    const btnUndo = cont.querySelector("#edUndo");
    const btnClear = cont.querySelector("#edClear");

    const porId = () => new Map(piezas.map((p) => [p.id, p]));
    const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    /* La medida del taller va al lado que le toca: "3 cm de largo" es alto,
       "2 cm de ancho" es ancho, y el diametro da los dos. Se mide contra las
       medidas reales del modelo, asi que la misma pieza ocupa mas en un 13 mini
       que en un 17 Pro Max. */
    function tamPieza(pieza) {
      const mm = pieza.mm || 12;
      const eje = pieza.eje || "largo";
      if (eje === "largo") {
        const pct = Math.max(3, Math.min(60, (mm / altoFunda(modelo)) * 100));
        return { eje: "alto", pct: pct };
      }
      const pct = Math.max(4, Math.min(46, (mm / anchoFunda(modelo)) * 100));
      return { eje: "ancho", pct: pct };
    }

    /* Cuanto ocupa a lo ancho, para separar unas piezas de otras. Las medidas a
       lo largo se convierten usando la proporcion de la funda. */
    function anchoPct(pieza) {
      const t = tamPieza(pieza);
      if (t.eje === "ancho") return t.pct;
      return t.pct * (altoFunda(modelo) / anchoFunda(modelo));
    }

    function guardarHistorial() {
      historial.push(JSON.stringify(puestos));
      if (historial.length > 40) historial.shift();
      btnUndo.disabled = historial.length === 0;
    }

    /* ---------- colocación automática ---------- */
    // Busca el primer punto libre en una espiral desde el centro: el charm cae
    // donde se ve bien, y la clienta solo mueve si quiere.
    function puntoLibre(tam) {
      const separacion = tam * 0.85;
      // Con la camara en barra el centro util baja; con modulo en esquina no.
      const centroY = esBarra(modelo) ? 56 : 50;
      for (let radio = 0; radio <= 60; radio += 4) {
        const pasos = radio === 0 ? 1 : Math.max(6, Math.round(radio / 2));
        for (let i = 0; i < pasos; i++) {
          const ang = (i / pasos) * Math.PI * 2 + radio * 0.7;
          const x = 50 + Math.cos(ang) * radio;
          const y = centroY + Math.sin(ang) * radio * 1.55;
          if (x < 8 || x > 92 || y < 4 || y > 94) continue;
          if (dentroDeCamara(camara, x, y, tam * 0.5)) continue;
          const choca = puestos.some((p) => {
            const otra = porId().get(p.id);
            const d = Math.hypot((p.x - x) * 0.9, (p.y - y) * 0.45);
            return d < (separacion + anchoPct(otra || { mm: 12 }) * 0.85) * 0.5;
          });
          if (!choca) return { x, y };
        }
      }
      return { x: 20 + Math.random() * 60, y: 15 + Math.random() * 70 };
    }

    function agregar(id, opts) {
      const pieza = porId().get(id);
      if (!pieza) return;
      guardarHistorial();
      const pos = (opts && opts.pos) || puntoLibre(anchoPct(pieza));
      const uid = "u" + ++contador;
      puestos.push({ uid, id, x: pos.x, y: pos.y, rot: opts && opts.rot != null ? opts.rot : Math.round((Math.random() * 26 - 13)) });
      seleccion = uid;
      pintar();
      const el = area.querySelector(`[data-uid="${uid}"]`);
      if (el) el.classList.add("entra");
    }

    function quitar(uid) {
      guardarHistorial();
      puestos = puestos.filter((p) => p.uid !== uid);
      if (seleccion === uid) seleccion = null;
      pintar();
    }

    function acomodar() {
      if (!puestos.length) return;
      guardarHistorial();
      // Reparte en una retícula suave y les da un giro leve: se ve hecho a mano,
      // no alineado como una hoja de cálculo.
      const n = puestos.length;
      const cols = Math.ceil(Math.sqrt(n * 0.62));
      const filas = Math.ceil(n / cols);
      puestos.forEach((p, i) => {
        const c = i % cols, f = Math.floor(i / cols);
        // Con modulo en esquina se empieza desde arriba para aprovechar la
        // franja de al lado; con barra completa no hay nada que aprovechar.
        const arriba = esBarra(modelo) ? camara.y1 + 4 : 8;
        const px = ((c + 0.5) / cols) * 74 + 13;
        const py = arriba + ((f + 0.5) / filas) * (92 - arriba);
        const ajustado = fueraDeCamara(camara, px + (Math.random() * 5 - 2.5), py + (Math.random() * 4 - 2), 6);
        p.x = ajustado.x;
        p.y = ajustado.y;
        p.rot = Math.round(Math.random() * 30 - 15);
      });
      pintar();
    }

    /* ---------- pintar ---------- */
    function medidaCss(pieza) {
      const t = tamPieza(pieza);
      // El % del alto se mide contra el alto de la caja de charms, no de la funda.
      return t.eje === "ancho"
        ? "--w:" + t.pct + "%;--h:auto"
        : "--w:auto;--h:" + (t.pct * (altoFunda(modelo) / (altoFunda(modelo) * 0.92))) + "%";
    }

    function pintar() {
      const mapa = porId();
      area.innerHTML = puestos.map((p) => {
        const pieza = mapa.get(p.id);
        if (!pieza) return "";
        const sel = p.uid === seleccion;
        const cuerpo = pieza.imgId
          ? `<img src="${esc(pieza.imgUrl)}" alt="">`
          : svgPieza(pieza);
        return `<div class="ed-charm${sel ? " sel" : ""}" data-uid="${p.uid}" tabindex="0"
          role="button" aria-label="${esc(pieza.nombre)}, arrastra para mover"
          style="left:${p.x}%;top:${p.y}%;--rot:${p.rot}deg;${medidaCss(pieza)}">${cuerpo}</div>`;
      }).join("");

      if (seleccion) {
        const el = area.querySelector(`[data-uid="${seleccion}"]`);
        if (el) {
          const quita = document.createElement("button");
          quita.type = "button";
          quita.className = "ed-tool quitar";
          quita.innerHTML = "✕";
          quita.setAttribute("aria-label", "Quitar este charm");
          quita.style.cssText = "top:-34px;right:-34px";
          quita.addEventListener("click", (e) => { e.stopPropagation(); quitar(seleccion); });
          const gira = document.createElement("button");
          gira.type = "button";
          gira.className = "ed-tool girar";
          gira.innerHTML = "⟳";
          gira.setAttribute("aria-label", "Girar este charm");
          gira.style.cssText = "top:-34px;left:-34px";
          gira.addEventListener("pointerdown", iniciarGiro);
          el.appendChild(quita);
          el.appendChild(gira);
        }
      }
      if (!tira.children.length) pintarTira(); else actualizarContadores();
      pintarResumen();
      btnClear.disabled = !puestos.length;
      btnAuto.disabled = !puestos.length;
      alCambiar(exportar());
    }

    /* Solo los contadores cambian cuando se pone un charm. Redibujar la tira
       entera perdia el scroll: la clienta ponia una pieza y la bandeja saltaba
       al inicio, obligandola a buscar otra vez donde iba. */
    function actualizarContadores() {
      const usados = {};
      puestos.forEach((p) => { usados[p.id] = (usados[p.id] || 0) + 1; });
      tira.querySelectorAll("[data-pieza]").forEach((b) => {
        const n = usados[b.dataset.pieza] || 0;
        const marca = b.querySelector(".n-en-uso");
        if (marca) marca.textContent = n ? "× " + n : "";
      });
    }

    function pintarTira() {
      const usados = {};
      puestos.forEach((p) => { usados[p.id] = (usados[p.id] || 0) + 1; });
      const lista = piezas.filter((p) => categoria === "Todas" || p.categoria === categoria);
      tira.innerHTML = lista.map((p) => {
        const n = usados[p.id] || 0;
        const cuerpo = p.imgId ? `<img src="${esc(p.imgUrl)}" alt="">` : svgPieza(p, 38);
        return `<button type="button" class="ed-pieza" data-pieza="${esc(p.id)}"
          aria-label="Agregar ${esc(p.nombre)}"${p.disponible === false ? " disabled" : ""}>
          ${cuerpo}<span class="nb">${esc(p.nombre)}</span>
          <span class="n-en-uso">${n ? "× " + n : ""}</span>
        </button>`;
      }).join("");

      const grupos = ["Todas"].concat(piezas.map((p) => p.categoria).filter((v, i, a) => v && a.indexOf(v) === i));
      cats.innerHTML = grupos.map((g) =>
        `<button type="button" class="ed-cat" data-cat="${esc(g)}" aria-pressed="${g === categoria}">${esc(g)}</button>`
      ).join("");

      aviso.textContent = sonEjemplo
        ? "Charms de ejemplo mientras subimos las fotos reales al catálogo."
        : "";
    }

    function pintarResumen() {
      const n = puestos.length;
      if (!n) { resumen.hidden = true; return; }
      resumen.hidden = false;
      const precios = opciones.precios && opciones.precios.listos ? opciones.precios : null;
      if (precios) {
        const mapa = porId();
        let suma = precios.base || 0;
        puestos.forEach((p) => { const q = mapa.get(p.id); if (q && typeof q.precio === "number") suma += q.precio; });
        resumen.innerHTML = `<span class="lbl">${n} charm${n > 1 ? "s" : ""} en tu funda</span>
          <span class="val">$${suma + (precios.envio || 0)}</span>
          <span class="nota">Incluye la funda y el envío. Lo confirmamos por Instagram antes de empezar.</span>`;
      } else {
        resumen.innerHTML = `<span class="lbl">${n} charm${n > 1 ? "s" : ""} en tu funda</span>
          <span class="val sin">Precio por confirmar</span>
          <span class="nota">Te pasamos el total por Instagram junto con la foto de tu diseño.</span>`;
      }
    }

    /* ---------- arrastrar ---------- */
    function limites(x, y) {
      const dentro = { x: Math.max(6, Math.min(94, x)), y: Math.max(4, Math.min(96, y)) };
      // Un charm sobre el lente no se puede pegar: la pieza se desvia sola.
      return fueraDeCamara(camara, dentro.x, dentro.y, 5);
    }

    area.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(".ed-charm");
      if (!el || e.target.closest(".ed-tool")) return;
      const uid = el.dataset.uid;
      seleccion = uid;
      pintar();
      const vivo = area.querySelector(`[data-uid="${uid}"]`);
      if (!vivo) return;
      const caja = area.getBoundingClientRect();
      const punto = puestos.find((p) => p.uid === uid);
      const dx = e.clientX - (caja.left + (punto.x / 100) * caja.width);
      const dy = e.clientY - (caja.top + (punto.y / 100) * caja.height);
      let movio = false;
      vivo.classList.add("dragging");
      vivo.setPointerCapture(e.pointerId);

      function mover(ev) {
        if (!movio) { movio = true; guardarHistorial(); }
        const p = limites(((ev.clientX - dx - caja.left) / caja.width) * 100,
                          ((ev.clientY - dy - caja.top) / caja.height) * 100);
        punto.x = p.x; punto.y = p.y;
        vivo.style.left = p.x + "%";
        vivo.style.top = p.y + "%";
      }
      function soltar() {
        vivo.classList.remove("dragging");
        vivo.removeEventListener("pointermove", mover);
        vivo.removeEventListener("pointerup", soltar);
        vivo.removeEventListener("pointercancel", soltar);
        if (movio) { pintar(); }
      }
      vivo.addEventListener("pointermove", mover);
      vivo.addEventListener("pointerup", soltar);
      vivo.addEventListener("pointercancel", soltar);
    });

    function iniciarGiro(e) {
      e.stopPropagation();
      e.preventDefault();
      const punto = puestos.find((p) => p.uid === seleccion);
      if (!punto) return;
      const el = area.querySelector(`[data-uid="${seleccion}"]`);
      const caja = el.getBoundingClientRect();
      const cx = caja.left + caja.width / 2, cy = caja.top + caja.height / 2;
      guardarHistorial();
      e.currentTarget.classList.add("dragging");

      function gira(ev) {
        const ang = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI;
        punto.rot = Math.round(ang + 90);
        el.style.setProperty("--rot", punto.rot + "deg");
      }
      function suelta() {
        window.removeEventListener("pointermove", gira);
        window.removeEventListener("pointerup", suelta);
        pintar();
      }
      window.addEventListener("pointermove", gira);
      window.addEventListener("pointerup", suelta);
    }

    /* ---------- teclado ---------- */
    area.addEventListener("keydown", (e) => {
      const el = e.target.closest(".ed-charm");
      if (!el) return;
      const punto = puestos.find((p) => p.uid === el.dataset.uid);
      if (!punto) return;
      const paso = e.shiftKey ? 5 : 1;
      const teclas = { ArrowLeft: [-paso, 0], ArrowRight: [paso, 0], ArrowUp: [0, -paso], ArrowDown: [0, paso] };
      if (teclas[e.key]) {
        e.preventDefault();
        guardarHistorial();
        const p = limites(punto.x + teclas[e.key][0], punto.y + teclas[e.key][1]);
        punto.x = p.x; punto.y = p.y;
        seleccion = punto.uid;
        pintar();
        const nuevo = area.querySelector(`[data-uid="${punto.uid}"]`);
        if (nuevo) nuevo.focus();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        quitar(punto.uid);
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        guardarHistorial();
        punto.rot = (punto.rot + 15) % 360;
        pintar();
        const nuevo = area.querySelector(`[data-uid="${punto.uid}"]`);
        if (nuevo) nuevo.focus();
      }
    });

    /* ---------- controles ---------- */
    tira.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pieza]");
      if (b && !b.disabled) agregar(b.dataset.pieza);
    });
    cats.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      categoria = b.dataset.cat;
      pintarTira();
    });
    caseBox.addEventListener("pointerdown", (e) => {
      if (!e.target.closest(".ed-charm")) { seleccion = null; pintar(); }
    });
    btnAuto.addEventListener("click", acomodar);
    btnClear.addEventListener("click", () => {
      if (!puestos.length) return;
      guardarHistorial();
      puestos = []; seleccion = null; pintar();
    });
    btnUndo.addEventListener("click", () => {
      if (!historial.length) return;
      puestos = JSON.parse(historial.pop());
      seleccion = null;
      btnUndo.disabled = historial.length === 0;
      pintar();
    });

    /* ---------- fuera ---------- */
    function exportar() {
      const mapa = porId();
      return {
        color: colorFunda,
        pasta: colorPasta,
        modelo: modelo,
        fundaMm: { ancho: Math.round(anchoFunda(modelo) * 10) / 10, alto: Math.round(altoFunda(modelo) * 10) / 10 },
        piezas: puestos.map((p) => ({
          id: p.id,
          nombre: (mapa.get(p.id) || {}).nombre || p.id,
          x: Math.round(p.x * 10) / 10,
          y: Math.round(p.y * 10) / 10,
          rot: p.rot,
        })),
      };
    }

    ajustarProporcion();
    pintar();

    return {
      exportar,
      total: () => puestos.length,
      /* El catalogo real reemplaza las piezas de ejemplo sin recargar nada. */
      usarCatalogo(catalogo, urlBase) {
        const lista = (catalogo && catalogo.charms || []).filter((c) => c.disponible !== false);
        if (!lista.length) return false;
        piezas = lista.map((c) => ({
          id: c.id, nombre: c.nombre, categoria: c.categoria || "Charms",
          mm: c.mm || 12, precio: c.precio, disponible: c.disponible,
          imgId: c.imgId, imgUrl: c.imgId ? urlBase + "/img/" + c.imgId : null,
          forma: "estrella", tono: "oro",
        }));
        sonEjemplo = false;
        puestos = puestos.filter((p) => piezas.some((q) => q.id === p.id));
        pintar();
        return true;
      },
      cambiarColor(color, pasta, nuevoModelo) {
        colorFunda = color || "Blanca";
        colorPasta = pasta || colorFunda;
        if (nuevoModelo !== undefined && nuevoModelo !== null) {
          modelo = nuevoModelo;
          camara = zonaCamara(modelo);
          // Al cambiar de modelo lo que quedo bajo la camara se reacomoda solo.
          puestos.forEach((q) => { const f = fueraDeCamara(camara, q.x, q.y, 5); q.x = f.x; q.y = f.y; });
        }
        ajustarProporcion();
        caseBox.innerHTML = svgFunda(colorFunda, colorPasta, modelo);
        // el area de charms se vuelve a colgar tal cual, con todo lo que lleva
        caseBox.appendChild(area);
        pintar();
      },
    };
  }

  global.AsteriaEditor = { crear, svgFunda };
})(window);
