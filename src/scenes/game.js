// Escena de juego: carga un nivel, gestiona entidades, colisiones, cámara, HUD y transiciones.
import { TILE } from '../engine/constants.js';
import { view } from '../engine/view.js';
import { input } from '../engine/input.js';
import { overlaps } from '../engine/physics.js';
import { TileMap } from '../engine/tilemap.js';
import { Camera } from '../engine/camera.js';
import { Player } from '../entities/player.js';
import { Blob, Flyer } from '../entities/enemy.js';
import { makeTileset, makeDecorPainter } from '../art/tiles.js';
import { makeBackground } from '../art/backgrounds.js';
import { makeItemSprites } from '../art/sprites.js';
import { Particles } from '../art/particles.js';
import { heartPath, HEART_7, drawPattern } from '../art/pixel.js';
import { THEMES } from '../../levels/themes.js';
import { LEVELS } from '../../levels/index.js';
import { drawText, drawBox, wrapText, drawLines } from '../ui/text.js';
import { audio } from '../audio/audio.js';
import { save } from '../state/save.js';

export class GameScene {
  constructor(app, levelNum = 1, charId = 'maria') {
    this.app = app; this.levelNum = levelNum; this.charId = charId;
    this.ready = false; this.paused = false;
  }

  async init() {
    const story = this.app.story;
    this.def = story.levels[this.levelNum - 1];
    const mod = await LEVELS[this.levelNum]();
    this.theme = THEMES[this.def.theme];
    this.map = new TileMap(mod.default.rows);
    this.map.build(makeTileset(this.theme), makeDecorPainter(this.theme));
    this.bg = makeBackground(this.theme);
    this.spr = makeItemSprites(this.theme);
    this.cam = new Camera();
    this.particles = new Particles();
    this.time = 0; this.state = 'play';
    this.hearts = []; this.checkpoints = []; this.enemies = []; this.signs = []; this.goal = null;
    let start = { tx: 1, ty: this.map.H - 3 };
    for (const s of this.map.spawns) {
      if (s.ch === 'S') start = s;
      else if (s.ch === 'o') this.hearts.push({ id: this.hearts.length, x: s.tx * TILE + 8, y: s.ty * TILE + 8, got: false });
      else if (s.ch === 'c') this.checkpoints.push({ tx: s.tx, ty: s.ty, on: false });
      else if (s.ch === 'e') this.enemies.push(new Blob(s.tx, s.ty));
      else if (s.ch === 'f') this.enemies.push(new Flyer(s.tx, s.ty));
      else if (s.ch === 'G') this.goal = { tx: s.tx, ty: s.ty };
      else if (/[1-9]/.test(s.ch)) this.signs.push({ tx: s.tx, ty: s.ty, key: s.ch });
    }
    this.spawn = { x: start.tx * TILE + 3, y: (start.ty + 1) * TILE - 16 };
    this.player = new Player(this.charId, this.app.sheets[this.charId]);
    this.player.respawn(this.spawn.x, this.spawn.y);
    this.player.invuln = 0;
    this.cam.snap(this.player, this.map, view.W, view.H);
    this.iris = 0; this.irisTarget = 1; this.banner = 3.4; this.eggTaps = 0; this.eggT = 0; this.eggMsg = 0;
    this.sign = null; this.collected = 0; this.dyingT = 0; this.endT = 0;
    this.ready = true;
    audio.playMusic(this.theme.music, 'level' + this.levelNum);
    this.updateControls();
  }

  updateControls() {
    const other = this.charId === 'maria' ? 'victor' : 'maria';
    this.app.setControls({ show: true, swap: true, swapIcon: this.app.sheets[other] });
  }

  swap() {
    const p = this.player;
    if (p.dead || this.state !== 'play') return;
    this.charId = this.charId === 'maria' ? 'victor' : 'maria';
    p.swapTo(this.charId, this.app.sheets[this.charId]);
    audio.sfx('swap');
    this.particles.sparkle(p.cx, p.cy, 10, '#ffd98a'); this.particles.burstHearts(p.cx, p.y, 4, '#ff9ac4');
    save.data.character = this.charId; save.commit();
    this.updateControls();
  }

  get totalHearts() { return this.hearts.length; }

  // ------------------------------------------------------------------ lógica
  update(dt) {
    if (!this.ready) return;
    if (input.consumePause()) this.togglePause();
    if (this.paused) return;
    this.time += dt;
    this.eggT = Math.max(0, this.eggT - dt); if (!this.eggT) this.eggTaps = 0;
    this.eggMsg = Math.max(0, this.eggMsg - dt);
    this.banner = Math.max(0, this.banner - dt);
    this.iris += (this.irisTarget - this.iris) * Math.min(1, 6 * dt) + Math.sign(this.irisTarget - this.iris) * 0.4 * dt;
    if (Math.abs(this.irisTarget - this.iris) < 0.02) this.iris = this.irisTarget;
    this.particles.update(dt);

    if (this.state === 'complete') { this.endT += dt; if (this.endT > 1 && input.consumeJump()) this.finish(); return; }
    if (this.state === 'dying') {
      this.dyingT -= dt;
      if (this.dyingT <= 0) {
        this.player.respawn(this.spawn.x, this.spawn.y);
        this.cam.snap(this.player, this.map, view.W, view.H);
        this.irisTarget = 1; this.state = 'play';
      }
      return;
    }
    this.updatePlay(dt);
  }

  updatePlay(dt) {
    const p = this.player, map = this.map;
    if (input.consumeSwap()) this.swap();
    p.update(dt, input, map, {
      onJump: (k) => { audio.sfx(k === 'air' ? 'jump2' : 'jump'); this.particles.dust(p.cx, p.y + p.h, k === 'air' ? 5 : 3); if (k === 'air') this.particles.sparkle(p.cx, p.y + p.h, 5); },
      onLand: (v) => { if (v > 140) { audio.sfx('land'); this.particles.dust(p.cx, p.y + p.h, 4); } },
      onGlideStart: () => audio.sfx('glide'),
      onBreak: (tx, ty) => { map.setTile(tx, ty, '.'); audio.sfx('break'); this.particles.debris(tx * TILE + 8, ty * TILE + 8, '#d9a05c'); this.particles.burstHearts(tx * TILE + 8, ty * TILE + 8, 4); },
    });
    if (p.gliding && Math.random() < 0.4) this.particles.add({ kind: 'spark', x: p.cx + (Math.random() - 0.5) * 12, y: p.y + 6, vy: 10, life: 0.5, color: '#ffd0e0' });

    for (const e of this.enemies) e.update(dt, map);

    // corazones
    for (const h of this.hearts) {
      if (h.got) continue;
      if (Math.abs(h.x - p.cx) < 9 && Math.abs(h.y - p.cy) < 11) {
        h.got = true; this.collected++;
        audio.sfx('heart'); this.particles.burstHearts(h.x, h.y, 5); this.particles.sparkle(h.x, h.y, 6);
      }
    }
    // checkpoints
    for (const c of this.checkpoints) {
      if (!c.on && Math.abs(c.tx * TILE + 8 - p.cx) < 12 && Math.abs((c.ty + 1) * TILE - (p.y + p.h)) < 20) {
        c.on = true; this.spawn = { x: c.tx * TILE + 3, y: (c.ty + 1) * TILE - 16 };
        audio.sfx('checkpoint'); this.particles.burstHearts(c.tx * TILE + 8, c.ty * TILE - 6, 8, '#ff9ac4');
      }
    }
    // espinas de rosa
    const x0 = Math.floor(p.x / TILE), x1 = Math.floor((p.x + p.w) / TILE), y0 = Math.floor(p.y / TILE), y1 = Math.floor((p.y + p.h) / TILE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (map.isHazard(tx, ty) && overlaps(p, { x: tx * TILE + 2, y: ty * TILE + 8, w: 12, h: 8 })) this.hurt();
    }
    // enemigos: pisar = amistoso "poof"; tocar de lado = vuelves al checkpoint
    for (const e of this.enemies) {
      if (!e.alive || p.dead || !overlaps(p, e)) continue;
      if (p.vy > 20 && (p.y + p.h) - e.y < 9) {
        e.alive = false; p.vy = input.jump ? -250 : -170; p.sy = 0.8; p.sx = 1.2;
        audio.sfx('stomp'); this.particles.burstHearts(e.x + e.w / 2, e.y, 4, '#ffb0d0'); this.particles.sparkle(e.x + e.w / 2, e.y + 4, 5);
      } else this.hurt();
    }
    this.enemies = this.enemies.filter(e => e.alive);
    // caída al vacío
    if (p.y > map.pxH + 24) this.hurt(true);
    // carteles
    this.sign = null;
    for (const s of this.signs) {
      if (Math.abs(s.tx * TILE + 8 - p.cx) < 24 && Math.abs((s.ty + 1) * TILE - (p.y + p.h)) < 24) { this.sign = s; break; }
    }
    // meta
    if (this.goal && Math.abs(this.goal.tx * TILE + 8 - p.cx) < 10 && Math.abs((this.goal.ty + 1) * TILE - (p.y + p.h)) < 22) this.complete();

    // ambiente: pétalos / corazoncitos flotando
    if (Math.random() < 0.06) {
      this.particles.add({ kind: Math.random() < 0.3 ? 'heart' : 'petal', x: this.cam.x + Math.random() * view.W, y: this.cam.y - 4,
        vx: -8 - Math.random() * 10, vy: 12 + Math.random() * 12, life: 8, sway: Math.random() * 6,
        color: Math.random() < 0.3 ? '#ff9ac4' : this.theme.petal });
    }
    this.cam.follow(p, map, view.W, view.H, dt);
  }

  hurt(fall = false) {
    const p = this.player;
    if (p.dead || p.invuln > 0 || this.state !== 'play') return;
    p.dead = true; p.hidden = false; this.state = 'dying'; this.dyingT = 0.75;
    audio.sfx('hurt'); this.cam.shake(fall ? 0 : 3);
    this.particles.burstHearts(p.cx, Math.min(p.cy, this.map.pxH - 6), 7, '#ffd0e0');
    this.irisTarget = 0; this.irisCx = p.cx - this.cam.x; this.irisCy = Math.min(p.cy, this.map.pxH - 10) - this.cam.y;
  }

  complete() {
    if (this.state !== 'play') return;
    this.state = 'complete'; this.endT = 0;
    audio.sfx('win'); audio.stopMusic();
    const ids = this.hearts.filter(h => h.got).map(h => h.id);
    this.savedHearts = save.addHearts(this.levelNum, ids);
    this.allHearts = this.savedHearts.length >= this.totalHearts;
    const d = save.data; d.done[this.levelNum] = true; d.unlocked = Math.max(d.unlocked, this.levelNum + 1);
    if (this.allHearts) d.memories[this.levelNum] = true;
    save.commit();
    this.particles.burstHearts(this.player.cx, this.player.cy, 14, '#ff6f9c');
    this.player.vx = 0;
  }

  finish() { this.app.levelFinished(this); }

  togglePause() {
    if (this.state !== 'play' && !this.paused) return;
    this.paused = !this.paused; input.clear(); audio.sfx('select');
  }

  pauseButtons() {
    const W = view.W;
    return [{ id: 'resume', y: 70, label: 'Continuar' }, { id: 'map', y: 96, label: 'Mapa de niveles' }]
      .map((b) => ({ ...b, x: Math.round(W / 2 - 70), w: 140, h: 22 }));
  }

  onPointer(x, y) {
    if (this.paused) {
      for (const b of this.pauseButtons()) {
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          if (b.id === 'resume') this.togglePause(); else { audio.stopMusic(); this.app.openMap(this.levelNum); }
        }
      }
      return;
    }
    if (this.state === 'complete' && this.endT > 1) { this.finish(); return; }
    // easter egg: tocar varias veces al personaje
    const p = this.player, px = p.cx - this.cam.x, py = p.cy - this.cam.y;
    if (Math.abs(x - px) < 16 && Math.abs(y - py) < 18) {
      this.eggTaps++; this.eggT = 2.2; p.sy = 0.75; p.sx = 1.2;
      this.particles.burstHearts(p.cx, p.y, 2, '#ff9ac4');
      if (this.eggTaps >= 7) {
        this.eggTaps = 0; this.eggMsg = 4.5; audio.sfx('egg');
        this.particles.burstHearts(p.cx, p.cy, 24, '#ff5d8f'); this.particles.sparkle(p.cx, p.cy, 16);
        save.data.egg = true; save.commit();
      }
    }
  }

  // ------------------------------------------------------------------ dibujo
  draw(ctx) {
    const W = view.W, H = view.H;
    if (!this.ready) { ctx.fillStyle = '#2b1538'; ctx.fillRect(0, 0, W, H); return; }
    const cam = this.cam, cx = cam.ix, cy = cam.iy, map = this.map, t = this.time;
    this.bg.draw(ctx, cx, cy, W, H, t);
    map.drawDecor(ctx, cx, cy, W, H);
    map.drawTiles(ctx, cx, cy, W, H);

    for (const s of this.signs) ctx.drawImage(this.spr.sign, s.tx * TILE - cx, (s.ty + 1) * TILE - 18 - cy);
    for (const c of this.checkpoints) {
      const f = c.on ? 1 + (Math.floor(t * 5) % 2) : 0;
      ctx.drawImage(this.spr.checkpoint, f * 16, 0, 16, 26, c.tx * TILE - cx, (c.ty + 1) * TILE - 26 - cy, 16, 26);
    }
    if (this.goal) {
      const f = Math.floor(t * 3) % 2, g = this.goal;
      ctx.drawImage(this.spr.goal, f * 26, 0, 26, 36, g.tx * TILE - 5 - cx, (g.ty + 1) * TILE - 36 - cy, 26, 36);
    }
    for (const h of this.hearts) {
      if (h.got) continue;
      const bob = Math.sin(t * 3 + h.id) * 2;
      const s = 1 + (Math.sin(t * 6 + h.id) > 0.8 ? 0.15 : 0);
      ctx.save(); ctx.translate(Math.round(h.x - cx), Math.round(h.y + bob - cy)); ctx.scale(s, s);
      ctx.drawImage(this.spr.heart, -4.5, -4);
      ctx.restore();
    }
    for (const e of this.enemies) e.draw(ctx, this.spr[e.kind], cx, cy);
    this.player.draw(ctx, cx, cy);
    this.particles.draw(ctx, cx, cy);

    this.drawSignBubble(ctx, cx, cy);
    this.drawHud(ctx);
    if (this.iris < 0.995) this.drawIris(ctx);
    if (this.state === 'complete') this.drawComplete(ctx);
    if (this.paused) this.drawPause(ctx);
  }

  drawPause(ctx) {
    const W = view.W, H = view.H;
    ctx.fillStyle = 'rgba(29,16,38,0.75)'; ctx.fillRect(0, 0, W, H);
    drawText(ctx, 'Pausa', W / 2, 40, { align: 'center', size: 12, color: '#ffd98a' });
    for (const b of this.pauseButtons()) {
      drawBox(ctx, b.x, b.y, b.w, b.h, { fill: '#3a2350', border: '#ff9ac4' });
      drawText(ctx, b.label, b.x + b.w / 2, b.y + 7, { align: 'center', size: 8 });
    }
  }

  drawSignBubble(ctx, cx, cy) {
    const s = this.sign;
    if (!s) return;
    const text = this.def.signs[s.key]; if (!text) return;
    const lines = wrapText(ctx, text, 200);
    const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 12, h = lines.length * 12 + 6;
    const sx = s.tx * TILE + 8 - cx, top = (s.ty + 1) * TILE - 18 - cy - h - 6;
    const x = Math.max(4, Math.min(view.W - w - 4, sx - w / 2));
    drawBox(ctx, x, top, w, h, { tail: Math.max(x + 6, Math.min(x + w - 6, sx)) });
    lines.forEach((l, i) => drawText(ctx, l, x + 6, top + 4 + i * 12, { color: '#5a3426', shadow: null }));
  }

  drawHud(ctx) {
    const sf = view.safe, x0 = 6 + sf.l, y0 = 5 + sf.t;
    drawPattern(ctx, HEART_7, { X: '#ff5d8f', L: '#ffc2d6' }, x0, y0 + 1);
    drawText(ctx, `${this.collected}/${this.totalHearts}`, x0 + 11, y0, { size: 8 });
    drawText(ctx, this.player.def.name, x0, y0 + 13, { size: 8, color: '#ffd98a' });
    if (this.banner > 0) {
      const a = Math.min(1, this.banner, (3.4 - this.banner) * 2);
      ctx.globalAlpha = a;
      drawText(ctx, `NIVEL ${this.levelNum}`, view.W / 2, 30, { align: 'center', size: 8, color: '#ffd98a' });
      drawText(ctx, this.def.name, view.W / 2, 44, { align: 'center', size: 8 });
      const sub = wrapText(ctx, this.def.subtitle, view.W - 40);
      drawLines(ctx, sub, view.W / 2, 60, { align: 'center', size: 8, color: '#ffe9f0' });
      ctx.globalAlpha = 1;
    }
    if (this.eggMsg > 0) {
      const lines = wrapText(ctx, this.app.story.easterEgg, 220);
      const w = 236, h = lines.length * 12 + 10, x = (view.W - w) / 2, y = 24;
      drawBox(ctx, x, y, w, h, { fill: '#ffe0ec', border: '#c23a6e' });
      lines.forEach((l, i) => drawText(ctx, l, view.W / 2, y + 6 + i * 12, { align: 'center', color: '#a02255', shadow: null }));
    }
  }

  drawIris(ctx) {
    const W = view.W, H = view.H;
    const p = this.player;
    const cx = this.state === 'dying' && this.irisCx != null ? this.irisCx : p.cx - this.cam.x;
    const cy = this.state === 'dying' && this.irisCy != null ? this.irisCy : p.cy - this.cam.y;
    const s = Math.max(0.001, this.iris) * 260;
    ctx.save();
    ctx.fillStyle = '#1d1026';
    ctx.beginPath(); ctx.rect(0, 0, W, H);
    ctx.translate(cx, cy); heartPath(ctx, s, false);
    ctx.fill('evenodd');
    ctx.restore();
  }

  drawComplete(ctx) {
    const W = view.W, H = view.H;
    const a = Math.min(1, this.endT * 1.5);
    ctx.globalAlpha = 0.72 * a; ctx.fillStyle = '#1d1026'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a;
    drawText(ctx, '¡Nivel completado!', W / 2, 40, { align: 'center', size: 12, color: '#ffd98a' });
    drawText(ctx, this.def.name, W / 2, 62, { align: 'center' });
    drawPattern(ctx, HEART_7, { X: '#ff5d8f', L: '#ffc2d6' }, W / 2 - 34, 84);
    drawText(ctx, `${this.collected} / ${this.totalHearts}`, W / 2 - 20, 83, { size: 10 });
    if (this.allHearts) drawText(ctx, '¡Has conseguido un recuerdo!', W / 2, 106, { align: 'center', color: '#ff9ac4' });
    if (this.endT > 1 && Math.floor(this.endT * 2) % 2 === 0) drawText(ctx, 'Toca para continuar', W / 2, 140, { align: 'center', size: 8 });
    ctx.globalAlpha = 1;
  }
}
