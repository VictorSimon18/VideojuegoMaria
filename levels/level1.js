// Nivel 1 - Instituto Félix de Azara. Definido con "chunks" ASCII fáciles de editar.
// Cada chunk son las filas 0-9 (arriba) y un patrón de suelo para las 2 filas inferiores.
// Las filas cortas se rellenan solas con '.' hasta el ancho del suelo.
// Leyenda completa en src/engine/tilemap.js y en el README.
import { chunk, joinChunks } from '../src/engine/tilemap.js';

const chunks = [
  // 1 - inicio tranquilo
  chunk([
    '', '', '', '', '', '', '', '', '',
    '..S..1..o..T..o...h...w.',
  ], '########################'),

  // 2 - primer hueco con checkpoint
  chunk([
    '', '', '', '', '', '', '',
    '.........o',
    '',
    '.....c..........h...w...',
  ], '########...#############'),

  // 3 - escalera de nubes con bichitos
  chunk([
    '', '', '',
    '.....................o',
    '...................====',
    '................o',
    '...............====',
    '',
    '............===',
    '..e.......2.....T..e....',
  ], '########################'),

  // 4 - huecos, ladrillo flotante y espinas de rosa
  chunk([
    '', '', '', '', '', '',
    '.......o',
    '',
    '.......X',
    '..h........^^...........',
  ], '#####.....#####..#######'),

  // 5 - checkpoint y paseo
  chunk([
    '', '', '', '', '', '', '',
    '.............o',
    '............o',
    '..e.....c.....3...e...h.',
  ], '########################'),

  // 6 - montículo de ladrillos
  chunk([
    '', '', '', '', '', '',
    '...........o',
    '..........XXX',
    '.........XXXXX',
    '...T....XXXXXXX........l',
  ], '########################'),

  // 7 - gran hueco para planear
  chunk([
    '', '', '', '', '', '',
    '.........o.o',
    '.............o',
    '',
    '...c.4',
  ], '######.........#########'),

  // 8 - paseo del patio
  chunk([
    '', '', '', '', '', '', '', '', '',
    'T..e..h..e..o....e..T..w',
  ], '########################'),

  // 9 - torre de nubes (corazón escondido)
  chunk([
    '....................o',
    '...................===',
    '',
    '..............===',
    '',
    '.........===',
    '',
    '....===',
    '',
    '.....................c.5',
  ], '########################'),

  // 10 - recta final con la puerta
  chunk([
    '', '', '', '', '', '', '', '', '',
    '..6.....l.....h...G...T.',
  ], '########################'),
];

export default {
  id: 1,
  rows: joinChunks(chunks),
};
