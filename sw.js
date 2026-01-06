// Service Worker для Illusionist OS
// Версия: 2.0 (PWA-only, без офлайна)
// Назначение: Позволяет установить приложение на Home Screen
// Офлайн режим: ОТКЛЮЧЁН - требуется интернет

console.log('[SW] Script loaded - PWA mode only');

// Install - регистрация Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing PWA Service Worker...');
  
  // Сразу активируем новую версию
  self.skipWaiting();
  
  console.log('[SW] Installation complete');
});

// Activate - активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating PWA Service Worker...');
  
  event.waitUntil(
    // Берём контроль над всеми открытыми страницами
    self.clients.claim().then(() => {
      console.log('[SW] Now controlling all pages');
    })
  );
});

// НЕТ fetch listener!
// Это значит:
// ✅ PWA установка работает (можно добавить на Home Screen)
// ✅ Полноэкранный режим работает
// ✅ Иконка на рабочем столе
// ❌ Офлайн режим НЕ работает - нужен интернет

console.log('[SW] PWA Service Worker ready - online only mode');

