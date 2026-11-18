// Recuerdo desbloqueado: foto tipo polaroid + texto corto. La foto se lee de assets/memories/nivelN.jpg
// (si no existe, se muestra un hueco bonito con el nombre del archivo que falta).
import { view } from '../engine/view.js';
import { input } from '../engine/input.js';
import { makeBackground } from '../art/backgrounds.js';
import { Particles } from '../art/particles.js';
import { HEART_7, drawPattern } from '../art/pixel.js';
import { THEMES } from '../../levels/themes.js';
import { drawText, drawBox, wrapText, drawLines } from '../ui/text.js';
import { audio } from '../audio/audio.js';

export class MemoryScene {
  constructor(app, levelNum, next) { this.app = app; this.n = levelNum; this.next = next; this.t = 0; this.leaving = false; }

  async init() {
    this.def = this.app.story.levels[this.n - 1];
    this.bg = makeBackground(THEMES[this.def.theme]);
    this.particles = new Particles();
    this.app.setControls({ show: false });
    this.photo = await new Promise((res) => {
      const img = new Image(); img.onload = () => res(img); img.onerror = () => res(null);
      img.src = this.def.memory.photo;
    });
    audio.playMusic({ bpm: 84, root: 60, seed: 7, mode: 'major' }, 'menu');
    audio.sfx('egg');
    this.particles.burstHearts(view.W * 0.3, 80, 14, '#ff9ac4');
  }

  onPointer() { this.close(); }
  close() { if (this.t < 0.8 || this.leaving) return; this.leaving = true; audio.sfx('select'); this.next(); }

  update(dt) {
    this.t += dt; this.particles.update(dt);
    if (Math.random() < 0.1) this.particles.add({ kind: 'heart', x: Math.random() * view.W, y: view.H + 4, vx: 0, vy: -(14 + Math.random() * 14), life: 9, sway: Math.random() * 6, color: '#ff9ac4' });
    if (input.consumeJump()) this.close();
  }

  draw(ctx) {
    const W = view.W, H = view.H, t = this.t;
    this.bg.draw(ctx, 200, 0, W, H, t);
    ctx.fillStyle = 'rgba(29,16,38,0.62)'; ctx.fillRect(0, 0, W, H);
    this.particles.draw(ctx, 0, 0);
    drawText(ctx, '¡Recuerdo desbloqueado!', W / 2, 8, { align: 'center', size: 10, color: '#ffd98a' });

    // polaroid
    const pw = 116, ph = 128, px = Math.round(W * 0.27 - pw / 2), py = 28 + Math.round(Math.sin(t * 2) * 1);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(px + 3, py + 4, pw, ph);
    ctx.fillStyle = '#fff6ea'; ctx.fillRect(px, py, pw, ph);
    const ax = px + 8, ay = py + 8, aw = pw - 16, ah = 92;
    if (this.photo) {
      const r = Math.max(aw / this.photo.width, ah / this.photo.height), sw = aw / r, sh = ah / r;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this.photo, (this.photo.width - sw) / 2, (this.photo.height - sh) / 2, sw, sh, ax, ay, aw, ah);
      ctx.imageSmoothingEnabled = false;
    } else {
      ctx.fillStyle = '#e88aa8'; ctx.fillRect(ax, ay, aw, ah);
      ctx.fillStyle = '#f4a8bf'; for (let i = 0; i < 6; i++) ctx.fillRect(ax + 6 + i * 16, ay + 6 + (i % 2) * 8, 6, 6);
      ctx.save(); ctx.translate(ax + aw / 2 - 11, ay + 12); ctx.scale(3, 3); drawPattern(ctx, HEART_7, { X: '#fff6ea', L: '#ffffff' }, 0, 0); ctx.restore();
      drawText(ctx, 'Tu foto aquí', ax + aw / 2, ay + 52, { align: 'center', size: 8, color: '#fff6ea', shadow: '#a02255' });
      drawText(ctx, `nivel${this.n}.jpg`, ax + aw / 2, ay + 66, { align: 'center', size: 8, color: '#fff6ea', shadow: '#a02255' });
    }
    drawText(ctx, this.def.memory.title, px + pw / 2, py + ph - 20, { align: 'center', size: 8, color: '#6b4434', shadow: null });

    // texto del recuerdo
    const tx = Math.round(W * 0.27 + pw / 2 + 14), tw = W - tx - 10 - view.safe.r;
    drawBox(ctx, tx, 30, tw, 118, { fill: '#fff3e0', border: '#6b4434' });
    drawText(ctx, this.def.name, tx + 8, 38, { size: 8, color: '#c23a6e', shadow: null });
    drawLines(ctx, wrapText(ctx, this.def.memory.text, tw - 16).slice(0, 9), tx + 8, 54, { size: 8, color: '#5a3426', shadow: null, gap: 4 });
    if (this.t > 0.8 && Math.floor(t * 2) % 2 === 0) drawText(ctx, 'Toca para continuar', W / 2, 164, { align: 'center', size: 8 });
  }
}
