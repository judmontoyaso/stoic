const CACHE_NAME = 'stoic-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/favicon.ico',
  '/logo.svg',
  '/manifest.json'
];

// Instalar SW y almacenar activos estáticos principales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones y aplicar estrategias de almacenamiento en caché
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Omitir peticiones que no sean HTTP (extensiones de chrome, supabase API, etc.)
  if (!req.url.startsWith(self.location.origin)) {
    return;
  }

  // Estrategia: Network-First para páginas HTML (para siempre ver datos frescos)
  // Cache-First para archivos estáticos (JS, CSS, Imágenes, Fuentes)
  const isStaticAsset = 
    req.url.includes('/_next/') || 
    req.url.endsWith('.js') || 
    req.url.endsWith('.css') || 
    req.url.endsWith('.png') || 
    req.url.endsWith('.svg') || 
    req.url.endsWith('.ico') ||
    req.url.includes('/manifest.json');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(req).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
          return networkResponse;
        });
      })
    );
  } else {
    // Network-First con Fallback de Caché
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Si falla todo, retornar la raíz "/" (shell principal)
            return caches.match('/');
          });
        })
    );
  }
});

// ============================================================
// Web Push: recibir notificaciones y abrir la app al tocarlas
// ============================================================
self.addEventListener('push', (event) => {
  let data = { title: 'StoiCom', body: 'Tu entrenamiento te espera.', url: '/', tag: 'stoic' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) { /* payload no JSON: usar defaults */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag,
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
