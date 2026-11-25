// =====================================================================
//  TEXTOS DEL JUEGO - edita aquí todo lo que se lee en pantalla.
//  Consejo: frases cortas (el cartel admite ~60 caracteres por línea con
//  la fuente pixel; el juego las parte solo en varias líneas).
//  Las fotos de los recuerdos van en assets/memories/ (ver README).
// =====================================================================
export const story = {
  title: 'Nuestra historia',
  subtitle: 'Un juego para María',
  tapToStart: 'Toca para empezar',
  rotate: 'Gira el móvil',
  rotateSub: 'Este juego se juega en horizontal',

  dedication: 'Hecho por Víctor para María',
  finalMessage: 'Gracias por cada día. Esto es solo el principio.',   // <- cámbialo cuando lo tengas pensado
  credits: [
    'Diseño, código y cariño: Víctor',
    'Personajes: María Bailera y Víctor Simón',
    'Música y sonidos: sintetizados al vuelo',
    'Fuente: Press Start 2P (OFL)',
    'Gracias por jugar',
  ],
  easterEgg: '¡Me has pillado! Te quiero, María.',

  levels: [
    {
      id: 1, theme: 'azara',
      name: 'Instituto Félix de Azara',
      subtitle: 'Donde todo empezó',
      signs: {
        // Carteles vacíos a propósito: se rellenarán más adelante.
        1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '',
      },
      memory: {
        title: 'Recuerdo 1',
        text: '',
        photo: 'assets/memories/nivel1.jpg',
      },
    },
    {
      id: 2, theme: 'zaragoza',
      name: 'Zaragoza',
      subtitle: 'Basílica del Pilar y su plaza',
      signs: {
        // Carteles vacíos a propósito: se rellenarán más adelante.
        1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '',
      },
      memory: { title: 'Recuerdo 2', text: '', photo: 'assets/memories/nivel2.jpg' },
    },
    {
      id: 3, theme: 'parque',
      name: 'Parque Imperial de Plaza',
      subtitle: 'Un paseo, una cita',
      signs: {
        // Carteles vacíos a propósito: se rellenarán más adelante.
        1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '',
      },
      memory: { title: 'Recuerdo 3', text: '', photo: 'assets/memories/nivel3.jpg' },
    },
    {
      id: 4, theme: 'wizink',
      name: 'Madrid, WiZink Centre',
      subtitle: 'El concierto de Quevedo que nos queda por vivir',
      signs: {
        // Carteles vacíos a propósito: se rellenarán más adelante.
        1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '',
      },
      memory: { title: 'Recuerdo 4', text: '', photo: 'assets/memories/nivel4.jpg' },
    },
    {
      id: 5, theme: 'calle',
      name: 'Una sorpresa',
      subtitle: 'Casi al final',
      signs: {
        // Carteles vacíos a propósito: se rellenarán más adelante.
        1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '',
      },
      memory: { title: 'Sorpresa', text: 'Ojalá algún día tengamos nuestra casa y podamos formar una familia. Voy a luchar por ello hasta que eso ocurra. Te amo, María.', photo: 'assets/memories/nivel5.jpg' },
    },
  ],
};
