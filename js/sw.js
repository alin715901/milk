// sw.js - 用于 PWA 通知和离线缓存
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open('v1').then(function(cache) {
            return cache.addAll([
                '/milk/',
                '/milk/index.html'
            ]);
        })
    );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) { return key !== 'v1'; })
                    .map(function(key) { return caches.delete(key); })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});

// ★★★ 推送通知处理 ★★★
self.addEventListener('push', function(e) {
    var data = {};
    try {
        data = e.data.json();
    } catch (err) {
        data = { title: '新消息', body: '你有新的消息' };
    }
    var options = {
        body: data.body || '你有新的消息',
        icon: 'icon.png',
        badge: 'icon.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/milk/'
        }
    };
    e.waitUntil(
        self.registration.showNotification(data.title || '传讯', options)
    );
});

// ★★★ 点击通知跳转 ★★★
self.addEventListener('notificationclick', function(e) {
    e.notification.close();
    var url = e.notification.data && e.notification.data.url ? e.notification.data.url : '/milk/';
    e.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
