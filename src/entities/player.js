// Jugador: movimiento con "game feel" (coyote time, jump buffering, salto variable,
// aceleración y fricción suaves) y habilidades propias de cada personaje.
import { moveBody } from '../engine/physics.js';
import { CHAR_SHEET } from '../art/sprites.js';
import { audio } from '../audio/audio.js';

export const CHARACTERS = {
  maria: {
    id: 'maria', name: 'María Bailera',
    jumpV: 400, airJumps: 0, glide: true, breaks: false,
    desc: 'Salta más alto y planea',
  },
  victor: {
    id: 'victor', name: 'Víctor Simón',
    jumpV: 330, airJumps: 1, airJumpV: 320, glide: false, breaks: true,
    desc: 'Doble salto y rompe cajas',
  },
};

// Constantes de movimiento (px/s, px/s²)
const RUN = 96, ACCEL = 900, AIR_ACCEL = 650, FRICTION = 1100, AIR_FRICTION = 260, TURN_BOOST = 1.7;
const GRAVITY = 1000, FALL_MULT = 1.5, CUT_MULT = 2.6, MAX_FALL = 320;
const COYOTE = 0.1, BUFFER = 0.12;
const GLIDE_FALL = 36, GLIDE_MAX = 1.7, GLIDE_RUN = 108;

export class Player {
  constructor(charId, sheet) {
    this.w = 10; this.h = 16;
    this.sheet = sheet;
    this.setCharacter(charId);
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0;
    this.face = 1; this.onGround = false; this.wasGround = false;
    this.coyote = 0; this.buffer = 0; this.airJumps = 0; this.glideT = 0; this.gliding = false;
    this.anim = 'idle'; this.animT = 0; this.invuln = 0; this.dead = false;
    this.sx = 1; this.sy = 1;   // squash & stretch
    this.hidden = false;
  }

  setCharacter(id, sheet) {
    this.def = CHARACTERS[id]; this.id = id;
    if (sheet) this.sheet = sheet;
  }

  /** Cambia de personaje en el mismo punto, conservando posición y velocidad. */
  swapTo(id, sheet) {
    this.setCharacter(id, sheet);
    this.gliding = false; this.glideT = 0;
    this.airJumps = this.onGround ? this.def.airJumps : 0;
    this.sx = 1.3; this.sy = 0.8;
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  respawn(x, y) {
    this.x = x; this.y = y; this.vx = 0; this.vy = 0; this.dead = false;
    this.invuln = 1.2; this.gliding = false; this.glideT = 0; this.sx = this.sy = 1;
  }

  /** @param {object} fx callbacks: { onJump(kind), onLand(), onBreak(tx,ty), onGlideStart() } */
  update(dt, input, map, fx = {}) {
    if (this.dead) return;
    if (input.consumeJump()) this.buffer = BUFFER; else this.buffer = Math.max(0, this.buffer - dt);
    this.coyote = this.onGround ? COYOTE : Math.max(0, this.coyote - dt);
    if (this.onGround) { this.airJumps = this.def.airJumps; this.glideT = 0; }
    this.invuln = Math.max(0, this.invuln - dt);

    // ---- Horizontal ----
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const maxV = this.gliding ? GLIDE_RUN : RUN;
    if (dir !== 0) {
      this.face = dir;
      let a = this.onGround ? ACCEL : AIR_ACCEL;
      if (Math.sign(this.vx) === -dir) a *= TURN_BOOST;
      this.vx += dir * a * dt;
      if (Math.abs(this.vx) > maxV) this.vx = dir * Math.max(maxV, Math.abs(this.vx) - 1200 * dt);
    } else {
      const f = (this.onGround ? FRICTION : AIR_FRICTION) * dt;
      this.vx = Math.abs(this.vx) <= f ? 0 : this.vx - Math.sign(this.vx) * f;
    }

    // ---- Salto ----
    if (this.buffer > 0) {
      if (this.coyote > 0) {
        this.vy = -this.def.jumpV; this.buffer = 0; this.coyote = 0; this.onGround = false;
        this.sx = 0.8; this.sy = 1.25; fx.onJump && fx.onJump('ground');
      } else if (this.airJumps > 0) {
        this.vy = -(this.def.airJumpV || this.def.jumpV); this.buffer = 0; this.airJumps--;
        this.sx = 0.8; this.sy = 1.25; fx.onJump && fx.onJump('air');
      }
    }

    // ---- Gravedad, salto variable y planeo ----
    const wasGliding = this.gliding;
    this.gliding = false;
    if (this.def.glide && !this.onGround && this.vy > 0 && input.jump && this.glideT < GLIDE_MAX) {
      this.gliding = true; this.glideT += dt;
      this.vy += (GLIDE_FALL - this.vy) * Math.min(1, 12 * dt);
      if (!wasGliding && fx.onGlideStart) fx.onGlideStart();
    } else {
      let g = GRAVITY;
      if (this.vy > 0) g *= FALL_MULT;
      else if (!input.jump) g *= CUT_MULT;
      this.vy = Math.min(MAX_FALL, this.vy + g * dt);
    }

    // ---- Movimiento y colisión ----
    this.wasGround = this.onGround;
    const vyBefore = this.vy;
    moveBody(this, map, dt);
    if (this.onGround && !this.wasGround) {
      this.sx = 1.25; this.sy = 0.78; fx.onLand && fx.onLand(vyBefore);
    }
    if (this.ceilTiles && this.def.breaks && fx.onBreak) {
      // rompe la caja que queda más cerca del centro del jugador
      const boxes = this.ceilTiles.filter(t => map.get(t.tx, t.ty) === 'b');
      if (boxes.length) {
        boxes.sort((a, b) => Math.abs(a.tx * 16 + 8 - this.cx) - Math.abs(b.tx * 16 + 8 - this.cx));
        fx.onBreak(boxes[0].tx, boxes[0].ty);
      }
    }

    // ---- Animación ----
    let anim = 'idle';
    if (!this.onGround) anim = this.gliding ? 'glide' : (this.vy < 0 ? 'jump' : 'fall');
    else if (Math.abs(this.vx) > 8 && dir !== 0) anim = 'run';
    if (anim !== this.anim) { this.anim = anim; this.animT = 0; } else this.animT += dt;
    this.sx += (1 - this.sx) * Math.min(1, 14 * dt);
    this.sy += (1 - this.sy) * Math.min(1, 14 * dt);
  }

  draw(ctx, camX, camY) {
    if (this.hidden) return;
    if (this.invuln > 0 && Math.floor(this.invuln * 14) % 2 === 0) return; // parpadeo
    const { fw, fh, anims } = CHAR_SHEET;
    const a = anims[this.anim];
    const frame = a.n > 1 ? Math.floor(this.animT * a.fps) % a.n : 0;
    // el borde inferior del sprite coincide con el de la hitbox
    const cx = Math.round(this.x + this.w / 2 - camX), by = Math.round(this.y + this.h - camY);
    ctx.save();
    ctx.translate(cx, by);
    ctx.scale(this.face * this.sx, this.sy);
    ctx.drawImage(this.sheet, frame * fw, a.row * fh, fw, fh, -fw / 2, -fh, fw, fh);
    ctx.restore();
  }
}
