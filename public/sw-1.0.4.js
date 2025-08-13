const CACHE_VERSION = 'v1.0.4'
const STATIC_CACHE = `getbig-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `getbig-runtime-${CACHE_VERSION}`

// Precarga mínima: solo recursos estáticos que existen en /public
const urlsToPrecache = [
	'/',
	'/index.html',
	'/icono-blanco.ico',
	'/manifest.json'
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(STATIC_CACHE)
			.then((cache) => {
				console.log('🔄 SW: Precargando estáticos')
				return cache.addAll(urlsToPrecache)
			})
			.then(() => self.skipWaiting())
			.catch((error) => {
				console.error('❌ SW: Error al precargar:', error)
			})
	)
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						const keep = [STATIC_CACHE, RUNTIME_CACHE]
						if (!keep.includes(cacheName)) {
							console.log('🗑️ SW: Eliminando cache antiguo:', cacheName)
							return caches.delete(cacheName)
						}
					})
				)
			})
			.then(() => self.clients.claim())
	)
})

// Interceptar peticiones fetch
self.addEventListener('fetch', (event) => {
	const { request } = event

	// Solo manejar GET y mismo origen
	if (
		request.method !== 'GET' ||
		new URL(request.url).origin !== self.location.origin
	) {
		return
	}

	const requestURL = new URL(request.url)

	// Estrategia network-first para navegación (SPA)
	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request)
				.then((response) => {
					const copy = response.clone()
					caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
					return response
				})
				.catch(async () => {
					const cached = await caches.match(request)
					return cached || caches.match('/index.html')
				})
		)
		return
	}

	// Para assets estáticos: estrategia diferenciada
	const isJS = /\.(?:js)$/i.test(requestURL.pathname)
	const isStaticAsset = /\.(?:css|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf)$/i.test(
		requestURL.pathname
	)

	// JS: network-first para evitar mezclar versiones de chunks
	if (isJS) {
		event.respondWith(
			fetch(request)
				.then((response) => {
					if (
						response &&
						response.status === 200 &&
						response.type === 'basic'
					) {
						const copy = response.clone()
						caches
							.open(RUNTIME_CACHE)
							.then((cache) => cache.put(request, copy))
					}
					return response
				})
				.catch(async () => {
					const cached = await caches.match(request)
					return cached || Promise.reject('No JS available in cache')
				})
		)
		return
	}

	// CSS/imagenes/fuentes: stale-while-revalidate
	if (isStaticAsset) {
		event.respondWith(
			caches.match(request).then((cached) => {
				const networkFetch = fetch(request)
					.then((response) => {
						if (
							response &&
							response.status === 200 &&
							response.type === 'basic'
						) {
							const copy = response.clone()
							caches
								.open(RUNTIME_CACHE)
								.then((cache) => cache.put(request, copy))
						}
						return response
					})
					.catch(() => cached)
				return cached || networkFetch
			})
		)
		return
	}

	// Por defecto: cache-first con actualización en background
	event.respondWith(
		caches.match(request).then((cached) => {
			const networkFetch = fetch(request)
				.then((response) => {
					if (
						response &&
						response.status === 200 &&
						response.type === 'basic'
					) {
						const copy = response.clone()
						caches
							.open(RUNTIME_CACHE)
							.then((cache) => cache.put(request, copy))
					}
					return response
				})
				.catch(() => cached)
			return cached || networkFetch
		})
	)
})

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting()
	}
})

// Manejar notificaciones push (futuro)
self.addEventListener('push', (event) => {
	const options = {
		body: event.data ? event.data.text() : '¡Nueva notificación de GetBig!',
		icon: '/icono-blanco.ico',
		badge: '/icono-blanco.ico',
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1,
		},
		actions: [
			{
				action: 'explore',
				title: 'Ver más',
				icon: '/icono-blanco.ico',
			},
			{
				action: 'close',
				title: 'Cerrar',
				icon: '/icono-blanco.ico',
			},
		],
	}

	event.waitUntil(
		self.registration.showNotification('GetBig Fitness', options)
	)
})

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
	event.notification.close()

	if (event.action === 'explore') {
		event.waitUntil(clients.openWindow('/'))
	}
})


