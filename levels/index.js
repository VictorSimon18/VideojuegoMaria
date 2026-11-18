// Registro de niveles: se cargan bajo demanda. Añade aquí cada nivel nuevo.
export const LEVELS = {
  1: () => import('./level1.js'),
};
export const LEVEL_COUNT = 5;
