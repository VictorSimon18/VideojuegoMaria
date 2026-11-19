// Nivel 3 - Parque Imperial de Plaza. Se compone con trozos de levels/chunks.js (genéricos) y levels/chunks_themed.js (propios del nivel).
// Cambia el orden de la lista para rediseñarlo. Carteles (de izquierda a derecha): 1 inicio, 2 setas, 3 hojas, 4 paseo, 5 hueco (María), 6 cajas (Víctor), 7 meta
import { buildLevel } from './chunks.js';
import { L3 } from './chunks_themed.js';

export default {
  id: 3,
  rows: buildLevel([
    'START', L3.SPRINGS, L3.LEAVES, L3.BUNNY, L3.SPRINGTOWER, 'WALK2', L3.LEAVES_UP, 'THORNS', 'GLIDE', 'BOXGATE3', 'FINALE',
  ]),
};
