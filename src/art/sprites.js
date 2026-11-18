// Sprites generados por código. Los personajes se pueden sustituir por PNG propios:
// basta con dejar assets/sprites/maria.png y assets/sprites/victor.png con el formato de
// hoja descrito en CHAR_SHEET (fotogramas de 16x20, 4 columnas x 5 filas).
import { makeCanvas, rect as R, outline, drawPattern, heartSprite, pixelEllipse } from './pixel.js';

export const CHAR_SHEET = {
  fw: 16, fh: 20, cols: 4,
  anims: {
    idle:  { row: 0, n: 2, fps: 2.5 },
    run:   { row: 1, n: 4, fps: 11 },
    jump:  { row: 2, n: 1, fps: 1 },
    fall:  { row: 3, n: 1, fps: 1 },
    glide: { row: 4, n: 1, fps: 1 },
  },
};

// ---------- Paletas ----------
const PAL = {
  maria: {
    skin: '#f4c7a3', hair: '#3a2218', hairL: '#5c3a2a', top: '#5a3426', topD: '#442619',
    pants: '#4f78b0', pantsL: '#7197cc', shoe: '#3a2a30', gold: '#f6dc8a', eye: '#2a1a14', blush: '#ee9a8c', mouth: '#c9606a',
  },
  victor: {
    skin: '#e9bd98', hair: '#2a1b15', hairL: '#46302a', top: '#bcc0c8', topD: '#969ba5', zip: '#6b7078',
    pants: '#2c2c36', pantsL: '#404050', shoe: '#17171c', gold: '#e2bb5c', eye: '#231712', stub: '#a47c64',
  },
};

// ---------- Poses (cuerpo en coordenadas de un fotograma 16x20) ----------
// legs: [x, y, h]; arms: dy izquierda/derecha; up: brazos en alto; out: planeo (brazos abiertos)
const POSES = {
  idle: [
    { bob: 0, legs: [[4, 16, 3], [9, 16, 3]], al: 0, ar: 0 },
    { bob: 1, legs: [[4, 16, 3], [9, 16, 3]], al: 1, ar: 1 },
  ],
  run: [
    { bob: 0,  legs: [[3, 16, 3], [10, 16, 3]], al: -1, ar: 1 },
    { bob: -1, legs: [[5, 17, 2], [8, 16, 3]], al: 0, ar: 0 },
    { bob: 0,  legs: [[10, 16, 3], [3, 16, 3]], al: 1, ar: -1 },
    { bob: -1, legs: [[8, 16, 3], [5, 17, 2]], al: 0, ar: 0 },
  ],
  jump: [{ bob: 0, legs: [[4, 16, 2], [9, 15, 2]], up: true }],
  fall: [{ bob: 0, legs: [[4, 16, 3], [9, 16, 3]], up: 'half' }],
  glide: [{ bob: 0, legs: [[5, 16, 3], [8, 16, 3]], out: true }],
};

/** Dibuja un fotograma de personaje mirando a la derecha. */
function drawChar(g, who, pose) {
  const P = PAL[who], maria = who === 'maria';
  const b = pose.bob || 0;
  // pelo largo por detrás (María)
  if (maria) R(g, P.hair, 3, 3 + b, 10, pose.out ? 7 : 11);
  // piernas
  for (const [x, y, h] of pose.legs) {
    R(g, P.pants, x, y, 3, h);
    R(g, P.shoe, x, y + h - 1, 3, 1);
    if (maria) R(g, P.pantsL, x + 1, y, 1, Math.max(1, h - 1));
  }
  // torso
  if (maria) {
    R(g, P.top, 4, 10 + b, 8, 4);
    R(g, P.topD, 4, 13 + b, 8, 1);
    R(g, P.skin, 4, 10 + b, 3, 1);            // hombro descubierto
    R(g, P.skin, 5, 14 + b, 6, 1);            // ombligo/cintura
    R(g, P.pants, 4, 15, 8, 1);
    R(g, P.gold, 8, 15, 1, 1);                // botón
  } else {
    R(g, P.top, 3, 10 + b, 10, 6);
    R(g, P.topD, 3, 15 + b, 10, 1);
    R(g, P.topD, 5, 10 + b, 6, 1);            // capucha
    R(g, P.zip, 8, 12 + b, 1, 4);             // cremallera
    R(g, P.gold, 7, 11 + b, 3, 1);            // cadena
    R(g, P.gold, 8, 12 + b, 1, 1);
  }
  // brazos
  const ax = maria ? [2, 12] : [1, 13];
  const sleeve = P.top;
  if (pose.out) {
    R(g, sleeve, 1, 10 + b, 4, 2); R(g, P.skin, 1, 10 + b, 1, 2);
    R(g, sleeve, 11, 10 + b, 4, 2); R(g, P.skin, 14, 10 + b, 1, 2);
  } else {
    const up = pose.up === true ? -3 : (pose.up === 'half' ? -1 : 0);
    const dl = (pose.al || 0), dr = (pose.ar || 0);
    for (const [i, d] of [[0, dl], [1, dr]]) {
      const x = ax[i], y = 11 + b + d + up;
      R(g, sleeve, x, y, 2, 4);
      R(g, P.skin, x, y + 4 * (up < 0 ? 0 : 1) - (up < 0 ? 1 : 0), 2, 1);
    }
  }
  // cabeza
  R(g, P.skin, 5, 5 + b, 6, 5);
  R(g, P.hair, 4, 2 + b, 8, 3);
  if (maria) {
    R(g, P.hair, 4, 4 + b, 1, 6); R(g, P.hair, 11, 4 + b, 1, 6);
    R(g, P.hair, 5, 5 + b, 2, 1); R(g, P.hair, 9, 5 + b, 2, 1);
    R(g, P.hairL, 6, 2 + b, 2, 1);
    R(g, P.gold, 4, 9 + b, 1, 1);             // pendiente
    R(g, P.blush, 5, 8 + b, 1, 1); R(g, P.blush, 10, 8 + b, 1, 1);
    R(g, P.mouth, 7, 9 + b, 2, 1);
  } else {
    R(g, P.hair, 4, 4 + b, 1, 2); R(g, P.hair, 11, 4 + b, 1, 2);
    R(g, P.hair, 5, 5 + b, 5, 1);             // flequillo
    R(g, P.hair, 6, 1 + b, 3, 1); R(g, P.hair, 9, 2 + b, 3, 1); // remolino
    R(g, P.hairL, 7, 2 + b, 2, 1);
    R(g, P.stub, 5, 9 + b, 6, 1); R(g, P.stub, 5, 8 + b, 1, 1); R(g, P.stub, 10, 8 + b, 1, 1);
  }
  R(g, P.eye, 6, 7 + b, 1, 1); R(g, P.eye, 9, 7 + b, 1, 1);
}

/** Hoja completa generada por código (64x100). */
export function generateCharSheet(who) {
  const { fw, fh, cols, anims } = CHAR_SHEET;
  const c = makeCanvas(fw * cols, fh * 5);
  const g = c.getContext('2d');
  for (const [name, a] of Object.entries(anims)) {
    for (let i = 0; i < a.n; i++) {
      const f = makeCanvas(fw, fh);
      drawChar(f.getContext('2d'), who, POSES[name][i]);
      outline(f);
      g.drawImage(f, i * fw, a.row * fh);
    }
  }
  return c;
}

/** Carga assets/sprites/<who>.png; si no existe o no encaja, usa la hoja generada. */
export function loadCharSheet(who) {
  return new Promise((resolve) => {
    const img = new Image();
    const { fw, fh, cols } = CHAR_SHEET;
    img.onload = () => resolve(img.width === fw * cols && img.height === fh * 5 ? img : generateCharSheet(who));
    img.onerror = () => resolve(generateCharSheet(who));
    img.src = `assets/sprites/${who}.png`;
  });
}

// ---------- Objetos del mundo (generados) ----------
export function makeItemSprites(theme) {
  const out = {};
  out.heart = heartSprite('#ff5d8f', '#ffc2d6');
  out.heartBig = (() => { const c = makeCanvas(13, 12); const g = c.getContext('2d'); R(g, '#000', 0, 0, 0, 0);
    drawPattern(g, ['.XX...XX.', 'XLLXXXXXX', 'XLXXXXXXX', 'XXXXXXXXX', '.XXXXXXX.', '..XXXXX..', '...XXX...', '....X....'], { X: '#ff5d8f', L: '#ffc2d6' }, 2, 2);
    return outline(c); })();

  // Cartel
  out.sign = (() => {
    const c = makeCanvas(16, 18); const g = c.getContext('2d');
    R(g, '#8a5e44', 7, 9, 2, 9);
    R(g, '#8a5e44', 1, 1, 14, 10); R(g, '#e6b878', 2, 2, 12, 8);
    R(g, '#b3814f', 4, 4, 8, 1); R(g, '#b3814f', 4, 6, 6, 1); R(g, '#ff6f9c', 10, 6, 2, 2);
    return outline(c);
  })();

  // Checkpoint: 0 apagado, 1-2 encendido (ondeando)
  out.checkpoint = (() => {
    const c = makeCanvas(16 * 3, 26); const g = c.getContext('2d');
    for (let f = 0; f < 3; f++) {
      const ox = f * 16;
      R(g, '#8a6a52', ox + 3, 2, 2, 22); R(g, '#6e5240', ox + 1, 23, 6, 3);
      R(g, '#ffe6a8', ox + 3, 1, 2, 2);
      const col = f === 0 ? '#b8a9b9' : '#ff7aa5', hi = f === 0 ? '#d4c8d5' : '#ffb3cd';
      for (let j = 0; j < 8; j++) {
        const w = Math.round(9 - Math.abs(j - 3.5) * 2.2) - (f === 2 ? (j % 2) : 0);
        const w2 = Math.max(1, w);
        R(g, j < 3 ? hi : col, ox + 5, 3 + j, w2, 1);
      }
      if (f > 0) { R(g, '#fff', ox + 7, 5, 1, 1); R(g, '#fff', ox + 9, 5, 1, 1); R(g, '#fff', ox + 7, 6, 3, 1); R(g, '#fff', ox + 8, 7, 1, 1); }
    }
    const o = makeCanvas(48, 26); const og = o.getContext('2d');
    for (let f = 0; f < 3; f++) { const t = makeCanvas(16, 26); t.getContext('2d').drawImage(c, f * 16, 0, 16, 26, 0, 0, 16, 26); outline(t); og.drawImage(t, f * 16, 0); }
    return o;
  })();

  // Meta: puerta cálida con corazón (2 fotogramas de brillo)
  out.goal = (() => {
    const o = makeCanvas(26 * 2, 36); const og = o.getContext('2d');
    for (let f = 0; f < 2; f++) {
      const c = makeCanvas(26, 36); const g = c.getContext('2d');
      pixelEllipse(g, '#8a5a46', 13, 14, 11, 10);
      R(g, '#8a5a46', 2, 14, 22, 22);
      pixelEllipse(g, f ? '#ffe9b0' : '#ffd98a', 13, 15, 8, 8);
      R(g, f ? '#ffe9b0' : '#ffd98a', 5, 15, 16, 21);
      R(g, '#ffb36a', 5, 30, 16, 6);
      R(g, '#ffefc9', 9, 18, 3, 6);
      drawPattern(g, ['.X.X.', 'XXXXX', '.XXX.', '..X..'], { X: '#ff6f9c' }, 11, 5 + f);
      outline(c); og.drawImage(c, f * 26, 0);
    }
    return o;
  })();

  // Bichito paseante (2 fotogramas)
  out.blob = (() => {
    const o = makeCanvas(14 * 2, 13); const og = o.getContext('2d');
    const body = theme?.enemy || '#ff9ac4', shade = theme?.enemyD || '#e0709f';
    for (let f = 0; f < 2; f++) {
      const c = makeCanvas(14, 13); const g = c.getContext('2d');
      R(g, body, 4, 3, 6, 1); R(g, body, 3, 4, 8, 1); R(g, body, 2, 5, 10, 5);
      R(g, shade, 2, 9, 10, 1);
      R(g, '#fff', 4, 6, 2, 2); R(g, '#fff', 8, 6, 2, 2);
      R(g, '#2a1620', 5, 7, 1, 1); R(g, '#2a1620', 9, 7, 1, 1);
      R(g, '#ff6f9c', 3, 9, 1, 1); R(g, '#ff6f9c', 11, 9, 1, 1);
      R(g, '#7bc96f', 6, 1, 1, 2); R(g, '#7bc96f', 7, 0, 2, 1); R(g, '#9ee08e', 8, 1, 1, 1);
      if (f === 0) { R(g, shade, 3, 10, 3, 2); R(g, shade, 8, 10, 3, 2); }
      else { R(g, shade, 4, 10, 2, 2); R(g, shade, 8, 10, 2, 2); }
      outline(c); og.drawImage(c, f * 14, 0);
    }
    return o;
  })();

  // Bichito volador (mariposa corazón) 2 fotogramas
  out.flyer = (() => {
    const o = makeCanvas(14 * 2, 12); const og = o.getContext('2d');
    for (let f = 0; f < 2; f++) {
      const c = makeCanvas(14, 12); const g = c.getContext('2d');
      const wy = f ? 2 : 0;
      R(g, '#ffb0d0', 1, 2 + wy, 5, 4); R(g, '#ffb0d0', 8, 2 + wy, 5, 4);
      R(g, '#ff7aa5', 2, 3 + wy, 3, 2); R(g, '#ff7aa5', 9, 3 + wy, 3, 2);
      R(g, '#8a5a8a', 6, 3, 2, 6);
      R(g, '#fff', 6, 4, 1, 1); R(g, '#fff', 7, 4, 1, 1);
      outline(c); og.drawImage(c, f * 14, 0);
    }
    return o;
  })();

  return out;
}
