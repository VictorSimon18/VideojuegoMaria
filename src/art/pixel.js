// Utilidades de pixel art: canvas, aleatorio con semilla, contorno, círculos, corazones.
export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

/** Generador pseudo-aleatorio determinista (mulberry32). */
export function rng(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hex(c) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function lerpColor(a, b, t) {
  const A = hex(a), B = hex(b);
  const m = (i) => Math.round(A[i] + (B[i] - A[i]) * t);
  return `rgb(${m(0)},${m(1)},${m(2)})`;
}

/** Rectángulo relleno rápido: r(g, color, x, y, w, h). */
export function rect(g, color, x, y, w = 1, h = 1) { g.fillStyle = color; g.fillRect(x, y, w, h); }

/** Círculo/elipse de píxeles. */
export function pixelEllipse(g, color, cx, cy, rx, ry) {
  g.fillStyle = color;
  for (let y = -ry; y <= ry; y++) {
    const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry + 0.0001)));
    g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
  }
}

/** Dibuja una trama de caracteres con una paleta { 'X': '#fff', ... }. '.' = transparente. */
export function drawPattern(g, rows, palette, x = 0, y = 0) {
  for (let j = 0; j < rows.length; j++) {
    for (let i = 0; i < rows[j].length; i++) {
      const c = palette[rows[j][i]];
      if (c) { g.fillStyle = c; g.fillRect(x + i, y + j, 1, 1); }
    }
  }
}

/** Añade un contorno de 1px alrededor de los píxeles opacos (dentro del propio canvas). */
export function outline(canvas, color = '#2a1620') {
  const g = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const src = g.getImageData(0, 0, w, h);
  const d = src.data;
  const [r, gg, b] = hex(color);
  const out = [];
  const a = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : d[(y * w + x) * 4 + 3];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (a(x, y) === 0 && (a(x - 1, y) > 0 || a(x + 1, y) > 0 || a(x, y - 1) > 0 || a(x, y + 1) > 0)) out.push(x, y);
    }
  }
  g.fillStyle = `rgb(${r},${gg},${b})`;
  for (let i = 0; i < out.length; i += 2) g.fillRect(out[i], out[i + 1], 1, 1);
  return canvas;
}

export const HEART_7 = [
  '.XX.XX.',
  'XLXXXXX',
  'XXXXXXX',
  '.XXXXX.',
  '..XXX..',
  '...X...',
];
export const HEART_5 = [
  '.X.X.',
  'XXXXX',
  '.XXX.',
  '..X..',
];

/** Corazón pixelado como canvas (color principal, brillo, sombra). */
export function heartSprite(main = '#ff5d8f', light = '#ffc2d6', dark = '#2a1620') {
  const c = makeCanvas(9, 8);
  const g = c.getContext('2d');
  drawPattern(g, HEART_7, { X: main, L: light }, 1, 1);
  outline(c, dark);
  return c;
}

/** Trazado de corazón (path) centrado en 0,0 con tamaño `s` (para transiciones). */
export function heartPath(g, s, begin = true) {
  if (begin) g.beginPath();
  g.moveTo(0, s);
  g.bezierCurveTo(-1.4 * s, 0.1 * s, -0.7 * s, -1.0 * s, 0, -0.4 * s);
  g.bezierCurveTo(0.7 * s, -1.0 * s, 1.4 * s, 0.1 * s, 0, s);
  g.closePath();
}
