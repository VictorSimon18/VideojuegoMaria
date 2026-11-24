// Nivel 5 - calle genérica de Zaragoza: bloques de pisos con balcones, plátanos sin hojas, farolas,
// marquesina de autobús, coches aparcados y bolardos. Meta: una casa con tres niños.
// Referencia: fotos de Street View de calles de Zaragoza.
import { makeCanvas, rect as R, rng, pixelEllipse, outline } from './pixel.js';

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

/** Plátano de sombra sin hojas: tronco claro moteado y ramas finas. */
export function barePlane(g, x, gy, h, rr) {
  const top = gy - h;
  R(g, '#c2b4a2', x - 1, top + 8, 3, h - 8); R(g, '#8a7a6a', x + 1, top + 8, 1, h - 8);
  for (let i = 0; i < 4; i++) R(g, '#e0d6c6', x - 1, top + 14 + i * 9, 2, 3);
  const br = [[-12, -14], [11, -16], [-5, -22], [6, -24], [-16, -6], [15, -5]];
  for (const [dx, dy] of br) {
    const bx = x + (dx > 0 ? 1 : 0), by = top + 14;
    pline(g, '#6e5e56', bx, by, bx + dx, by + dy);
    pline(g, '#6e5e56', bx + dx, by + dy, bx + dx + (dx > 0 ? 5 : -5), by + dy - 4);
    pline(g, '#6e5e56', bx + Math.round(dx / 2), by + Math.round(dy / 2), bx + Math.round(dx / 2) + (dx > 0 ? 4 : -4), by + Math.round(dy / 2) - 6);
    if (rr() < 0.5) R(g, '#c8a070', bx + dx + (dx > 0 ? 5 : -5), by + dy - 4, 1, 1);
  }
  pline(g, '#6e5e56', x, top + 8, x - 3, top - 2); pline(g, '#6e5e56', x, top + 8, x + 4, top);
}

/** Farola alta de cabeza curva, con la luz encendida. */
export function streetLamp(g, x, gy, h = 54) {
  R(g, '#2a2a32', x - 1, gy - h, 2, h); R(g, '#2a2a32', x - 3, gy - 3, 6, 3);
  R(g, '#2a2a32', x - 1, gy - h, 7, 2); R(g, '#3a3a44', x + 4, gy - h + 2, 5, 3);
  g.fillStyle = 'rgba(255,217,138,0.22)'; g.beginPath(); g.arc(x + 7, gy - h + 6, 15, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,217,138,0.28)'; g.beginPath(); g.arc(x + 7, gy - h + 6, 7, 0, 7); g.fill();
  R(g, '#fff4c4', x + 5, gy - h + 5, 4, 1);
}

function car(g, x, gy, body, shade) {
  R(g, body, x, gy - 9, 30, 6); R(g, shade, x, gy - 5, 30, 2); R(g, body, x + 6, gy - 14, 16, 5);
  R(g, '#8aa8c0', x + 8, gy - 13, 5, 4); R(g, '#8aa8c0', x + 15, gy - 13, 5, 4);
  R(g, '#e03a30', x + 29, gy - 8, 1, 2); R(g, '#1a1a22', x + 2, gy - 4, 6, 4); R(g, '#1a1a22', x + 21, gy - 4, 6, 4);
  R(g, '#a8a8b4', x + 4, gy - 3, 2, 2); R(g, '#a8a8b4', x + 23, gy - 3, 2, 2);
}

export function calleFar(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(23);
  R(g, '#8a7a82', 0, 148, pw, H - 148);
  const blocks = [[0, 112, 40, '#d6a07c'], [112, 84, 66, '#e0c29c'], [196, 100, 50, '#c8946e'], [296, 118, 72, '#dcb48e'], [414, 66, 54, '#d6a07c']];
  for (const [x, w, top, col] of blocks) {
    R(g, col, x, top, w, 150 - top); R(g, 'rgba(60,30,50,0.22)', x + w - 7, top, 7, 150 - top);
    R(g, '#8a5a4a', x - 1, top - 3, w + 2, 3); R(g, '#f0d4b4', x, top, w, 1);
    for (let y = top + 6; y < 134; y += 11) {
      for (let wx = x + 5; wx + 7 < x + w - 6; wx += 12) {
        R(g, r() < 0.28 ? '#ffd98a' : '#3a3858', wx, y, 6, 7); R(g, '#f0e6d8', wx - 1, y - 1, 8, 1);
        if ((Math.floor((y - top) / 11) + Math.floor((wx - x) / 12)) % 3 === 0) { R(g, '#5a4a54', wx - 2, y + 8, 10, 1); R(g, '#3a2e36', wx - 2, y + 7, 1, 2); R(g, '#3a2e36', wx + 7, y + 7, 1, 2); }
      }
    }
    R(g, '#6a4a48', x, 136, w, 14); for (let wx = x + 4; wx < x + w - 8; wx += 16) R(g, '#ffe0a0', wx, 139, 10, 8);   // locales de la planta baja
  }
  g.globalAlpha = 0.13; g.fillStyle = '#ff9a6a'; g.fillRect(0, 20, pw, H); g.globalAlpha = 0.1; g.fillStyle = '#3a3a66'; g.fillRect(0, 20, pw, 50); g.globalAlpha = 1;
  return c;
}

export function calleMid(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(71), gy = 152;
  // coches aparcados
  car(g, 232, gy, '#c8302c', '#962420'); car(g, 268, gy, '#8a94a8', '#6a7488'); car(g, 304, gy, '#3a4a78', '#2a3658'); car(g, 340, gy, '#e8e8f0', '#b8b8c8');
  // marquesina de autobús
  R(g, '#2a3040', 120, gy - 34, 62, 3); R(g, '#3a4458', 120, gy - 34, 62, 1);
  R(g, '#2a3040', 122, gy - 31, 2, 31); R(g, '#2a3040', 178, gy - 31, 2, 31);
  g.globalAlpha = 0.28; g.fillStyle = '#9ab4cc'; g.fillRect(124, gy - 30, 54, 26); g.globalAlpha = 1;
  R(g, '#d8d8cc', 130, gy - 26, 12, 14); R(g, '#8a8a88', 132, gy - 24, 8, 1); R(g, '#8a8a88', 132, gy - 21, 8, 1); R(g, '#8a8a88', 132, gy - 18, 6, 1);
  R(g, '#1c1c24', 146, gy - 26, 12, 14); R(g, '#c8302c', 120, gy - 30, 62, 1);
  R(g, '#3a3a44', 134, gy - 8, 30, 2); R(g, '#3a3a44', 136, gy - 6, 2, 6); R(g, '#3a3a44', 160, gy - 6, 2, 6);
  // plátanos y farolas
  for (const [x, h] of [[24, 66], [78, 60], [212, 64], [372, 62], [100, 56]]) barePlane(g, x, gy, h, r);
  for (const x of [52, 200, 388]) streetLamp(g, x, gy, 56);
  // bolardos
  for (const x of [8, 16, 24]) { R(g, '#7a7a86', x, gy - 8, 3, 8); R(g, '#a0a0ac', x, gy - 8, 3, 1); }
  g.globalAlpha = 0.08; g.fillStyle = '#ff8a6a'; g.fillRect(0, 0, pw, H); g.globalAlpha = 1;
  return c;
}

function kid(g, x, base, shirt, hair, up) {
  R(g, '#2a3a6a', x, base - 5, 2, 5); R(g, '#2a3a6a', x + 3, base - 5, 2, 5);                       // piernas
  R(g, shirt, x - 1, base - 11, 7, 6);                                                              // jersey
  R(g, '#f0c8a0', x + 3 - (up ? 4 : 0) - 1 - 1, base - (up ? 15 : 8), 2, up ? 5 : 3); R(g, '#f0c8a0', x + 5, base - (up ? 15 : 8), 2, up ? 5 : 3);
  R(g, '#f0c8a0', x, base - 16, 5, 5); R(g, hair, x, base - 17, 5, 2); R(g, hair, x - 1, base - 16, 1, 2);   // cabeza y pelo
  R(g, '#2a1620', x + 1, base - 14, 1, 1); R(g, '#2a1620', x + 3, base - 14, 1, 1); R(g, '#c8503c', x + 2, base - 12, 1, 1);
}

/** Casa con tres niños delante (meta del nivel 5). Dos fotogramas de 60x48 (los niños saludan). */
export function casaGoal() {
  const W = 60, Hh = 48, o = makeCanvas(W * 2, Hh), og = o.getContext('2d');
  for (let f = 0; f < 2; f++) {
    const c = makeCanvas(W, Hh), g = c.getContext('2d');
    R(g, '#e8d0a8', 6, 20, 48, 28); R(g, '#c8a880', 46, 20, 8, 28);                                  // paredes
    for (let y = 0; y < 10; y++) R(g, '#b8503c', 3 + Math.floor(y * 0.6), 10 + y, 54 - Math.floor(y * 1.2), 1);   // tejado
    R(g, '#8a3a2c', 3, 19, 54, 2); R(g, '#d8705a', 8, 11, 44, 1);
    R(g, '#6a3a2c', 40, 12, 5, 8); R(g, '#8a5a44', 40, 12, 5, 1);                                     // chimenea
    R(g, '#8a5a3a', 26, 30, 10, 18); R(g, '#a8744a', 27, 31, 8, 16); R(g, '#e8c040', 33, 40, 1, 2);    // puerta
    R(g, '#f0e6d8', 10, 26, 10, 9); R(g, '#8ab0d0', 11, 27, 8, 7); R(g, '#f0e6d8', 14, 27, 1, 7);      // ventana
    R(g, '#f0e6d8', 42, 26, 8, 9); R(g, '#ffd98a', 43, 27, 6, 7);
    R(g, '#ff7aa5', 29, 4, 2, 1); R(g, '#ff7aa5', 33, 4, 2, 1); R(g, '#ff7aa5', 28, 5, 8, 2); R(g, '#ff7aa5', 29, 7, 6, 1); R(g, '#ff7aa5', 31, 8, 2, 1);   // corazón sobre el tejado
    R(g, '#6a8a4a', 0, 46, W, 2);                                                                      // césped
    kid(g, 12, 48, '#e8503c', '#4a2a1a', f === 0); kid(g, 28, 48, '#3a9ad8', '#c88a3a', f === 1); kid(g, 44, 48, '#f0c040', '#2a1a14', f === 0);
    outline(c); og.drawImage(c, f * W, 0);
  }
  return o;
}
