import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './registerSW';
import './clearDevCache'; // Очистка кэша в dev режиме

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Регистрируем Service Worker только в продакшене
if (process.env.NODE_ENV === 'production') {
    serviceWorkerRegistration.register({
        onSuccess: (registration) => {
            console.log('PWA: Service Worker зарегистрирован успешно');
            console.log('PWA: Приложение готово к работе в офлайн режиме');
        },
        onUpdate: (registration) => {
            console.log('PWA: Доступно обновление приложения');
            if (window.confirm('Доступна новая версия приложения. Обновить?')) {
                window.location.reload();
            }
        }
    });
} else {
    // В dev режиме отключаем Service Worker
    console.log('Dev режим: Service Worker отключен для корректной работы hot-reload');
    serviceWorkerRegistration.unregister();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
