// Prueba del audio en Chromium (el WebKit de Playwright en Windows no incluye Web Audio).
//   npm run test:audio
// Comprueba que la música chiptune y los efectos producen sonido real (se mide con un analizador),
// que el silencio funciona y que las canciones propias de assets/music/playlist.json se reproducen.
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { server, port } = await startServer(0);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await (await browser.newContext({ ...devices['iPhone 14 landscape'].viewport ? { viewport: { width: 844, height: 390 }, hasTouch: true } : {} })).newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
let failed = 0;
const check = (cond, msg) => { console.log((cond ? 'OK   ' : 'FALLA'), msg); if (!cond) failed++; };

await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(() => window.__maria && window.__maria.app.scene && window.__maria.app.scene.ready);
await page.click('canvas');                       // primer toque: desbloquea el audio
await page.waitForTimeout(600);
check(await page.evaluate(() => !!window.__maria.app.audio.ctx && window.__maria.app.audio.ctx.state === 'running'), 'el audio se desbloquea con el primer toque (AudioContext en marcha)');

// Analizador conectado a la salida para medir el volumen real
await page.evaluate(() => {
  const a = window.__maria.app.audio, an = a.ctx.createAnalyser(); an.fftSize = 1024;
  a.master.connect(an); window.__an = an; window.__buf = new Float32Array(an.fftSize);
  window.__peak = () => { an.getFloatTimeDomainData(window.__buf); let m = 0; for (const v of window.__buf) m = Math.max(m, Math.abs(v)); return m; };
});
const peakOver = async (ms) => page.evaluate((ms) => new Promise((res) => { let m = 0; const t0 = performance.now(); (function f() { m = Math.max(m, window.__peak()); if (performance.now() - t0 < ms) setTimeout(f, 20); else res(m); })(); }), ms);

// Música chiptune de cada pantalla
const themes = await page.evaluate(() => Object.keys({ azara: 1, zaragoza: 1, parque: 1, wizink: 1, final: 1 }));
for (const [i, key] of ['menu', 'level1', 'level2', 'level3', 'level4', 'level5', 'final'].entries()) {
  await page.evaluate(([key, i]) => { const a = window.__maria.app.audio; a.playlist = {}; a.stopMusic(); a.playMusic({ bpm: 90 + i * 5, root: 57 + i, seed: i + 1, mode: i % 2 ? 'minor' : 'major' }, key); }, [key, i]);
  const p = await peakOver(1800);
  check(p > 0.01, `la música "${key}" suena (volumen pico ${p.toFixed(3)})`);
}
// misma clave = no se reinicia
const same = await page.evaluate(() => { const a = window.__maria.app.audio, t = a.timer; a.playMusic({ bpm: 90, root: 60, seed: 1, mode: 'major' }, 'final'); return a.timer === t; });
check(same, 'pedir la misma música dos veces no la reinicia');

// Efectos
await page.evaluate(() => window.__maria.app.audio.stopMusic());
await page.waitForTimeout(300);
const silence = await peakOver(300);
let allOk = true;
for (const name of ['jump', 'jump2', 'land', 'heart', 'checkpoint', 'hurt', 'stomp', 'break', 'glide', 'swap', 'select', 'win', 'egg', 'sign', 'spring']) {
  await page.evaluate((n) => window.__maria.app.audio.sfx(n), name);
  const p = await peakOver(450);
  if (!(p > 0.005)) { allOk = false; console.log('  efecto mudo:', name, p.toFixed(4)); }
}
check(allOk, `los 15 efectos de sonido suenan`);
check(silence < 0.01, `al parar la música no quedan notas sonando (residuo ${silence.toFixed(4)})`);

// Silencio
await page.evaluate(() => { const a = window.__maria.app.audio; a.playlist = {}; a.playMusic({ bpm: 100, root: 60, seed: 3, mode: 'major' }, 'level1'); a.setMuted(true); });
await page.waitForTimeout(500);
const muted = await peakOver(800);
check(muted < 0.002, `el botón de silencio apaga todo (pico ${muted.toFixed(4)})`);
await page.evaluate(() => window.__maria.app.audio.setMuted(false));
await page.waitForTimeout(400);
check(await peakOver(1200) > 0.01, 'al quitar el silencio vuelve a sonar');
check(await page.evaluate(() => localStorage.getItem('maria-muted') === '0'), 'el estado de silencio se guarda');

// Canción propia
const wav = Buffer.alloc(44 + 16000 * 2, 0);          // 1 s, 16 kHz, 8 bit mono: tono de 440 Hz
wav.write('RIFF', 0); wav.writeUInt32LE(36 + 16000 * 2, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(16000, 24); wav.writeUInt32LE(32000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(32000, 40);
for (let i = 0; i < 16000; i++) wav.writeInt16LE(Math.round(Math.sin(2 * Math.PI * 440 * i / 16000) * 12000), 44 + i * 2);
const testWav = path.join(root, 'assets/music/_test.wav');
fs.writeFileSync(testWav, wav);
await page.evaluate(() => { const a = window.__maria.app.audio; a.stopMusic(); a.playlist = { menu: 'assets/music/_test.wav' }; a.playMusic({ bpm: 90, root: 60, seed: 1, mode: 'major' }, 'menu'); });
const pf = await peakOver(1500);
const fileState = await page.evaluate(() => { const a = window.__maria.app.audio; return { file: !!a.fileEl, chip: !!a.timer, playing: a.fileEl ? !a.fileEl.paused : false }; });
check(fileState.file && !fileState.chip && fileState.playing && pf > 0.05, `una canción de playlist.json suena en lugar del chiptune (pico ${pf.toFixed(3)})`);
await page.evaluate(() => { const a = window.__maria.app.audio; a.stopMusic(); a.playlist = { menu: 'assets/music/_missing.mp3' }; a.playMusic({ bpm: 90, root: 60, seed: 1, mode: 'major' }, 'menu'); });
await page.waitForTimeout(1200);
const fb = await page.evaluate(() => { const a = window.__maria.app.audio; return { file: !!a.fileEl, chip: !!a.timer }; });
check(!fb.file && fb.chip && await peakOver(1500) > 0.01, 'si falta el archivo, vuelve al chiptune y suena');
await page.evaluate(() => { const a = window.__maria.app.audio; a.stopMusic(); a.playlist = {}; });
fs.unlinkSync(testWav);

check(errors.length === 0, `sin errores en la consola${errors.length ? ': ' + errors.join(' | ') : ''}`);
await browser.close(); server.close();
console.log(failed ? `\n${failed} comprobación(es) fallida(s)` : '\nAudio correcto');
process.exit(failed ? 1 : 0);
