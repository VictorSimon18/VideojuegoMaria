// Punto de entrada: arranca vista, entrada, sprites, y el bucle principal con delta time.
import { STEP } from './engine/constants.js';
import { initView, view, toLogical } from './engine/view.js';
import { input } from './engine/input.js';
import { initTouch, isTouchDevice } from './ui/touch.js';
import { loadCharSheet } from './art/sprites.js';
import { audio } from './audio/audio.js';
import { save } from './state/save.js';
import { story } from '../levels/story.js';
import { TitleScene } from './scenes/title.js';
import { GameScene } from './scenes/game.js';
import { SelectScene } from './scenes/select.js';

const app = {
  story, save, audio,
  sheets: {},
  scene: null,
  hasVictor: false,
  controls: null,

  setControls(c) { this.controls && this.controls.setControls(c); },

  async go(scene) {
    this.scene = null;
    await scene.init();
    this.scene = scene;
  },

  afterTitle() { this.go(new SelectScene(this)); },

  startLevel(n, charId) { save.data.character = charId; save.commit(); this.go(new GameScene(this, n, charId)); },

  levelFinished() { this.go(new TitleScene(this)); },
};

async function boot() {
  const canvas = document.getElementById('game');
  initView(canvas);
  app.controls = initTouch();
  try { await document.fonts.load('8px "Press Start 2P"'); } catch (_) { /* usa la fuente de reserva */ }
  const [maria, victor] = await Promise.all([loadCharSheet('maria'), loadCharSheet('victor')]);
  app.sheets.maria = maria; app.sheets.victor = victor; app.hasVictor = true;
  await app.go(new TitleScene(app));
  document.body.classList.add('ready');

  canvas.addEventListener('pointerdown', (e) => {
    if (!app.scene || !app.scene.onPointer) return;
    const p = toLogical(e); app.scene.onPointer(p.x, p.y, e);
  });

  let last = performance.now(), acc = 0;
  const touch = isTouchDevice();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const paused = document.hidden || (touch && view.portrait);
    const sc = app.scene;   // la escena puede cambiar durante update()
    if (sc) {
      if (!paused) {
        acc += dt;
        let n = 0;
        while (acc >= STEP && n++ < 16 && app.scene === sc) { sc.update(STEP); acc -= STEP; }
        if (n >= 16) acc = 0;
      }
      if (app.scene === sc) sc.draw(view.ctx);
    }
  }
  requestAnimationFrame(frame);

  // Gancho de depuración/pruebas
  window.__maria = { app, input, view };
}

boot().catch((e) => {
  console.error(e);
  document.body.insertAdjacentHTML('beforeend', `<pre style="color:#fff;position:fixed;top:0;left:0;padding:8px;font-size:11px;white-space:pre-wrap;z-index:99">${e.stack || e}</pre>`);
});
