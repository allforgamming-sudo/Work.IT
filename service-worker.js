// Service Worker for Shift Calendar PWA

const CACHE_NAME = 'shift-calendar-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install event - cache assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(error => {
                console.error('Cache addAll error:', error);
                // Continue even if some assets fail to cache
                return Promise.resolve();
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Network first strategy for dynamic content
    event.respondWith(
        fetch(request)
            .then(response => {
                // Cache successful responses
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    const cache = caches.open(CACHE_NAME);
                    cache.then(c => c.put(request, responseClone));
                }
                return response;
            })
            .catch(error => {
                // Fall back to cache
                return caches.match(request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        
                        // Provide offline fallback
                        if (request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // Return error response
                        return new Response('Offline - Resource not available', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Handle messages from clients
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background sync for data (when connection is restored)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-shifts') {
        event.waitUntil(syncShifts());
    }
});

async function syncShifts() {
    try {
        // This would sync data with a backend if needed
        console.log('Syncing shifts data');
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// Push notifications (optional)
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'New notification from Shift Calendar',
        icon: '/icon-192.png',
        badge: '/icon-96.png',
        vibrate: [200, 100, 200],
        tag: 'shift-notification'
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Shift Calendar', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Find if app is already open
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open app if not already open
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});
