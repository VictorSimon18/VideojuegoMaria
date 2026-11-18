// Texto con la fuente pixel (Press Start 2P) sobre el canvas.
export const FONT = '"Press Start 2P", monospace';

export function setFont(ctx, size = 8) { ctx.font = `${size}px ${FONT}`; ctx.textBaseline = 'top'; }

/** Parte un texto en líneas que quepan en maxW píxeles lógicos. */
export function wrapText(ctx, str, maxW, size = 8) {
  setFont(ctx, size);
  const words = String(str).split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Dibuja texto con sombra. align: 'left' | 'center' | 'right'. */
export function drawText(ctx, str, x, y, { size = 8, color = '#fff', shadow = '#2a1620', align = 'left' } = {}) {
  setFont(ctx, size);
  ctx.textAlign = align;
  if (shadow) { ctx.fillStyle = shadow; ctx.fillText(str, Math.round(x), Math.round(y) + 1); }
  ctx.fillStyle = color;
  ctx.fillText(str, Math.round(x), Math.round(y));
  ctx.textAlign = 'left';
}

/** Dibuja varias líneas centradas; devuelve la altura total. */
export function drawLines(ctx, lines, x, y, opts = {}) {
  const lh = (opts.size || 8) + (opts.gap ?? 4);
  lines.forEach((l, i) => drawText(ctx, l, x, y + i * lh, opts));
  return lines.length * lh;
}

/** Caja estilo diálogo (crema con borde marrón y esquinas recortadas). */
export function drawBox(ctx, x, y, w, h, { fill = '#fff3e0', border = '#6b4434', tail = null } = {}) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  ctx.fillStyle = border;
  ctx.fillRect(x + 1, y, w - 2, h); ctx.fillRect(x, y + 1, w, h - 2);
  ctx.fillStyle = fill;
  ctx.fillRect(x + 2, y + 1, w - 4, h - 2); ctx.fillRect(x + 1, y + 2, w - 2, h - 4);
  if (tail) { // pico hacia abajo en x = tail
    const tx = Math.round(tail);
    ctx.fillStyle = border; ctx.fillRect(tx - 3, y + h, 7, 1); ctx.fillRect(tx - 2, y + h + 1, 5, 1); ctx.fillRect(tx - 1, y + h + 2, 3, 1);
    ctx.fillStyle = fill; ctx.fillRect(tx - 2, y + h - 1, 5, 1); ctx.fillRect(tx - 1, y + h, 3, 1); ctx.fillRect(tx, y + h + 1, 1, 1);
  }
}
