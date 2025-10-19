#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Быстрое исправление nginx конфигурации...${NC}"

# Исправляем ошибку в gzip_proxied
echo -e "${YELLOW}📝 Исправляем синтаксис gzip_proxied...${NC}"
sudo sed -i 's/gzip_proxied expired no-cache no-store private must-revalidate auth;/gzip_proxied expired no-cache no-store private auth;/g' /etc/nginx/sites-available/flow

# Проверяем конфигурацию
echo -e "${YELLOW}✅ Проверяем конфигурацию nginx...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Конфигурация nginx исправлена${NC}"
    
    # Перезагружаем nginx
    echo -e "${YELLOW}🔄 Перезагружаем nginx...${NC}"
    sudo systemctl reload nginx
    
    if sudo systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx успешно перезагружен${NC}"
        echo -e "${GREEN}🌐 Ваш сайт доступен по адресу: http://pvnto.ru${NC}"
    else
        echo -e "${RED}❌ Ошибка при перезагрузке nginx${NC}"
        sudo systemctl status nginx
    fi
else
    echo -e "${RED}❌ Ошибка в конфигурации nginx${NC}"
    echo -e "${YELLOW}📋 Детали ошибки:${NC}"
    sudo nginx -t
fi
