// Nivel 2 - Zaragoza. Se compone con trozos de levels/chunks.js (cambia el orden para rediseñarlo).
// Carteles (de izquierda a derecha): 1 inicio, 2 nubes, 3 paseo, 4 hueco (María), 5 cajas (Víctor), 6 torre, 7 meta
import { buildLevel } from './chunks.js';

export default {
  id: 2,
  rows: buildLevel([
    'START', 'PITS', 'FLYERS', 'CLOUDS', 'CHECKWALK', 'BRIDGE', 'GLIDE', 'WALK2', 'MOUND',
    'BOXGATE', 'THORNS', 'TOWER', 'FINALE',
  ]),
};
