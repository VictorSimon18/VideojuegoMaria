// Gestión de la pantalla: canvas nítido (retina), escalado manteniendo proporción
// y márgenes de seguridad (notch / barra de inicio).
import { VIEW_H, VIEW_MIN_W, VIEW_MAX_W } from './constants.js';

const MAX_RENDER_SCALE = 4;

export const view = {
  canvas: null,
  ctx: null,
  W: VIEW_MIN_W,      // ancho lógico actual
  H: VIEW_H,          // alto lógico (fijo)
  scale: 1,           // píxeles de dispositivo por píxel lógico
  dpr: 1,
  safe: { l: 0, r: 0, t: 0, b: 0 }, // márgenes seguros en píxeles lógicos
  portrait: false,
  listeners: [],
  onResize(fn) { this.listeners.push(fn); },
};

let probe;

function readSafeArea() {
  // Lee env(safe-area-inset-*) a través de un elemento sonda con padding.
  if (!probe) {
    probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;left:0;top:0;' +
      'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.appendChild(probe);
  }
  const cs = getComputedStyle(probe);
  return {
    t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0,
    b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0,
  };
}

export function layout() {
  const cssW = window.innerWidth, cssH = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  view.dpr = dpr;
  view.portrait = cssH > cssW;
  const aspect = cssW / cssH;
  view.W = Math.max(VIEW_MIN_W, Math.min(VIEW_MAX_W, Math.floor(aspect * VIEW_H)));
  const devW = cssW * dpr, devH = cssH * dpr;
  const raw = Math.min(devW / view.W, devH / view.H);
  // Escala entera cuando es pequeña (píxeles perfectos); libre cuando es grande.
  // Tamaño en pantalla (en píxeles de dispositivo): escala entera si es pequeña, libre si es grande.
  const full = raw < 4 ? Math.max(1, Math.floor(raw)) : raw;
  // Resolución interna limitada a 4 px por píxel lógico: el CSS la amplía sin suavizar (image-rendering: pixelated),
  // se ve igual de nítido pero rellena muchos menos píxeles => 60 fps también en iPhone Pro.
  view.scale = Math.min(full, MAX_RENDER_SCALE);
  const cw = Math.round(view.W * view.scale), ch = Math.round(view.H * view.scale);
  const showW = view.W * full / dpr, showH = view.H * full / dpr;
  const c = view.canvas;
  c.width = cw; c.height = ch;
  c.style.width = showW + 'px';
  c.style.height = showH + 'px';
  view.ctx.setTransform(cw / view.W, 0, 0, ch / view.H, 0, 0);
  view.ctx.imageSmoothingEnabled = false;

  // Márgenes seguros convertidos a píxeles lógicos relativos al canvas centrado.
  const s = readSafeArea();
  const k = view.W / showW; // lógico por css px
  const offX = (cssW - showW) / 2, offY = (cssH - showH) / 2;
  view.safe = {
    l: Math.max(0, (s.l - offX)) * k, r: Math.max(0, (s.r - offX)) * k,
    t: Math.max(0, (s.t - offY)) * k, b: Math.max(0, (s.b - offY)) * k,
  };
  document.documentElement.classList.toggle('portrait', view.portrait);
  view.listeners.forEach(fn => fn(view));
}

export function initView(canvas) {
  view.canvas = canvas;
  view.ctx = canvas.getContext('2d', { alpha: false });
  layout();
  let t;
  const relayout = () => { layout(); clearTimeout(t); t = setTimeout(layout, 250); };
  window.addEventListener('resize', relayout);
  window.addEventListener('orientationchange', relayout);
}

// Convierte un evento de puntero a coordenadas lógicas.
export function toLogical(e) {
  const r = view.canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * view.W, y: (e.clientY - r.top) / r.height * view.H };
}
