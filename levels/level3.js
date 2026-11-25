// Nivel 3 - Parque Imperial de Plaza. Se compone con trozos de levels/chunks.js (genéricos) y levels/chunks_themed.js (propios del nivel).
// Cambia el orden de la lista para rediseñarlo. Carteles (de izquierda a derecha): 1 inicio, 2 setas, 3 hojas, 4 paseo, 5 hueco (María), 6 cajas (Víctor), 7 meta
import { buildLevel } from './chunks.js';
import { L3 } from './chunks_themed.js';

/** Reparte 8 conejos escondidos (token 'n') antes del cartel 6: 6 en el suelo, bien separados, y 2 sobre nubes altas. */
function hideBunnies(rows) {
  rows = rows.map((r) => r.split(''));
  let col6 = -1; for (const r of rows) { const i = r.indexOf('6'); if (i >= 0) col6 = i; }
  const ground = rows.findIndex((r) => r[2] === '#' || r.slice(0, 40).includes('#')) ;   // primera fila de suelo
  const ty = ground - 1, cand = [];
  for (let x = 14; x < col6 - 6; x++) {
    if (x >= 30 && x <= 48) continue;   // esa zona ya tiene los 2 conejos de las nubes
    let ok = rows[ty][x] === '.' && rows[ground][x] === '#';
    for (let d = -2; d <= 2; d++) if (['^', 'u', 'c', 'e', 'o', 'k'].includes(rows[ty][x + d]) || rows[ground][x + d] !== '#') ok = false;
    if (ok) cand.push(x);
  }
  const picks = [0.04, 0.2, 0.36, 0.52, 0.7, 0.88].map((q) => cand[Math.floor(q * (cand.length - 1))]);
  for (const x of picks) rows[ty][x] = 'n';
  for (const [x, y] of [[35, 3], [44, 7]]) if (rows[y][x] === '.' && rows[y + 1][x] === '=') rows[y][x] = 'n';   // sobre las nubes altas
  return rows.map((r) => r.join(''));
}

export default {
  id: 3,
  rows: hideBunnies(buildLevel([
    'START', L3.SPRINGS, L3.LEAVES, L3.BUNNY, L3.SPRINGTOWER, 'WALK2', L3.LEAVES_UP, 'THORNS', 'GLIDE', 'BOXGATE3', 'FINALE',
  ])),
};
