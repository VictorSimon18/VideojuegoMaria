// Mapa de niveles: muestra los 5 niveles con corazones, recuerdos y candados.
import { view } from '../engine/view.js';
import { input } from '../engine/input.js';
import { makeBackground } from '../art/backgrounds.js';
import { Particles } from '../art/particles.js';
import { CHAR_SHEET } from '../art/sprites.js';
import { HEART_7, drawPattern } from '../art/pixel.js';
import { THEMES } from '../../levels/themes.js';
import { LEVELS, LEVEL_COUNT } from '../../levels/index.js';
import { drawText, drawBox, wrapText, drawLines } from '../ui/text.js';
import { audio } from '../audio/audio.js';
import { save } from '../state/save.js';

/** Cuenta los corazones ('o') de un nivel sin construirlo entero. */
async function countHearts(n) {
  const mod = await LEVELS[n]();
  return mod.default.rows.reduce((a, r) => a + (r.match(/o/g) || []).length, 0);
}

export class MapScene {
  constructor(app, select) { this.app = app; this.t = 0; this.want = select; this.prevL = false; this.prevR = false; this.leaving = 0; }

  async init() {
    const d = save.data;
    this.totals = await Promise.all(Array.from({ length: LEVEL_COUNT }, (_, i) => countHearts(i + 1)));
    this.sel = Math.max(0, Math.min(LEVEL_COUNT - 1, (this.want ?? Math.min(d.unlocked, LEVEL_COUNT)) - 1));
    this.bgs = null;
    this.bg = makeBackground(THEMES[this.app.story.levels[this.sel].theme]);
    this.bgTheme = this.sel;
    this.particles = new Particles();
    this.app.setControls({ show: false });
  }

  unlocked(i) { return i + 1 <= save.data.unlocked; }
  got(i) { return (save.data.hearts[i + 1] || []).length; }
  card(i) {
    const w = 56, gap = 6, total = LEVEL_COUNT * w + (LEVEL_COUNT - 1) * gap, x0 = (view.W - total) / 2;
    return { x: Math.round(x0 + i * (w + gap)), y: 34, w, h: 78 };
  }
  buttons() {
    const W = view.W, sf = view.safe;
    const b = [{ id: 'char', x: 8 + sf.l, y: 152, w: 86, h: 22 }, { id: 'play', x: Math.round(W / 2 - 36), y: 150, w: 80, h: 24 }];
    if (this.unlocked(this.sel) && save.data.memories[this.sel + 1]) b.push({ id: 'memory', x: W - 92 - sf.r, y: 152, w: 84, h: 22 });
    return b;
  }

  play() {
    if (this.leaving || !this.unlocked(this.sel)) { audio.sfx('hurt'); return; }
    audio.sfx('select'); this.leaving = 0.45;
  }

  onPointer(x, y) {
    for (let i = 0; i < LEVEL_COUNT; i++) {
      const c = this.card(i);
      if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) {
        if (this.sel === i) this.play(); else { this.sel = i; audio.sfx('select'); this.changeBg(); }
        return;
      }
    }
    for (const b of this.buttons()) {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        if (b.id === 'play') this.play();
        else if (b.id === 'char') this.app.go(new (this.app.SelectScene)(this.app));
        else if (b.id === 'memory') { audio.sfx('select'); this.app.go(new (this.app.MemoryScene)(this.app, this.sel + 1, () => this.app.openMap(this.sel + 1))); }
      }
    }
  }

  changeBg() { this.bg = makeBackground(THEMES[this.app.story.levels[this.sel].theme]); }

  update(dt) {
    this.t += dt; this.particles.update(dt);
    if (Math.random() < 0.05) this.particles.add({ kind: 'heart', x: Math.random() * (view.W + 40), y: view.H + 4, vx: -6, vy: -(12 + Math.random() * 12), life: 9, sway: Math.random() * 6, color: '#ff9ac4' });
    if (!this.leaving) {
      if (input.left && !this.prevL && this.sel > 0) { this.sel--; audio.sfx('select'); this.changeBg(); }
      if (input.right && !this.prevR && this.sel < LEVEL_COUNT - 1) { this.sel++; audio.sfx('select'); this.changeBg(); }
      if (input.consumeJump()) this.play();
    }
    this.prevL = input.left; this.prevR = input.right;
    if (this.leaving) { this.leaving -= dt; if (this.leaving <= 0) { this.leaving = 0; this.app.startLevel(this.sel + 1, save.data.character || 'maria'); } }
  }

  draw(ctx) {
    const W = view.W, H = view.H, t = this.t, d = save.data;
    this.bg.draw(ctx, 100 + t * 8, 0, W, H, t);
    ctx.fillStyle = 'rgba(29,16,38,0.55)'; ctx.fillRect(0, 0, W, H);
    this.particles.draw(ctx, 0, 0);
    drawText(ctx, 'Nuestra historia', W / 2, 10, { align: 'center', size: 10, color: '#fff3e0' });
    const totalGot = this.totals.reduce((a, _, i) => a + this.got(i), 0), totalAll = this.totals.reduce((a, b) => a + b, 0);
    drawPattern(ctx, HEART_7, { X: '#ff5d8f', L: '#ffc2d6' }, 8 + view.safe.l, 11);
    drawText(ctx, `${totalGot}/${totalAll}`, 19 + view.safe.l, 10, { size: 8 });

    for (let i = 0; i < LEVEL_COUNT; i++) {
      const c = this.card(i), sel = i === this.sel, open = this.unlocked(i), lift = sel ? Math.round(Math.sin(t * 5)) - 2 : 0;
      const th = THEMES[this.app.story.levels[i].theme];
      drawBox(ctx, c.x, c.y + lift, c.w, c.h, { fill: sel ? '#5a2f63' : '#33203f', border: sel ? '#ff6f9c' : '#7a5a8a' });
      // franja con los colores del cielo del nivel
      const grd = ctx.createLinearGradient(0, c.y + lift + 4, 0, c.y + lift + 34);
      grd.addColorStop(0, th.sky[0]); grd.addColorStop(0.6, th.sky[1]); grd.addColorStop(1, th.sky[2]);
      ctx.globalAlpha = open ? 1 : 0.35; ctx.fillStyle = grd; ctx.fillRect(c.x + 4, c.y + lift + 4, c.w - 8, 30);
      ctx.fillStyle = th.near; ctx.fillRect(c.x + 4, c.y + lift + 26, c.w - 8, 8);
      ctx.globalAlpha = 1;
      drawText(ctx, String(i + 1), c.x + c.w / 2, c.y + lift + 12, { align: 'center', size: 12, color: open ? '#fff3e0' : '#9a8aa8' });
      if (!open) {   // candado
        ctx.fillStyle = '#e8d8f0'; ctx.fillRect(c.x + c.w / 2 - 6, c.y + lift + 48, 12, 9); ctx.fillRect(c.x + c.w / 2 - 4, c.y + lift + 43, 8, 2);
        ctx.fillRect(c.x + c.w / 2 - 4, c.y + lift + 43, 2, 6); ctx.fillRect(c.x + c.w / 2 + 2, c.y + lift + 43, 2, 6);
        ctx.fillStyle = '#33203f'; ctx.fillRect(c.x + c.w / 2 - 1, c.y + lift + 51, 2, 3);
      } else {
        drawPattern(ctx, HEART_7, { X: '#ff5d8f', L: '#ffc2d6' }, c.x + 8, c.y + lift + 42);
        drawText(ctx, `${this.got(i)}/${this.totals[i]}`, c.x + 18, c.y + lift + 41, { size: 8 });
        if (d.memories[i + 1]) { // polaroid = recuerdo conseguido
          ctx.fillStyle = '#fff3e0'; ctx.fillRect(c.x + c.w / 2 - 7, c.y + lift + 55, 14, 16);
          ctx.fillStyle = '#e88aa8'; ctx.fillRect(c.x + c.w / 2 - 5, c.y + lift + 57, 10, 9);
          drawPattern(ctx, ['.X.X.', 'XXXXX', '.XXX.', '..X..'], { X: '#fff' }, c.x + c.w / 2 - 2, c.y + lift + 59);
        } else if (d.done[i + 1]) drawText(ctx, '*', c.x + c.w / 2, c.y + lift + 56, { align: 'center', size: 8, color: '#ffd98a' });
      }
    }
    const def = this.app.story.levels[this.sel];
    drawText(ctx, def.name, W / 2, 120, { align: 'center', size: 8, color: '#ffd98a' });
    drawLines(ctx, wrapText(ctx, def.subtitle, W - 30).slice(0, 2), W / 2, 132, { align: 'center', size: 8, color: '#fff3e0', gap: 3 });

    for (const b of this.buttons()) {
      const hot = b.id === 'play';
      drawBox(ctx, b.x, b.y, b.w, b.h, { fill: hot ? '#c23a6e' : '#3a2350', border: hot ? '#ffb0cc' : '#8a6a9a' });
      if (b.id === 'play') drawText(ctx, this.unlocked(this.sel) ? 'JUGAR' : 'BLOQUEADO', b.x + b.w / 2, b.y + 8, { align: 'center', size: 8 });
      else if (b.id === 'memory') drawText(ctx, 'Recuerdo', b.x + b.w / 2, b.y + 7, { align: 'center', size: 8 });
      else {
        const { fw, fh, anims } = CHAR_SHEET, a = anims.idle;
        ctx.drawImage(this.app.sheets[d.character || 'maria'], 0, a.row * fh, fw, fh, b.x + 4, b.y + 2, 13, 17);
        drawText(ctx, 'Cambiar', b.x + 20, b.y + 7, { size: 8 });
      }
    }
    if (this.leaving) { ctx.globalAlpha = 1 - this.leaving / 0.45; ctx.fillStyle = '#1d1026'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }
}
