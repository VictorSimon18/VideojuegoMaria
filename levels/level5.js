// Nivel 5 - Sorpresa final. Se compone con trozos de levels/chunks.js (cambia el orden para rediseñarlo).
// Carteles (de izquierda a derecha): 1 inicio, 2 nubes, 3 cajas (Víctor), 4 hueco (María), 5 paseo, 6 torre, 7 meta
import { buildLevel } from './chunks.js';

export default {
  id: 5,
  rows: buildLevel([
    'START', 'CLOUDS', 'THORNS', 'BOXGATE', 'FLYERS', 'GLIDE_LONG', 'BRIDGE', 'CHECKWALK', 'MOUND',
    'PITS', 'TOWER', 'FINALE',
  ]),
};
