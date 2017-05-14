console.log(111);

this.addEventListener('install', function(event) {
    console.log('sw.js install');
    event.waitUntil(
        //这里先不往缓存中写
        caches.open('v1').then(function(cache) {
            return cache.addAll([
                // '/demo/service-workers/',
                // '/demo/service-workers/index.html',
                // '/demo/service-workers/js/main.js',
                // '/demo/service-workers/json/data.json',
                // '/demo/service-workers/images/1.jpg',
                // '/demo/service-workers/images/2.jpg',
                // '/demo/service-workers/child.html',
            ]);
        })
    );
});

this.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            if (response) {
                //如果匹配到了
                return response;
            } else {
                //如果有资源没有匹配(比如child.html里面的跨域图片),就先发请求访问,然后缓存一份
                console.log('url not match;' + event.request.url);
                return fetch(event.request).then(function(response) {
                    console.log(response);
                    caches.open('v1').then(function(cache) {
                        cache.put(event.request, response);
                    });
                    return response.clone();
                });
            }
        })
        .catch(function() {
            return fetch(event.request);
        })
    );
});

this.addEventListener('activate', function(event) {
    console.log('activate')
});