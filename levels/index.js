// Registro de niveles: se cargan bajo demanda. Añade aquí cada nivel nuevo.
export const LEVELS = {
  1: () => import('./level1.js'),
  2: () => import('./level2.js'),
  3: () => import('./level3.js'),
  4: () => import('./level4.js'),
  5: () => import('./level5.js'),
};
export const LEVEL_COUNT = 5;
