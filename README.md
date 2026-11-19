# Nuestra historia - un juego para María

Un videojuego de plataformas 2D en pixel art, hecho con cariño. Se juega en el navegador (pensado para iPhone en horizontal), sin servidor y sin compilar: HTML + CSS + JavaScript + `<canvas>`.

- **5 niveles** con temática de vuestra historia, corazones que recoger y un recuerdo con foto por nivel.
- **2 personajes**, que se pueden cambiar en mitad del nivel:
  - **María Bailera**: salta más alto y **planea** si mantienes el salto en el aire.
  - **Víctor Simón**: **doble salto** y **rompe cajas** golpeándolas por debajo.
- Cada nivel tiene una zona que solo puede pasar María (un hueco enorme) y otra que solo puede pasar Víctor (cajas en el techo).
- **Cada nivel tiene sus propios obstáculos y enemigos:**

| Nivel | Obstáculos propios | Enemigos |
|---|---|---|
| 1 Instituto Félix de Azara | rosas con espinas, nubes, montículos de ladrillos | signos matemáticos (× + ÷ π e Σ) |
| 2 Zaragoza | cierzo (viento a favor y en contra), barcas sobre el Ebro, arcos del puente de Piedra | palomas |
| 3 Parque Imperial de Plaza | setas que lanzan por los aires, hojas que caen al pisarlas, rosas anchas | ardillas |
| 4 Madrid, WiZink Centre | bloques rosas y azules que se alternan al ritmo, ascensores, altavoces-muelle | notas musicales |
| 5 Sorpresa final | baja gravedad, estrellas que caen, estrellas móviles, muelles de estrella | estrellitas |
- Sin game over: si te toca un bichito o una espina de rosa, reapareces en el último checkpoint.
- Se guarda el progreso (nivel desbloqueado, corazones, recuerdos) en el propio navegador.

## Cómo se juega

| | Táctil (iPhone) | Teclado |
|---|---|---|
| Moverse | cruceta de la izquierda (se puede deslizar el dedo) | flechas o `A` / `D` |
| Saltar | botón grande de la derecha (mantener = salto más alto) | `Espacio`, `↑` o `W` |
| Planear (María) | mantener el botón de salto en el aire | mantener `Espacio` en el aire |
| Cambiar de personaje | botón con la cara del otro personaje | `Q` o `E` |
| Pausa | botón de pausa (arriba a la derecha) | `Esc` o `P` |

Se pueden usar varios dedos a la vez (moverse y saltar). Si el móvil está en vertical aparece un aviso para girarlo.

## Cómo editar el juego

### Textos

Todo lo que se lee en pantalla está en **`levels/story.js`**: título, dedicatoria, mensaje final, créditos, nombre de cada nivel, **textos de los carteles** y **textos de los recuerdos**. Es un archivo de texto normal: edítalo y guarda.

- La dedicatoria es `dedication` ("Hecho por Víctor para María").
- La sorpresa del nivel 5 y su mensaje final son `levels[4].memory.text` y `finalMessage` (ahora hay textos provisionales).
- Los carteles de cada nivel se numeran de izquierda a derecha (`1`, `2`, `3`...). Si añades o quitas carteles en un nivel, ajusta sus textos.

### Fotos de los recuerdos

Pon las fotos en **`assets/memories/`** con estos nombres exactos:

```
assets/memories/nivel1.jpg   nivel2.jpg   nivel3.jpg   nivel4.jpg   nivel5.jpg
```

Se recortan al centro en un cuadrado, así que sirve cualquier proporción. Conviene que cada foto pese menos de 300 KB (por ejemplo, 800 px de lado) para que cargue rápido en el móvil. Mientras no existan, el recuerdo muestra un hueco con "Tu foto aquí". El recuerdo se desbloquea al recoger **todos** los corazones de un nivel (se acumulan entre intentos).

### Sprites de los personajes

Los sprites se generan por código, pero hay PNG listos para sustituir en **`assets/sprites/maria.png`** y **`assets/sprites/victor.png`**. Cada hoja mide **80×130 px**: fotogramas de **20×26 px** en 4 columnas y 5 filas (los pies tocan la fila de abajo y la cabeza queda por encima de la caja de colisión, que mide 10×16 px):

| fila | animación | fotogramas |
|---|---|---|
| 0 | reposo | 2 |
| 1 | correr | 4 |
| 2 | saltar | 1 |
| 3 | caer | 1 |
| 4 | planear | 1 |

Dibújalos mirando a la derecha y respeta el tamaño: si la imagen no mide 80×130, el juego usa la versión generada. Para volver a generar los PNG originales: `npm run assets`.

### Niveles

Los niveles son mapas de texto. `levels/level1.js` está escrito a mano y los niveles 2-5 se montan juntando trozos de `levels/chunks.js` (cambia el orden de la lista de cada `levelN.js` para rediseñarlos). Cada carácter es un tile de 16×16 px:

| carácter | significado |
|---|---|
| `.` | aire |
| `#` | suelo (hierba/tierra automática) |
| `X` | ladrillo sólido |
| `b` | caja rompible (solo Víctor, desde abajo) |
| `=` | nube plataforma (se atraviesa por abajo) |
| `^` | espinas de rosa (vuelves al checkpoint) |
| `S` | salida del jugador |
| `o` | corazón |
| `c` | checkpoint |
| `e` / `f` | bichito que pasea / mariposa que flota |
| `G` | puerta de meta |
| `0`-`9` | cartel (texto en `story.js`) |
| `>` `<` | zona de viento a favor / en contra (empuja 45 px/s) |
| `z` | zona de baja gravedad |
| `m` `M` | plataforma móvil horizontal (barca) / vertical (ascensor) |
| `k` | hoja o estrella que tiembla y cae al pisarla, y reaparece |
| `r` `R` | bloques que aparecen y desaparecen al ritmo (rosas / azules) |
| `u` | muelle (seta, altavoz o estrella según el nivel) |
| `T` `h` `w` `l` | decoración: árbol, arbusto, flores, farola |

Los colores, la música y el tipo de enemigo y de aparatos de cada nivel están en `levels/themes.js`. Los trozos con obstáculos propios de los niveles 2-5 están en `levels/chunks_themed.js` y se dibujan con coordenadas (`a.set(x, y, 'u')`, `a.fill(...)`...).

### Música: canciones propias (opcional)

Por defecto suena música chiptune generada por código, sin derechos de autor. Si quieres usar canciones concretas, copia los archivos (mp3, m4a u ogg) en **`assets/music/`** y asígnalos en **`assets/music/playlist.json`**:

```json
{
  "menu": "assets/music/menu.mp3",
  "level1": "assets/music/instituto.mp3",
  "level4": "assets/music/concierto.mp3"
}
```

Claves: `menu` (selección, mapa y recuerdos), `level1` … `level5` y `final`. Lo que no esté en la lista sigue sonando con el chiptune, y si un archivo falla también vuelve al chiptune. Hay más detalles en `assets/music/LEEME.txt`.

> **Derechos de autor:** las canciones comerciales tienen copyright. Si subes el audio a un repositorio público de GitHub o a GitHub Pages lo estás distribuyendo y pueden retirártelo. Para algo privado, usa música libre de derechos o propia, o no subas esos archivos a GitHub.

## Probarlo en tu ordenador

Los módulos de JavaScript no funcionan abriendo `index.html` con doble clic: hace falta un servidor local. Con Node.js instalado:

```
npm install
npm run serve
```

y abre <http://127.0.0.1:8080/>. Las pruebas automáticas usan Playwright (`npx playwright install webkit chromium` la primera vez):

- `npm test`: WebKit con emulación de iPhone en horizontal (controles, personajes, niveles, obstáculos, guardado, PWA). Guarda capturas en `tests/out/`.
- `npm run test:audio`: Chromium (el WebKit de Playwright en Windows no incluye Web Audio). Comprueba música, efectos, silencio y canciones propias midiendo el sonido real.

## Publicarlo en GitHub Pages

El juego es 100 % estático y usa rutas relativas, así que funciona en `https://<usuario>.github.io/<repositorio>/`. Se publica **desde la raíz de la rama `main`** (no hace falta carpeta `docs`):

1. Sube el código a GitHub (`git push`).
2. En el repositorio: **Settings → Pages**.
3. En *Build and deployment → Source* elige **Deploy from a branch**.
4. Rama **`main`**, carpeta **`/ (root)`** y pulsa **Save**.
5. Espera uno o dos minutos y abre la dirección que aparece arriba en esa misma página.

Cada vez que hagas `git push` a `main`, la web se actualiza sola.

**Opcional (GitHub Actions):** en `.github/workflows/pages.yml` hay un workflow manual. Para usarlo, en *Settings → Pages → Source* elige **GitHub Actions** y lánzalo desde la pestaña *Actions → Publicar en GitHub Pages → Run workflow*. No lo necesitas si usas "Deploy from a branch".

### Si cambias archivos del juego

El juego guarda una copia para funcionar sin conexión (`sw.js`). Tras publicar cambios, **sube el número `CACHE_VERSION` de `sw.js`** y, al abrir la web, puede hacer falta cargarla dos veces para ver la versión nueva.

## Añadirlo a la pantalla de inicio del iPhone

1. Abre la dirección del juego en **Safari** (tiene que ser Safari).
2. Pulsa el botón **Compartir** (el cuadrado con la flecha hacia arriba).
3. Elige **Añadir a pantalla de inicio** y pulsa **Añadir**.
4. Abre el icono: se juega a pantalla completa, sin barras del navegador, y funciona sin conexión.

Si no oyes la música, comprueba que el **interruptor de silencio** del lateral del iPhone no esté activado y que el botón de sonido del juego (arriba a la derecha) no esté tachado. El audio empieza tras el primer toque en "Toca para empezar" (restricción de iOS).

## Estructura del proyecto

```
index.html  manifest.json  sw.js        página, instalación PWA y modo sin conexión
css/style.css                            estilos, controles táctiles, aviso de orientación
src/engine/                              vista (retina), entrada, física, mapa de tiles, cámara
src/entities/                            jugador, enemigos y aparatos (plataformas móviles, hojas, bloques al ritmo, muelles)
src/art/                                 sprites, enemigos, aparatos, tiles, fondos con parallax, partículas (todo generado por código)
src/audio/audio.js                       música chiptune y efectos con Web Audio
src/scenes/                              título, selección, mapa, juego, recuerdo, final
src/ui/ src/state/                       texto pixel, controles táctiles, guardado
levels/                                  textos (story.js), temas, trozos (genéricos y propios de cada nivel) y niveles
assets/                                  fuente, iconos, sprites, fotos de los recuerdos y música propia
tests/ tools/                            pruebas con Playwright y generador de PNG
```

## Créditos y licencias

Fuente [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) (SIL Open Font License, ver `assets/fonts/OFL.txt`). El resto (código, sprites, música y sonidos) está creado para este juego, sin material con derechos de autor.
