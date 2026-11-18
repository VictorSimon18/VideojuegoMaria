// Prueba con Playwright (WebKit, emulación de iPhone en horizontal). Guarda capturas en tests/out/.
//   npm test            (o)   node tests/run.mjs
import { webkit, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out');
fs.mkdirSync(out, { recursive: true });
const { server, port } = await startServer(0);
const url = `http://127.0.0.1:${port}/`;
const browser = await webkit.launch();
const errors = [];
let failed = 0;
const check = (cond, msg) => { console.log((cond ? 'OK   ' : 'FALLA'), msg); if (!cond) failed++; };

const ctx = await browser.newContext({ ...devices['iPhone 14 landscape'] });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(url);
await page.waitForFunction(() => window.__maria && window.__maria.app.scene && window.__maria.app.scene.ready);
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, '01-titulo.png') });

// Toque para empezar
await page.touchscreen.tap(400, 200);
await page.waitForFunction(() => (() => { const s = window.__maria.app.scene; return !!s && s.constructor.name === 'GameScene' && s.ready; })(), null, { timeout: 8000 });
await page.waitForTimeout(1800);
await page.screenshot({ path: path.join(out, '02-nivel1-inicio.png') });

// Multitouch simulado con eventos de puntero sobre los botones reales
const press = (sel, id, type) => page.evaluate(([s, i, t]) => {
  const el = document.querySelector(s), r = el.getBoundingClientRect();
  el.dispatchEvent(new PointerEvent(t, { pointerId: i, clientX: r.left + r.width * (s === '#dpad' ? 0.85 : 0.5), clientY: r.top + r.height / 2, bubbles: true, pointerType: 'touch', isPrimary: false }));
}, [sel, id, type]);

const state = () => page.evaluate(() => { const p = window.__maria.app.scene.player; return { x: p.x, y: p.y, onGround: p.onGround, vy: p.vy, anim: p.anim }; });
const s0 = await state();
await press('#dpad', 11, 'pointerdown');
await page.waitForTimeout(900);
const s1 = await state();
check(s1.x > s0.x + 30, `andar a la derecha con la cruceta táctil (${s0.x.toFixed(0)} -> ${s1.x.toFixed(0)})`);
await press('#btn-jump', 12, 'pointerdown');     // saltar mientras se mueve
await page.waitForTimeout(150);
const s2 = await state();
check(!s2.onGround && s2.y < s1.y - 4, 'saltar a la vez que se mueve (multitouch)');
await page.waitForTimeout(150);
await page.screenshot({ path: path.join(out, '03-saltando.png') });
await press('#btn-jump', 12, 'pointerup');
await press('#dpad', 11, 'pointerup');
await page.waitForTimeout(700);

// Capturas a lo largo del nivel (teletransporte)
const W = await page.evaluate(() => window.__maria.app.scene.map.W);
const marks = [0.0, 0.18, 0.30, 0.42, 0.55, 0.70, 0.82, 0.96];
let i = 4;
for (const m of marks) {
  await page.evaluate((frac) => {
    const sc = window.__maria.app.scene, map = sc.map;
    const tx = Math.floor(map.W * frac);
    // busca una columna con suelo y coloca al jugador encima
    let ty = 0; while (ty < map.H && !map.isSolid(tx, ty)) ty++;
    sc.player.respawn(tx * 16 + 3, ty * 16 - 16 - 1); sc.player.invuln = 5;
    sc.cam.snap(sc.player, map, window.__maria.view.W, window.__maria.view.H);
    sc.banner = 0;
  }, m);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, `${String(i++).padStart(2, '0')}-nivel1-${Math.round(m * 100)}.png`) });
}
check(W > 200, `el nivel 1 mide ${W} tiles de ancho`);

// Meta: completar el nivel
await page.evaluate(() => { const sc = window.__maria.app.scene; sc.complete(); });
await page.waitForTimeout(1600);
await page.screenshot({ path: path.join(out, '12-nivel-completado.png') });

// Vertical: aviso de girar el móvil
const ctx2 = await browser.newContext({ ...devices['iPhone 14'] });
const p2 = await ctx2.newPage();
await p2.goto(url);
await p2.waitForTimeout(800);
await p2.screenshot({ path: path.join(out, '13-vertical-aviso.png') });
check(await p2.evaluate(() => getComputedStyle(document.getElementById('rotate')).display === 'flex'), 'aviso de "gira el móvil" en vertical');

check(errors.length === 0, `sin errores de consola${errors.length ? ': ' + errors.join(' | ') : ''}`);
await browser.close(); server.close();
console.log(failed ? `\n${failed} comprobación(es) fallida(s)` : '\nTodo correcto');
process.exit(failed ? 1 : 0);
