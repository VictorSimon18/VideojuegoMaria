// Service worker: permite jugar sin conexión y que la app se instale a pantalla completa.
// Estrategia: se precachea todo el juego; después, "stale-while-revalidate" (se sirve lo guardado y se
// actualiza en segundo plano). Si cambias archivos, SUBE el número de CACHE_VERSION para limpiar la caché.
const CACHE_VERSION = 2;
const CACHE = `videojuego-maria-v${CACHE_VERSION}`;

const FILES = [
  './', 'index.html', 'manifest.json', 'css/style.css',
  'assets/fonts/PressStart2P-Regular.ttf',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png',
  'assets/sprites/maria.png', 'assets/sprites/victor.png',
  'src/main.js',
  'src/engine/constants.js', 'src/engine/view.js', 'src/engine/input.js', 'src/engine/physics.js',
  'src/engine/tilemap.js', 'src/engine/camera.js',
  'src/art/pixel.js', 'src/art/sprites.js', 'src/art/tiles.js', 'src/art/backgrounds.js', 'src/art/particles.js',
  'src/art/enemies.js', 'src/art/gadget_art.js',
  'src/audio/audio.js', 'src/state/save.js',
  'src/entities/player.js', 'src/entities/enemy.js', 'src/entities/gadgets.js',
  'src/ui/text.js', 'src/ui/touch.js',
  'src/scenes/title.js', 'src/scenes/select.js', 'src/scenes/map.js', 'src/scenes/game.js',
  'src/scenes/memory.js', 'src/scenes/final.js',
  'levels/index.js', 'levels/story.js', 'levels/themes.js', 'levels/chunks.js', 'levels/chunks_themed.js',
  'levels/level1.js', 'levels/level2.js', 'levels/level3.js', 'levels/level4.js', 'levels/level5.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(FILES.map((f) => c.add(f)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('videojuego-maria-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // el audio (peticiones Range en Safari) y las canciones propias no pasan por la caché del service worker
  if (req.headers.has('range') || /\/assets\/music\/.+\.(mp3|m4a|aac|ogg|wav)$/i.test(url.pathname)) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
