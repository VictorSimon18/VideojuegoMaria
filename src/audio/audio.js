// Audio 100% sintetizado con Web Audio API: efectos y música chiptune suave en bucle.
// En iOS el audio solo arranca tras un gesto del usuario: llamar a audio.unlock() en el primer toque.

// WAV silencioso: reproducirlo con <audio> hace que iOS use el canal de "reproducción"
// y suene aunque el interruptor de silencio esté activado.
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

class AudioEngine {
  constructor() {
    this.ctx = null; this.master = null; this.musicGain = null; this.sfxGain = null;
    this.muted = false; this.timer = null; this.track = null; this.step = 0; this.nextTime = 0;
    try { this.muted = localStorage.getItem('maria-muted') === '1'; } catch (_) { /* sin almacenamiento */ }
  }

  /** Crea/reanuda el contexto. Debe llamarse dentro de un gesto del usuario. */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.5; this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = 0.8; this.sfxGain.connect(this.master);
      try { const a = new Audio(SILENT_WAV); a.loop = true; a.play().catch(() => {}); this.silent = a; } catch (_) { /* ok */ }
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) this.ctx.suspend(); else this.ctx.resume();
      });
    }
    if (this.ctx.state !== 'running') this.ctx.resume();
    if (this.pendingTrack) { const [t, k] = this.pendingTrack; this.pendingTrack = null; this.playMusic(t, k); }
  }

  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem('maria-muted', m ? '1' : '0'); } catch (_) { /* ok */ }
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  }
  toggleMute() { this.setMuted(!this.muted); return this.muted; }

  // ---------- Efectos ----------
  tone(freq, dur, type = 'square', vol = 0.15, slideTo = null, delay = 0, dest = null) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest || this.sfxGain);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  noise(dur, vol = 0.2, delay = 0) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay, n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = this.ctx.createBufferSource(), g = this.ctx.createGain();
    s.buffer = buf; g.gain.value = vol; s.connect(g); g.connect(this.sfxGain); s.start(t0);
  }

  sfx(name) {
    switch (name) {
      case 'jump': this.tone(300, 0.14, 'square', 0.1, 620); break;
      case 'jump2': this.tone(450, 0.14, 'square', 0.1, 900); break;
      case 'land': this.tone(120, 0.06, 'triangle', 0.1, 70); break;
      case 'heart': this.tone(988, 0.08, 'square', 0.09); this.tone(1319, 0.2, 'square', 0.09, null, 0.07); break;
      case 'checkpoint': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.14, null, i * 0.08)); break;
      case 'hurt': this.tone(380, 0.35, 'triangle', 0.16, 90); break;
      case 'stomp': this.tone(500, 0.08, 'square', 0.1, 900); break;
      case 'break': this.noise(0.18, 0.25); this.tone(200, 0.12, 'square', 0.08, 80); break;
      case 'glide': this.tone(700, 0.12, 'sine', 0.04, 520); break;
      case 'swap': this.tone(660, 0.07, 'square', 0.08); this.tone(880, 0.1, 'square', 0.08, null, 0.07); break;
      case 'select': this.tone(784, 0.08, 'square', 0.08); break;
      case 'win': [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.2, 'square', 0.1, null, i * 0.1)); break;
      case 'egg': [1319, 1568, 2093, 1568, 2349].forEach((f, i) => this.tone(f, 0.15, 'triangle', 0.12, null, i * 0.07)); break;
      case 'spring': this.tone(240, 0.22, 'square', 0.1, 1000); this.tone(480, 0.15, 'triangle', 0.08, 1400, 0.04); break;
      case 'sign': this.tone(880, 0.05, 'square', 0.05); break;
      default: break;
    }
  }

  // ---------- Música ----------
  /** Genera una pieza suave determinista a partir de {bpm, root, seed, mode}. */
  buildTrack(p) {
    if (p.score) return { bpm: p.bpm, steps: p.score, total: p.total || 64 };   // pieza escrita a mano (nivel 4)
    let s = p.seed | 0;
    const rnd = () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 8) & 0xffff) / 65536; };
    const major = p.mode !== 'minor';
    const scale = major ? [0, 2, 4, 7, 9] : [0, 3, 5, 7, 10];
    const prog = major
      ? [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]]       // I vi IV V
      : [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]];       // i VI VII V
    const roots = major ? [0, -3, -7, -5] : [0, -4, -2, -5];
    const steps = [];      // eventos por corchea: {i, type, midi, len}
    let m = 0;
    for (let rep = 0; rep < 2; rep++) {
      for (let bar = 0; bar < 4; bar++) {
        const base = (rep * 4 + bar) * 8, ch = prog[bar];
        steps.push({ i: base, type: 'bass', midi: p.root + roots[bar] - 24, len: 3 });
        steps.push({ i: base + 4, type: 'bass', midi: p.root + roots[bar] - 24 + (major ? 7 : 7), len: 3 });
        for (let k = 0; k < 8; k++) {
          steps.push({ i: base + k, type: 'arp', midi: p.root + ch[[0, 1, 2, 1][k % 4]] + (k >= 4 ? 12 : 0) - 12 + 12, len: 1 });
        }
        for (let k = 0; k < 8; k += 2) {
          if (rnd() < 0.72) {
            m = Math.max(0, Math.min(scale.length * 2 - 1, m + Math.floor(rnd() * 5) - 2));
            const deg = scale[m % scale.length] + 12 * Math.floor(m / scale.length);
            steps.push({ i: base + k, type: 'lead', midi: p.root + 12 + deg, len: rnd() < 0.4 ? 3 : 2 });
          }
        }
      }
    }
    return { bpm: p.bpm, steps, total: 64 };
  }

  /** Lee assets/music/playlist.json: { "menu": "assets/music/a.mp3", "level1": "...", ... } (opcional). */
  async loadPlaylist() {
    try {
      const r = await fetch('assets/music/playlist.json', { cache: 'no-cache' });
      if (r.ok) { const j = await r.json(); this.playlist = (j && typeof j === 'object') ? j : {}; }
    } catch (_) { /* sin lista: se usa la música sintetizada */ }
  }

  /**
   * Reproduce música de fondo. `key` identifica la pieza ('menu', 'level1'...'level5', 'final'): si ya suena,
   * no se reinicia. Si en playlist.json hay un archivo para esa clave se usa; si no, o si falla, suena el chiptune.
   */
  playMusic(params, key = null) {
    if (!this.ctx) { this.pendingTrack = [params, key]; return; }
    if (key && key === this.musicKey && (this.timer || this.fileEl)) return;
    this.stopMusic();
    this.musicKey = key;
    const file = key && this.playlist && this.playlist[key];
    if (file) { this._playFile(file, params, key); return; }
    this._playChip(params);
  }

  _playFile(url, params, key) {
    try {
      const el = new Audio(url);
      el.loop = true; el.preload = 'auto';
      const src = this.ctx.createMediaElementSource(el);
      src.connect(this.musicGain);
      this.musicGain.gain.value = 0.9;
      this.fileEl = el; this.fileSrc = src;
      el.addEventListener('error', () => {   // archivo que no existe o formato no soportado: vuelve al chiptune
        if (this.fileEl !== el) return;
        this.stopMusic(); this.musicKey = key; this._playChip(params);
      });
      const p = el.play();
      if (p && p.catch) p.catch(() => { if (this.fileEl === el) { this.stopMusic(); this.musicKey = key; this._playChip(params); } });
    } catch (_) { this._playChip(params); }
  }

  _playChip(params) {
    if (this.musicGain) this.musicGain.gain.value = 0.5;
    this.trackGain = this.ctx.createGain(); this.trackGain.connect(this.musicGain);   // un nodo por pieza: permite fundirla al parar
    this.track = this.buildTrack(params);
    this.step = 0; this.nextTime = this.ctx.currentTime + 0.1;
    const tick = () => {
      if (!this.track) return;
      const dur = 60 / this.track.bpm / 2;   // corchea
      while (this.nextTime < this.ctx.currentTime + 0.35) {
        const n = this.step % this.track.total;
        for (const e of this.track.steps) if (e.i === n) this._note(e, this.nextTime, dur);
        this.nextTime += dur; this.step++;
      }
    };
    this.timer = setInterval(tick, 100); tick();
  }

  stopMusic() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null; this.track = null; this.musicKey = null; this.pendingTrack = null;
    if (this.trackGain) {   // fundido rápido: las notas ya programadas no siguen sonando
      const tg = this.trackGain; this.trackGain = null;
      try { tg.gain.cancelScheduledValues(0); tg.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04); } catch (_) { /* ok */ }
      setTimeout(() => { try { tg.disconnect(); } catch (_) { /* ok */ } }, 500);
    }
    if (this.fileEl) {
      const el = this.fileEl; this.fileEl = null;
      try { el.pause(); el.removeAttribute('src'); el.load(); } catch (_) { /* ok */ }
      try { this.fileSrc && this.fileSrc.disconnect(); } catch (_) { /* ok */ }
      this.fileSrc = null;
    }
  }

  _note(e, t0, dur) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    const cfg = { lead: ['square', 0.045], arp: ['triangle', 0.05], bass: ['triangle', 0.1], kick: ['sine', 0.16], snare: ['square', 0.02], hat: ['square', 0.012] }[e.type];
    o.type = cfg[0]; o.frequency.value = midiToFreq(e.midi);
    if (e.type === 'kick') { o.frequency.setValueAtTime(110, t0); o.frequency.exponentialRampToValueAtTime(40, t0 + 0.12); }
    const len = dur * e.len;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(cfg[1], t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + len * 0.95);
    o.connect(g); g.connect(this.trackGain || this.musicGain);
    o.start(t0); o.stop(t0 + len);
  }
}

export const audio = new AudioEngine();
