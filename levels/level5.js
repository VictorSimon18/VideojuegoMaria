// Nivel 5 - Sorpresa final. Se compone con trozos de levels/chunks.js (genéricos) y levels/chunks_themed.js (propios del nivel).
// Cambia el orden de la lista para rediseñarlo. Carteles (de izquierda a derecha): 1 inicio, 2 gravedad, 3 estrellas, 4 escalera, 5 hueco (María), 6 cajas (Víctor), 7 meta
import { buildLevel } from './chunks.js';
import { L5 } from './chunks_themed.js';

export default {
  id: 5,
  rows: buildLevel([
    'START', L5.LOWG, L5.STARS, L5.MOVERS, L5.SPRINGS5, L5.FINALTOWER, 'WALK2', L5.LOWG2, 'GLIDE_LONG', 'BOXGATE3', 'FINALE',
  ]),
};
