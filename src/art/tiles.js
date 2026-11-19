// Tileset y decoración generados por código a partir de un tema (paleta) del nivel.
import { makeCanvas, rng, rect as R, pixelEllipse } from './pixel.js';
import { pine, plane } from './facade.js';

const T = 16;

function dirtBase(g, th, r) {
  R(g, th.dirt, 0, 0, T, T);
  for (let i = 0; i < 16; i++) R(g, th.dirtD, Math.floor(r() * T), Math.floor(r() * T), 1 + (r() < 0.3 ? 1 : 0), 1);
  for (let i = 0; i < 5; i++) R(g, th.dirtL, Math.floor(r() * T), Math.floor(r() * T), 1, 1);
}

function grassTop(g, th, r) {
  dirtBase(g, th, r);
  R(g, th.grass, 0, 0, T, 4);
  const fringe = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0];
  for (let x = 0; x < T; x++) {
    if (fringe[(x + Math.floor(r() * 3)) % T]) R(g, th.grass, x, 4, 1, 1);
    R(g, th.grassD, x, 3, 1, 1);
    if (x % 2 === (r() < 0.5 ? 0 : 1)) R(g, th.grassL, x, 0, 1, 1);
  }
  R(g, th.grassD, 0, 4, 1, 1);
}

/** Pista de patio (azul con líneas blancas) vista de lado: pintura azul arriba y losa de hormigón debajo. */
function courtTop(g, th, r, variant) {
  slab(g, th, r);
  R(g, th.grass, 0, 0, T, 4); R(g, th.grassL, 0, 0, T, 1); R(g, th.grassD, 0, 3, T, 2);
  if (variant === 1) R(g, '#f4f4f4', 0, 1, T, 1);                                  // línea de pista
  else if (variant === 2) for (let x = 1; x < T; x += 5) R(g, '#f4f4f4', x, 1, 3, 1);   // línea discontinua
}

function slab(g, th, r) {
  R(g, th.dirt, 0, 0, T, T);
  for (let i = 0; i < 14; i++) R(g, th.dirtD, Math.floor(r() * T), Math.floor(r() * T), 1, 1);
  for (let i = 0; i < 6; i++) R(g, th.dirtL, Math.floor(r() * T), Math.floor(r() * T), 1, 1);
  R(g, th.dirtD, 0, 0, 1, T);                                                      // junta entre losas
}

/** Banco del patio: tablones de madera y patas metálicas (plataforma de nube del nivel 1). */
function bench(g) {
  R(g, '#d9a064', 0, 0, T, 1); R(g, '#b87a44', 0, 1, T, 2); R(g, '#8a5a30', 0, 3, T, 1);
  R(g, '#3a3a44', 1, 4, 2, 2); R(g, '#3a3a44', 13, 4, 2, 2);
}

function brick(g, th) {
  R(g, th.brick, 0, 0, T, T);
  R(g, th.brickD, 0, 7, T, 1); R(g, th.brickD, 0, 15, T, 1);
  R(g, th.brickD, 7, 0, 1, 7); R(g, th.brickD, 3, 8, 1, 7); R(g, th.brickD, 11, 8, 1, 7);
  R(g, th.brickL, 0, 0, T, 1); R(g, th.brickL, 0, 8, T, 1);
}

function box(g, th) {
  R(g, th.boxD, 0, 0, T, T);
  R(g, th.box, 1, 1, 14, 14);
  R(g, th.boxL, 1, 1, 14, 1);
  R(g, th.boxD, 2, 2, 12, 1); R(g, th.boxD, 2, 13, 12, 1); R(g, th.boxD, 2, 2, 1, 12); R(g, th.boxD, 13, 2, 1, 12);
  // corazón grabado
  const h = ['.X.X.', 'XXXXX', '.XXX.', '..X..'];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) if (h[j][i] === 'X') R(g, '#ff7aa5', 5 + i, 5 + j, 1, 1);
  R(g, '#ffd0e0', 6, 6, 1, 1);
}

function cloud(g, th) {
  R(g, th.cloud, 0, 3, T, 3);
  pixelEllipse(g, th.cloud, 4, 3, 4, 2);
  pixelEllipse(g, th.cloud, 11, 2, 5, 2);
  R(g, th.cloudD, 0, 5, T, 1);
  R(g, '#fff', 3, 1, 2, 1); R(g, '#fff', 10, 0, 2, 1);
}

function thorn(g, th) {
  R(g, '#4f7a46', 0, 13, T, 3);
  for (let i = 0; i < 4; i++) {
    const x = i * 4;
    R(g, '#6fa35a', x + 1, 10, 2, 3); R(g, '#6fa35a', x + 1, 8, 1, 2); R(g, '#3d6137', x + 2, 9, 1, 4);
    R(g, '#ff8aa8', x + 1, 7, 1, 1);
  }
  R(g, '#ff5d8f', 6, 11, 3, 2); R(g, '#ffb0c8', 7, 11, 1, 1);
}

/** Crea el conjunto de tiles para un tema. `pick` devuelve el sprite de una celda. */
export function makeTileset(th) {
  const r = rng(1234);
  const mk = (fn) => { const c = makeCanvas(T, T); fn(c.getContext('2d')); return c; };
  const patio = th.floor === 'patio';
  const grass = [0, 1, 2].map((i) => mk((g) => (patio ? courtTop(g, th, r, i) : grassTop(g, th, r))));
  const dirt = [0, 1, 2].map(() => mk((g) => (patio ? slab(g, th, r) : dirtBase(g, th, r))));
  const sBrick = mk((g) => brick(g, th));
  const sBox = mk((g) => box(g, th));
  const sCloud = mk((g) => (th.cloudSkin === 'banco' ? bench(g) : cloud(g, th)));
  const sThorn = mk((g) => thorn(g, th));
  return {
    pick(map, tx, ty) {
      const ch = map.get(tx, ty);
      const v = (tx * 7 + ty * 13) % 3;
      switch (ch) {
        case '#': return map.isSolid(tx, ty - 1) ? dirt[v] : grass[v];
        case 'X': return sBrick;
        case 'b': return sBox;
        case '=': return sCloud;
        case '^': return sThorn;
        default: return null;
      }
    },
  };
}

/** Pinta un elemento decorativo (árbol, arbusto...) en la capa de decoración. */
/** Objetos del patio del instituto: pinos, plátanos, setos, balones y canastas. */
function makePatioDecor(th) {
  const r = rng(99);
  return function paint(g, ch, tx, ty) {
    const cx = tx * T + 8, by = (ty + 1) * T;
    if (ch === 'T') { if (tx % 2) plane(g, cx, by, r); else pine(g, cx, by, 48 + (tx % 5) * 3); }
    else if (ch === 'h') {   // seto
      for (let i = -14; i < 14; i += 2) R(g, '#2f5a3a', cx + i, by - 11 - Math.floor(r() * 4), 2, 15);
      for (let i = 0; i < 12; i++) R(g, r() < 0.5 ? '#3f7a4a' : '#244a2e', cx - 14 + Math.floor(r() * 28), by - 12 + Math.floor(r() * 10), 2, 1);
    } else if (ch === 'w') {   // balón de baloncesto y cono
      pixelEllipse(g, '#e8782a', cx - 5, by - 4, 4, 4); R(g, '#7a3a12', cx - 5, by - 8, 1, 8); R(g, '#7a3a12', cx - 9, by - 4, 8, 1);
      R(g, '#ffb070', cx - 7, by - 6, 2, 1);
      R(g, '#ff9a3a', cx + 4, by - 1, 7, 1); R(g, '#ff9a3a', cx + 5, by - 3, 5, 2); R(g, '#ff9a3a', cx + 6, by - 5, 3, 2); R(g, '#fff', cx + 5, by - 3, 5, 1);
    } else if (ch === 'l') {   // farola
      R(g, '#3e3046', cx - 1, by - 36, 2, 36); R(g, '#3e3046', cx - 3, by - 3, 6, 3);
      g.fillStyle = 'rgba(255,217,138,0.22)'; g.beginPath(); g.arc(cx, by - 40, 17, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,217,138,0.25)'; g.beginPath(); g.arc(cx, by - 40, 10, 0, 7); g.fill();
      R(g, '#3e3046', cx - 4, by - 44, 8, 2); R(g, '#ffd98a', cx - 3, by - 42, 6, 6); R(g, '#fff4c4', cx - 1, by - 41, 2, 3);
    } else if (ch === 'B') {   // canasta
      R(g, '#4a4a58', cx - 1, by - 46, 3, 46); R(g, '#32323e', cx - 3, by - 3, 7, 3);
      R(g, '#d0d0da', cx - 9, by - 56, 18, 13); R(g, '#f4f4f8', cx - 8, by - 55, 16, 11);
      R(g, '#d83a3a', cx - 4, by - 51, 8, 6); R(g, '#f4f4f8', cx - 3, by - 50, 6, 4);
      R(g, '#ff8a2a', cx - 5, by - 43, 10, 2);                                           // aro
      g.globalAlpha = 0.6; for (let i = -4; i <= 4; i += 2) R(g, '#ffffff', cx + i, by - 41, 1, 6); g.globalAlpha = 1;
    }
  };
}

export function makeDecorPainter(th) {
  if (th.decor === 'patio') return makePatioDecor(th);
  const r = rng(99);
  return function paint(g, ch, tx, ty) {
    const cx = tx * T + 8, by = (ty + 1) * T;
    if (ch === 'T') {
      R(g, '#6b4434', cx - 2, by - 24, 4, 24); R(g, '#53342a', cx + 1, by - 24, 1, 24);
      R(g, '#6b4434', cx - 4, by - 3, 8, 3);
      pixelEllipse(g, th.leaf[2], cx + 1, by - 28, 14, 11);
      pixelEllipse(g, th.leaf[0], cx, by - 31, 13, 10);
      pixelEllipse(g, th.leaf[1], cx - 4, by - 34, 7, 5);
      for (let i = 0; i < 7; i++) R(g, th.petal, cx - 12 + Math.floor(r() * 24), by - 40 + Math.floor(r() * 18), 1, 1);
    } else if (ch === 'h') {
      pixelEllipse(g, th.bush, cx, by - 5, 13, 6);
      pixelEllipse(g, th.bushL, cx - 3, by - 8, 7, 3);
      for (let i = 0; i < 4; i++) R(g, th.petal, cx - 9 + Math.floor(r() * 18), by - 10 + Math.floor(r() * 7), 1, 1);
    } else if (ch === 'w') {
      const cols = ['#ff7aa5', '#ffd166', '#ffffff', '#ff9bd0'];
      for (let i = 0; i < 3; i++) {
        const x = cx - 5 + i * 5, h = 5 + (i % 2) * 2;
        R(g, '#4f7a46', x, by - h, 1, h);
        R(g, cols[(i + tx) % cols.length], x - 1, by - h - 2, 3, 3);
        R(g, '#ffe9a8', x, by - h - 1, 1, 1);
      }
    } else if (ch === 'l') {
      R(g, '#3e3046', cx - 1, by - 36, 2, 36); R(g, '#3e3046', cx - 3, by - 3, 6, 3);
      g.fillStyle = 'rgba(255,217,138,0.22)'; g.beginPath(); g.arc(cx, by - 40, 17, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,217,138,0.25)'; g.beginPath(); g.arc(cx, by - 40, 10, 0, 7); g.fill();
      R(g, '#3e3046', cx - 4, by - 44, 8, 2); R(g, '#ffd98a', cx - 3, by - 42, 6, 6); R(g, '#fff4c4', cx - 1, by - 41, 2, 3);
    }
  };
}
