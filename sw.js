// NuContaRG — Service Worker v1
const CACHE = 'nuconta-v1';
const ASSETS = [
  '/NuContaRG/',
  '/NuContaRG/index.html',
  '/NuContaRG/icon-192.png',
  '/NuContaRG/icon-512.png'
];

// Instalación: cachear los recursos principales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Network-first para que siempre cargue la última versión
// Si falla la red (offline), sirve desde caché
self.addEventListener('fetch', event => {
  // Solo interceptar peticiones GET del mismo origen
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar copia en caché si la respuesta es válida
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
