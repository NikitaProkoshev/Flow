#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Начинаем развертывание Flow приложения...${NC}"

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Ошибка: package.json не найден. Запустите скрипт из корневой директории проекта.${NC}"
    exit 1
fi

# Останавливаем PM2 процесс если он запущен
echo -e "${YELLOW}⏹️ Останавливаем существующий процесс...${NC}"
pm2 stop flow-app 2>/dev/null || true
pm2 delete flow-app 2>/dev/null || true

# Устанавливаем зависимости
echo -e "${YELLOW}📦 Устанавливаем зависимости...${NC}"
npm install --production

# Собираем React приложение
echo -e "${YELLOW}🔨 Собираем React приложение...${NC}"
cd client
npm install
npm run build
cd ..

# Копируем собранное приложение в нужную директорию
echo -e "${YELLOW}📁 Копируем файлы...${NC}"
sudo mkdir -p /var/www/flow
sudo cp -r client/build/* /var/www/flow/
sudo chown -R www-data:www-data /var/www/flow

# Копируем конфигурацию nginx
echo -e "${YELLOW}⚙️ Настраиваем nginx...${NC}"
sudo cp nginx.conf /etc/nginx/sites-available/flow
sudo ln -sf /etc/nginx/sites-available/flow /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Запускаем приложение через PM2
echo -e "${YELLOW}🚀 Запускаем приложение...${NC}"
pm2 start ecosystem.config.js --env production

# Сохраняем конфигурацию PM2
pm2 save
pm2 startup

echo -e "${GREEN}✅ Развертывание завершено успешно!${NC}"
echo -e "${GREEN}🌐 Приложение доступно по адресу: https://pvnto.ru${NC}"
echo -e "${YELLOW}📊 Для мониторинга используйте: pm2 monit${NC}"
echo -e "${YELLOW}📋 Логи: pm2 logs flow-app${NC}"
