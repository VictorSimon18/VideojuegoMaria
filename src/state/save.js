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
  addHearts(level, ids, total = Infinity) {
    const d = this.load();
    const set = new Set([...(d.hearts[level] || []), ...ids].filter((id) => id < total));   // ignora ids que ya no existen (el nivel cambió)
    d.hearts[level] = [...set].sort((a, b) => a - b);
    this.commit();
    return d.hearts[level];
  },
  /** Descarta corazones guardados que ya no existen (si se rediseñó un nivel, el contador no puede pasar del total). */
  prune(totals) {
    const d = this.load(); let changed = false;
    totals.forEach((t, i) => {
      const a = d.hearts[i + 1];
      if (a && a.some((id) => id >= t)) { d.hearts[i + 1] = a.filter((id) => id < t); changed = true; }
    });
    if (changed) this.commit();
  },
  reset() { data = { ...DEFAULT }; this.commit(); },
};
