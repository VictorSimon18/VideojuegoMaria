// Trozos de nivel con OBSTÁCULOS PROPIOS de cada nivel (niveles 2-5).
//   Nivel 2 Zaragoza : viento (cierzo), barcas en el Ebro, arcos del puente de Piedra, palomas
//   Nivel 3 Parque   : setas-muelle, hojas que caen, rosas con espinas
//   Nivel 4 Madrid   : bloques al ritmo, ascensores, altavoces-muelle, notas musicales
//   Nivel 5 Final    : baja gravedad, estrellas que caen, estrellas-barca, muelles de estrella
// Cada trozo se dibuja con coordenadas (x = columna, y = fila 0-9 desde arriba; el suelo empieza en la fila 10).
// '?' = cartel con numeración automática (ver buildLevel en chunks.js).
import { chunk } from '../src/engine/tilemap.js';

const G24 = '########################';

/** Dibuja un trozo: `ground` es el patrón del suelo y `draw(a)` coloca cosas con a.set / a.fill / a.row / a.hearts. */
export function build(ground, draw) {
  const w = ground.length, g = Array.from({ length: 10 }, () => Array(w).fill('.'));
  const a = {
    w,
    set(x, y, c) { if (x >= 0 && x < w && y >= 0 && y < 10) g[y][x] = c; },
    fill(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) a.set(x, y, c); },
    row(y, str, x0 = 0) { [...str].forEach((c, i) => { if (c !== '.') a.set(x0 + i, y, c); }); },   // '.' no borra
    hearts(y, xs) { xs.forEach((x) => a.set(x, y, 'o')); },
  };
  draw(a);
  return chunk(g.map((r) => r.join('')), ground);
}

// ===================================================================== NIVEL 2 - ZARAGOZA
export const L2 = {
  // Barca sobre el Ebro (pozo de 8 tiles)
  RIVER: () => build('########........########', (a) => {
    a.set(1, 9, 'T'); a.set(3, 9, '?'); a.set(5, 9, 'c'); a.set(11, 9, 'm'); a.hearts(7, [10, 13]); a.set(20, 9, 'h'); a.set(22, 9, 'w');
  }),
  // Arcos del puente de Piedra: se puede ir por encima del tablero o por debajo de los arcos
  ARCH: () => build(G24, (a) => {
    a.set(2, 9, '?'); a.fill(8, 7, 17, 8, 'X'); a.row(9, '.....XX.XX...XX..X');   // el corazón que estaba aquí quedaba atrapado entre ladrillos: ahora va arriba
    a.set(8, 6, 'l'); a.hearts(6, [10, 12, 14]); a.set(16, 6, 'e');
  }),
  // Pozos de 5 tiles que el cierzo (viento a favor) ayuda a saltar
  SKIPS: () => build('######.....######.....##', (a) => {
    a.fill(4, 5, 22, 9, '>'); a.hearts(4, [8, 19]); a.set(3, 9, 'c'); a.set(2, 9, 'w'); a.set(13, 9, 'l');
  }),
  // Cierzo en contra: andar cuesta más; palomas volando
  HEAD: () => build(G24, (a) => {
    a.fill(0, 4, 23, 9, '<'); a.set(6, 6, 'f'); a.set(14, 6, 'f'); a.hearts(8, [10, 12]); a.set(20, 9, 'c'); a.set(3, 9, 'e'); a.set(17, 9, 'e');
  }),
  // Hueco enorme (12) con el cierzo a favor: solo María lo cruza planeando
  GLIDEWIND: () => build('######............######', (a) => {
    a.fill(5, 2, 19, 8, '>'); a.fill(6, 9, 18, 9, '>'); a.row(9, '...c.?');
    a.hearts(6, [10, 12]); a.hearts(7, [15]); a.set(1, 9, 'T'); a.set(21, 9, 'w');
  }),
  // Dos barcas sobre un pozo de 12 tiles
  RIVER2: () => build('######............######', (a) => {
    a.set(1, 9, 'T'); a.set(4, 9, 'c'); a.set(9, 9, 'm'); a.set(14, 9, 'm'); a.hearts(7, [11, 13]);
  }),
};

// ===================================================================== NIVEL 3 - PARQUE IMPERIAL DE PLAZA
export const L3 = {
  // Setas que te lanzan a nubes altas
  SPRINGS: () => build(G24, (a) => {
    a.set(2, 9, '?'); a.set(5, 9, 'u'); a.row(4, '........====');
    a.hearts(3, [9, 10]); a.row(6, '..............===='); a.hearts(5, [15]); a.row(8, '...................===');
    a.set(23, 9, 'w');
  }),
  // Hojas de otoño que caen al pisarlas, sobre un pozo de 11
  LEAVES: () => build('#######...........######', (a) => {
    a.set(1, 9, 'T'); a.set(3, 9, '?'); a.set(5, 9, 'c'); a.set(9, 9, 'k'); a.set(12, 9, 'k'); a.set(15, 9, 'k');
    a.hearts(7, [9, 12, 15]); a.set(22, 9, 'h');
  }),
  // Rosas con espinas anchas: hay que usar la seta para pasar
  BUNNY: () => build(G24, (a) => {
    a.set(1, 9, 'T'); a.set(5, 9, 'u'); a.fill(7, 9, 10, 9, '^'); a.hearts(6, [8, 10]); a.set(17, 9, 'e'); a.set(21, 9, 'c');
  }),
  // Dos setas para conseguir corazones altos
  SPRINGTOWER: () => build(G24, (a) => {
    a.set(2, 9, '?'); a.set(4, 9, 'u'); a.row(2, '......===='); a.hearts(1, [7, 8]);
    a.set(14, 9, 'u'); a.row(3, '................===='); a.hearts(2, [17, 18]); a.set(22, 9, 'T');
  }),
  // Hojas escalonadas sobre un pozo de 8
  LEAVES_UP: () => build('#######........#########', (a) => {
    a.set(1, 9, 'T'); a.set(9, 9, 'k'); a.set(11, 8, 'k'); a.set(13, 7, 'k'); a.hearts(6, [11]); a.hearts(5, [13]); a.set(20, 9, 'e');
  }),
};

// ===================================================================== NIVEL 4 - MADRID, WIZINK CENTRE
export const L4 = {
  // Altavoces que lanzan por los aires (pozo de 5)
  SPEAKERS: () => build('#######.....############', (a) => {
    a.set(1, 9, 'T'); a.set(2, 9, '?'); a.set(5, 9, 'u'); a.hearts(4, [9, 10]); a.set(19, 9, 'l'); a.set(20, 9, 'e');
  }),
  // Bloques rosas (r) y azules (R) que se alternan al ritmo (pozo de 10)
  RHYTHM: () => build('#######..........#######', (a) => {
    a.set(1, 9, 'T'); a.set(3, 9, '?'); a.set(5, 9, 'c'); a.set(8, 9, 'r'); a.set(10, 9, 'R'); a.set(12, 9, 'r'); a.set(14, 9, 'R');
    a.hearts(7, [9, 11, 13]); a.set(21, 9, 'h');
  }),
  // Ascensor hasta una tarima con un bichito
  ELEVATOR: () => build(G24, (a) => {
    a.set(1, 9, 'T'); a.set(6, 7, 'M'); a.fill(9, 4, 15, 4, 'X'); a.hearts(3, [10, 12]); a.set(14, 3, 'e'); a.set(20, 9, 'c');
  }),
  // Escalera de bloques al ritmo (pozo de 8)
  STAGE: () => build('#######........#########', (a) => {
    a.set(1, 9, 'T'); a.set(8, 9, 'r'); a.set(10, 8, 'R'); a.set(12, 7, 'r'); a.set(14, 6, 'R'); a.hearts(5, [12]); a.hearts(4, [14]); a.set(20, 9, 'l');
  }),
  // Dos ascensores hacia nubes altas
  ELEVATOWER: () => build(G24, (a) => {
    a.set(2, 9, '?'); a.set(5, 7, 'M'); a.row(3, '........==='); a.hearts(2, [9]);
    a.set(14, 6, 'M'); a.row(1, '................==='); a.hearts(0, [17]); a.set(22, 9, 'T');
  }),
};

// ===================================================================== NIVEL 5 - SORPRESA FINAL
export const L5 = {
  // Baja gravedad: nubes cada vez más altas
  LOWG: () => build(G24, (a) => {
    a.fill(0, 0, 23, 9, 'z'); a.set(2, 9, '?'); a.row(6, '....====');
    a.hearts(5, [5, 6]); a.row(3, '.........===='); a.hearts(2, [10, 11]); a.row(1, '..............===='); a.hearts(0, [15, 16]);
    a.row(5, '...................====');
  }),
  // Estrellas que caen sobre un pozo de 12, también con baja gravedad
  STARS: () => build('######............######', (a) => {
    a.fill(0, 0, 23, 9, 'z'); a.set(4, 9, 'c'); a.set(8, 9, 'k'); a.set(11, 8, 'k'); a.set(14, 8, 'k'); a.hearts(6, [8, 11, 14]);
  }),
  // Una estrella-ascensor y una estrella-barca
  MOVERS: () => build('######............######', (a) => {
    a.set(4, 9, 'c'); a.set(9, 8, 'M'); a.set(14, 7, 'm'); a.hearts(5, [9, 14]); a.set(1, 9, 'T');
  }),
  // Muelle de estrella para llegar a una estrella en mitad del pozo
  SPRINGS5: () => build('#######........#########', (a) => {
    a.set(1, 9, 'T'); a.set(5, 9, 'u'); a.set(11, 9, 'k'); a.hearts(7, [9, 13]); a.hearts(8, [11]);
  }),
  // Torre de estrellas que caen: hay que seguir subiendo
  FINALTOWER: () => build(G24, (a) => {
    a.set(2, 9, '?'); a.set(4, 9, 'k'); a.set(7, 7, 'k'); a.set(10, 5, 'k'); a.set(13, 3, 'k'); a.set(16, 1, 'k'); a.hearts(0, [16]); a.hearts(2, [13]);
  }),
  // Escalera de ladrillos con baja gravedad
  LOWG2: () => build(G24, (a) => {
    a.fill(0, 0, 23, 9, 'z'); a.set(2, 9, '?');
    a.fill(5, 7, 6, 9, 'X'); a.fill(9, 4, 10, 9, 'X'); a.fill(13, 1, 14, 9, 'X'); a.fill(17, 5, 18, 9, 'X');
    a.hearts(6, [5]); a.hearts(3, [9]); a.hearts(0, [13]); a.hearts(4, [17]);
  }),
};
