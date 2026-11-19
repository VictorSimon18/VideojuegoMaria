// Sistema de partículas suaves: corazones, brillos, polvo, pétalos.
import { HEART_5, drawPattern } from './pixel.js';

export class Particles {
  constructor() { this.list = []; }

  add(p) {
    if (this.list.length > 400) this.list.shift();
    this.list.push({ vx: 0, vy: 0, g: 0, life: 1, age: 0, size: 1, color: '#fff', kind: 'dust', drag: 0, ...p });
  }

  /** Ráfaga de corazones (al recoger, al hacer checkpoint...). */
  burstHearts(x, y, n = 6, color = '#ff6f9c') {
    for (let i = 0; i < n; i++) {
      const a = Math.PI * 2 * i / n + Math.random() * 0.5, s = 30 + Math.random() * 40;
      this.add({ kind: 'heart', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 25, g: 30, life: 0.9 + Math.random() * 0.4, color });
    }
  }
  sparkle(x, y, n = 6, color = '#fff2b0') {
    for (let i = 0; i < n; i++) {
      this.add({ kind: 'spark', x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 30, vy: -Math.random() * 30, life: 0.5 + Math.random() * 0.5, color });
    }
  }
  dust(x, y, n = 4, color = '#e8d2b8') {
    for (let i = 0; i < n; i++) {
      this.add({ kind: 'dust', x, y, vx: (Math.random() - 0.5) * 40, vy: -Math.random() * 18, life: 0.3 + Math.random() * 0.2, color, size: 2 });
    }
  }
  debris(x, y, color) {
    for (let i = 0; i < 8; i++) {
      this.add({ kind: 'dust', x, y, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 80, g: 500, life: 0.7, color, size: 3 });
    }
  }

  update(dt) {
    const l = this.list;
    for (let i = l.length - 1; i >= 0; i--) {
      const p = l[i];
      p.age += dt;
      if (p.age >= p.life) { l.splice(i, 1); continue; }
      p.vy += p.g * dt;
      if (p.drag) { p.vx -= p.vx * p.drag * dt; p.vy -= p.vy * p.drag * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.sway) p.x += Math.sin(p.age * 3 + p.sway) * 8 * dt;
    }
  }

  draw(ctx, camX, camY) {
    for (const p of this.list) {
      const t = p.age / p.life;
      const x = Math.round(p.x - camX), y = Math.round(p.y - camY);
      ctx.globalAlpha = t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1;
      if (p.kind === 'heart') drawPattern(ctx, HEART_5, { X: p.color }, x - 2, y - 2);
      else if (p.kind === 'spark') {
        ctx.fillStyle = p.color;
        const on = Math.floor(p.age * 14) % 2 === 0;
        ctx.fillRect(x, y, 1, 1);
        if (on) { ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); }
      } else if (p.kind === 'streak') {
        ctx.fillStyle = p.color; ctx.fillRect(x, y, p.vx > 0 ? 7 : -7, 1);
      } else if (p.kind === 'petal') {
        ctx.fillStyle = p.color; ctx.fillRect(x, y, 2, 1); ctx.fillRect(x + 1, y + 1, 1, 1);
      } else { ctx.fillStyle = p.color; ctx.fillRect(x, y, p.size, p.size); }
    }
    ctx.globalAlpha = 1;
  }
}
