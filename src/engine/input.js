// Entrada unificada: teclado + controles táctiles (multitouch real).
// Los botones táctiles llaman a input.touch.* desde ui/touch.js.
const kb = { left: false, right: false, jump: false };
const touch = { left: false, right: false, jump: false };

export const input = {
  touch,
  left: false, right: false, jump: false,
  _jumpEdge: false, _swapEdge: false, _pauseEdge: false,
  consumeJump() { const v = this._jumpEdge; this._jumpEdge = false; return v; },
  consumeSwap() { const v = this._swapEdge; this._swapEdge = false; return v; },
  consumePause() { const v = this._pauseEdge; this._pauseEdge = false; return v; },
  pressJump() { this._jumpEdge = true; },
  pressSwap() { this._swapEdge = true; },
  /** Recalcula el estado combinado (se llama al cambiar cualquier fuente). */
  sync() {
    this.left = kb.left || touch.left;
    this.right = kb.right || touch.right;
    this.jump = kb.jump || touch.jump;
  },
  clear() {
    for (const o of [kb, touch]) { o.left = o.right = o.jump = false; }
    this.sync();
  },
};

const KEYS = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyZ: 'jump',
};

window.addEventListener('keydown', (e) => {
  const k = KEYS[e.code];
  if (k) {
    e.preventDefault();
    if (k === 'jump' && !kb.jump && !e.repeat) input._jumpEdge = true;
    kb[k] = true; input.sync();
  } else if (e.code === 'KeyE' || e.code === 'KeyQ' || e.code === 'Tab') {
    e.preventDefault(); if (!e.repeat) input._swapEdge = true;
  } else if (e.code === 'Escape' || e.code === 'KeyP') {
    if (!e.repeat) input._pauseEdge = true;
  } else if (e.code === 'Enter') {
    if (!e.repeat) input._jumpEdge = true;
  }
});
window.addEventListener('keyup', (e) => {
  const k = KEYS[e.code];
  if (k) { kb[k] = false; input.sync(); }
});
window.addEventListener('blur', () => input.clear());
document.addEventListener('visibilitychange', () => { if (document.hidden) input.clear(); });
