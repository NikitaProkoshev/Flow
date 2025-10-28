// Скрипт для очистки кэша в dev режиме
if (process.env.NODE_ENV === 'development') {
  // Очищаем кэш Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
        console.log('Dev: Service Worker отключен');
      }
    });
  }

  // Очищаем кэш браузера
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
        console.log('Dev: Кэш очищен:', name);
      }
    });
  }

  // Очищаем localStorage (опционально)
  // localStorage.clear();
  // console.log('Dev: localStorage очищен');
}
