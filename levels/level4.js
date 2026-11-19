// Nivel 4 - Madrid, WiZink Centre. Se compone con trozos de levels/chunks.js (genéricos) y levels/chunks_themed.js (propios del nivel).
// Cambia el orden de la lista para rediseñarlo. Carteles (de izquierda a derecha): 1 inicio, 2 altavoces, 3 ritmo, 4 ascensores, 5 hueco (María), 6 cajas (Víctor), 7 meta
import { buildLevel } from './chunks.js';
import { L4 } from './chunks_themed.js';

export default {
  id: 4,
  rows: buildLevel([
    'START', L4.SPEAKERS, L4.RHYTHM, L4.ELEVATOR, 'FLYERS', L4.STAGE, L4.ELEVATOWER, 'GLIDE_LONG', 'WALK2', 'BOXGATE', 'FINALE',
  ]),
};
