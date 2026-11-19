// Sprites generados por código. Los personajes se pueden sustituir por PNG propios:
// basta con dejar assets/sprites/maria.png y assets/sprites/victor.png con el formato de
// hoja descrito en CHAR_SHEET (fotogramas de 20x26, 4 columnas x 5 filas).
import { makeCanvas, rect as R, outline, drawPattern, heartSprite, pixelEllipse } from './pixel.js';

export const CHAR_SHEET = {
  fw: 20, fh: 26, cols: 4,
  anims: {
    idle:  { row: 0, n: 2, fps: 2.5 },
    run:   { row: 1, n: 4, fps: 11 },
    jump:  { row: 2, n: 1, fps: 1 },
    fall:  { row: 3, n: 1, fps: 1 },
    glide: { row: 4, n: 1, fps: 1 },
  },
};

// ---------- Paletas (tomadas de las fotos de referencia) ----------
const PAL = {
  maria: {
    skin: '#f3c6a2', skinD: '#dca07f', hair: '#33201a', hairL: '#5c3a2c', top: '#4d2c20', topD: '#3a2017', topL: '#6a4030',
    pants: '#4d77b0', pantsD: '#3b5f93', pantsL: '#7298cc', shoe: '#f0ece6', sole: '#b9b3a8', gold: '#f6dc8a',
    eye: '#2a1812', blush: '#f0a090', mouth: '#c9606a', brow: '#2a1812',
  },
  victor: {
    skin: '#e8bc98', skinD: '#cf9e7c', hair: '#2a1b15', hairL: '#4a342b', top: '#bcc0c8', topD: '#969ba5', topL: '#d6d9df', zip: '#6b7078',
    pants: '#2b2b35', pantsD: '#1d1d26', pantsL: '#404050', shoe: '#18181d', sole: '#e8e8ee', gold: '#e2bb5c',
    eye: '#1c110c', stub: '#8a6650', stubL: '#a98169', stubD: '#4a3328', brow: '#1c110c',
  },
};

// ---------- Poses (en coordenadas del fotograma 20x26) ----------
// legs: [x, y, h] (zapatilla en y+h..y+h+1); al/ar: desplazamiento de brazos; up: brazos en alto; out: planeo
const POSES = {
  idle: [
    { bob: 0, legs: [[5, 21, 2], [11, 21, 2]], al: 0, ar: 0 },
    { bob: 1, legs: [[5, 21, 2], [11, 21, 2]], al: 1, ar: 1 },
  ],
  run: [
    { bob: 0,  legs: [[3, 21, 2], [12, 21, 2]], al: -1, ar: 1 },
    { bob: -1, legs: [[6, 21, 1], [10, 21, 2]], al: 0, ar: 0 },
    { bob: 0,  legs: [[12, 21, 2], [3, 21, 2]], al: 1, ar: -1 },
    { bob: -1, legs: [[10, 21, 2], [6, 21, 1]], al: 0, ar: 0 },
  ],
  jump: [{ bob: 0, legs: [[5, 21, 1], [11, 20, 1]], up: true }],
  fall: [{ bob: 0, legs: [[5, 21, 2], [11, 21, 2]], up: 'half' }],
  glide: [{ bob: 0, legs: [[6, 21, 2], [10, 21, 2]], out: true }],
};

/** Dibuja un fotograma de personaje mirando a la derecha (vista casi frontal). */
function drawChar(g, who, pose) {
  const P = PAL[who], maria = who === 'maria';
  const b = pose.bob || 0;

  // --- pelo largo por detrás (María) ---
  if (maria) R(g, P.hair, 3, 5 + b, 14, pose.out ? 11 : 14);

  // --- piernas y zapatillas ---
  for (const [x, y, h] of pose.legs) {
    R(g, P.pants, x, y, 4, h);
    R(g, P.pantsL, x + 1, y, 1, h);
    if (!maria) { R(g, P.pantsD, x, y, 1, h); R(g, P.pantsL, x + 3, y, 1, 1); }   // bolsillo cargo
    R(g, P.shoe, x, y + h, 4, 1);
    R(g, P.sole, x, y + h + 1, 4, 1);
    if (maria) R(g, '#ffffff', x + 1, y + h, 1, 1);
  }

  // --- torso ---
  if (maria) {
    R(g, P.top, 5, 15 + b, 10, 5);                    // top marrón de manga larga
    R(g, P.topL, 9, 16 + b, 4, 1); R(g, P.topD, 5, 19 + b, 10, 1);
    R(g, P.skin, 5, 15 + b, 4, 2);                    // hombro descubierto (cuello caído)
    R(g, P.skin, 7, 15 + b, 6, 1);                    // clavícula
    R(g, P.skinD, 6, 17 + b, 2, 1);
    R(g, P.skin, 6, 20 + b, 8, 1);                    // cintura
    R(g, P.pants, 5, 21, 10, 1);                      // vaqueros
    R(g, P.pantsL, 7, 21, 1, 1); R(g, P.pantsL, 12, 21, 1, 1);
    R(g, P.gold, 10, 21, 1, 1);                       // botón
  } else {
    R(g, P.top, 3, 14 + b, 14, 7);                    // sudadera oversize
    R(g, P.topL, 4, 16 + b, 3, 2); R(g, P.topD, 15, 15 + b, 2, 5);
    R(g, P.topD, 5, 14 + b, 10, 2);                   // capucha alrededor del cuello
    R(g, P.zip, 9, 16 + b, 1, 5); R(g, P.gold, 9, 17 + b, 1, 1);   // cremallera con tirador
    R(g, '#f2f2f2', 7, 16 + b, 1, 4); R(g, '#f2f2f2', 12, 16 + b, 1, 4);   // cordones
    R(g, '#d0d0d8', 7, 19 + b, 1, 1); R(g, '#d0d0d8', 12, 19 + b, 1, 1);
    R(g, P.gold, 8, 15 + b, 1, 1); R(g, P.gold, 10, 15 + b, 1, 1); R(g, P.gold, 9, 16 + b, 1, 1);   // cadena
    R(g, P.topD, 6, 19 + b, 8, 1); R(g, P.topD, 6, 19 + b, 1, 2); R(g, P.topD, 13, 19 + b, 1, 2);   // bolsillo canguro
    R(g, P.topD, 3, 20 + b, 14, 1);                   // puño inferior
  }

  // --- brazos ---
  const sleeve = P.top;
  if (pose.out) {                                      // planeo: brazos abiertos
    if (maria) { R(g, sleeve, 0, 15 + b, 6, 3); R(g, P.skin, 0, 15 + b, 1, 3); R(g, sleeve, 14, 15 + b, 6, 3); R(g, P.skin, 19, 15 + b, 1, 3); }
    else { R(g, sleeve, 0, 14 + b, 5, 3); R(g, P.skin, 0, 14 + b, 1, 3); R(g, sleeve, 15, 14 + b, 5, 3); R(g, P.skin, 19, 14 + b, 1, 3); }
  } else {
    const up = pose.up === true ? -5 : (pose.up === 'half' ? -2 : 0);
    const dl = pose.al || 0, dr = pose.ar || 0;
    const ax = maria ? [2, 15] : [1, 16], top = maria ? 16 : 15, len = maria ? 4 : 5;
    for (const [i, d] of [[0, dl], [1, dr]]) {
      const x = ax[i], y = top + b + d + up;
      R(g, sleeve, x, y, 3, len);
      if (!maria) R(g, P.topD, x, y + len - 1, 3, 1);
      R(g, P.skin, x, up < 0 ? y - 2 : y + len, 3, 2);   // mano
    }
  }

  // --- cabeza ---
  R(g, P.skin, 5, 6 + b, 10, 7); R(g, P.skin, 6, 13 + b, 8, 1); R(g, P.skin, 8, 14 + b, 4, 1);
  if (maria) {
    R(g, P.hair, 5, 2 + b, 10, 1); R(g, P.hair, 4, 3 + b, 12, 4);                          // flequillo/cabeza
    R(g, P.hair, 4, 6 + b, 2, 8); R(g, P.hair, 14, 6 + b, 2, 8);                           // mechones laterales
    R(g, P.skin, 8, 5 + b, 4, 2);                                                          // raya al medio
    R(g, P.hair, 6, 6 + b, 2, 1); R(g, P.hair, 12, 6 + b, 2, 1);
    R(g, P.hairL, 6, 3 + b, 3, 1); R(g, P.hairL, 12, 4 + b, 2, 1); R(g, P.hairL, 4, 9 + b, 1, 3);
    R(g, P.brow, 7, 7 + b, 3, 1); R(g, P.brow, 11, 7 + b, 3, 1);                           // cejas (con un píxel de aire sobre los ojos)
    R(g, P.eye, 8, 9 + b, 2, 2); R(g, P.eye, 12, 9 + b, 2, 2);                             // ojos grandes
    R(g, '#ffffff', 8, 9 + b, 1, 1); R(g, '#ffffff', 12, 9 + b, 1, 1);
    R(g, P.blush, 7, 11 + b, 1, 1); R(g, P.blush, 13, 11 + b, 1, 1);
    R(g, P.mouth, 10, 12 + b, 2, 1);                                                       // sonrisa pequeña
    R(g, P.gold, 4, 13 + b, 1, 2); R(g, P.gold, 15, 13 + b, 1, 2);                         // aros
  } else {
    R(g, P.hair, 5, 2 + b, 10, 1); R(g, P.hair, 4, 3 + b, 12, 4);
    R(g, P.hair, 6, 1 + b, 3, 1); R(g, P.hair, 11, 1 + b, 2, 1); R(g, P.hair, 14, 2 + b, 2, 1);   // remolinos
    R(g, P.hair, 4, 6 + b, 1, 5); R(g, P.hair, 15, 6 + b, 1, 5);                           // patillas
    R(g, P.hair, 5, 6 + b, 4, 1); R(g, P.hair, 10, 6 + b, 5, 1);   // flequillo
    R(g, P.hairL, 7, 3 + b, 3, 1); R(g, P.hairL, 12, 4 + b, 2, 1);
    R(g, P.brow, 6, 7 + b, 3, 1); R(g, P.brow, 11, 7 + b, 3, 1);
    R(g, P.eye, 7, 9 + b, 2, 2); R(g, P.eye, 12, 9 + b, 2, 2);
    R(g, '#ffffff', 7, 9 + b, 1, 1); R(g, '#ffffff', 12, 9 + b, 1, 1);
    R(g, P.skinD, 10, 10 + b, 1, 2);                                                       // nariz
    R(g, P.stub, 5, 11 + b, 10, 3);                                                        // barba corta
    R(g, P.stubL, 6, 12 + b, 1, 1); R(g, P.stubL, 9, 13 + b, 1, 1); R(g, P.stubL, 12, 12 + b, 1, 1); R(g, P.stubL, 13, 13 + b, 1, 1);
    R(g, P.stubD, 8, 11 + b, 5, 1);                                                        // bigote
    R(g, P.skin, 5, 10 + b, 1, 1); R(g, P.skin, 14, 10 + b, 1, 1);
    R(g, '#a85a5a', 10, 12 + b, 2, 1);                                                     // boca
  }
}

/** Hoja completa generada por código (80x130). */
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

  // En el instituto la meta es la verja negra con postes amarillos (como la entrada real)
  if (theme && theme.goal === 'insti') {
    const o = makeCanvas(26 * 2, 36), og = o.getContext('2d');
    for (let f = 0; f < 2; f++) {
      const c = makeCanvas(26, 36), g = c.getContext('2d');
      R(g, f ? '#ffe9b0' : '#ffd98a', 5, 8, 16, 28);                                  // luz al otro lado de la verja
      R(g, '#e8b84a', 1, 6, 4, 30); R(g, '#f4d070', 1, 6, 1, 30); R(g, '#e8b84a', 21, 6, 4, 30); R(g, '#f4d070', 21, 6, 1, 30);
      R(g, '#e8b84a', 1, 4, 24, 3);
      for (let x = 6; x < 21; x += 3) R(g, '#2a2a30', x, 8, 1, 28);
      R(g, '#2a2a30', 5, 8, 16, 1); R(g, '#2a2a30', 5, 20, 16, 1);
      drawPattern(g, ['.X.X.', 'XXXXX', '.XXX.', '..X..'], { X: '#ff6f9c' }, 11, 0 + f);
      outline(g.canvas); og.drawImage(c, f * 26, 0);
    }
    out.goal = o;
  }

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
