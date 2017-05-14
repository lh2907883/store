this.addEventListener('install', function(event) {
    console.log('sw.js install');
    event.waitUntil(
        caches.open('v1').then(function(cache) {
            return cache.addAll([
                '/demo/service-workers/',
                '/demo/service-workers/index.html',
                '/demo/service-workers/js/main.js',
                '/demo/service-workers/json/data.json',
                '/demo/service-workers/images/1.jpg',
                '/demo/service-workers/images/2.jpg',
            ]);
        })
    );
});

this.addEventListener('fetch', function(event) {
    console.log(event.request);
    console.log(caches);
    event.respondWith(
        caches.match(event.request)
        .catch(function() {
            return fetch(event.request);
        }).then(function(response) {
            console.log(response);
            caches.open('v1').then(function(cache) {
                console.log(cache);
                cache.put(event.request, response);
            });
            return response.clone();
        }).catch(function() {

        })
    );
});