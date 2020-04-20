const staticCacheName = 'site-static-v5';
const dynamicCacheName = 'sitedynamic-v7';
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    'img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
    '/pages/fallback.html'
]; 

// cache size limit function 
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache =>{
        cache.keys().then(keys =>{
            if(keys.length > size){
                cache.delete(keys[0])
                .then(limitCacheSize(name, size));
            }
        })
    })
};

//install service worker: install fires if SW is changed
self.addEventListener('install', (evt)=>{
    // console.log('service worker has been installed');

    //wait until the caching is done then end the install event
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('caching shell assets');
            cache.addAll(assets);
        })
    );
    
}); 

//activate service worker 
self.addEventListener('activate', evt =>{
    // console.log('service worker has been activated');
    evt.waitUntil(
        caches.keys().then(keys =>{
            // console.log(keys);
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key=>caches.delete(key))
                )    
        })
    )
    
}) 

//fetch event
self.addEventListener('fetch', evt =>{
    // console.log('fetch', evt);

    //intercept request from browser to server
        if(evt.request.url.indexOf('firestore.googleapis.com') === -1){

            evt.respondWith(
                //check if request has been cached 
                caches.match(evt.request).then(cacheRes =>{
                    //return the cached request or continues fetch request and save request in the dynamic cache
                    return cacheRes || fetch(evt.request).then(fetchRes =>{
                        return caches.open(dynamicCacheName).then(cache => {
                            // save a copy of the fetch response in cache
                            cache.put(evt.request.url, fetchRes.clone());
                            //check and limit cache size
                            limitCacheSize(dynamicCacheName, 15);  
                            // return the fetch response to the application
                            return fetchRes;
                        })
                    }).catch(()=>{
                        if (evt.request.url.indexOf('.html') > -1 ){
                            return caches.match('/pages/fallback.html');
                        }
                    });
                })
            );
            
        }
}); 