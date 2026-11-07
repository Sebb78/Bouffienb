// Mode hors ligne. Tous les chemins sont relatifs à l'emplacement de sw.js,
// donc valables sous /nutritrack/ comme à la racine.
// Stratégie : réponse immédiate depuis le cache, puis mise à jour en arrière-plan
// (la nouvelle version s'applique au lancement suivant). Change VERSION pour vider l'ancien cache.
const VERSION = 'bouffienb-v1.1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/main.js', 'js/store.js', 'js/utils.js', 'js/features/diary.js', 'js/features/settings.js',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'js/features/food.js', 'js/features/sport.js'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(VERSION)
    // cache:'reload' évite de précacher une copie périmée du cache HTTP de GitHub Pages (10 min)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting())));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req.url, { cache: 'no-cache' })
      .then(r => { if (r.ok) cache.put(req, r.clone()); return r; })
      .catch(() => null);
    if (cached) { e.waitUntil(network); return cached; }
    return (await network) || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
  })());
});
