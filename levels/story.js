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
        1: 'Instituto Félix de Azara. Aquí empezó todo.',
        2: 'Primeras miradas, primeras risas... y mucho patio.',
        3: 'Quién te iba a decir que 4 años después el feo ese iba a ser tu novio.',
        4: 'Hueco enorme. Solo María puede cruzarlo: mantén el salto en el aire para planear.',
        5: 'Algunas cosas importantes empiezan sin avisar.',
        6: 'Sigue por la puerta para saber qué pasa.',
        7: 'Cajas en lo alto. Víctor puede romperlas desde abajo: sube por las nubes y salta.',
        8: 'Con el botón de cambio (Q o E en teclado) alternas entre María y Víctor.',
        9: '¿Oye, tú vas al Félix, no? Jajaja',
        0: 'Me lo estoy pasando tajo bien haciendo el juego.',
      },
      memory: {
        title: 'Recuerdo 1',
        text: 'Donde nos conocimos. (Escribe aquí vuestro recuerdo.)',
        photo: 'assets/memories/nivel1.jpg',
      },
    },
    {
      id: 2, theme: 'zaragoza',
      name: 'Zaragoza',
      subtitle: 'Basílica del Pilar, puente de Piedra y el Ebro',
      signs: {
        1: 'Zaragoza. Nuestra ciudad, nuestro punto de partida.',
        2: 'El Ebro y el cierzo: sopla fuerte por aquí. ¡Súbete a las barcas!',
        3: 'La Basílica del Pilar, al fondo, siempre vigilando. Y debajo, el puente de Piedra.',
        4: 'Hueco enorme sobre el Ebro. María planea con el cierzo a favor: mantén el salto en el aire.',
        5: 'Cajas en lo alto. Víctor las rompe desde abajo.',
        6: 'El puente de Piedra guarda más secretos de los que parece.',
        7: 'Zaragoza es mejor si la recorremos juntos.',
      },
      memory: { title: 'Recuerdo 2', text: 'Paseos por Zaragoza. (Escribe aquí vuestro recuerdo.)', photo: 'assets/memories/nivel2.jpg' },
    },
    {
      id: 3, theme: 'parque',
      name: 'Parque Imperial de Plaza',
      subtitle: 'Un paseo, una cita',
      signs: {
        1: 'Parque Imperial de Plaza. Una tarde cualquiera...',
        2: 'Las setas rebotan: salta encima y vuela.',
        3: 'Las hojas de otoño caen si te quedas quieto. ¡No pares!',
        4: 'Paseando sin rumbo, hablando de todo y de nada.',
        5: 'Hueco enorme. María planea: mantén el salto en el aire.',
        6: 'Cajas en lo alto. Víctor las rompe desde abajo.',
        7: 'Se hizo de noche y ni nos dimos cuenta. Fin del paseo, no de la historia.',
      },
      memory: { title: 'Recuerdo 3', text: 'Una tarde en el parque. (Escribe aquí vuestro recuerdo.)', photo: 'assets/memories/nivel3.jpg' },
    },
    {
      id: 4, theme: 'wizink',
      name: 'Madrid, WiZink Centre',
      subtitle: 'El concierto de Quevedo que nos queda por vivir',
      signs: {
        1: 'Madrid, WiZink Centre. Aún no hemos ido, pero ya lo imaginamos.',
        2: 'Los altavoces te lanzan al aire. ¡Que suene la música!',
        3: 'Los bloques aparecen y desaparecen al ritmo. Salta al compás.',
        4: 'Cuenta atrás para el concierto de Quevedo.',
        5: 'Hueco enorme. María planea: mantén el salto en el aire.',
        6: 'Cajas en lo alto. Víctor las rompe desde abajo.',
        7: 'Este viaje lo vamos a hacer, prometido. Nos vemos en Madrid.',
      },
      memory: { title: 'Recuerdo 4', text: 'Una ilusión compartida. (Escribe aquí vuestro recuerdo.)', photo: 'assets/memories/nivel4.jpg' },
    },
    {
      id: 5, theme: 'final',
      name: 'Una sorpresa',
      subtitle: 'Casi al final',
      signs: {
        1: 'Casi hemos llegado al final.',
        2: 'Aquí arriba la gravedad pesa menos. Como cuando estoy contigo.',
        3: 'Las estrellas se apagan si te paras. ¡Sigue subiendo!',
        4: 'Mira todo lo que hemos recorrido juntos.',
        5: 'Hueco enorme. María planea: mantén el salto en el aire.',
        6: 'Cajas en lo alto. Víctor las rompe desde abajo.',
        7: 'Aquí irá la sorpresa final. (Pendiente de escribir.)',
      },
      memory: { title: 'Sorpresa', text: 'Aquí irá la sorpresa final. (Pendiente de escribir.)', photo: 'assets/memories/nivel5.jpg' },
    },
  ],
};
