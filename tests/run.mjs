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
page.on('console', (m) => { if (m.type() === 'error' && !/status of 404/.test(m.text())) errors.push(m.text()); });
page.on('response', (r) => { if (r.status() === 404 && !/assets\/(memories\/|music\/_missing)/.test(r.url())) errors.push('404 ' + r.url()); });
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
await waitScene('MapScene');
await page.waitForTimeout(800);
await shot(page, '03-mapa');
const tapLogical = (x, y) => page.evaluate(([x, y]) => {
  const { view } = window.__maria, r = view.canvas.getBoundingClientRect();
  return { x: r.left + x / view.W * r.width, y: r.top + y / view.H * r.height };
}, [x, y]).then((c) => page.touchscreen.tap(c.x, c.y));
const playBtn = await page.evaluate(() => { const b = window.__maria.app.scene.buttons().find((b) => b.id === 'play'); return [b.x + b.w / 2, b.y + b.h / 2]; });
await tapLogical(...playBtn);
await waitScene('GameScene');
await page.waitForTimeout(1800);
check(await page.evaluate(() => window.__maria.app.scene.player.id) === 'maria', 'la tarjeta de María inicia el juego con María');
await shot(page, '03b-nivel1-inicio');

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

// ---------- Niveles 2-5: carga, contenido y capturas ----------
const startLevel = async (n, who = 'maria') => {
  await page.evaluate(([n, who]) => window.__maria.app.startLevel(n, who), [n, who]);
  await waitScene('GameScene');
  await page.waitForTimeout(500);
};
const teleport = (tx, who) => page.evaluate(([tx, who]) => {
  const sc = window.__maria.app.scene, map = sc.map, p = sc.player;
  sc.charId = who; p.swapTo(who, window.__maria.app.sheets[who]);
  let ty = 0; while (ty < map.H && !map.isSolid(tx, ty)) ty++;
  p.respawn(tx * 16 + 3, ty * 16 - 17); p.invuln = 9; sc.state = 'play'; sc.banner = 0;
  sc.cam.snap(p, map, window.__maria.view.W, window.__maria.view.H);
}, [tx, who]);
for (let n = 2; n <= 5; n++) {
  await startLevel(n);
  const info = await page.evaluate(() => {
    const sc = window.__maria.app.scene, map = sc.map;
    let boxes = 0, gap = 0, best = 0;
    for (let x = 0; x < map.W; x++) { for (let y = 0; y < map.H; y++) if (map.get(x, y) === 'b') boxes++; gap = map.isSolid(x, 10) ? 0 : gap + 1; best = Math.max(best, gap); }
    return { W: map.W, hearts: sc.hearts.length, goal: !!sc.goal, signsMissing: sc.signs.filter((s) => !sc.def.signs[s.key]).map((s) => s.key),
      signTexts: Object.keys(sc.def.signs).length, signs: sc.signs.length, boxes, gap: best, cps: sc.checkpoints.length, name: sc.def.name };
  });
  check(info.goal && info.hearts >= 10 && info.W > 250, `nivel ${n} (${info.name}): ${info.W} tiles, ${info.hearts} corazones, meta`);
  const emptyOk = n === 2;   // nivel 2: carteles vacíos a propósito (el usuario los rellenará)
  check(emptyOk ? info.signs === 7 : (info.signsMissing.length === 0 && info.signs === info.signTexts), `nivel ${n}: ${info.signs} carteles${emptyOk ? ' (vacíos a propósito)' : ', todos con texto en story.js'}`);
  check(info.boxes >= 2 && info.gap >= 9, `nivel ${n}: tiene zona de Víctor (${info.boxes} cajas) y de María (hueco de ${info.gap})`);
  await shot(page, `20-nivel${n}-inicio`);
  const cols = [Math.floor(info.W * 0.35), Math.floor(info.W * 0.62), info.W - 14];
  for (const [k, tx] of cols.entries()) { await teleport(tx, k % 2 ? 'victor' : 'maria'); await page.waitForTimeout(450); await shot(page, `2${n}-nivel${n}-col${tx}`); }
}

// ---------- Completar nivel -> recuerdo -> mapa, con guardado ----------
await startLevel(1);
await page.evaluate(() => { const sc = window.__maria.app.scene; sc.hearts.forEach((h) => { h.got = true; }); sc.collected = sc.hearts.length; sc.complete(); });
await page.waitForTimeout(1500);
await shot(page, '30-completado-todos-los-corazones');
await page.evaluate(() => window.__maria.input.pressJump());
await waitScene('MemoryScene');
await page.waitForTimeout(1200);
await shot(page, '31-recuerdo');
await page.evaluate(() => window.__maria.input.pressJump());
await waitScene('MapScene');
await page.waitForTimeout(700);
await shot(page, '32-mapa-con-progreso');
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('videojuego-maria-v1')));
check(saved.unlocked >= 2 && saved.memories[1] === true && (saved.hearts[1] || []).length > 5, `progreso guardado (nivel desbloqueado ${saved.unlocked}, recuerdo 1, ${(saved.hearts[1] || []).length} corazones)`);
await page.reload();
await waitScene('TitleScene');
check(await page.evaluate(() => window.__maria.app.save.data.unlocked >= 2), 'el progreso sobrevive a recargar la página');

// pausa y salir al mapa
await page.evaluate(() => window.__maria.app.startLevel(2, 'maria'));
await waitScene('GameScene'); await page.waitForTimeout(500);
await page.evaluate(() => window.__maria.app.scene.togglePause());
await page.waitForTimeout(200);
await shot(page, '33-pausa');
check(await page.evaluate(() => window.__maria.app.scene.paused), 'la pausa se activa');
await page.evaluate(() => window.__maria.app.scene.onPointer(200, 100));   // "Mapa de niveles"
await waitScene('MapScene');
check(true, 'salir de la pausa lleva al mapa');

// final del juego tras el nivel 5
await startLevel(5);
await page.evaluate(() => window.__maria.app.scene.complete());
await page.waitForTimeout(1500);
await page.evaluate(() => window.__maria.input.pressJump());
await waitScene('FinalScene');
for (const ph of [0, 1, 2]) { await page.waitForTimeout(1300); await shot(page, `4${ph}-final-${ph}`); await page.evaluate(() => window.__maria.input.pressJump()); }

// ---------- Corazones al alcance (comprobación estática) ----------
for (let n = 1; n <= 5; n++) {
  await startLevel(n);
  const r = await page.evaluate(() => {
    const sc = window.__maria.app.scene, map = sc.map, bad = []; let pits = 0;
    const gadgets = map.spawns.filter((s) => 'kmMrRu'.includes(s.ch));
    for (const h of sc.hearts) {
      const tx = Math.floor(h.x / 16), ty = Math.floor(h.y / 16);
      const low = map.zoneAt(tx, ty) === 'z';
      const reach = low ? 220 : 99;
      let best = Infinity, found = false;
      for (let cx = tx - 1; cx <= tx + 1; cx++) for (let y = ty; y <= map.H; y++) if (map.isSolid(cx, y) || map.isOneWay(cx, y)) { best = Math.min(best, y * 16 - h.y); found = true; break; }
      let ok = found && best <= reach;
      for (const g of gadgets) {                       // plataformas y muelles también valen como apoyo
        if (Math.abs(g.tx - tx) > 2) continue;
        const top = g.ch === 'u' ? (g.ty + 1) * 16 - 8 : g.ty * 16, lim = g.ch === 'u' ? 150 : (g.ch === 'm' || g.ch === 'M' ? reach + 45 : reach);
        const d = top - h.y; found = true;
        if (d >= -12 && d <= lim) ok = true;
      }
      if (!found) pits++; else if (!ok) bad.push(`(${tx},${ty})`);
    }
    return { bad, pits, total: sc.hearts.length };
  });
  check(r.bad.length === 0, `nivel ${n}: todos los corazones al alcance (${r.total - r.pits} con apoyo, ${r.pits} sobre huecos para planear)${r.bad.length ? ' MAL: ' + r.bad.join(', ') : ''}`);
}

// ---------- Obstáculos propios de cada nivel ----------
await startLevel(3);
const spring = await page.evaluate(() => {   // muelle (seta)
  const sc = window.__maria.app.scene, p = sc.player, s = sc.springs[0];
  sc.charId = 'maria'; p.swapTo('maria', window.__maria.app.sheets.maria);
  p.respawn(s.x + 2, s.y - 30); p.invuln = 9; p.vy = 0; sc.state = 'play'; sc.banner = 0; sc.cam.snap(p, sc.map, window.__maria.view.W, window.__maria.view.H);
  return { n: sc.springs.length };
});
let minVy = 0; for (let i = 0; i < 30; i++) { minVy = Math.min(minVy, (await page.evaluate(() => window.__maria.app.scene.player.vy))); await page.waitForTimeout(20); }
check(spring.n >= 3 && minVy < -400, `nivel 3: la seta lanza al jugador hacia arriba (vy ${minVy.toFixed(0)}, ${spring.n} setas)`);

const crumb = await page.evaluate(() => {   // hoja que cae
  const sc = window.__maria.app.scene, p = sc.player, c = sc.platforms.find((x) => x.kind === 'crumble');
  p.respawn(c.x + 10, c.y - p.h - 1); p.invuln = 99; p.vy = 0; sc.state = 'play'; sc.cam.snap(p, sc.map, window.__maria.view.W, window.__maria.view.H);
  return sc.platforms.filter((x) => x.kind === 'crumble').length;
});
await page.waitForTimeout(300);
check(await page.evaluate(() => window.__maria.app.scene.player.onGround), 'nivel 3: se puede pisar una hoja');
await page.waitForTimeout(900);
check(await page.evaluate(() => window.__maria.app.scene.platforms.find((x) => x.kind === 'crumble' && x.state === 'fall') !== undefined), `nivel 3: la hoja cae tras pisarla (${crumb} hojas)`);
await page.waitForTimeout(3600);
check(await page.evaluate(() => window.__maria.app.scene.platforms.every((x) => x.kind !== 'crumble' || x.active)), 'nivel 3: las hojas reaparecen');

await startLevel(2);
const mv = await page.evaluate(() => {   // barca que arrastra
  const sc = window.__maria.app.scene, p = sc.player, m = sc.platforms.find((x) => x.kind === 'moverH');
  p.respawn(m.x + 10, m.y - p.h - 1); p.invuln = 99; p.vy = 0; sc.state = 'play'; sc.cam.snap(p, sc.map, window.__maria.view.W, window.__maria.view.H);
  return { off: p.x - m.x, mx: m.x };
});
await page.waitForTimeout(1800);
const mv2 = await page.evaluate(() => { const sc = window.__maria.app.scene, p = sc.player, m = sc.platforms.find((x) => x.kind === 'moverH'); return { off: p.x - m.x, mx: m.x, ground: p.onGround, riding: p.riding === m }; });
check(Math.abs(mv2.mx - mv.mx) > 8 && Math.abs(mv2.off - mv.off) < 6 && mv2.ground && mv2.riding, `nivel 2: la barca arrastra al jugador (barca ${mv.mx.toFixed(0)} -> ${mv2.mx.toFixed(0)}, desfase ${(mv2.off - mv.off).toFixed(1)})`);
const hasWind = await page.evaluate(() => { const sc = window.__maria.app.scene; return [sc.windTiles.some((t) => t.dir === 1), sc.windTiles.some((t) => t.dir === -1)]; });
check(hasWind[0] && hasWind[1], 'nivel 2: hay zonas de viento a favor y en contra');
await page.evaluate(() => { const sc = window.__maria.app.scene, w = sc.windTiles.find((t) => t.dir === -1); const p = sc.player; p.respawn(w.tx * 16 + 3, w.ty * 16); p.invuln = 99; p.vy = -40; p.onGround = false; sc.state = 'play'; });
await page.waitForTimeout(60);
check(await page.evaluate(() => window.__maria.app.scene.player.ext) === -45, 'nivel 2: el viento en contra empuja hacia atrás (-45 px/s)');

await startLevel(4);
const rh = [];
for (let i = 0; i < 12; i++) { rh.push(await page.evaluate(() => { const sc = window.__maria.app.scene; const r = sc.platforms.find((x) => x.kind === 'rhythm' && x.group === 'r'), R = sc.platforms.find((x) => x.kind === 'rhythm' && x.group === 'R'); return [r.active, R.active]; })); await page.waitForTimeout(260); }
check(rh.some((s) => s[0]) && rh.some((s) => !s[0]) && rh.some((s) => s[1]) && rh.some((s) => !s[1]), `nivel 4: los bloques r y R se encienden y apagan al ritmo (${rh.map((s) => (s[0] ? 'r' : '-') + (s[1] ? 'R' : '-')).join(' ')})`);
const el = await page.evaluate(() => { const sc = window.__maria.app.scene; return { v: sc.platforms.filter((x) => x.kind === 'moverV').length, sp: sc.springs.length }; });
check(el.v >= 3 && el.sp >= 1, `nivel 4: ${el.v} ascensores y ${el.sp} altavoz-muelle`);

await startLevel(5);
const lg = await page.evaluate(() => { const sc = window.__maria.app.scene, z = sc.lowgTiles[0], p = sc.player; p.respawn(z.tx * 16 + 3, z.ty * 16); p.invuln = 99; sc.state = 'play'; return sc.lowgTiles.length; });
await page.waitForTimeout(60);
check(lg > 50 && await page.evaluate(() => window.__maria.app.scene.player.gravScale) < 0.5, `nivel 5: zonas de baja gravedad (${lg} tiles)`);
const stars = await page.evaluate(() => { const sc = window.__maria.app.scene; return { k: sc.platforms.filter((x) => x.kind === 'crumble').length, m: sc.platforms.filter((x) => x.kind === 'moverH' || x.kind === 'moverV').length, u: sc.springs.length }; });
check(stars.k >= 8 && stars.m >= 2 && stars.u >= 1, `nivel 5: ${stars.k} estrellas que caen, ${stars.m} estrellas móviles, ${stars.u} muelle`);

// ---------- Música: canciones propias (playlist) con vuelta al chiptune si falta el archivo ----------
const wav = Buffer.alloc(44 + 8000, 128);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + 8000, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(8000, 28); wav.writeUInt16LE(1, 32); wav.writeUInt16LE(8, 34); wav.write('data', 36); wav.writeUInt32LE(8000, 40);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testWav = path.join(rootDir, 'assets/music/_test.wav');
fs.writeFileSync(testWav, wav);
const ctxOk = await page.evaluate(() => !!window.__maria.app.audio.ctx);
if (!ctxOk) console.log('INFO  este WebKit no creó el contexto de audio: se omite la prueba de música');
else {
  await page.evaluate(() => { const a = window.__maria.app.audio; a.playlist = { menu: 'assets/music/_test.wav' }; a.stopMusic(); a.playMusic({ bpm: 90, root: 60, seed: 1, mode: 'major' }, 'menu'); });
  await page.waitForTimeout(400);
  const m1 = await page.evaluate(() => { const a = window.__maria.app.audio; return { file: !!a.fileEl, key: a.musicKey, chip: !!a.timer }; });
  check(m1.file && !m1.chip && m1.key === 'menu', 'si hay canción en playlist.json suena el archivo (no el chiptune)');
  await page.evaluate(() => { const a = window.__maria.app.audio; a.playlist = { menu: 'assets/music/_missing.mp3' }; a.stopMusic(); a.playMusic({ bpm: 90, root: 60, seed: 1, mode: 'major' }, 'menu'); });
  await page.waitForTimeout(900);
  const m2 = await page.evaluate(() => { const a = window.__maria.app.audio; return { file: !!a.fileEl, chip: !!a.timer }; });
  check(!m2.file && m2.chip, 'si el archivo de la playlist falla, vuelve al chiptune');
  await page.evaluate(() => { const a = window.__maria.app.audio; a.playlist = {}; a.stopMusic(); });
}
fs.unlinkSync(testWav);

// Rendimiento: el bucle de juego (JS) cuesta <1 ms por fotograma; se mide en un viewport 1x porque
// WebKit headless de Windows no tiene GPU y limita las pantallas de alta densidad por software.
const browserF = await webkit.launch();   // instancia limpia: sin otras páginas compitiendo por la CPU
const ctxF = await browserF.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, hasTouch: true });
const pF = await ctxF.newPage();
await pF.goto(url);
await pF.waitForFunction(() => window.__maria && window.__maria.app.scene && window.__maria.app.scene.ready);
await pF.evaluate(() => window.__maria.app.startLevel(2, 'maria'));
await pF.waitForFunction(() => { const s = window.__maria.app.scene; return s && s.constructor.name === 'GameScene' && s.ready; });
await pF.waitForTimeout(700);
const fps = await pF.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); (function f() { n++; if (performance.now() - t0 < 2500) requestAnimationFrame(f); else res(n / 2.5); })(); }));
const cost = await pF.evaluate(() => { const { app, view } = window.__maria, sc = app.scene; const t = performance.now(); for (let i = 0; i < 100; i++) { sc.update(1 / 120); sc.update(1 / 120); sc.draw(view.ctx); } return (performance.now() - t) / 100; });
console.log(`INFO  coste de un fotograma de juego (2 pasos + dibujo): ${cost.toFixed(2)} ms; ${fps.toFixed(0)} fps medidos`);
check(cost < 4 && fps > 50, `el juego es ligero y fluido (${cost.toFixed(2)} ms por fotograma, ${fps.toFixed(0)} fps)`);
await ctxF.close(); await browserF.close();

// ---------- Publicado en una subcarpeta (como GitHub Pages) ----------
const sub = await startServer(0, '/VideojuegoMaria');
const subUrl = `http://127.0.0.1:${sub.port}/VideojuegoMaria/`;
const ctx3 = await browser.newContext({ ...devices['iPhone 14 landscape'] });
const p3 = await ctx3.newPage();
const bad404 = [];
p3.on('response', (r) => { if (r.status() >= 400 && !/assets\/memories\//.test(r.url())) bad404.push(r.status() + ' ' + r.url()); });
await p3.goto(subUrl);
await p3.waitForFunction(() => window.__maria && window.__maria.app.scene && window.__maria.app.scene.ready, null, { timeout: 10000 });
await p3.evaluate(() => window.__maria.app.startLevel(1, 'victor'));
await p3.waitForFunction(() => { const s = window.__maria.app.scene; return s && s.constructor.name === 'GameScene' && s.ready; }, null, { timeout: 10000 });
await p3.waitForTimeout(600);
check(bad404.length === 0, `funciona publicado en una subcarpeta con rutas relativas${bad404.length ? ': ' + bad404.join(' | ') : ''}`);
const manifest = await p3.evaluate(() => fetch('manifest.json').then((r) => r.json()));
check(manifest.start_url === './' && manifest.orientation === 'landscape' && manifest.icons.length >= 2, 'manifest.json válido (start_url relativo, horizontal, iconos)');
await ctx3.close(); sub.server.close();

// ---------- Service worker: modo sin conexión ----------
const ctx4 = await browser.newContext({ ...devices['iPhone 14 landscape'] });
const p4 = await ctx4.newPage();
await p4.goto(url + '?sw=1');
await p4.evaluate(() => navigator.serviceWorker.ready);
await p4.waitForTimeout(1500);
const cached = await p4.evaluate(async () => { const ks = await caches.keys(); const c = await caches.open(ks[0]); return (await c.keys()).length; });
check(cached >= 40, `el service worker guarda el juego para usarlo sin conexión (${cached} archivos)`);
await ctx4.setOffline(true);
await p4.reload();
await p4.waitForFunction(() => window.__maria && window.__maria.app.scene && window.__maria.app.scene.ready, null, { timeout: 10000 }).catch(() => {});
check(await p4.evaluate(() => !!(window.__maria && window.__maria.app.scene && window.__maria.app.scene.ready)), 'el juego arranca sin conexión');
await ctx4.close();

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
