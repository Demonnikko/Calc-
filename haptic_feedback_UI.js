// ============================================
// ТАКТИЛЬНАЯ ВИБРАЦИЯ ДЛЯ UI КНОПОК
// ============================================
// Добавьте этот код в <script> тег в index.html
// Вставить ПЕРЕД закрывающим </script> (примерно строка 9000+)

(function() {
  // Проверяем поддержку Vibration API
  const isVibrationSupported = 'vibrate' in navigator;

  // Паттерны вибрации (в миллисекундах)
  const HAPTIC = {
    light: 15,       // Легкая вибрация
    medium: 25,      // Средняя вибрация
    strong: 40,      // Сильная вибрация
    success: [15, 50, 15],  // Паттерн успеха (два быстрых импульса)
    error: [10, 50, 10, 50, 10]  // Паттерн ошибки
  };

  // Главная функция вибрации
  window.hapticFeedback = function(type = 'medium') {
    if (!isVibrationSupported) return;
    const pattern = HAPTIC[type] || HAPTIC.medium;
    navigator.vibrate(pattern);
  };

  // Ждем загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHaptics);
  } else {
    initHaptics();
  }

  function initHaptics() {
    console.log('✅ UI Haptic feedback initialized', { supported: isVibrationSupported });

    // ВАЖНО: Переопределяем App.showToast чтобы добавить вибрацию
    if (window.App && window.App.showToast) {
      const originalShowToast = window.App.showToast;

      window.App.showToast = function(message, duration) {
        // Определяем тип вибрации по сообщению
        if (message.includes('скопировано') || message.includes('добавлена') || message.includes('восстановлена')) {
          hapticFeedback('success');  // Успешное действие - два импульса
        } else if (message.includes('Ошибка') || message.includes('❌')) {
          hapticFeedback('error');  // Ошибка - паттерн
        } else if (message.includes('Удалено') || message.includes('удалена')) {
          hapticFeedback('medium');  // Удаление - одиночная средняя
        } else {
          hapticFeedback('light');  // Остальное - легкая
        }

        // Вызываем оригинальную функцию
        return originalShowToast.call(this, message, duration);
      };
    }

    // Добавляем вибрацию на кнопку "Забронировать в календарь"
    const calendarBtn = document.getElementById('btn-to-calendar');
    if (calendarBtn) {
      calendarBtn.addEventListener('click', () => {
        hapticFeedback('strong');  // Сильная вибрация для важного действия
      });
    }

    // Добавляем вибрацию на все кнопки с классом btn-primary (главные кнопки)
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('click', () => {
        hapticFeedback('medium');
      });
    });

    // Добавляем вибрацию на все кнопки с классом btn-secondary
    document.querySelectorAll('.btn-secondary').forEach(btn => {
      btn.addEventListener('click', () => {
        hapticFeedback('light');
      });
    });

    // Добавляем вибрацию на кнопки удаления (с иконкой trash)
    document.querySelectorAll('[data-lucide="trash-2"]').forEach(icon => {
      const button = icon.closest('button');
      if (button) {
        button.addEventListener('click', () => {
          hapticFeedback('medium');
        });
      }
    });
  }

  console.log('📳 Haptic feedback module loaded');
})();
