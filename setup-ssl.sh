#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Настройка SSL сертификата для pvnto.ru${NC}"

# Проверяем, что certbot установлен
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Устанавливаем certbot...${NC}"
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Останавливаем nginx временно
echo -e "${YELLOW}⏹️ Останавливаем nginx...${NC}"
sudo systemctl stop nginx

# Получаем сертификат
echo -e "${YELLOW}🔐 Получаем SSL сертификат...${NC}"
sudo certbot certonly --standalone -d pvnto.ru -d www.pvnto.ru

# Проверяем, что сертификат получен
if [ -f "/etc/letsencrypt/live/pvnto.ru/fullchain.pem" ]; then
    echo -e "${GREEN}✅ SSL сертификат успешно получен!${NC}"
    
    # Настраиваем автообновление
    echo -e "${YELLOW}🔄 Настраиваем автообновление сертификата...${NC}"
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    # Запускаем nginx
    echo -e "${YELLOW}🚀 Запускаем nginx...${NC}"
    sudo systemctl start nginx
    
    echo -e "${GREEN}✅ SSL настроен успешно!${NC}"
    echo -e "${GREEN}🌐 Ваш сайт теперь доступен по HTTPS: https://pvnto.ru${NC}"
else
    echo -e "${RED}❌ Ошибка при получении SSL сертификата${NC}"
    echo -e "${YELLOW}💡 Убедитесь, что:${NC}"
    echo -e "${YELLOW}   - Домен pvnto.ru указывает на ваш сервер${NC}"
    echo -e "${YELLOW}   - Порт 80 открыт в файрволе${NC}"
    echo -e "${YELLOW}   - DNS записи обновились${NC}"
fi
