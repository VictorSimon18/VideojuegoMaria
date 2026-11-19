// Temas visuales y musicales de cada nivel (paletas cálidas y románticas).
// Para cambiar el aspecto de un nivel basta con tocar los colores de aquí.
const base = {
  dirtL: '#a47058', grassL: '#c4e68a', brickL: '#e08a76', boxL: '#f0c27e',
  cloud: '#fff1ee', cloudD: '#f4c6d4', enemy: '#ff9ac4', enemyD: '#e0709f',
  window: '#ffd98a', stars: true,
};

export const THEMES = {
  // Nivel 1 - Instituto Félix de Azara: atardecer de otoño
  azara: {
    ...base, bgKind: 'school',
    floor: 'patio', cloudSkin: 'banco', decor: 'patio', goal: 'insti',   // suelo de pista, bancos, canastas y verja del instituto
    sky: ['#3d2b63', '#c4577a', '#ffb374'], sun: '#ffe1a8',
    far: '#8c5a86', mid: '#6f4676', near: '#3a2a4c', cloudBg: '#ffc9b8',
    grass: '#3f84e0', grassD: '#2a5fb4', grassL: '#7ab6f6', dirt: '#7c8296', dirtD: '#5d637a', dirtL: '#a2a8ba',
    brick: '#eaa270', brickD: '#b87a50', brickL: '#f6c294', box: '#d9a05c', boxD: '#8a5a30',
    leaf: ['#f08a4b', '#ffb26b', '#c4573d'], petal: '#ffd0dc', bush: '#6a9a4a', bushL: '#8cc15a',
    enemy: 'math',
    music: { bpm: 96, root: 60, seed: 11, mode: 'major' },
  },
  // Nivel 2 - Zaragoza: Pilar, puente de Piedra y el Ebro (se completa en la fase 3)
  zaragoza: {
    ...base, bgKind: 'pilar',
    floor: 'plaza', cloudSkin: 'jardinera', decor: 'plaza', floorLine: '#b5573d',   // adoquín de la plaza, jardineras y arbolitos
    sky: ['#2f3a7a', '#e0707f', '#ffc78a'], sun: '#fff0c0',
    far: '#8a5f8c', mid: '#6a4a7c', near: '#47345c', cloudBg: '#ffd5c5',
    grass: '#efd2a8', grassD: '#c9a478', grassL: '#fbe8c8', dirt: '#d6b588', dirtD: '#b08f64', dirtL: '#ecd2a8',
    brick: '#c9774f', brickD: '#a05a3a', brickL: '#e09a70', box: '#d9a05c', boxD: '#8a5a30',
    leaf: ['#ffb36a', '#ffd08a', '#d9784a'], petal: '#ffd6e0', bush: '#78a050', bushL: '#9cc468',
    enemy: 'paloma', flyerWing: '#dfe6f4', flyerWingD: '#aab6d0',
    gadgets: { mover: 'barca' },
    music: { bpm: 104, root: 62, seed: 22, mode: 'major' },
  },
  // Nivel 3 - Parque Imperial de Plaza: paseo de cita al anochecer
  parque: {
    ...base, bgKind: 'park',
    floor: 'plaza', cloudSkin: 'banco', decor: 'parque', floorLine: '#7c7a84',   // camino de gravilla con bordillo, bancos y arbolitos
    sky: ['#241a4a', '#8a4a8a', '#ff9a8a'], sun: '#ffd0c0',
    far: '#6e4a86', mid: '#563c70', near: '#3e2a58', cloudBg: '#e9b4d0',
    grass: '#d9c39a', grassD: '#b59d74', grassL: '#ecdcb8', dirt: '#a98b68', dirtD: '#876c4e', dirtL: '#c4a884',
    brick: '#8e8e9a', brickD: '#6a6a78', brickL: '#b0b0bc', box: '#d9a05c', boxD: '#8a5a30',
    leaf: ['#ff9ac4', '#ffc4de', '#d86a9e'], petal: '#ffe0ec', bush: '#58924e', bushL: '#7cb868',
    enemy: 'coche',
    gadgets: { spring: 'seta', crumble: 'hoja' },
    music: { bpm: 88, root: 57, seed: 33, mode: 'minor' },
  },
  // Nivel 4 - Madrid, WiZink Centre: noche de concierto
  wizink: {
    ...base, bgKind: 'city',
    sky: ['#140f2e', '#4a2a7a', '#d0587a'], sun: '#ffd0e8',
    far: '#4a3478', mid: '#382860', near: '#281c4a', cloudBg: '#9a70c8',
    grass: '#6a8ad8', grassD: '#4a62b0', dirt: '#4a3a78', dirtD: '#382c60',
    brick: '#c8508a', brickD: '#963a68', box: '#e0a05c', boxD: '#8a5a30',
    leaf: ['#ff70b0', '#ffa0d0', '#c84a8a'], petal: '#ffd6f0', bush: '#4a62b0', bushL: '#6a8ad8',
    enemy: 'nota', flyerWing: '#c8a0ff', flyerWingD: '#9a6ae0',
    gadgets: { spring: 'altavoz', mover: 'tarima' },
    music: { bpm: 120, root: 64, seed: 44, mode: 'major' },
  },
  // Nivel 5 - sorpresa final: cielo estrellado
  final: {
    ...base, bgKind: 'stars',
    sky: ['#120c2c', '#5a2a7a', '#ff8aa8'], sun: '#fff0d0',
    far: '#5a3a86', mid: '#442c6e', near: '#32205a', cloudBg: '#d0a0e0',
    grass: '#ffb0c8', grassD: '#e0809e', dirt: '#6a4a86', dirtD: '#523a6e',
    brick: '#e0708e', brickD: '#b04e6e', box: '#e8a85c', boxD: '#8a5a30',
    leaf: ['#ffd0e0', '#fff0f4', '#e890b0'], petal: '#ffffff', bush: '#e0809e', bushL: '#ffa8c4',
    enemy: 'estrella', flyerWing: '#ffe27a', flyerWingD: '#ffb84a',
    gadgets: { spring: 'estrella', crumble: 'estrella', mover: 'estrella' },
    music: { bpm: 84, root: 60, seed: 55, mode: 'major' },
  },
};
