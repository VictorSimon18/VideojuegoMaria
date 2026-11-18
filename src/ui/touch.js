// Controles táctiles en pantalla (DOM): cruceta con deslizamiento, salto grande y cambio de personaje.
// Cada control usa su propio puntero => multitouch real (moverse y saltar a la vez).
import { input } from '../engine/input.js';
import { audio } from '../audio/audio.js';

const $ = (s) => document.querySelector(s);

export const isTouchDevice = () =>
  ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

export function initTouch() {
  const root = document.documentElement;
  root.classList.toggle('touch', isTouchDevice());

  // ---- Cruceta: mitad izquierda = izquierda, mitad derecha = derecha (con zona muerta central) ----
  const dpad = $('#dpad');
  let dpadPointer = null, dir = 0;
  const setDir = (d) => {
    dir = d;
    input.touch.left = d < 0; input.touch.right = d > 0; input.sync();
    dpad.classList.toggle('l', d < 0); dpad.classList.toggle('r', d > 0);
  };
  const dirAt = (e) => {
    const r = dpad.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
    if (x < 0.46) return -1;
    if (x > 0.54) return 1;
    return dir || (x < 0.5 ? -1 : 1);
  };
  dpad.addEventListener('pointerdown', (e) => {
    e.preventDefault(); audio.unlock();
    dpadPointer = e.pointerId; try { dpad.setPointerCapture(e.pointerId); } catch (_) { /* ok */ } setDir(dirAt(e));
  });
  dpad.addEventListener('pointermove', (e) => { if (e.pointerId === dpadPointer) setDir(dirAt(e)); });
  const dpadEnd = (e) => { if (e.pointerId === dpadPointer) { dpadPointer = null; setDir(0); } };
  dpad.addEventListener('pointerup', dpadEnd);
  dpad.addEventListener('pointercancel', dpadEnd);
  dpad.addEventListener('lostpointercapture', dpadEnd);

  // ---- Botón de salto ----
  const jump = $('#btn-jump');
  let jumpPointer = null;
  jump.addEventListener('pointerdown', (e) => {
    e.preventDefault(); audio.unlock();
    jumpPointer = e.pointerId; try { jump.setPointerCapture(e.pointerId); } catch (_) { /* ok */ }
    input.touch.jump = true; input.pressJump(); input.sync(); jump.classList.add('down');
  });
  const jumpEnd = (e) => {
    if (e.pointerId !== jumpPointer) return;
    jumpPointer = null; input.touch.jump = false; input.sync(); jump.classList.remove('down');
  };
  jump.addEventListener('pointerup', jumpEnd);
  jump.addEventListener('pointercancel', jumpEnd);
  jump.addEventListener('lostpointercapture', jumpEnd);

  // ---- Botón de cambio de personaje ----
  const swap = $('#btn-swap');
  swap.addEventListener('pointerdown', (e) => { e.preventDefault(); audio.unlock(); input.pressSwap(); swap.classList.add('down'); });
  const swapEnd = () => swap.classList.remove('down');
  swap.addEventListener('pointerup', swapEnd); swap.addEventListener('pointercancel', swapEnd);

  // ---- Silencio ----
  const mute = $('#btn-mute');
  const paint = () => mute.classList.toggle('off', audio.muted);
  mute.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); audio.unlock(); audio.toggleMute(); paint(); });
  paint();

  // ---- Evitar zoom, scroll elástico y menú contextual ----
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, (e) => e.preventDefault());
  document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  let lastEnd = 0;
  document.addEventListener('touchend', (e) => {
    const n = Date.now();
    if (n - lastEnd < 350) e.preventDefault();   // bloquea el zoom por doble toque
    lastEnd = n;
  }, { passive: false });
  // Seguridad: cualquier primer toque desbloquea el audio (iOS)
  window.addEventListener('pointerup', () => audio.unlock(), { once: true });

  return {
    /** Muestra/oculta los controles táctiles según la escena. */
    setControls({ show = true, swap = false } = {}) {
      $('#touch').classList.toggle('hidden', !show);
      $('#btn-swap').classList.toggle('hidden', !swap);
      if (!show) { setDir(0); input.touch.jump = false; input.sync(); }
    },
  };
}
