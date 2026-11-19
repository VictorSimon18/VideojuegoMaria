// Aparatos de los niveles: plataformas móviles, hojas/estrellas que caen, bloques al ritmo y muelles.
// Las plataformas se comportan como "nubes": se pisan desde arriba y se atraviesan desde abajo.
// Cada una expone {x, y, w, h, active, dx, dy}; el jugador las usa en Player.update (ver `platforms`).

/** Ritmo compartido de los bloques r/R (segundos). A está activo [0, aOn); B desde bFrom hasta el final. */
export const BEAT = { period: 2.6, aOn: 1.5, bFrom: 1.1, warn: 0.4 };

class Platform {
  constructor(x, y, w, h, kind) {
    Object.assign(this, { x, y, w, h, kind, active: true, dx: 0, dy: 0 });
  }
  touch() {}
  update() {}
}

/** Barca / ascensor: se mueve en seno alrededor de su posición inicial. */
export class Mover extends Platform {
  constructor(tx, ty, vertical) {
    super(tx * 16 + 8 - 16, ty * 16, 32, 8, vertical ? 'moverV' : 'moverH');
    this.vertical = vertical; this.x0 = this.x; this.y0 = this.y;
    this.amp = 40; this.speed = 1.1; this.phase = tx * 0.7;
    this.update(0, 0); this.dx = this.dy = 0;
  }
  update(dt, t) {
    const ox = this.x, oy = this.y, s = Math.sin(t * this.speed + this.phase) * this.amp;
    if (this.vertical) this.y = this.y0 + s; else this.x = this.x0 + s;
    this.dx = this.x - ox; this.dy = this.y - oy;
  }
}

/** Hoja (parque) o estrella (final): tiembla al pisarla, cae y reaparece. */
export class Crumble extends Platform {
  constructor(tx, ty) {
    super(tx * 16 + 8 - 16, ty * 16, 32, 6, 'crumble');
    this.homeY = this.y; this.state = 'idle'; this.timer = 0; this.vy = 0; this.shake = 0; this.appear = 0;
  }
  touch() { if (this.state === 'idle') { this.state = 'shake'; this.timer = 0.55; } }
  update(dt) {
    this.dx = this.dy = 0;
    if (this.appear > 0) this.appear = Math.max(0, this.appear - dt);
    if (this.state === 'shake') {
      this.timer -= dt; this.shake = Math.sin(this.timer * 70) * 1.2;
      if (this.timer <= 0) { this.state = 'fall'; this.active = false; this.vy = 0; this.timer = 0; this.shake = 0; }
    } else if (this.state === 'fall') {
      this.timer += dt; this.vy += 500 * dt; this.y += this.vy * dt;
      if (this.timer > 3) { this.state = 'idle'; this.y = this.homeY; this.active = true; this.vy = 0; this.appear = 0.45; }
    }
  }
}

/** Bloque que aparece y desaparece al ritmo de la música del nivel (grupo 'r' o 'R'). */
export class Rhythm extends Platform {
  constructor(tx, ty, group) {
    super(tx * 16, ty * 16, 16, 8, 'rhythm');
    this.group = group; this.warn = false;
    this.update(0, 0);
  }
  update(dt, t) {
    const p = t % BEAT.period;
    if (this.group === 'r') { this.active = p < BEAT.aOn; this.warn = this.active && p > BEAT.aOn - BEAT.warn; }
    else { this.active = p >= BEAT.bFrom; this.warn = this.active && p > BEAT.period - BEAT.warn; }
  }
}

/** Muelle (seta, altavoz o estrella): lanza al jugador hacia arriba al caer sobre él. */
export class Spring {
  constructor(tx, ty) { this.x = tx * 16 + 1; this.y = (ty + 1) * 16 - 8; this.w = 14; this.h = 8; this.squash = 0; }
  update(dt) { this.squash = Math.max(0, this.squash - dt); }
}

export const SPRING_V = 540;

/** Crea todos los aparatos a partir de los marcadores del mapa. */
export function buildGadgets(spawns) {
  const platforms = [], springs = [];
  for (const s of spawns) {
    if (s.ch === 'm') platforms.push(new Mover(s.tx, s.ty, false));
    else if (s.ch === 'M') platforms.push(new Mover(s.tx, s.ty, true));
    else if (s.ch === 'k') platforms.push(new Crumble(s.tx, s.ty));
    else if (s.ch === 'r' || s.ch === 'R') platforms.push(new Rhythm(s.tx, s.ty, s.ch));
    else if (s.ch === 'u') springs.push(new Spring(s.tx, s.ty));
  }
  return { platforms, springs };
}

/** Dibuja plataformas y muelles. `spr` viene de makeGadgetSprites. */
export function drawGadgets(ctx, spr, platforms, springs, camX, camY, t) {
  for (const p of platforms) {
    const x = Math.round(p.x - camX), y = Math.round(p.y - camY);
    if (x < -40 || x > 460) continue;
    if (p.kind === 'moverH' || p.kind === 'moverV') ctx.drawImage(spr.mover, x, y);
    else if (p.kind === 'crumble') {
      if (p.state === 'fall' && p.timer > 1.2) continue;
      ctx.globalAlpha = p.state === 'fall' ? Math.max(0, 1 - p.timer / 1.2) : (p.appear > 0 ? 1 - p.appear / 0.45 : 1);
      ctx.drawImage(spr.crumble, x + Math.round(p.shake || 0), y);
      ctx.globalAlpha = 1;
    } else if (p.kind === 'rhythm') {
      const img = spr.rhythm[p.group][p.active ? 'on' : 'off'];
      if (p.warn && Math.floor(t * 14) % 2 === 0) ctx.globalAlpha = 0.45;
      ctx.drawImage(img, x, y);
      ctx.globalAlpha = 1;
    }
  }
  for (const s of springs) {
    const img = s.squash > 0 ? spr.spring[1] : spr.spring[0];
    ctx.drawImage(img, Math.round(s.x - camX), Math.round(s.y + s.h - img.height - camY));
  }
}
