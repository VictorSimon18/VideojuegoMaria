// Biblioteca de trozos de nivel reutilizables (niveles 2-5).
// Cada chunk son 10 filas superiores + patrón de suelo (ver chunk() en tilemap.js).
// '?' = cartel con numeración automática: se numeran 1, 2, 3... de izquierda a derecha en cada nivel,
// y el texto de cada cartel se escribe en levels/story.js (signs 1, 2, 3...).
import { chunk, joinChunks } from '../src/engine/tilemap.js';

const G24 = '########################';

export const LIB = {
  // Inicio tranquilo (lleva la 'S' de salida y un cartel)
  START: chunk([
    '', '', '', '', '', '', '', '', '',
    '..S..?..o..T..o...h...w.',
  ], G24),

  // Huecos pequeños y ladrillo flotante con espinas de rosa
  PITS: chunk([
    '', '', '', '', '', '',
    '.......o',
    '',
    '.......X',
    '..h........^^...........',
  ], '#####.....#####..#######'),

  // Escalera de nubes con bichitos y un cartel
  CLOUDS: chunk([
    '', '', '',
    '.....................o',
    '...................====',
    '................o',
    '...............====',
    '',
    '............===',
    '..e.......?.....T..e....',
  ], G24),

  // Paseo con checkpoint, bichitos y un cartel
  CHECKWALK: chunk([
    '', '', '', '', '', '', '',
    '.............o',
    '............o',
    '..e.....c.....?...e...h.',
  ], G24),

  // Montículo de ladrillos con farola
  MOUND: chunk([
    '', '', '', '', '', '',
    '...........o',
    '..........XXX',
    '.........XXXXX',
    '...T....XXXXXXX........l',
  ], G24),

  // Paseo con varios bichitos
  WALK2: chunk([
    '', '', '', '', '', '', '', '', '',
    'T..e..h..e..o....e..T..w',
  ], G24),

  // Mariposas flotantes con un corazón debajo
  FLYERS: chunk([
    '', '', '', '', '',
    '......f.........f',
    '',
    '..........o',
    '',
    '..T.....h.....w...l.....',
  ], G24),

  // Puente de huecos pequeños con corazones sobre cada uno
  BRIDGE: chunk([
    '', '', '', '', '', '', '', '',
    '...o....o....o....o',
    '.T.....h.....w.....l',
  ], '###..###..###..###..####'),

  // Jardín de espinas de rosa con checkpoint
  THORNS: chunk([
    '', '', '', '', '', '', '',
    '........o......o',
    '',
    '..^^...^^^....^^...c..^^',
  ], G24),

  // Torre de nubes con un corazón escondido arriba
  TOWER: chunk([
    '....................o',
    '...................===',
    '',
    '..............===',
    '',
    '.........===',
    '',
    '....===',
    '',
    '.....................c.?',
  ], G24),

  // Recta final con la puerta (meta)
  FINALE: chunk([
    '', '', '', '', '', '', '', '', '',
    '..?.....l.....h...G...T.',
  ], G24),
};

/** ZONA DE MARÍA: hueco de `w` tiles que solo se cruza planeando (9-12 recomendado). */
export function glide(w = 9) {
  const gap = '.'.repeat(w);
  return chunk([
    '', '', '', '', '', '',
    '.'.repeat(6 + Math.floor(w / 2) - 1) + 'o.o',
    '.'.repeat(4 + w) + 'o',
    '',
    '...c.?',
  ], '######' + gap + '#########');
}

/** ZONA DE VÍCTOR: cajas en el techo; hay que subir por las nubes y romperlas desde abajo. */
export function boxGate() {
  return chunk([
    '', '', '',
    '........o...o',
    '......XXXXbbXXX',
    '.............XX',
    '.........===.XX',
    '.............XX',
    '......===....XX',
    '...?.........XX...c',
  ], G24);
}

/**
 * Construye las filas de un nivel a partir de una lista de chunks (nombres de LIB o chunks ya hechos)
 * y numera los carteles '?' de izquierda a derecha.
 */
export function buildLevel(parts) {
  const chunks = parts.map((p) => (typeof p === 'string' ? (p === 'GLIDE' ? glide(9) : p === 'GLIDE_LONG' ? glide(11) : p === 'BOXGATE' ? boxGate() : LIB[p]) : p));
  if (chunks.some((c) => !c)) throw new Error('Chunk desconocido en la lista del nivel');
  const rows = joinChunks(chunks);
  const marks = [];
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '?') marks.push({ x, y }); });
  marks.sort((a, b) => a.x - b.x);
  marks.forEach((m, i) => {
    const r = rows[m.y];
    rows[m.y] = r.slice(0, m.x) + String(i + 1) + r.slice(m.x + 1);
  });
  return rows;
}
