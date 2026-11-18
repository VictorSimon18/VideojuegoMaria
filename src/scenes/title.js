// Pantalla de título / "Toca para empezar" (el primer toque desbloquea el audio en iOS).
import { view } from '../engine/view.js';
import { input } from '../engine/input.js';
import { makeBackground } from '../art/backgrounds.js';
import { Particles } from '../art/particles.js';
import { CHAR_SHEET } from '../art/sprites.js';
import { THEMES } from '../../levels/themes.js';
import { drawText } from '../ui/text.js';
import { audio } from '../audio/audio.js';

export class TitleScene {
  constructor(app) { this.app = app; this.t = 0; this.ready = false; this.leaving = 0; }

  async init() {
    this.bg = makeBackground(THEMES.azara);
    this.particles = new Particles();
    this.app.setControls({ show: false });
    this.ready = true;
  }

  start() {
    if (this.leaving) return;
    audio.unlock(); audio.sfx('select');
    this.leaving = 0.6;
  }

  onPointer() { this.start(); }

  update(dt) {
    this.t += dt;
    this.particles.update(dt);
    if (Math.random() < 0.08) this.particles.add({ kind: Math.random() < 0.5 ? 'heart' : 'petal', x: Math.random() * (view.W + 40), y: -4, vx: -10, vy: 14 + Math.random() * 14, life: 9, sway: Math.random() * 6, color: Math.random() < 0.5 ? '#ff9ac4' : '#ffd0dc' });
    if (input.consumeJump()) this.start();
    if (this.leaving) { this.leaving -= dt; if (this.leaving <= 0) { this.leaving = 0; this.app.afterTitle(); } }
  }

  draw(ctx) {
    const W = view.W, H = view.H, t = this.t;
    this.bg.draw(ctx, t * 14, 0, W, H, t);
    ctx.fillStyle = '#4c305c'; ctx.fillRect(0, 160, W, H - 160);
    ctx.fillStyle = '#9bc45f'; ctx.fillRect(0, 160, W, 4);
    ctx.fillStyle = '#6a9a4a'; ctx.fillRect(0, 163, W, 1);
    this.particles.draw(ctx, 0, 0);

    const bob = Math.round(Math.sin(t * 2) * 2);
    drawText(ctx, this.app.story.title, W / 2, 34 + bob, { align: 'center', size: 16, color: '#fff3e0', shadow: '#7a2a5a' });
    drawText(ctx, this.app.story.subtitle, W / 2, 62, { align: 'center', size: 8, color: '#ffd98a' });

    // personajes en el suelo (María; Víctor aparece en la fase 2)
    const sheets = this.app.sheets, { fw, fh, anims } = CHAR_SHEET;
    const draw = (who, x, face) => {
      if (!sheets[who]) return;
      const a = anims.idle, f = Math.floor(t * a.fps) % a.n;
      ctx.save(); ctx.translate(x, 160); ctx.scale(face * 2, 2);
      ctx.drawImage(sheets[who], f * fw, a.row * fh, fw, fh, -fw / 2, -fh, fw, fh);
      ctx.restore();
    };
    draw('maria', W / 2 - 24, 1);
    if (this.app.hasVictor) draw('victor', W / 2 + 24, -1);

    if (Math.floor(t * 1.6) % 2 === 0) drawText(ctx, this.app.story.tapToStart, W / 2, 126 - 30 + 30, { align: 'center', size: 8 });
    if (this.leaving) { ctx.globalAlpha = 1 - this.leaving / 0.6; ctx.fillStyle = '#1d1026'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }
}
