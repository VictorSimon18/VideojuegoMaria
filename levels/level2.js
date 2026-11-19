// Nivel 2 - Zaragoza. Se compone con trozos de levels/chunks.js (genéricos) y levels/chunks_themed.js (propios del nivel).
// Cambia el orden de la lista para rediseñarlo. Carteles (de izquierda a derecha): 1 inicio, 2 Ebro, 3 Pilar, 4 hueco (María), 5 cajas (Víctor), 6 puente, 7 meta
import { buildLevel } from './chunks.js';
import { L2 } from './chunks_themed.js';

export default {
  id: 2,
  rows: buildLevel([
    'START', L2.RIVER, L2.ARCH, 'WALK2', L2.SKIPS, L2.HEAD, L2.GLIDEWIND, L2.RIVER2, 'WALK2', 'BOXGATE', 'TOWER', 'FINALE',
  ]),
};
