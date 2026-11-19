// Enemigos simpáticos de cada nivel, dibujados por código (cada uno con su "piel" de tema):
//   math     -> signos matemáticos con ojos (x + ÷ π e Σ), nivel 1 (Instituto)
//   paloma   -> palomas del Pilar, nivel 2 (Zaragoza)
//   ardilla  -> ardillas del parque, nivel 3
//   nota     -> notas musicales, nivel 4 (concierto)
//   estrella -> estrellitas, nivel 5
// Cada paseante son 2 fotogramas de 14x13. Se elige con theme.enemy en levels/themes.js.
import { makeCanvas, rect as R, drawPattern, outline } from './pixel.js';

// Glifos 9x9: X = cuerpo, E = ojo (blanco), P = pupila.
const GLYPHS = [
  { color: '#ff7aa5', rows: ['XX.....XX', 'XXX...XXX', '.XXXXXXX.', '..XEXEX..', '...PXP...', '..XXXXX..', '.XXXXXXX.', 'XXX...XXX', 'XX.....XX'] },   // ×
  { color: '#ffb04a', rows: ['...XXX...', '...XXX...', '...XXX...', 'XXEXXXEXX', 'XXPXXXPXX', 'XXXXXXXXX', '...XXX...', '...XXX...', '...XXX...'] },   // +
  { color: '#3fc8c0', rows: ['...XXX...', '...XXX...', '.........', 'XXEXXXEXX', 'XXPXXXPXX', 'XXXXXXXXX', '.........', '...XXX...', '...XXX...'] },   // ÷
  { color: '#a58aff', rows: ['XXXXXXXXX', 'XXXXXXXXX', '.EX...EX.', '.PX...PX.', '.XX...XX.', '.XX...XX.', '.XX...XX.', '.XX...XXX', '.XX....XX'] },   // π
  { color: '#7bd96f', rows: ['.XXXXXXX.', 'XXXXXXXXX', 'XX.....XX', 'XXEXXXEXX', 'XXPXXXPXX', 'XX.......', 'XXX....XX', '.XXXXXXX.', '..XXXXX..'] },   // e
  { color: '#5aa8ff', rows: ['XXEXXXEXX', 'XXPXXXPXX', '.XXX.....', '..XXX....', '...XXX...', '..XXX....', '.XXX.....', 'XXXXXXXXX', 'XXXXXXXXX'] },   // Σ
];

function frame2(drawFn) {
  const o = makeCanvas(28, 13), og = o.getContext('2d');
  for (let f = 0; f < 2; f++) {
    const c = makeCanvas(14, 13), g = c.getContext('2d');
    drawFn(g, f);
    outline(c);
    og.drawImage(c, f * 14, 0);
  }
  return o;
}

function glyphWalker(gl) {
  return frame2((g, f) => {
    const dy = f ? -1 : 0;
    const shade = '#00000040';
    drawPattern(g, gl.rows, { X: gl.color, E: '#ffffff', P: '#2a1620' }, 2, 2 + dy);
    // brillo y sombra para dar volumen
    R(g, '#ffffff55', 3, 2 + dy, 2, 1);
    R(g, shade, 2, 10 + dy, 9, 1);
    // patitas
    R(g, '#2a1620', f ? 4 : 3, 11, 2, 1); R(g, '#2a1620', f ? 8 : 9, 11, 2, 1);
  });
}

const WALKERS = {
  paloma: () => [frame2((g, f) => {
    R(g, '#cfd6e6', 3, 5, 8, 5); R(g, '#eef2fa', 4, 8, 6, 2);     // cuerpo y pecho
    R(g, '#cfd6e6', 9, 2, 4, 4); R(g, '#ff9a4a', 13, 4, 1, 1);    // cabeza y pico
    R(g, '#2a1620', 11, 3, 1, 1); R(g, '#ff9ac4', 10, 4, 1, 1);   // ojo y mejilla
    R(g, '#9aa6c0', 4, 5, 5, 3); R(g, '#8794b0', 1, 6, 3, 2);     // ala y cola
    R(g, '#6e7a96', 4, 7, 4, 1);
    R(g, '#ff9a4a', f ? 5 : 4, 10, 1, 2); R(g, '#ff9a4a', f ? 8 : 9, 10, 1, 2);
  })],
  ardilla: () => [frame2((g, f) => {
    R(g, '#e0a050', 0, 2, 5, 8); R(g, '#f0c070', 1, 3, 2, 3); R(g, '#c8803c', 3, 4, 2, 6);   // cola grande
    R(g, '#c8803c', 4, 6, 6, 4); R(g, '#f4d8a8', 6, 8, 3, 2);                                // cuerpo y barriga
    R(g, '#c8803c', 8, 3, 5, 5);                                                              // cabeza
    R(g, '#c8803c', 8, 2, 1, 1); R(g, '#c8803c', 11, 2, 1, 1);                                // orejas
    R(g, '#2a1620', 10, 5, 1, 1); R(g, '#2a1620', 13, 6, 1, 1); R(g, '#ff9ac4', 9, 6, 1, 1);  // ojo, nariz, mejilla
    R(g, '#8a5a2c', f ? 5 : 4, 10, 2, 2); R(g, '#8a5a2c', f ? 8 : 9, 10, 2, 2);
  })],
  nota: () => [frame2((g, f) => {
    const dy = f ? -1 : 0;
    R(g, '#ff70b8', 8, 1 + dy, 2, 9); R(g, '#ff70b8', 10, 1 + dy, 3, 2); R(g, '#ff70b8', 11, 3 + dy, 2, 2);   // plica y corchete
    R(g, '#ff70b8', 2, 7 + dy, 7, 4); R(g, '#ff70b8', 3, 6 + dy, 5, 1);                                       // cabeza
    R(g, '#ffffff', 3, 8 + dy, 2, 2); R(g, '#ffffff', 6, 8 + dy, 2, 2);                                       // ojos
    R(g, '#2a1620', 4, 9 + dy, 1, 1); R(g, '#2a1620', 7, 9 + dy, 1, 1);
    R(g, '#c23a8e', 2, 10 + dy, 7, 1);
    R(g, '#2a1620', f ? 3 : 2, 11, 2, 1); R(g, '#2a1620', f ? 7 : 8, 11, 2, 1);
  })],
  estrella: () => [frame2((g, f) => {
    const dy = f ? -1 : 0;
    drawPattern(g, ['.....X.....', '....XXX....', 'XXXXXXXXXXX', '.XXEXXXEXX.', '..XPXXXPX..', '..XXXXXXX..', '.XXX...XXX.', '.XX.....XX.'],
      { X: '#ffd84a', E: '#fff', P: '#2a1620' }, 1, 2 + dy);
    R(g, '#fff7c0', 6, 3 + dy, 2, 1); R(g, '#ff9ac4', 3, 7 + dy, 1, 1); R(g, '#ff9ac4', 10, 7 + dy, 1, 1);
    R(g, '#2a1620', f ? 3 : 2, 12, 2, 1); R(g, '#2a1620', f ? 9 : 10, 12, 2, 1);
  })],
};

/** Devuelve { walkers: [hojas de 28x13...], flyer: hoja de 28x12 } para un tema. */
export function makeEnemySprites(theme) {
  const kind = theme.enemy || 'math';
  const walkers = kind === 'math' ? GLYPHS.map(glyphWalker) : (WALKERS[kind] || WALKERS.paloma)();
  // mariposa voladora recoloreable por tema
  const wing = theme.flyerWing || '#ffb0d0', wingD = theme.flyerWingD || '#ff7aa5';
  const flyer = makeCanvas(28, 12), fg = flyer.getContext('2d');
  for (let f = 0; f < 2; f++) {
    const c = makeCanvas(14, 12), g = c.getContext('2d'), wy = f ? 2 : 0;
    R(g, wing, 1, 2 + wy, 5, 4); R(g, wing, 8, 2 + wy, 5, 4);
    R(g, wingD, 2, 3 + wy, 3, 2); R(g, wingD, 9, 3 + wy, 3, 2);
    R(g, '#8a5a8a', 6, 3, 2, 6); R(g, '#fff', 6, 4, 1, 1); R(g, '#fff', 7, 4, 1, 1);
    outline(c); fg.drawImage(c, f * 14, 0);
  }
  return { walkers, flyer };
}
