// Cámara suave que sigue al jugador con "lookahead" y límites del nivel.
export class Camera {
  constructor() { this.x = 0; this.y = 0; this.shakeT = 0; this.shakeA = 0; this.sx = 0; this.sy = 0; }

  snap(target, map, W, H) {
    this.x = this._clampX(target.cx - W / 2, map, W);
    this.y = this._clampY(target.cy - H * 0.55, map, H);
  }

  follow(target, map, W, H, dt) {
    const k = 1 - Math.exp(-5 * dt);
    const tx = this._clampX(target.cx + target.face * 26 - W / 2, map, W);
    const ty = this._clampY(target.cy - H * 0.55, map, H);
    this.x += (tx - this.x) * k;
    this.y += (ty - this.y) * (1 - Math.exp(-3.5 * dt));
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const a = this.shakeA * Math.max(0, this.shakeT / 0.3);
      this.sx = (Math.random() - 0.5) * 2 * a; this.sy = (Math.random() - 0.5) * 2 * a;
    } else { this.sx = this.sy = 0; }
  }

  shake(a = 3) { this.shakeA = a; this.shakeT = 0.3; }

  _clampX(x, map, W) { return Math.max(0, Math.min(map.pxW - W, x)); }
  _clampY(y, map, H) {
    const max = map.pxH - H;
    return max <= 0 ? max / 2 : Math.max(0, Math.min(max, y));
  }

  /** Posición entera de dibujo (evita costuras entre tiles). */
  get ix() { return Math.round(this.x + this.sx); }
  get iy() { return Math.round(this.y + this.sy); }
}
