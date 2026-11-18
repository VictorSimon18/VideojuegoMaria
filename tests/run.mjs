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
const shot = (page, name) => page.screenshot({ path: path.join(out, name + '.png') });

const ctx = await browser.newContext({ ...devices['iPhone 14 landscape'] });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
const sceneName = () => page.evaluate(() => { const s = window.__maria.app.scene; return s && s.ready !== false ? s.constructor.name : null; });
const waitScene = (name) => page.waitForFunction((n) => { const s = window.__maria.app.scene; return !!s && s.constructor.name === n && s.ready !== false; }, name, { timeout: 10000 });

// ---------- Título y selección ----------
await page.goto(url);
await waitScene('TitleScene');
await page.waitForTimeout(600);
await shot(page, '01-titulo');
await page.touchscreen.tap(400, 200);
await waitScene('SelectScene');
await page.waitForTimeout(700);
await shot(page, '02-seleccion');

const cardCenter = (i) => page.evaluate((idx) => {
  const { app, view } = window.__maria, c = app.scene.card(idx), r = view.canvas.getBoundingClientRect();
  return { x: r.left + (c.x + c.w / 2) / view.W * r.width, y: r.top + (c.y + c.h / 2) / view.H * r.height };
}, i);
let c0 = await cardCenter(0);
await page.touchscreen.tap(c0.x, c0.y);
await waitScene('GameScene');
await page.waitForTimeout(1800);
check(await page.evaluate(() => window.__maria.app.scene.player.id) === 'maria', 'la tarjeta de María inicia el juego con María');
await shot(page, '03-nivel1-inicio');

// ---------- Controles táctiles (multitouch simulado sobre los botones reales) ----------
const press = (sel, id, type) => page.evaluate(([s, i, t]) => {
  const el = document.querySelector(s), r = el.getBoundingClientRect();
  el.dispatchEvent(new PointerEvent(t, { pointerId: i, clientX: r.left + r.width * (s === '#dpad' ? 0.85 : 0.5), clientY: r.top + r.height / 2, bubbles: true, pointerType: 'touch' }));
}, [sel, id, type]);
const state = () => page.evaluate(() => { const p = window.__maria.app.scene.player; return { x: p.x, y: p.y, onGround: p.onGround, id: p.id }; });
const s0 = await state();
await press('#dpad', 11, 'pointerdown');
await page.waitForTimeout(900);
const s1 = await state();
check(s1.x > s0.x + 30, `andar con la cruceta táctil (${s0.x.toFixed(0)} -> ${s1.x.toFixed(0)})`);
await press('#btn-jump', 12, 'pointerdown');
await page.waitForTimeout(150);
const s2 = await state();
check(!s2.onGround && s2.y < s1.y - 4, 'saltar a la vez que se mueve (multitouch)');
await press('#btn-jump', 12, 'pointerup'); await press('#dpad', 11, 'pointerup');
await page.waitForTimeout(800);

// ---------- Cambio de personaje en el mismo punto ----------
check(await page.evaluate(() => !document.getElementById('btn-swap').classList.contains('hidden')), 'el botón de cambio es visible en el nivel');
const before = await state();
await press('#btn-swap', 13, 'pointerdown'); await press('#btn-swap', 13, 'pointerup');
await page.waitForTimeout(300);
const after = await state();
check(after.id === 'victor' && Math.abs(after.x - before.x) < 3, `cambiar a Víctor sin moverse (x ${before.x.toFixed(0)} -> ${after.x.toFixed(0)})`);
await shot(page, '04-cambio-a-victor');

// ---------- Habilidades ----------
const setup = (id, tx, ty) => page.evaluate(([cid, tx, ty]) => {
  const sc = window.__maria.app.scene, p = sc.player;
  sc.charId = cid; p.swapTo(cid, window.__maria.app.sheets[cid]);
  p.respawn(tx * 16 + 3, ty * 16); p.invuln = 0; p.vx = 0; p.vy = 0; p.hidden = false; sc.state = 'play';
  sc.cam.snap(p, sc.map, window.__maria.view.W, window.__maria.view.H); sc.banner = 0;
}, [id, tx, ty]);
const keys = (o) => page.evaluate((o) => {
  const { input } = window.__maria;
  if ('jump' in o) { input.touch.jump = o.jump; if (o.jump) input.pressJump(); }
  if ('right' in o) input.touch.right = o.right;
  input.sync();
}, o);
const minY = async (ms) => { let m = 1e9; const t0 = Date.now(); while (Date.now() - t0 < ms) { m = Math.min(m, (await state()).y); await page.waitForTimeout(16); } return m; };

// salto simple (María) vs doble salto (Víctor)
await setup('maria', 4, 9);
await page.waitForTimeout(250);
const gy = (await state()).y;
await keys({ jump: true }); const hM = gy - await minY(700); await keys({ jump: false });
await page.waitForTimeout(500);
await setup('victor', 4, 9);
await page.waitForTimeout(250);
await keys({ jump: true });
await page.waitForTimeout(330); await keys({ jump: true });   // segundo salto en el aire
const hV = gy - await minY(800); await keys({ jump: false });
check(hM > 70, `María salta alto (${hM.toFixed(0)} px)`);
check(hV > hM + 10 || hV > 90, `Víctor con doble salto llega más arriba que su salto simple (${hV.toFixed(0)} px)`);
await page.waitForTimeout(500);

// hueco enorme: solo María planeando (hueco = tiles 150-158 del nivel 1)
const crossGap = async (id) => {
  await setup(id, 148, 9);
  await page.waitForTimeout(200);
  await keys({ right: true }); await keys({ jump: true });
  let maxX = 0; const t0 = Date.now();
  while (Date.now() - t0 < 3200) { maxX = Math.max(maxX, (await state()).x); await page.waitForTimeout(30); }
  await keys({ right: false, jump: false });
  return maxX;
};
const xM = await crossGap('maria');
check(xM > 159 * 16, `María cruza el hueco planeando (x máx ${xM.toFixed(0)} > ${159 * 16})`);
const xV = await crossGap('victor');
check(xV < 159 * 16, `Víctor NO puede cruzar el hueco (x máx ${xV.toFixed(0)})`);
await page.waitForTimeout(1500);

// caja en el techo (tile 202,4): solo Víctor la rompe
const tile = (tx, ty) => page.evaluate(([x, y]) => window.__maria.app.scene.map.get(x, y), [tx, ty]);
const jumpHold = async (ms) => { await keys({ jump: true }); await page.waitForTimeout(ms); await keys({ jump: false }); };
await setup('maria', 202, 5);     // sobre la nube alta (fila 6)
await page.waitForTimeout(300);
await shot(page, '05-zona-victor');
await jumpHold(700); await page.waitForTimeout(500);
check(await tile(202, 4) === 'b' && await tile(203, 4) === 'b', 'María NO rompe las cajas');
await setup('victor', 202, 5);
await page.waitForTimeout(300);
await jumpHold(600); await page.waitForTimeout(500);
check(await tile(202, 4) === '.', 'Víctor rompe la caja desde abajo');
await setup('victor', 203, 5); await page.waitForTimeout(300);
await jumpHold(600); await page.waitForTimeout(500);
check(await tile(203, 4) === '.', 'Víctor rompe también la segunda caja');
await setup('victor', 202, 5); await page.waitForTimeout(300);
await shot(page, '06-caja-rota');
await keys({ jump: true });
for (let k = 0; k < 150; k++) {   // sube y, en cuanto supera el tejado, avanza a la derecha (como haría un jugador)
  const st = await state();
  if (st.y < 60) await keys({ right: true });
  if (st.onGround && st.y < 60) break;
  await page.waitForTimeout(16);
}
await keys({ jump: false, right: false }); await page.waitForTimeout(300);
const up = await state();
check(up.y < 64, `Víctor sube por el hueco hasta el techo (y=${up.y.toFixed(0)})`);

// ---------- Capturas a lo largo del nivel ----------
const W = await page.evaluate(() => window.__maria.app.scene.map.W);
let i = 7;
for (const [id, tx] of [['maria', 20], ['victor', 60], ['maria', 100], ['maria', 146], ['victor', 196], ['victor', 232], ['maria', W - 14]]) {
  await page.evaluate(([cid, tx]) => {
    const sc = window.__maria.app.scene, map = sc.map, p = sc.player;
    sc.charId = cid; p.swapTo(cid, window.__maria.app.sheets[cid]);
    let ty = 0; while (ty < map.H && !map.isSolid(tx, ty)) ty++;
    p.respawn(tx * 16 + 3, ty * 16 - 17); p.invuln = 9; sc.state = 'play';
    sc.cam.snap(p, map, window.__maria.view.W, window.__maria.view.H); sc.banner = 0;
  }, [id, tx]);
  await page.waitForTimeout(450);
  await shot(page, `${String(i++).padStart(2, '0')}-nivel1-col${tx}-${id}`);
}
check(W > 250, `el nivel 1 mide ${W} tiles de ancho`);

await page.evaluate(() => { window.__maria.app.scene.complete(); });
await page.waitForTimeout(1600);
await shot(page, '15-nivel-completado');

// ---------- Vertical: aviso de girar el móvil ----------
const ctx2 = await browser.newContext({ ...devices['iPhone 14'] });
const p2 = await ctx2.newPage();
await p2.goto(url);
await p2.waitForTimeout(800);
await shot(p2, '16-vertical-aviso');
check(await p2.evaluate(() => getComputedStyle(document.getElementById('rotate')).display === 'flex'), 'aviso de "gira el móvil" en vertical');

check(errors.length === 0, `sin errores de consola${errors.length ? ': ' + errors.join(' | ') : ''}`);
await browser.close(); server.close();
console.log(failed ? `\n${failed} comprobación(es) fallida(s)` : '\nTodo correcto');
process.exit(failed ? 1 : 0);
