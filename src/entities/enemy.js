// Enemigos suaves y simpáticos: bichito paseante y mariposa voladora.
import { moveBody } from '../engine/physics.js';

/** Bichito que pasea por el suelo y da la vuelta en paredes y bordes. */
export class Blob {
  constructor(tx, ty) {
    this.w = 12; this.h = 10;
    this.x = tx * 16 + 2; this.y = (ty + 1) * 16 - this.h;
    this.vx = -22; this.vy = 0; this.t = Math.random() * 3; this.alive = true;
    this.kind = 'blob';
  }
  update(dt, map) {
    this.t += dt;
    this.vy = Math.min(300, this.vy + 900 * dt);
    const dir = Math.sign(this.vx) || 1;
    moveBody(this, map, dt);
    if (this.wall) this.vx = -dir * 22;
    else if (this.onGround) {
      const aheadX = Math.floor((this.x + (dir > 0 ? this.w + 1 : -1)) / 16);
      const feetY = Math.floor((this.y + this.h + 2) / 16);
      if (!map.isSolid(aheadX, feetY) && !map.isOneWay(aheadX, feetY)) this.vx = -dir * 22;
    }
    if (this.vx === 0) this.vx = -dir * 22;
  }
  draw(ctx, spr, camX, camY) {
    const f = Math.floor(this.t * 5) % 2;
    const cx = Math.round(this.x + this.w / 2 - camX), by = Math.round(this.y + this.h - camY);
    ctx.save(); ctx.translate(cx, by); ctx.scale(this.vx > 0 ? 1 : -1, 1);
    ctx.drawImage(spr, f * 14, 0, 14, 13, -7, -12, 14, 13);
    ctx.restore();
  }
}

/** Mariposa que flota en vertical (sin perseguir, solo adorno con roce suave). */
export class Flyer {
  constructor(tx, ty) {
    this.w = 10; this.h = 8;
    this.baseX = tx * 16 + 3; this.baseY = ty * 16 + 4;
    this.x = this.baseX; this.y = this.baseY; this.t = Math.random() * 6; this.alive = true;
    this.kind = 'flyer';
  }
  update(dt) {
    this.t += dt;
    this.x = this.baseX + Math.sin(this.t * 1.3) * 26;
    this.y = this.baseY + Math.sin(this.t * 2.2) * 8;
    this.dir = Math.cos(this.t * 1.3) >= 0 ? 1 : -1;
  }
  draw(ctx, spr, camX, camY) {
    const f = Math.floor(this.t * 8) % 2;
    ctx.drawImage(spr, f * 14, 0, 14, 12, Math.round(this.x - 2 - camX), Math.round(this.y - 2 - camY), 14, 12);
  }
}
