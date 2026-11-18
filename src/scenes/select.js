// Pantalla de selección de personaje (toca una tarjeta, o flechas + salto en teclado).
import { view } from '../engine/view.js';
import { input } from '../engine/input.js';
import { makeBackground } from '../art/backgrounds.js';
import { Particles } from '../art/particles.js';
import { CHAR_SHEET } from '../art/sprites.js';
import { CHARACTERS } from '../entities/player.js';
import { THEMES } from '../../levels/themes.js';
import { drawText, drawBox, wrapText, drawLines } from '../ui/text.js';
import { audio } from '../audio/audio.js';
import { save } from '../state/save.js';

const IDS = ['maria', 'victor'];

export class SelectScene {
  constructor(app) { this.app = app; this.t = 0; this.leaving = 0; this.prevL = false; this.prevR = false; }

  async init() {
    this.bg = makeBackground(THEMES.azara);
    this.particles = new Particles();
    this.sel = save.data.character === 'victor' ? 1 : 0;
    this.app.setControls({ show: false });
  }

  card(i) {
    const w = 140, h = 118, cx = view.W * (i === 0 ? 0.27 : 0.73);
    return { x: Math.round(cx - w / 2), y: 32, w, h };
  }

  pick(i) {
    if (this.leaving) return;
    this.sel = i; this.leaving = 0.55; audio.sfx('select');
    this.particles.burstHearts(this.card(i).x + 70, 90, 8, '#ff9ac4');
  }

  onPointer(x, y) {
    IDS.forEach((_, i) => {
      const c = this.card(i);
      if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) this.pick(i);
    });
  }

  update(dt) {
    this.t += dt; this.particles.update(dt);
    if (Math.random() < 0.06) this.particles.add({ kind: 'petal', x: Math.random() * (view.W + 40), y: -4, vx: -10, vy: 14 + Math.random() * 12, life: 9, sway: Math.random() * 6, color: '#ffd0dc' });
    if (!this.leaving) {
      if (input.left && !this.prevL) { this.sel = 0; audio.sfx('select'); }
      if (input.right && !this.prevR) { this.sel = 1; audio.sfx('select'); }
      if (input.consumeJump()) this.pick(this.sel);
    }
    this.prevL = input.left; this.prevR = input.right;
    if (this.leaving) {
      this.leaving -= dt;
      if (this.leaving <= 0) { this.leaving = 0; this.app.startLevel(1, IDS[this.sel]); }
    }
  }

  draw(ctx) {
    const W = view.W, H = view.H, t = this.t;
    this.bg.draw(ctx, 120 + t * 10, 0, W, H, t);
    ctx.fillStyle = 'rgba(29,16,38,0.55)'; ctx.fillRect(0, 0, W, H);
    this.particles.draw(ctx, 0, 0);
    drawText(ctx, 'Elige a tu personaje', W / 2, 12, { align: 'center', size: 10, color: '#fff3e0' });

    IDS.forEach((id, i) => {
      const c = this.card(i), sel = this.sel === i, def = CHARACTERS[id];
      const lift = sel ? Math.round(Math.sin(t * 5) * 1.5) - 2 : 0;
      drawBox(ctx, c.x, c.y + lift, c.w, c.h, { fill: sel ? '#5a2f63' : '#33203f', border: sel ? '#ff6f9c' : '#7a5a8a' });
      const { fw, fh, anims } = CHAR_SHEET, a = anims.idle, f = Math.floor(t * a.fps) % a.n;
      ctx.save(); ctx.translate(c.x + c.w / 2, c.y + 70 + lift); ctx.scale(3, 3);
      if (!sel) ctx.globalAlpha = 0.75;
      ctx.drawImage(this.app.sheets[id], f * fw, a.row * fh, fw, fh, -fw / 2, -fh, fw, fh);
      ctx.restore();
      drawText(ctx, def.name, c.x + c.w / 2, c.y + 76 + lift, { align: 'center', size: 8, color: sel ? '#ffd98a' : '#e8d8f0' });
      drawLines(ctx, wrapText(ctx, def.desc, c.w - 14), c.x + c.w / 2, c.y + 90 + lift, { align: 'center', size: 8, color: '#fff3e0', gap: 3 });
    });
    drawText(ctx, 'Podrás cambiar en pleno nivel', W / 2, 160, { align: 'center', size: 8, color: '#ffd98a' });
    if (this.leaving) { ctx.globalAlpha = 1 - this.leaving / 0.55; ctx.fillStyle = '#1d1026'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }
}
