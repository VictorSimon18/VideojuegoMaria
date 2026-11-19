// Arreglo en chiptune de "Al golpito" (Quevedo, Nueva Línea), escrito a mano a partir de la partitura de piano
// que aportó el autor del juego: tonalidad de Fa menor, 103 bpm, ciclo de acordes Re♭ - Mi♭ - Fa m.
// ES UNA APROXIMACIÓN (acordes, ritmo de reggaetón y una melodía parecida): para la canción real, ver assets/music/LEEME.txt.
// Para retocar la melodía: edita MELODY (una lista de 8 corcheas por compás; 0 = silencio; números = notas MIDI).
const ROOTS = [37, 39, 41, 41, 37, 39, 41, 41];             // bajo: Db2 Eb2 F2 F2 Db2 Eb2 F2 F2
const CHORDS = [[61, 65, 68], [63, 67, 70], [65, 68, 72], [65, 68, 72], [61, 65, 68], [63, 67, 70], [65, 68, 72], [65, 68, 72]];
const MELODY = [
  [72, 0, 72, 73, 72, 70, 68, 0],
  [70, 0, 70, 72, 70, 68, 67, 0],
  [68, 70, 72, 0, 75, 73, 72, 0],
  [73, 72, 70, 68, 65, 0, 0, 0],
  [77, 0, 77, 75, 73, 0, 73, 75],
  [75, 0, 75, 73, 72, 0, 72, 73],
  [72, 73, 72, 70, 68, 0, 70, 72],
  [68, 0, 65, 0, 68, 0, 0, 0],
];

export function golpitoScore() {
  const steps = [];
  for (let bar = 0; bar < 8; bar++) {
    const b = bar * 8;
    for (const k of [0, 3, 6]) steps.push({ i: b + k, type: 'bass', midi: ROOTS[bar], len: k === 6 ? 2 : 3 });   // tresillo del dembow
    for (const k of [0, 3, 6]) steps.push({ i: b + k, type: 'arp', midi: CHORDS[bar][k === 3 ? 1 : k === 6 ? 2 : 0], len: 1 });
    for (const k of [0, 2, 4, 6]) steps.push({ i: b + k, type: 'kick', midi: 36, len: 1 });
    for (const k of [3, 7]) steps.push({ i: b + k, type: 'snare', midi: 60, len: 1 });
    for (const k of [1, 5]) steps.push({ i: b + k, type: 'hat', midi: 96, len: 1 });
    MELODY[bar].forEach((m, k) => { if (m) steps.push({ i: b + k, type: 'lead', midi: m, len: 1 }); });
  }
  return steps;
}
