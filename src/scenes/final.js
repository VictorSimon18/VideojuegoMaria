// Pantalla final: dedicatoria, mensaje, estadísticas y créditos con corazones y brillos.
import { view } from '../engine/view.js';
import { input } from '../engine/input.js';
import { makeBackground } from '../art/backgrounds.js';
import { Particles } from '../art/particles.js';
import { CHAR_SHEET } from '../art/sprites.js';
import { HEART_7, drawPattern } from '../art/pixel.js';
import { THEMES } from '../../levels/themes.js';
import { drawText, wrapText, drawLines } from '../ui/text.js';
import { audio } from '../audio/audio.js';
import { save } from '../state/save.js';

export class FinalScene {
  constructor(app) { this.app = app; this.t = 0; this.phase = 0; this.pt = 0; this.boom = 0; }

  async init() {
    this.bg = makeBackground(THEMES.final);
    this.particles = new Particles();
    this.app.setControls({ show: false });
    audio.playMusic({ bpm: 76, root: 60, seed: 99, mode: 'major' });
  }

  next() {
    if (this.pt < 0.7) return;
    audio.sfx('select');
    if (this.phase < 2) { this.phase++; this.pt = 0; } else this.app.openMap(1);
  }
  onPointer() { this.next(); }

  update(dt) {
    this.t += dt; this.pt += dt; this.particles.update(dt);
    this.boom -= dt;
    if (this.boom <= 0) {
      this.boom = 0.5 + Math.random() * 0.7;
      const x = 40 + Math.random() * (view.W - 80), y = 30 + Math.random() * 60;
      this.particles.burstHearts(x, y, 9, Math.random() < 0.5 ? '#ff6f9c' : '#ffd98a');
      this.particles.sparkle(x, y, 8);
    }
    if (input.consumeJump()) this.next();
  }

  draw(ctx) {
    const W = view.W, H = view.H, t = this.t, d = save.data;
    this.bg.draw(ctx, t * 6, 0, W, H, t);
    ctx.fillStyle = 'rgba(29,16,38,0.45)'; ctx.fillRect(0, 0, W, H);
    this.particles.draw(ctx, 0, 0);
    const a = Math.min(1, this.pt * 1.2); ctx.globalAlpha = a;
    const st = this.app.story;
    if (this.phase === 0) {
      drawPattern(ctx, HEART_7, { X: '#ff5d8f', L: '#ffc2d6' }, W / 2 - 14, 24 + Math.round(Math.sin(t * 4) * 2));   // corazón grande
      ctx.save(); ctx.restore();
      drawText(ctx, st.dedication, W / 2, 66, { align: 'center', size: 10, color: '#fff3e0', shadow: '#7a2a5a' });
      drawLines(ctx, wrapText(ctx, st.finalMessage, W - 60), W / 2, 92, { align: 'center', size: 8, color: '#ffd98a' });
      const { fw, fh, anims } = CHAR_SHEET, f = Math.floor(t * 2.5) % 2;
      for (const [who, x, face] of [['maria', W / 2 - 20, 1], ['victor', W / 2 + 20, -1]]) {
        ctx.save(); ctx.translate(x, 160); ctx.scale(face * 2, 2);
        ctx.drawImage(this.app.sheets[who], f * fw, anims.idle.row * fh, fw, fh, -fw / 2, -fh, fw, fh); ctx.restore();
      }
    } else if (this.phase === 1) {
      const hearts = [1, 2, 3, 4, 5].reduce((s, n) => s + (d.hearts[n] || []).length, 0);
      const mems = Object.keys(d.memories).length;
      drawText(ctx, 'Créditos', W / 2, 14, { align: 'center', size: 10, color: '#ffd98a' });
      drawLines(ctx, st.credits.flatMap((c) => wrapText(ctx, c, W - 40)), W / 2, 38, { align: 'center', size: 8, color: '#fff3e0', gap: 7 });
      drawText(ctx, `Corazones: ${hearts}   Recuerdos: ${mems}/5`, W / 2, 148, { align: 'center', size: 8, color: '#ff9ac4' });
    } else {
      drawText(ctx, 'Gracias por jugar', W / 2, 62, { align: 'center', size: 12, color: '#fff3e0', shadow: '#7a2a5a' });
      drawText(ctx, st.dedication, W / 2, 90, { align: 'center', size: 8, color: '#ffd98a' });
    }
    ctx.globalAlpha = 1;
    if (this.pt > 0.7 && Math.floor(t * 2) % 2 === 0) drawText(ctx, this.phase < 2 ? 'Toca para continuar' : 'Toca para volver al mapa', W / 2, 168, { align: 'center', size: 8 });
  }
}
