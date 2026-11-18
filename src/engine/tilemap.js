// Mapa de tiles: parseo de niveles en ASCII, consultas de colisión y capas pre-renderizadas.
//
// Leyenda (ver README):
//   .  aire              #  suelo (hierba/tierra automática)   X  ladrillo sólido
//   b  caja rompible     =  plataforma de nube (se atraviesa por abajo)   ^  espinas de rosa (peligro suave)
//   S  inicio   o  corazón   c  checkpoint   e  bichito paseante   f  bichito volador   G  meta
//   1-9 cartel con texto (story.js)   T árbol  h arbusto  w flores  l farola  (decoración)
import { TILE } from './constants.js';
import { makeCanvas } from '../art/pixel.js';

const SOLID = new Set(['#', 'X', 'b']);
const ENTITY = new Set(['S', 'o', 'c', 'e', 'f', 'G', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'v', 'p']);
const DECOR = new Set(['T', 'h', 'w', 'l', 'k']);
const TILES = new Set(['.', ' ', '#', 'X', 'b', '=', '^']);

/** Une varios "chunks" (trozos de nivel) horizontalmente en un solo array de filas. */
export function joinChunks(chunks) {
  const H = chunks[0].length;
  const rows = Array.from({ length: H }, () => '');
  chunks.forEach((c, i) => {
    if (c.length !== H) throw new Error(`Chunk ${i}: tiene ${c.length} filas, se esperaban ${H}`);
    for (let y = 0; y < H; y++) rows[y] += c[y];
  });
  return rows;
}

/** Crea un chunk: `top` son las filas superiores (se rellenan con '.' hasta el ancho del suelo),
 *  `ground` es el patrón de las 4 filas inferiores. */
export function chunk(top, ground) {
  const w = ground.length;
  const pad = (r, i) => {
    if (r.length > w) throw new Error(`Fila ${i} del chunk mide ${r.length} y el suelo ${w}: "${r}"`);
    return r.padEnd(w, '.');
  };
  return [...top.map(pad), ground, ground, ground, ground];
}

export class TileMap {
  constructor(rows) {
    this.H = rows.length;
    this.W = rows[0].length;
    this.t = [];            // t[y][x] -> carácter de tile
    this.spawns = [];       // entidades: {ch, tx, ty}
    this.decor = [];        // decoración: {ch, tx, ty}
    for (let y = 0; y < this.H; y++) {
      if (rows[y].length !== this.W) throw new Error(`Fila ${y} del nivel mide ${rows[y].length}, se esperaba ${this.W}`);
      const line = [];
      for (let x = 0; x < this.W; x++) {
        const ch = rows[y][x];
        if (ENTITY.has(ch)) { this.spawns.push({ ch, tx: x, ty: y }); line.push('.'); }
        else if (DECOR.has(ch)) { this.decor.push({ ch, tx: x, ty: y }); line.push('.'); }
        else if (TILES.has(ch)) line.push(ch === ' ' ? '.' : ch);
        else throw new Error(`Carácter desconocido "${ch}" en columna ${x}, fila ${y}`);
      }
      this.t.push(line);
    }
    this.pxW = this.W * TILE;
    this.pxH = this.H * TILE;
  }

  get(tx, ty) {
    if (tx < 0 || tx >= this.W) return '#';        // paredes laterales del nivel
    if (ty < 0 || ty >= this.H) return '.';
    return this.t[ty][tx];
  }
  isSolid(tx, ty) { return SOLID.has(this.get(tx, ty)); }
  isOneWay(tx, ty) { return this.get(tx, ty) === '='; }
  isHazard(tx, ty) { return this.get(tx, ty) === '^'; }

  setTile(tx, ty, ch) {
    if (tx < 0 || tx >= this.W || ty < 0 || ty >= this.H) return;
    this.t[ty][tx] = ch;
    this.redraw(tx - 1, ty - 1, 3, 3);
  }

  /** Pre-renderiza las capas de tiles y decoración en canvas grandes (rápido en móvil). */
  build(tileset, paintDecor) {
    this.tileset = tileset;
    this.layer = makeCanvas(this.pxW, this.pxH);
    this.decorLayer = makeCanvas(this.pxW, this.pxH);
    this.redraw(0, 0, this.W, this.H);
    const dg = this.decorLayer.getContext('2d');
    dg.imageSmoothingEnabled = false;
    for (const d of this.decor) paintDecor(dg, d.ch, d.tx, d.ty, this);
  }

  redraw(tx0, ty0, w, h) {
    const g = this.layer.getContext('2d');
    for (let ty = Math.max(0, ty0); ty < Math.min(this.H, ty0 + h); ty++) {
      for (let tx = Math.max(0, tx0); tx < Math.min(this.W, tx0 + w); tx++) {
        g.clearRect(tx * TILE, ty * TILE, TILE, TILE);
        const spr = this.tileset.pick(this, tx, ty);
        if (spr) g.drawImage(spr, tx * TILE, ty * TILE);
      }
    }
  }

  drawDecor(ctx, camX, camY, W, H) { this._slice(ctx, this.decorLayer, camX, camY, W, H); }
  drawTiles(ctx, camX, camY, W, H) { this._slice(ctx, this.layer, camX, camY, W, H); }

  _slice(ctx, layer, camX, camY, W, H) {
    const sx = Math.max(0, camX), sy = Math.max(0, camY);
    const sw = Math.min(W - (sx - camX), this.pxW - sx), sh = Math.min(H - (sy - camY), this.pxH - sy);
    if (sw > 0 && sh > 0) ctx.drawImage(layer, sx, sy, sw, sh, sx - camX, sy - camY, sw, sh);
  }
}
