// Progreso del juego en localStorage (con tolerancia a que no esté disponible).
const KEY = 'videojuego-maria-v1';

const DEFAULT = {
  unlocked: 1,          // nivel máximo desbloqueado (1-5)
  character: 'maria',   // último personaje elegido
  hearts: {},           // { nivel: [ids de corazones recogidos] }
  memories: {},         // { nivel: true }
  done: {},             // { nivel: true }
  egg: false,           // easter egg encontrado
};

let data = null;

export const save = {
  load() {
    if (data) return data;
    try { data = { ...DEFAULT, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; }
    catch (_) { data = { ...DEFAULT }; }
    return data;
  },
  get data() { return this.load(); },
  commit() { try { localStorage.setItem(KEY, JSON.stringify(this.load())); } catch (_) { /* ok */ } },
  /** Suma corazones recogidos en un nivel (unión con los anteriores). */
  addHearts(level, ids) {
    const d = this.load();
    const set = new Set([...(d.hearts[level] || []), ...ids]);
    d.hearts[level] = [...set].sort((a, b) => a - b);
    this.commit();
    return d.hearts[level];
  },
  reset() { data = { ...DEFAULT }; this.commit(); },
};
