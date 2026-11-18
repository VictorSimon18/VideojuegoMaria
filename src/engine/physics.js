// Física de plataformas: movimiento por ejes con colisión contra tiles.
// Un "cuerpo" es cualquier objeto con { x, y, w, h, vx, vy }.
import { TILE } from './constants.js';

/**
 * Mueve un cuerpo `dt` segundos y resuelve colisiones con el mapa.
 * Resultado en el propio cuerpo: onGround, wall (-1/0/1), ceilTiles (tiles golpeados por arriba).
 */
export function moveBody(b, map, dt) {
  // ---- Eje X ----
  b.x += b.vx * dt;
  b.wall = 0;
  if (b.vx !== 0) {
    const y0 = Math.floor(b.y / TILE), y1 = Math.floor((b.y + b.h - 0.01) / TILE);
    if (b.vx > 0) {
      const tx = Math.floor((b.x + b.w - 0.001) / TILE);
      for (let ty = y0; ty <= y1; ty++) {
        if (map.isSolid(tx, ty)) { b.x = tx * TILE - b.w; b.vx = 0; b.wall = 1; break; }
      }
    } else {
      const tx = Math.floor(b.x / TILE);
      for (let ty = y0; ty <= y1; ty++) {
        if (map.isSolid(tx, ty)) { b.x = (tx + 1) * TILE; b.vx = 0; b.wall = -1; break; }
      }
    }
  }

  // ---- Eje Y ----
  const prevBottom = b.y + b.h;
  b.y += b.vy * dt;
  b.onGround = false;
  b.ceilTiles = null;
  const x0 = Math.floor((b.x + 0.01) / TILE), x1 = Math.floor((b.x + b.w - 0.01) / TILE);
  if (b.vy >= 0) {
    const ty = Math.floor((b.y + b.h) / TILE);
    for (let tx = x0; tx <= x1; tx++) {
      const solid = map.isSolid(tx, ty);
      const oneWay = !solid && map.isOneWay(tx, ty) && prevBottom <= ty * TILE + 0.01 && !b.dropThrough;
      if (solid || oneWay) {
        b.y = ty * TILE - b.h; b.vy = 0; b.onGround = true; break;
      }
    }
  } else {
    const ty = Math.floor(b.y / TILE);
    let hit = null;
    for (let tx = x0; tx <= x1; tx++) {
      if (map.isSolid(tx, ty)) { (hit ||= []).push({ tx, ty }); }
    }
    if (hit) { b.y = (ty + 1) * TILE; b.vy = 0; b.ceilTiles = hit; }
  }
}

/** Solape AABB entre dos rectángulos {x,y,w,h}. */
export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
