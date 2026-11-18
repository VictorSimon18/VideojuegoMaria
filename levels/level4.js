// Nivel 4 - Madrid, WiZink Centre. Se compone con trozos de levels/chunks.js (cambia el orden para rediseñarlo).
// Carteles (de izquierda a derecha): 1 inicio, 2 hueco (María), 3 paseo, 4 cajas (Víctor), 5 nubes, 6 torre, 7 meta
import { buildLevel } from './chunks.js';

export default {
  id: 4,
  rows: buildLevel([
    'START', 'FLYERS', 'PITS', 'GLIDE_LONG', 'THORNS', 'CHECKWALK', 'MOUND', 'BOXGATE', 'BRIDGE',
    'CLOUDS', 'WALK2', 'TOWER', 'FINALE',
  ]),
};
