// Aspecto de los aparatos de cada nivel (se elige con theme.gadgets en levels/themes.js).
import { makeCanvas, rect as R, pixelEllipse, drawPattern, outline } from './pixel.js';

const mk = (w, h, fn, line = true) => { const c = makeCanvas(w, h), g = c.getContext('2d'); fn(g); if (line) outline(c); return c; };

const MOVERS = {
  barca: () => mk(32, 10, (g) => {
    R(g, '#d9a870', 0, 0, 32, 2); R(g, '#f0c890', 2, 0, 28, 1);
    R(g, '#8a5a3a', 1, 2, 30, 4); R(g, '#a8704a', 3, 3, 26, 1); R(g, '#6a4228', 4, 6, 24, 2);
    R(g, '#ffe9b8', 6, 4, 2, 1); R(g, '#ffe9b8', 24, 4, 2, 1);
  }),
  tarima: () => mk(32, 10, (g) => {
    R(g, '#9fa0c4', 0, 0, 32, 3); R(g, '#ffffff', 2, 0, 28, 1);
    R(g, '#5a5a7e', 0, 3, 32, 3); R(g, '#3a3a58', 2, 6, 28, 2);
    for (const x of [4, 14, 26]) { R(g, '#ff70b0', x, 4, 2, 1); R(g, '#ffd0e8', x, 4, 1, 1); }
  }),
  estrella: () => mk(32, 10, (g) => {
    R(g, '#d0e0ff', 1, 0, 30, 3); R(g, '#ffffff', 3, 0, 26, 1); R(g, '#a8c8ff', 0, 1, 32, 2);
    R(g, '#7aa0e8', 3, 3, 26, 2); R(g, '#5a7ec8', 6, 5, 20, 1);
    R(g, '#ffffff', 5, 2, 1, 1); R(g, '#ffffff', 16, 1, 1, 1); R(g, '#ffe27a', 26, 2, 1, 1);
  }),
};

const CRUMBLES = {
  hoja: () => mk(32, 9, (g) => {
    pixelEllipse(g, '#e8863a', 16, 3, 15, 3); pixelEllipse(g, '#f2a65a', 14, 2, 11, 1);
    R(g, '#b85a28', 2, 3, 28, 1); R(g, '#b85a28', 9, 4, 2, 1); R(g, '#b85a28', 19, 4, 2, 1);
    R(g, '#8a5a2c', 28, 3, 3, 1);
  }),
  estrella: () => mk(32, 9, (g) => {
    R(g, '#ffe27a', 1, 0, 30, 3); R(g, '#fff6c0', 3, 0, 26, 1);
    R(g, '#ffb84a', 3, 3, 26, 2); R(g, '#ff9a3a', 7, 5, 18, 1);
    R(g, '#ffffff', 6, 1, 1, 1); R(g, '#ffffff', 15, 2, 1, 1); R(g, '#ffffff', 25, 1, 1, 1);
  }),
};

function rhythmBlock(main, light, dark) {
  const on = mk(16, 16, (g) => {
    R(g, dark, 0, 0, 16, 16); R(g, main, 1, 1, 14, 14); R(g, light, 1, 1, 14, 2);
    R(g, light, 4, 6, 8, 1); R(g, light, 6, 9, 4, 1); R(g, dark, 3, 12, 10, 1);
  }, false);
  const off = mk(16, 16, (g) => {
    g.globalAlpha = 0.5; g.fillStyle = main;
    for (let i = 0; i < 16; i += 2) { g.fillRect(i, 0, 1, 1); g.fillRect(i, 15, 1, 1); g.fillRect(0, i, 1, 1); g.fillRect(15, i, 1, 1); }
    g.globalAlpha = 0.12; g.fillRect(1, 1, 14, 14);
  }, false);
  return { on, off };
}

const SPRINGS = {
  seta: () => [
    mk(14, 10, (g) => { R(g, '#f4e4cc', 5, 5, 4, 5); R(g, '#e8506e', 1, 2, 12, 3); R(g, '#e8506e', 3, 1, 8, 1); R(g, '#ff8aa0', 3, 2, 3, 1); R(g, '#fff', 3, 3, 2, 1); R(g, '#fff', 8, 2, 2, 1); R(g, '#fff', 10, 3, 2, 1); }),
    mk(14, 7, (g) => { R(g, '#f4e4cc', 5, 4, 4, 3); R(g, '#e8506e', 0, 2, 14, 2); R(g, '#e8506e', 2, 1, 10, 1); R(g, '#fff', 3, 2, 2, 1); R(g, '#fff', 9, 2, 2, 1); }),
  ],
  altavoz: () => [
    mk(14, 10, (g) => { R(g, '#3a2a4a', 1, 0, 12, 10); R(g, '#6a5a8a', 1, 0, 12, 1); R(g, '#ff70b0', 3, 2, 8, 6); R(g, '#ffd0e8', 5, 4, 4, 2); R(g, '#3a2a4a', 6, 4, 2, 2); }),
    mk(14, 7, (g) => { R(g, '#3a2a4a', 1, 0, 12, 7); R(g, '#6a5a8a', 1, 0, 12, 1); R(g, '#ff70b0', 3, 2, 8, 4); R(g, '#ffd0e8', 5, 3, 4, 2); }),
  ],
  estrella: () => [
    mk(14, 10, (g) => { drawPattern(g, ['.....X.....'.slice(0, 14), '....XXX....', '..XXXXXXX..', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..XXXXXXX..', '.XXX...XXX.', '.X.......X.'], { X: '#ffd84a' }, 1, 1); R(g, '#fff7c0', 6, 3, 2, 1); }),
    mk(14, 7, (g) => { drawPattern(g, ['....XXX....', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..XXXXXXX..', '.XXX...XXX.'], { X: '#ffd84a' }, 1, 1); R(g, '#fff7c0', 5, 2, 2, 1); }),
  ],
};

/** Hojas de sprites de aparatos para un tema (siempre devuelve todos, con valores por defecto). */
export function makeGadgetSprites(theme) {
  const gd = theme.gadgets || {};
  return {
    mover: (MOVERS[gd.mover] || MOVERS.barca)(),
    crumble: (CRUMBLES[gd.crumble] || CRUMBLES.hoja)(),
    spring: (SPRINGS[gd.spring] || SPRINGS.seta)(),
    rhythm: { r: rhythmBlock('#ff5aa8', '#ffb0d8', '#8a2260'), R: rhythmBlock('#4ad8ff', '#b0f0ff', '#1a6a8a') },
  };
}
