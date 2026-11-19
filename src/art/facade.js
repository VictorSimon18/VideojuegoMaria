// Nivel 1 - IES Félix de Azara: fondo con la fachada real del instituto y árboles/valla del patio.
//   facadeFar: paredes verde salvia y salmón con bandas de ventanas y persianas, pilastras crema, azotea con banderas.
//   patioMid : seto, valla negra, pinos y plátanos sin hojas (de tronco rojizo) delante de la fachada.
// Referencia: fotos de Street View de la fachada y vista aérea del patio (ver README).
import { makeCanvas, rect as R, rng, pixelEllipse, lerpColor } from './pixel.js';

const GREEN = ['#628f5c', '#4b7649', '#7aa972'];     // pared verde salvia: base, sombra, luz
const SALMON = ['#c96c4c', '#a35439', '#e0865f'];    // bloque central salmón/terracota
const OLIVE = ['#8ca968', '#718c52', '#a8c580'];     // ala derecha, verde más claro
const CREAM = '#d9d2a4';
const WIN = '#2c3650', FRAME = '#efebe1', BLIND = '#e6e2d8', REFL = '#ffc98a';

/** Línea de píxeles (Bresenham). */
function pline(g, color, x0, y0, x1, y1) {
  g.fillStyle = color;
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

export function facadeFar(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(8);
  const wall = (x0, x1, y0, col) => {
    R(g, col[0], x0, y0, x1 - x0, H - y0);
    R(g, col[2], x0, y0, x1 - x0, 2); R(g, col[1], x0, y0 + 2, x1 - x0, 1);       // cornisa
    R(g, '#4a3a50', x0, y0 - 2, x1 - x0, 2);                                       // pretil de la azotea
    for (let y = y0 + 10; y < H; y += 28) R(g, col[1], x0, y + 24, x1 - x0, 1);    // juntas entre plantas
  };
  wall(0, 152, 52, GREEN); wall(152, 330, 44, SALMON); wall(330, pw, 58, OLIVE);
  for (const x of [149, 330]) R(g, CREAM, x, 44, 3, H - 44);                        // pilastras crema

  // bandas de ventanas con persianas blancas y reflejos del atardecer
  const band = (x0, x1, y, h) => {
    for (let x = x0; x + 16 <= x1; x += 17) {
      R(g, FRAME, x, y, 15, h); R(g, WIN, x + 1, y + 1, 13, h - 2);
      const t = r();
      if (t < 0.4) R(g, BLIND, x + 1, y + 1, 13, Math.floor((h - 2) * (0.35 + r() * 0.5)));
      else if (t < 0.65) { R(g, REFL, x + 1, y + 1, 13, 2); R(g, '#ffa86a', x + 1, y + 3, 13, 1); }
      R(g, FRAME, x + 7, y, 1, h);
    }
  };
  for (const y of [62, 90, 118, 146]) { band(6, 146, y, 11); band(336, pw - 8, y + 4, 11); }
  for (const y of [54, 80, 120]) band(158, 326, y, 11);
  // cartel "IES FÉLIX DE AZARA" sobre el salmón (letras como bloques blancos)
  R(g, '#efe9dc', 196, 100, 90, 12); R(g, '#a35439', 196, 112, 90, 1);
  for (let i = 0; i < 17; i++) if (i !== 3 && i !== 11) R(g, '#7a3a28', 199 + i * 5, 103, 3, 6);
  // entrada: postes amarillos y verja negra
  R(g, '#e8b84a', 226, 140, 4, 40); R(g, '#e8b84a', 258, 140, 4, 40); R(g, '#2a2a30', 230, 144, 28, 36);
  for (let x = 232; x < 258; x += 3) R(g, '#4a4a58', x, 146, 1, 34);
  // azotea con banderas (europea, de España y de Aragón)
  R(g, '#4a3a50', 240, 20, 2, 24); R(g, '#e8d070', 240, 18, 2, 2);
  R(g, '#2a4aa8', 242, 22, 9, 5); R(g, '#ffd84a', 245, 24, 3, 1);
  R(g, '#c8372d', 242, 29, 9, 2); R(g, '#ffd84a', 242, 31, 9, 2); R(g, '#c8372d', 242, 33, 9, 2);
  // calor del atardecer sobre todo el edificio y sombra en lo alto
  g.globalAlpha = 0.11; g.fillStyle = '#ff8a5a'; g.fillRect(0, 18, pw, H); g.globalAlpha = 0.14;
  g.fillStyle = '#3d2b63'; g.fillRect(0, 18, pw, 40); g.globalAlpha = 1;
  return c;
}

export function pine(g, x, gy, h) {
  R(g, '#4a3226', x - 1, gy - 16, 3, 16);
  const layers = 5, top = gy - h;
  for (let i = 0; i < layers; i++) {
    const ty = top + Math.round(i * (h - 14) / layers), ht = Math.round((h - 14) / layers) + 8, wMax = 6 + i * 4;
    for (let yy = 0; yy < ht; yy++) {
      const rw = Math.max(1, Math.round(3 + (wMax - 3) * yy / ht));
      R(g, i % 2 ? '#2a6040' : '#1f4a32', x - Math.floor(rw / 2), ty + yy, rw, 1);
      if (yy % 3 === 0) R(g, '#3a7a52', x - Math.floor(rw / 2), ty + yy, 1, 1);
    }
  }
}

export function plane(g, x, gy, rr) {
  R(g, '#9a5a46', x - 2, gy - 44, 5, 44); R(g, '#b6a090', x - 2, gy - 32, 2, 9); R(g, '#b6a090', x + 1, gy - 20, 2, 7); R(g, '#7a4636', x + 2, gy - 44, 1, 44);
  const tw = [[-13, -18], [11, -16], [-5, -26], [6, -28], [-18, -9], [16, -8]];   // ramas sin hojas
  for (const [dx, dy] of tw) {
    const bx = x + (dx > 0 ? 2 : -1), by = gy - 44;
    pline(g, '#6a4036', bx, by, bx + dx, by + dy);
    pline(g, '#6a4036', bx + dx, by + dy, bx + dx + (dx > 0 ? 5 : -5), by + dy - 5);
    pline(g, '#6a4036', bx + Math.round(dx / 2), by + Math.round(dy / 2), bx + Math.round(dx / 2) + (dx > 0 ? 4 : -4), by + Math.round(dy / 2) - 6);
    if (rr() < 0.6) R(g, '#e0883a', bx + dx + (dx > 0 ? 5 : -5), by + dy - 5, 2, 2);   // alguna hoja de otoño
  }
}

export function patioMid(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(31), gy = 150;
  // valla de malla negra
  R(g, '#1c1c24', 0, gy - 30, pw, 1); R(g, '#1c1c24', 0, gy - 15, pw, 1);
  g.globalAlpha = 0.45; g.fillStyle = '#1c1c24';
  for (let x = 0; x < pw; x += 3) g.fillRect(x, gy - 29, 1, 14);
  g.globalAlpha = 1;
  for (let x = 6; x < pw; x += 40) R(g, '#1c1c24', x, gy - 31, 2, 33);
  // seto
  for (let x = 0; x < pw; x += 2) {
    const h = 12 + Math.floor(r() * 5);
    R(g, '#2f5a3a', x, gy - h, 2, h + 8);
  }
  for (let i = 0; i < 70; i++) R(g, r() < 0.5 ? '#3f7a4a' : '#244a2e', Math.floor(r() * pw), gy - 14 + Math.floor(r() * 14), 2, 1);
  R(g, '#a85040', 0, gy - 1, pw, 0);
  // árboles: pinos y plátanos sin hojas
  for (const x of [40, 190, 335]) pine(g, x, gy - 6, 62 + (x % 7));
  for (const x of [110, 262, 380]) plane(g, x, gy - 6, r);
  return c;
}
