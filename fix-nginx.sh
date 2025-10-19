#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Исправляем конфигурацию nginx...${NC}"

# Останавливаем nginx
echo -e "${YELLOW}⏹️ Останавливаем nginx...${NC}"
sudo systemctl stop nginx

# Отключаем дефолтный сайт
echo -e "${YELLOW}🗑️ Отключаем дефолтный сайт nginx...${NC}"
sudo rm -f /etc/nginx/sites-enabled/default

# Копируем нашу конфигурацию
echo -e "${YELLOW}📋 Копируем конфигурацию...${NC}"
sudo cp nginx.conf /etc/nginx/sites-available/flow

# Создаем символическую ссылку
echo -e "${YELLOW}🔗 Создаем символическую ссылку...${NC}"
sudo ln -sf /etc/nginx/sites-available/flow /etc/nginx/sites-enabled/

# Проверяем конфигурацию
echo -e "${YELLOW}✅ Проверяем конфигурацию nginx...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Конфигурация nginx корректна${NC}"
    
    # Запускаем nginx
    echo -e "${YELLOW}🚀 Запускаем nginx...${NC}"
    sudo systemctl start nginx
    
    # Проверяем статус
    if sudo systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx успешно запущен${NC}"
        echo -e "${GREEN}🌐 Ваш сайт теперь доступен по адресу: http://pvnto.ru${NC}"
        echo -e "${YELLOW}💡 Для настройки HTTPS запустите: ./setup-ssl.sh${NC}"
    else
        echo -e "${RED}❌ Ошибка при запуске nginx${NC}"
        sudo systemctl status nginx
    fi
else
    echo -e "${RED}❌ Ошибка в конфигурации nginx${NC}"
    echo -e "${YELLOW}📋 Детали ошибки:${NC}"
    sudo nginx -t
    exit 1
fi

# Проверяем, что приложение запущено
echo -e "${YELLOW}🔍 Проверяем статус приложения...${NC}"
if pm2 list | grep -q "flow-app"; then
    echo -e "${GREEN}✅ Приложение flow-app запущено${NC}"
else
    echo -e "${YELLOW}⚠️ Приложение не запущено. Запускаем...${NC}"
    pm2 start ecosystem.config.js --env production
fi

echo -e "${GREEN}🎉 Исправление завершено!${NC}"
echo -e "${GREEN}🌐 Сайт: http://pvnto.ru${NC}"
echo -e "${GREEN}🔧 API: http://pvnto.ru/api/task${NC}"
