// Fondos con parallax de 3 capas (lejos, medio, cerca) + cielo con sol, estrellas y nubes.
import { makeCanvas, rng, rect as R, pixelEllipse, lerpColor } from './pixel.js';

const TAU = Math.PI * 2;
const mod = (a, p) => ((a % p) + p) % p;

function skyCanvas(th, H) {
  const c = makeCanvas(4, H);
  const g = c.getContext('2d');
  const band = 4;
  for (let y = 0; y < H; y += band) {
    const t = y / H;
    const col = t < 0.55 ? lerpColor(th.sky[0], th.sky[1], t / 0.55) : lerpColor(th.sky[1], th.sky[2], (t - 0.55) / 0.45);
    R(g, col, 0, y, 4, band);
  }
  return c;
}

function cloudsLayer(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(7);
  for (let i = 0; i < 6; i++) {
    const x = Math.floor((i + r() * 0.6) * pw / 6), y = 20 + Math.floor(r() * 60), w = 30 + Math.floor(r() * 30);
    g.globalAlpha = 0.55;
    pixelEllipse(g, th.cloudBg, x, y, w / 2, 5);
    pixelEllipse(g, th.cloudBg, x - w / 5, y - 4, w / 4, 4);
    pixelEllipse(g, th.cloudBg, x + w / 6, y - 5, w / 5, 4);
  }
  g.globalAlpha = 1;
  return c;
}

function schoolFar(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const dark = lerpColor(th.far, '#201030', 0.25), light = lerpColor(th.far, '#ffd0c0', 0.12);
  const r = rng(5);
  R(g, th.far, 0, 150, pw, 30);
  // árboles de fondo
  for (const x of [28, 70, 410, 452]) { pixelEllipse(g, dark, x, 132, 14, 14); R(g, dark, x - 1, 140, 3, 12); }
  const wing = (x, w, top) => {
    R(g, th.far, x, top, w, 150 - top); R(g, dark, x - 1, top - 3, w + 2, 3);
    for (let wy = top + 6; wy < 140; wy += 14) for (let wx = x + 6; wx < x + w - 8; wx += 14) {
      R(g, r() < 0.55 ? th.window : light, wx, wy, 7, 8);
      R(g, dark, wx + 3, wy, 1, 8);
    }
  };
  wing(110, 34, 118); wing(334, 36, 118);
  wing(144, 190, 100);
  // torre del reloj
  R(g, th.far, 218, 66, 44, 36); R(g, dark, 215, 62, 50, 4);
  for (let i = 0; i < 12; i++) R(g, dark, 224 + i * 2, 50 + (i < 6 ? 12 - i * 2 : (i - 5) * 2 - 2), 2, 14);
  pixelEllipse(g, dark, 240, 52, 6, 4);
  R(g, dark, 239, 40, 2, 10);   // mástil
  R(g, '#ff7aa5', 241, 40, 7, 4); // bandera
  pixelEllipse(g, '#ffe9c0', 240, 78, 8, 8);
  R(g, dark, 240, 72, 1, 7); R(g, dark, 240, 78, 4, 1);
  // puerta
  R(g, dark, 232, 126, 16, 24); R(g, th.window, 235, 130, 10, 20);
  return c;
}

function genericFar(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const dark = lerpColor(th.far, '#201030', 0.25);
  R(g, th.far, 0, 148, pw, 32);
  for (let i = 0; i < 9; i++) {
    const x = i * pw / 9 + 20, h = 24 + (i * 37 % 40);
    R(g, th.far, x, 148 - h, 22, h); R(g, dark, x - 1, 148 - h - 2, 24, 2);
    for (let wy = 148 - h + 5; wy < 140; wy += 9) R(g, th.window, x + 4, wy, 4, 4), R(g, th.window, x + 13, wy, 4, 4);
  }
  return c;
}

function midLayer(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const dark = lerpColor(th.mid, '#1a0c28', 0.2);
  g.fillStyle = th.mid;
  for (let x = 0; x < pw; x++) {
    const y = 138 + Math.sin(TAU * 3 * x / pw) * 8 + Math.sin(TAU * 7 * x / pw) * 3;
    g.fillRect(x, Math.round(y), 1, H);
  }
  const r = rng(21);
  for (let i = 0; i < 10; i++) {
    const x = Math.floor(i * pw / 10 + r() * 20) + 10;
    const gy = Math.round(138 + Math.sin(TAU * 3 * x / pw) * 8 + Math.sin(TAU * 7 * x / pw) * 3);
    R(g, dark, x - 1, gy - 12, 3, 14);
    pixelEllipse(g, dark, x, gy - 18, 9, 9);
    pixelEllipse(g, th.mid, x - 3, gy - 21, 4, 3);
  }
  return c;
}

function nearLayer(th, pw, H) {
  const c = makeCanvas(pw, H), g = c.getContext('2d');
  const r = rng(3);
  R(g, th.near, 0, 166, pw, 14);
  for (let x = 6; x < pw; x += 22) pixelEllipse(g, th.near, x, 164, 13, 8);
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(r() * pw), y = 156 + Math.floor(r() * 12);
    R(g, th.window, x, y, 1, 1);
  }
  return c;
}

const FARS = { school: schoolFar };

export function makeBackground(th, H = 180) {
  const sky = skyCanvas(th, H);
  const clouds = cloudsLayer(th, 480, H);
  const far = (FARS[th.bgKind] || genericFar)(th, 480, H);
  const mid = midLayer(th, 400, H);
  const near = nearLayer(th, 320, H);
  const r = rng(77);
  const stars = Array.from({ length: 46 }, () => ({ x: r() * 800, y: r() * 80, p: r() * TAU }));
  const tile = (ctx, img, f, camX, camY, W, oy = 0, time = 0, drift = 0) => {
    const pw = img.width;
    const x0 = -mod(camX * f + time * drift, pw);
    const y = -camY * 0.15 + oy;
    for (let x = x0; x < W; x += pw) ctx.drawImage(img, Math.round(x), Math.round(y));
  };
  return {
    draw(ctx, camX, camY, W, Hh, time) {
      ctx.drawImage(sky, 0, 0, 4, H, 0, 0, W, Hh);
      if (th.stars) {
        for (const s of stars) {
          const x = mod(s.x - camX * 0.02, 800);
          if (x > W) continue;
          if (Math.sin(time * 2 + s.p) > -0.2) R(ctx, '#fff4e0', Math.round(x), Math.round(s.y), 1, 1);
        }
      }
      // sol con aureola
      const sx = Math.round(W * 0.74 - camX * 0.03), sy = 112;
      ctx.globalAlpha = 0.18; pixelEllipse(ctx, th.sun, sx, sy, 34, 34);
      ctx.globalAlpha = 0.3; pixelEllipse(ctx, th.sun, sx, sy, 26, 26);
      ctx.globalAlpha = 1; pixelEllipse(ctx, th.sun, sx, sy, 18, 18);
      tile(ctx, clouds, 0.08, camX, camY, W, 0, time, 2.5);
      tile(ctx, far, 0.18, camX, camY, W);
      tile(ctx, mid, 0.34, camX, camY, W);
      tile(ctx, near, 0.55, camX, camY, W);
    },
  };
}
