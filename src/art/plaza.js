// Nivel 2 - Zaragoza: fondo con la Basílica del Pilar (torres y cúpulas de azulejo) y,
// delante, el Ayuntamiento de ladrillo con banderas, árboles y farolas de la Plaza del Pilar.
// Referencia: fotos aéreas y de la plaza (ver README).
import { makeCanvas, rect as R, rng, pixelEllipse } from './pixel.js';

const SAND = ['#e6c48c', '#c7a068', '#f6dfb4'];                 // piedra de la basílica: base, sombra, luz
const TILES = ['#2fa39a', '#f2c84b', '#f4f2e6', '#2e5fa8'];     // azulejos: turquesa, amarillo, blanco, azul
const COPPER = '#4f9a86', DARK = '#6a4a3a', WIN = '#3a2c3c';

/** Cúpula de azulejo (media elipse con franjas diagonales). */
function tiledDome(g, cx, cy, rx, ry) {
  for (let y = -ry; y <= 0; y++) {
    const hw = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry)));
    for (let x = -hw; x <= hw; x++) {
      const band = ((Math.floor((x + y * 2) / 3) % 4) + 4) % 4;
      R(g, TILES[band], cx + x, cy + y, 1, 1);
    }
    R(g, '#ffffff', cx - hw, cy + y, 1, 1);
  }
  R(g, 'rgba(60,30,60,0.25)', cx + Math.floor(rx * 0.4), cy - ry + 3, Math.ceil(rx * 0.6), ry - 3);   // sombra lateral
}

function dome(g, cx, base, rx, ry, drum) {
  R(g, SAND[0], cx - rx, base - drum, rx * 2, drum); R(g, SAND[1], cx + rx - 3, base - drum, 3, drum);
  for (let x = cx - rx + 3; x < cx + rx - 3; x += 6) R(g, WIN, x, base - drum + 2, 2, Math.max(2, drum - 4));
  tiledDome(g, cx, base - drum, rx, ry);
  const top = base - drum - ry;
  R(g, SAND[0], cx - 2, top - 7, 4, 7); R(g, COPPER, cx - 1, top - 11, 2, 4); R(g, SAND[1], cx, top - 14, 1, 3);
}

function tower(g, x, top, base) {
  R(g, SAND[0], x + 3, top + 24, 16, base - top - 24); R(g, SAND[1], x + 15, top + 24, 4, base - top - 24);
  R(g, SAND[2], x + 3, top + 24, 1, base - top - 24);
  R(g, SAND[0], x, top + 40, 22, base - top - 40); R(g, SAND[1], x + 18, top + 40, 4, base - top - 40);
  for (const y of [top + 44, top + 64, top + 84]) { R(g, SAND[1], x, y - 2, 22, 2); if (y + 12 < base) { R(g, WIN, x + 9, y + 3, 4, 10); R(g, SAND[2], x + 9, y + 2, 4, 1); } }
  pixelEllipse(g, '#f4efe0', x + 11, top + 33, 4, 4); R(g, WIN, x + 11, top + 30, 1, 4); R(g, WIN, x + 11, top + 33, 3, 1);   // reloj
  R(g, SAND[1], x + 1, top + 21, 20, 3); R(g, SAND[2], x + 1, top + 20, 20, 1);                                          // balconada
  for (let i = 0; i < 5; i++) R(g, SAND[1], x + 2 + i * 4, top + 14, 2, 7);
  tiledDome(g, x + 11, top + 14, 9, 11);
  R(g, SAND[0], x + 9, top - 3, 4, 6); R(g, COPPER, x + 10, top - 8, 2, 5); R(g, SAND[1], x + 11, top - 13, 1, 5); R(g, SAND[1], x + 9, top - 11, 5, 1);
}

export function plazaFar(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(12);
  R(g, '#b98a6a', 0, 150, pw, H - 150);
  // cuerpo de la basílica y su cornisa
  R(g, SAND[0], 84, 112, 312, 40); R(g, SAND[1], 84, 108, 312, 4); R(g, SAND[2], 84, 107, 312, 1);
  for (let x = 90; x < 392; x += 9) { R(g, SAND[1], x, 114, 1, 36); R(g, SAND[2], x + 1, 114, 1, 36); }
  for (const x of [128, 232, 336]) { R(g, SAND[1], x - 2, 128, 28, 24); pixelEllipse(g, SAND[1], x + 12, 128, 14, 8); R(g, WIN, x + 4, 130, 16, 22); pixelEllipse(g, WIN, x + 12, 130, 8, 6); }
  for (let x = 98; x < 384; x += 18) if (x % 3) { R(g, WIN, x, 118, 3, 7); R(g, SAND[2], x, 117, 3, 1); }
  // cúpulas
  dome(g, 240, 108, 30, 28, 10);
  for (const x of [148, 196, 284, 332]) dome(g, x, 108, 15, 13, 5);
  for (const x of [114, 366]) dome(g, x, 108, 11, 9, 4);
  // cuatro torres
  tower(g, 62, 36, 152); tower(g, 98, 46, 152); tower(g, 378, 46, 152); tower(g, 414, 36, 152);
  // resplandor cálido del atardecer y sombra en lo alto
  g.globalAlpha = 0.13; g.fillStyle = '#ff9a5a'; g.fillRect(0, 20, pw, H); g.globalAlpha = 0.12;
  g.fillStyle = '#3d2b63'; g.fillRect(0, 20, pw, 40); g.globalAlpha = 1;
  for (let i = 0; i < 14; i++) R(g, '#fff4d8', 70 + Math.floor(r() * 340), 60 + Math.floor(r() * 60), 1, 1);   // destellos en los azulejos
  return c;
}

function roundTree(g, x, gy, h, r) {
  R(g, '#5a3c2c', x - 1, gy - h * 0.55, 3, h * 0.55);
  pixelEllipse(g, '#3f6e3c', x + 1, gy - h * 0.75, 10, 9);
  pixelEllipse(g, '#5f9448', x - 1, gy - h * 0.82, 9, 8);
  for (let i = 0; i < 6; i++) R(g, i % 2 ? '#e0a040' : '#86b85a', x - 8 + Math.floor(r() * 16), gy - h + Math.floor(r() * 14), 2, 1);
}

function flag(g, x, y, kind) {
  R(g, '#3a3340', x, y, 1, 22);
  if (kind === 'es') { R(g, '#c8372d', x + 1, y, 10, 2); R(g, '#f2c040', x + 1, y + 2, 10, 4); R(g, '#c8372d', x + 1, y + 6, 10, 2); }
  else if (kind === 'ar') { for (let i = 0; i < 5; i++) R(g, i % 2 ? '#c8372d' : '#f2c040', x + 1, y + i * 2, 10, 2); }
  else { R(g, '#2a4aa8', x + 1, y, 10, 8); for (let i = 0; i < 6; i++) R(g, '#ffd84a', x + 3 + (i % 3) * 3, y + 2 + Math.floor(i / 3) * 3, 1, 1); }
}

export function plazaMid(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(41), gy = 152;
  // Ayuntamiento de ladrillo: cornisa saliente, ventanas con balcón, arcos en la planta baja
  const x0 = 236, w = 150, top = gy - 50;
  R(g, '#c9774f', x0, top, w, gy - top); R(g, '#a35a3a', x0 + w - 6, top, 6, gy - top);
  for (let y = top + 3; y < gy; y += 4) R(g, '#b0643f', x0, y, w, 1);
  R(g, '#7a3a28', x0 - 4, top - 4, w + 8, 4); R(g, '#d98a60', x0 - 4, top - 5, w + 8, 1);
  for (let x = x0 + 10; x < x0 + w - 12; x += 22) {
    R(g, '#f0d8b0', x, top + 8, 9, 13); R(g, WIN, x + 1, top + 9, 7, 11); R(g, '#7a3a28', x - 2, top + 21, 13, 2);
    R(g, '#e8d4a8', x + 3, top + 28, 3, 10);
  }
  for (let x = x0 + 8; x < x0 + w - 12; x += 22) { R(g, '#8a4a30', x, gy - 16, 12, 16); pixelEllipse(g, '#8a4a30', x + 6, gy - 16, 6, 5); R(g, '#3a2430', x + 2, gy - 14, 8, 14); }
  flag(g, x0 + 24, top - 26, 'es'); flag(g, x0 + 70, top - 26, 'ar'); flag(g, x0 + 112, top - 26, 'eu');
  // árboles de la plaza
  for (const x of [26, 76, 138, 188]) roundTree(g, x, gy - 2, 40 + (x % 3) * 4, r);
  // pilonas oscuras de luz y farolas
  for (const x of [8, 214]) { R(g, '#2a2430', x, gy - 70, 4, 70); R(g, '#3a3240', x - 1, gy - 72, 6, 3); R(g, '#ffd98a', x, gy - 75, 4, 3); }
  g.globalAlpha = 0.1; g.fillStyle = '#ff9a5a'; g.fillRect(0, 0, pw, H); g.globalAlpha = 1;
  return c;
}
