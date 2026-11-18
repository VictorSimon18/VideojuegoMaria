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
        3: 'Nadie sabía todavía lo que iba a pasar.',
        4: 'Hueco enorme. Solo María puede cruzarlo: mantén el salto en el aire para planear.',
        5: 'Algunas cosas importantes empiezan sin avisar.',
        6: 'La puerta del final: sigue, que hay más historia.',
        7: 'Cajas en lo alto. Víctor puede romperlas desde abajo: sube por las nubes y salta.',
        8: 'Con el botón de cambio (Q o E en teclado) alternas entre María y Víctor.',
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
        2: 'La Basílica del Pilar, al fondo, siempre vigilando.',
        3: 'Un paseo junto al Ebro, sin prisa.',
        4: 'Hueco enorme. María planea: mantén el salto en el aire. Ojo al río.',
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
        2: 'Paseando sin rumbo, hablando de todo y de nada.',
        3: 'Cajas en lo alto. Víctor las rompe desde abajo.',
        4: 'Las mejores citas no necesitan plan.',
        5: 'Hueco enorme. María planea: mantén el salto en el aire.',
        6: 'Se hizo de noche y ni nos dimos cuenta.',
        7: 'Fin del paseo. Pero no de la historia.',
      },
      memory: { title: 'Recuerdo 3', text: 'Una tarde en el parque. (Escribe aquí vuestro recuerdo.)', photo: 'assets/memories/nivel3.jpg' },
    },
    {
      id: 4, theme: 'wizink',
      name: 'Madrid, WiZink Centre',
      subtitle: 'El concierto de Quevedo que nos queda por vivir',
      signs: {
        1: 'Madrid, WiZink Centre. Aún no hemos ido, pero ya lo imaginamos.',
        2: 'Hueco enorme. María planea: mantén el salto en el aire.',
        3: 'Cuenta atrás para el concierto de Quevedo.',
        4: 'Cajas en lo alto. Víctor las rompe desde abajo.',
        5: 'Las luces, la gente, la música... y tú a mi lado.',
        6: 'Este viaje lo vamos a hacer, prometido.',
        7: 'Nos vemos en Madrid. Es una promesa.',
      },
      memory: { title: 'Recuerdo 4', text: 'Una ilusión compartida. (Escribe aquí vuestro recuerdo.)', photo: 'assets/memories/nivel4.jpg' },
    },
    {
      id: 5, theme: 'final',
      name: 'Una sorpresa',
      subtitle: 'Casi al final',
      signs: {
        1: 'Casi hemos llegado al final.',
        2: 'Mira todo lo que hemos recorrido juntos.',
        3: 'Cajas en lo alto. Víctor las rompe desde abajo.',
        4: 'Hueco enorme. María planea: mantén el salto en el aire.',
        5: 'Ya casi...',
        6: 'Lo que viene es para ti.',
        7: 'Aquí irá la sorpresa final. (Pendiente de escribir.)',
      },
      memory: { title: 'Sorpresa', text: 'Aquí irá la sorpresa final. (Pendiente de escribir.)', photo: 'assets/memories/nivel5.jpg' },
    },
  ],
};
