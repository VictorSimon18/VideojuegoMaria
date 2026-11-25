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
        1: 'Empieza el juego',
        2: 'Espero que no se te haga difícil',
        3: 'Oye tú vas al Feliz no? Jajaja',
        4: 'Quién te iba a decir hace 4 años que ese feo sería tu novio',
        5: 'Ten cuidado con los signos matemáticos que te matan',
        6: 'Has recogido todos los corazones?',
        7: 'Al siguiente nivel',
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
        1: 'A por el nivel 2',
        2: 'Que guapa la basílica',
        3: 'Ten cuidado con las palomas cagona',
        4: 'Me lo estoy pasando tajo bien haciendo esto',
        5: 'El diseño de personajes mola no?',
        6: 'El año que viene pasamos la ofrenda juntos',
        7: 'A por el nivel 3',
      },
      memory: { title: 'Recuerdo 2', text: '', photo: 'assets/memories/nivel2.jpg' },
    },
    {
      id: 3, theme: 'parque',
      name: 'Parque Imperial de Plaza',
      subtitle: 'Un paseo, una cita',
      signs: {
        1: 'Este nivel es más difícil',
        2: 'Cuidao con las bemetas',
        3: 'En el BM no se chilla',
        4: 'Unos nuggets en el coche y tirando',
        5: 'La de gasofa que habré quemao viniendo a este parking',
        6: 'Has contado cuántos conejos hay escondidos?',
        7: 'Ahora toca un viaje',
      },
      memory: { title: 'Recuerdo 3', text: '', photo: 'assets/memories/nivel3.jpg' },
    },
    {
      id: 4, theme: 'wizink',
      name: 'Madrid, WiZink Centre',
      subtitle: 'El concierto de Quevedo que nos queda por vivir',
      signs: {
        1: 'Solo quedan 5 meses...',
        2: 'Queeeeedate',
        3: 'Gástate mi dinero, ma, que me hago el pendejo',
        4: 'Los enemigos son baifos',
        5: 'Eyayaaa, eyaya',
        6: 'No sé qué poner aquí',
        7: 'Ve con Quevedo y al último nivel',
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
