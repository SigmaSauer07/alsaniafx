// Service Worker for AlsaniaFX NFT Marketplace
const CACHE_NAME = 'alsaniafx-v1.0.0';
const STATIC_CACHE = 'alsaniafx-static-v1';
const DYNAMIC_CACHE = 'alsaniafx-dynamic-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/config.js',
    '/js/utils.js',
    '/js/web3.js',
    '/js/marketplace.js',
    '/js/nft.js',
    '/js/collections.js',
    '/js/profile.js',
    '/js/ui.js',
    '/js/app.js',
    '/js/performance.js',
    '/js/advanced-ui.js',
    '/js/analytics.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle API requests differently
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle static assets
    if (isStaticAsset(url.pathname)) {
        event.respondWith(handleStaticAsset(request));
        return;
    }

    // Handle other requests
    event.respondWith(handleOtherRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        return caches.match('/offline.html');
    }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Update cache in background
        fetch(request).then((response) => {
            if (response.ok) {
                caches.open(STATIC_CACHE).then((cache) => {
                    cache.put(request, response);
                });
            }
        });
        
        return cachedResponse;
    }
    
    // Fallback to network
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return new Response('Offline', { status: 503 });
    }
}

// Handle other requests with network-first strategy
async function handleOtherRequest(request) {
    try {
        const response = await fetch(request);
        
        // Cache successful responses
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        return caches.match('/offline.html');
    }
}

// Check if request is for static asset
function isStaticAsset(pathname) {
    return STATIC_ASSETS.some(asset => pathname === asset) ||
           pathname.startsWith('/css/') ||
           pathname.startsWith('/js/') ||
           pathname.startsWith('/images/') ||
           pathname.endsWith('.css') ||
           pathname.endsWith('.js') ||
           pathname.endsWith('.png') ||
           pathname.endsWith('.jpg') ||
           pathname.endsWith('.svg');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Get stored offline actions
        const offlineActions = await getOfflineActions();
        
        for (const action of offlineActions) {
            try {
                await performOfflineAction(action);
                await removeOfflineAction(action.id);
            } catch (error) {
                console.error('Background sync failed for action:', action.id, error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Store offline action
async function storeOfflineAction(action) {
    const actions = await getOfflineActions();
    actions.push({
        id: Date.now().toString(),
        action: action,
        timestamp: Date.now()
    });
    
    localStorage.setItem('offline-actions', JSON.stringify(actions));
}

// Get stored offline actions
async function getOfflineActions() {
    try {
        return JSON.parse(localStorage.getItem('offline-actions') || '[]');
    } catch (error) {
        return [];
    }
}

// Remove offline action
async function removeOfflineAction(actionId) {
    const actions = await getOfflineActions();
    const filteredActions = actions.filter(action => action.id !== actionId);
    localStorage.setItem('offline-actions', JSON.stringify(filteredActions));
}

// Perform offline action
async function performOfflineAction(actionData) {
    const { action } = actionData;
    
    switch (action.type) {
        case 'list-nft':
            // Implement NFT listing logic
            break;
        case 'place-bid':
            // Implement bid placement logic
            break;
        case 'buy-nft':
            // Implement NFT purchase logic
            break;
        default:
            console.warn('Unknown action type:', action.type);
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New notification from AlsaniaFX',
        icon: '/images/alsania-icon.png',
        badge: '/images/alsania-badge.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/images/explore-icon.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/close-icon.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('AlsaniaFX', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/explore')
        );
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event.notification.tag);
});

// Message handling
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
}); 