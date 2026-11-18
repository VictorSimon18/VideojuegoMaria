// Nivel 3 - Parque Imperial de Plaza. Se compone con trozos de levels/chunks.js (cambia el orden para rediseñarlo).
// Carteles (de izquierda a derecha): 1 inicio, 2 paseo, 3 cajas (Víctor), 4 nubes, 5 hueco (María), 6 torre, 7 meta
import { buildLevel } from './chunks.js';

export default {
  id: 3,
  rows: buildLevel([
    'START', 'BRIDGE', 'CHECKWALK', 'FLYERS', 'BOXGATE', 'WALK2', 'CLOUDS', 'PITS', 'GLIDE',
    'MOUND', 'TOWER', 'FINALE',
  ]),
};
