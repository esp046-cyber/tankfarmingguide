const CACHE='tankfarming-v2026.2';
const ASSETS=[
 "./",
 "./apple-touch-icon.png",
 "./assets/og-image.png",
 "./css/styles.css",
 "./favicon.ico",
 "./favicon.svg",
 "./icons/favicon-16x16.png",
 "./icons/favicon-32x32.png",
 "./icons/icon-128.png",
 "./icons/icon-144.png",
 "./icons/icon-152.png",
 "./icons/icon-192.png",
 "./icons/icon-384.png",
 "./icons/icon-512.png",
 "./icons/icon-72.png",
 "./icons/icon-96.png",
 "./icons/icon-maskable-192.png",
 "./icons/icon-maskable-512.png",
 "./index.html",
 "./js/app.js",
 "./manifest.webmanifest",
 "./offline.html",
 "./robots.txt",
 "./screenshots/screenshot-narrow.png",
 "./screenshots/screenshot-wide.png"
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html')).then(m=>m||caches.match('./offline.html'))));return}
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match('./offline.html'))));
});
