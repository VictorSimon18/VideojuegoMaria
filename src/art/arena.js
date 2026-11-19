// Nivel 4 - WiZink Centre: interior del pabellón (gradas llenas, escenario con focos, pantallas),
// público en primer plano con móviles, y a Quevedo con una cabrita como meta del nivel.
// Referencia: fotos del pabellón durante un concierto.
import { makeCanvas, rect as R, rng, pixelEllipse, outline } from './pixel.js';

export function arenaFar(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(17);
  // techo oscuro con cerchas
  const grad = g.createLinearGradient(0, 0, 0, 150);
  grad.addColorStop(0, '#0c0818'); grad.addColorStop(0.55, '#1e1236'); grad.addColorStop(1, '#3a1c4a');
  g.fillStyle = grad; g.fillRect(0, 0, pw, H);
  for (let y = 10; y < 52; y += 14) R(g, '#2a2044', 0, y, pw, 2);
  for (let x = 0; x < pw; x += 40) { R(g, '#2a2044', x, 0, 2, 52); R(g, '#3a2c5a', x + 1, 0, 1, 52); }
  // resplandor del escenario
  const cx = 240;
  const glow = g.createRadialGradient(cx, 112, 4, cx, 112, 120);
  glow.addColorStop(0, 'rgba(255,240,210,0.9)'); glow.addColorStop(0.3, 'rgba(255,170,200,0.4)'); glow.addColorStop(1, 'rgba(255,120,200,0)');
  g.fillStyle = glow; g.fillRect(0, 0, pw, H);
  // gradas: dos pisos con público (puntitos cálidos) y franjas azules de leds
  for (const [y0, y1] of [[64, 92], [100, 132]]) {
    R(g, '#1a1030', 0, y0, pw, y1 - y0);
    for (let y = y0 + 2; y < y1; y += 4) {
      for (let x = (y % 8) ? 0 : 2; x < pw; x += 4) {
        const d = Math.abs(x - cx) / 240;
        R(g, r() < 0.5 ? '#c8704a' : (r() < 0.5 ? '#8a4a5a' : '#e0a070'), x, y, 2, 2);
        if (r() < d * 0.25) R(g, '#12081e', x, y, 2, 2);
      }
      R(g, '#2a2a7a', 0, y + 2, pw, 1);
    }
    R(g, '#4a5af0', 0, y0, pw, 1); R(g, '#8a9aff', 0, y0, pw, 1);
  }
  // pantallas gigantes y escenario
  for (const x of [cx - 80, cx + 60]) { R(g, '#0a0614', x - 1, 82, 22, 30); R(g, '#e8d8ff', x, 83, 20, 28); R(g, '#ff9ac4', x + 3, 90, 14, 10); R(g, '#fff', x + 6, 93, 4, 3); }
  R(g, '#1a1030', cx - 46, 120, 92, 12); R(g, '#fff4d8', cx - 44, 118, 88, 3);
  pixelEllipse(g, '#fff6e0', cx, 112, 20, 9);
  // haces de luz
  g.fillStyle = '#ffe8f4';
  for (const [x, dx] of [[cx - 34, -70], [cx - 12, -22], [cx + 12, 24], [cx + 34, 72]]) {
    g.globalAlpha = 0.14; g.beginPath(); g.moveTo(x, 116); g.lineTo(x + dx - 9, 0); g.lineTo(x + dx + 9, 0); g.closePath(); g.fill();
  }
  g.globalAlpha = 1;
  // pista abarrotada
  R(g, '#10081c', 0, 136, pw, H - 136);
  for (let y = 138; y < 152; y += 3) for (let x = 0; x < pw; x += 3) if (r() < 0.8) R(g, r() < 0.5 ? '#2a1a3a' : '#4a2a4a', x, y, 2, 2);
  return c;
}

export function arenaMid(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(61), gy = 156;
  // siluetas del público con brazos en alto y luces de móvil
  for (let x = -4; x < pw; x += 7 + Math.floor(r() * 4)) {
    const h = 12 + Math.floor(r() * 7);
    pixelEllipse(g, '#140a22', x + 3, gy - h, 4, 4); R(g, '#140a22', x - 1, gy - h + 2, 8, h);
    if (r() < 0.35) {   // brazo en alto con móvil
      const up = 8 + Math.floor(r() * 7);
      R(g, '#140a22', x + 5, gy - h - up, 2, up);
      if (r() < 0.6) { R(g, '#fff4c4', x + 4, gy - h - up - 3, 4, 3); g.fillStyle = 'rgba(255,244,196,0.25)'; g.beginPath(); g.arc(x + 6, gy - h - up - 2, 6, 0, 7); g.fill(); }
    }
  }
  R(g, '#140a22', 0, gy - 2, pw, 30);
  return c;
}

/** Quevedo (pelo castaño, camiseta blanca, cadena dorada, tatuaje) con una cabrita negra en brazos: meta del nivel 4. */
export function quevedoGoal() {
  const o = makeCanvas(26 * 2, 36), og = o.getContext('2d');
  for (let f = 0; f < 2; f++) {
    const c = makeCanvas(26, 36), g = c.getContext('2d'), dy = f ? 1 : 0;
    // piernas y zapatillas
    R(g, '#3a5a9a', 8, 27, 4, 7); R(g, '#3a5a9a', 14, 27, 4, 7); R(g, '#2e4a80', 8, 27, 1, 7); R(g, '#f4f4f4', 7, 34, 5, 2); R(g, '#f4f4f4', 14, 34, 5, 2);
    // camiseta blanca
    R(g, '#f4f4f6', 6, 14 + dy, 14, 14); R(g, '#d8d8e4', 17, 15 + dy, 3, 13); R(g, '#fff', 7, 14 + dy, 3, 2);
    R(g, '#f4f4f6', 4, 15 + dy, 3, 8); R(g, '#f4f4f6', 19, 15 + dy, 3, 8);
    // brazos (piel) y tatuaje
    R(g, '#e0aa84', 3, 22 + dy, 3, 5); R(g, '#e0aa84', 20, 22 + dy, 3, 5); R(g, '#7a7a8a', 20, 23 + dy, 3, 1); R(g, '#7a7a8a', 21, 25 + dy, 2, 1);
    R(g, '#e8c040', 3, 25 + dy, 3, 1);   // reloj dorado
    // cabeza
    R(g, '#e8b890', 8, 5 + dy, 10, 10); R(g, '#d09a74', 16, 7 + dy, 2, 8);
    R(g, '#e8b890', 7, 8 + dy, 1, 3); R(g, '#e8b890', 18, 8 + dy, 1, 3);
    // pelo castaño con tupé
    R(g, '#6a4430', 7, 2 + dy, 12, 5); R(g, '#8a5a40', 9, 1 + dy, 8, 2); R(g, '#6a4430', 7, 7 + dy, 2, 2); R(g, '#6a4430', 17, 7 + dy, 2, 2); R(g, '#8a5a40', 10, 2 + dy, 3, 1);
    // cara sonriente
    R(g, '#2a1620', 10, 9 + dy, 2, 2); R(g, '#2a1620', 14, 9 + dy, 2, 2); R(g, '#fff', 10, 9 + dy, 1, 1); R(g, '#fff', 14, 9 + dy, 1, 1);
    R(g, '#8a4a3a', 10, 12 + dy, 6, 2); R(g, '#fff', 11, 12 + dy, 4, 1);
    R(g, '#ff9a8a', 8, 11 + dy, 2, 1); R(g, '#ff9a8a', 16, 11 + dy, 2, 1);
    // cadena dorada
    R(g, '#e8c040', 10, 15 + dy, 6, 1); R(g, '#e8c040', 12, 16 + dy, 2, 2);
    // cabrita negra en brazos (a la izquierda)
    R(g, '#2a2630', 0, 18 + dy, 8, 6); R(g, '#3a3640', 1, 18 + dy, 6, 1);
    R(g, '#2a2630', 0, 14 + dy, 4, 5); R(g, '#2a2630', 0, 13 + dy, 1, 2); R(g, '#2a2630', 3, 13 + dy, 1, 2);
    R(g, '#ff9ac4', 0, 17 + dy, 2, 1); R(g, '#fff', 1, 15 + dy, 1, 1);
    R(g, '#2a2630', 6, 23 + dy, 1, 2); R(g, '#2a2630', 2, 23 + dy, 1, 2);
    // destellos
    if (f) { R(g, '#fff4c4', 22, 2, 1, 3); R(g, '#fff4c4', 21, 3, 3, 1); } else { R(g, '#ffd0e8', 3, 3, 1, 3); R(g, '#ffd0e8', 2, 4, 3, 1); }
    outline(c); og.drawImage(c, f * 26, 0);
  }
  return o;
}
