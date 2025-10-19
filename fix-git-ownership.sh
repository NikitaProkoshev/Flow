#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Исправляем права доступа к Git репозиторию...${NC}"

# Переходим в директорию проекта
cd /var/www/flow

# Проверяем текущего владельца
echo -e "${YELLOW}📋 Текущий владелец репозитория:${NC}"
ls -la | head -5

# Исправляем права доступа
echo -e "${YELLOW}🔐 Исправляем права доступа...${NC}"
sudo chown -R $USER:$USER /var/www/flow

# Устанавливаем безопасные права для .git
echo -e "${YELLOW}🔒 Настраиваем безопасные права для .git...${NC}"
chmod -R 755 /var/www/flow/.git
chmod 700 /var/www/flow/.git/hooks
chmod 700 /var/www/flow/.git/objects
chmod 700 /var/www/flow/.git/refs

# Настраиваем Git для безопасной работы
echo -e "${YELLOW}⚙️ Настраиваем Git...${NC}"
git config --global --add safe.directory /var/www/flow

# Проверяем, что все работает
echo -e "${YELLOW}✅ Проверяем Git...${NC}"
if git status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Git работает корректно${NC}"
    echo -e "${GREEN}🌐 Теперь можно выполнить: git pull origin main${NC}"
else
    echo -e "${RED}❌ Проблема с Git все еще существует${NC}"
    echo -e "${YELLOW}💡 Попробуйте выполнить:${NC}"
    echo -e "${YELLOW}   sudo chown -R \$USER:\$USER /var/www/flow${NC}"
    echo -e "${YELLOW}   git config --global --add safe.directory /var/www/flow${NC}"
fi

echo -e "${GREEN}🎉 Исправление завершено!${NC}"
