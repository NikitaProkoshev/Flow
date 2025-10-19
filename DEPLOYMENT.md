# 🚀 Развертывание Flow на VDS

## Предварительные требования

- Ubuntu 20.04+ или Debian 10+
- Node.js 16+ и npm
- PM2 (глобально)
- Nginx
- MongoDB Atlas (уже настроено)

## 📋 Пошаговая инструкция

### 1. Подготовка сервера

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Устанавливаем PM2 глобально
sudo npm install -g pm2

# Устанавливаем Nginx
sudo apt install -y nginx

# Устанавливаем Git
sudo apt install -y git
```

### 2. Клонирование и настройка проекта

```bash
# Клонируем репозиторий
git clone <your-repo-url> /var/www/flow
cd /var/www/flow

# Делаем скрипты исполняемыми
chmod +x deploy.sh setup-ssl.sh

# Устанавливаем зависимости
npm install
```

### 3. Настройка домена

Убедитесь, что:
- Домен `pvnto.ru` указывает на IP вашего сервера
- DNS записи обновились (может занять до 24 часов)

### 4. Настройка SSL (обязательно!)

```bash
# Запускаем скрипт настройки SSL
./setup-ssl.sh
```

### 5. Развертывание приложения

```bash
# Запускаем скрипт развертывания
./deploy.sh
```

### 6. Настройка автозапуска

```bash
# Копируем systemd сервис
sudo cp flow.service /etc/systemd/system/

# Перезагружаем systemd
sudo systemctl daemon-reload

# Включаем автозапуск
sudo systemctl enable flow.service
```

## 🔧 Управление приложением

### PM2 команды
```bash
# Статус приложения
pm2 status

# Логи
pm2 logs flow-app

# Перезапуск
pm2 restart flow-app

# Остановка
pm2 stop flow-app

# Мониторинг
pm2 monit
```

### Nginx команды
```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка
sudo systemctl reload nginx

# Статус
sudo systemctl status nginx
```

## 🔍 Проверка работы

1. Откройте https://pvnto.ru в браузере
2. Проверьте, что API работает: https://pvnto.ru/api/task
3. Убедитесь, что SSL сертификат валиден

## 📊 Мониторинг

- **Логи приложения**: `pm2 logs flow-app`
- **Логи Nginx**: `sudo tail -f /var/log/nginx/flow_access.log`
- **Ошибки Nginx**: `sudo tail -f /var/log/nginx/flow_error.log`
- **Мониторинг PM2**: `pm2 monit`

## 🔄 Обновление приложения

```bash
# Переходим в директорию проекта
cd /var/www/flow

# Получаем обновления
git pull origin main

# Перезапускаем развертывание
./deploy.sh
```

## 🛠️ Устранение неполадок

### Приложение не запускается
```bash
# Проверяем логи
pm2 logs flow-app

# Проверяем статус
pm2 status
```

### Nginx ошибки
```bash
# Проверяем конфигурацию
sudo nginx -t

# Проверяем логи
sudo tail -f /var/log/nginx/error.log
```

### SSL проблемы
```bash
# Проверяем сертификат
sudo certbot certificates

# Обновляем сертификат
sudo certbot renew
```

## 📁 Структура файлов

```
/var/www/flow/
├── app.js                 # Основной файл приложения
├── package.json           # Зависимости Node.js
├── ecosystem.config.js    # Конфигурация PM2
├── nginx.conf            # Конфигурация Nginx
├── deploy.sh             # Скрипт развертывания
├── setup-ssl.sh          # Скрипт настройки SSL
├── flow.service          # Systemd сервис
└── client/build/         # Собранное React приложение
```

## 🔐 Безопасность

- SSL сертификат автоматически обновляется
- Nginx настроен с безопасными заголовками
- Приложение запускается в изолированной среде PM2
- Логирование всех запросов и ошибок
