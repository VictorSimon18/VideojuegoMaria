// Nivel 3 - Parque Imperial de Plaza: fondo con arbolitos jóvenes, farolas de brazo, naves al fondo,
// valla de malla verde y bolardos amarillos plegables. Referencia: fotos de Street View y vista aérea.
import { makeCanvas, rect as R, rng, pixelEllipse } from './pixel.js';

/** Arbolito joven: tronco claro y copa irregular de varias manchas. */
export function youngTree(g, x, gy, h, r, dusk = true) {
  R(g, '#b9a890', x - 1, gy - h * 0.6, 2, h * 0.6); R(g, '#8a7a66', x, gy - h * 0.6, 1, h * 0.6);
  const cy = gy - h * 0.72, cols = dusk ? ['#2f6a3c', '#4f8a44', '#78a84e'] : ['#3f7a44', '#5f9a48', '#90c05a'];
  pixelEllipse(g, cols[0], x + 2, cy + 2, 9, 8); pixelEllipse(g, cols[1], x - 2, cy - 2, 9, 8); pixelEllipse(g, cols[2], x - 4, cy - 5, 5, 4);
  for (let i = 0; i < 6; i++) R(g, i % 2 ? '#c8d070' : '#2a5a34', x - 9 + Math.floor(r() * 18), cy - 8 + Math.floor(r() * 16), 2, 1);
}

/** Farola de brazo con luz encendida y halo. */
export function armLamp(g, x, gy, h = 50) {
  R(g, '#4a444e', x - 1, gy - h, 2, h); R(g, '#3a343e', x - 3, gy - 3, 6, 3);
  R(g, '#4a444e', x - 1, gy - h, 8, 2); R(g, '#3a343e', x + 5, gy - h + 2, 5, 2);
  g.fillStyle = 'rgba(255,217,138,0.22)'; g.beginPath(); g.arc(x + 8, gy - h + 6, 16, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,217,138,0.28)'; g.beginPath(); g.arc(x + 8, gy - h + 6, 8, 0, 7); g.fill();
  R(g, '#fff4c4', x + 6, gy - h + 4, 4, 2);
}

export function parkFar(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(13);
  R(g, '#7a5a6a', 0, 150, pw, H - 150);
  // naves y bloques lejanos
  for (const [x, w, h] of [[10, 70, 18], [96, 40, 12], [300, 60, 22], [370, 70, 16]]) {
    R(g, '#8a7a9a', x, 150 - h, w, h); R(g, '#a898b4', x, 150 - h, w, 2);
    for (let wx = x + 4; wx < x + w - 4; wx += 9) if (r() < 0.5) R(g, th.window, wx, 150 - h + 5, 3, 2);
  }
  // línea de árboles lejanos
  for (let x = 0; x < pw; x += 11) {
    const rr = 8 + Math.floor(r() * 5);
    pixelEllipse(g, r() < 0.5 ? '#3f6a4c' : '#365a44', x + 5, 146 - Math.floor(r() * 6), rr, rr - 2);
  }
  R(g, '#365a44', 0, 146, pw, 6);
  g.globalAlpha = 0.14; g.fillStyle = '#ff8a6a'; g.fillRect(0, 60, pw, H); g.globalAlpha = 1;
  return c;
}

export function parkMid(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(52), gy = 152;
  // valla de malla verde (postes inclinados)
  R(g, '#2f6a4a', 0, gy - 18, pw, 1);
  g.globalAlpha = 0.35; g.fillStyle = '#2f6a4a'; for (let x = 0; x < pw; x += 3) g.fillRect(x, gy - 17, 1, 17); g.globalAlpha = 1;
  for (let x = 14; x < pw; x += 44) { R(g, '#2f6a4a', x, gy - 22, 2, 22); R(g, '#2f6a4a', x + 2, gy - 23, 3, 1); }
  // hierba seca al pie
  for (let i = 0; i < 90; i++) R(g, r() < 0.5 ? '#9a8a4a' : '#6f8a4a', Math.floor(r() * pw), gy - 3 - Math.floor(r() * 4), 1, 3 + Math.floor(r() * 2));
  // arbolitos y farolas
  for (const x of [22, 70, 128, 190, 262, 318, 372]) youngTree(g, x, gy, 52 + (x % 4) * 5, r);
  for (const x of [100, 292]) armLamp(g, x, gy, 58);
  g.globalAlpha = 0.08; g.fillStyle = '#ff8a6a'; g.fillRect(0, 0, pw, H); g.globalAlpha = 1;
  return c;
}
