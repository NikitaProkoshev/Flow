#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎨 Генерация иконок для PWA...${NC}"

# Проверяем наличие ImageMagick
if ! command -v convert &> /dev/null; then
    echo -e "${YELLOW}📦 Устанавливаем ImageMagick...${NC}"
    sudo apt update
    sudo apt install -y imagemagick
fi

cd client/public

# Создаем временную директорию
mkdir -p temp_icons

echo -e "${YELLOW}🔄 Создаем иконки из существующих...${NC}"

# Используем logo512.png как основу, если есть, иначе logo192.png
if [ -f "logo512.png" ]; then
    BASE_ICON="logo512.png"
    echo -e "${GREEN}✅ Используем logo512.png как основу${NC}"
elif [ -f "logo192.png" ]; then
    BASE_ICON="logo192.png"
    echo -e "${GREEN}✅ Используем logo192.png как основу${NC}"
else
    echo -e "${RED}❌ Не найдены logo512.png или logo192.png${NC}"
    echo -e "${YELLOW}💡 Создайте иконку 512x512px и назовите logo512.png${NC}"
    exit 1
fi

# Создаем any иконки (обычные)
echo -e "${YELLOW}📱 Создаем any иконки...${NC}"
convert "$BASE_ICON" -resize 192x192 temp_icons/icon-192-any.png
convert "$BASE_ICON" -resize 512x512 temp_icons/icon-512-any.png
convert "$BASE_ICON" -resize 1024x1024 temp_icons/icon-1024.png

# Создаем maskable иконки (для Android)
echo -e "${YELLOW}🤖 Создаем maskable иконки...${NC}"

# 192x192 maskable (безопасная зона 126px)
convert "$BASE_ICON" -resize 126x126 temp_icons/logo_small.png
convert -size 192x192 xc:transparent temp_icons/icon-192-maskable.png
composite -gravity center temp_icons/logo_small.png temp_icons/icon-192-maskable.png temp_icons/icon-192-maskable.png

# 512x512 maskable (безопасная зона 338px)
convert "$BASE_ICON" -resize 338x338 temp_icons/logo_medium.png
convert -size 512x512 xc:transparent temp_icons/icon-512-maskable.png
composite -gravity center temp_icons/logo_medium.png temp_icons/icon-512-maskable.png temp_icons/icon-512-maskable.png

# 1024x1024 maskable (безопасная зона 676px)
convert "$BASE_ICON" -resize 676x676 temp_icons/logo_large.png
convert -size 1024x1024 xc:transparent temp_icons/icon-1024-maskable.png
composite -gravity center temp_icons/logo_large.png temp_icons/icon-1024-maskable.png temp_icons/icon-1024-maskable.png

# Копируем готовые иконки
echo -e "${YELLOW}📁 Копируем иконки...${NC}"
cp temp_icons/*.png ./

# Очищаем временные файлы
rm -rf temp_icons

echo -e "${GREEN}✅ Иконки созданы успешно!${NC}"
echo -e "${GREEN}📱 Созданные файлы:${NC}"
echo -e "${GREEN}   - icon-192-any.png (192x192)${NC}"
echo -e "${GREEN}   - icon-192-maskable.png (192x192, для Android)${NC}"
echo -e "${GREEN}   - icon-512-any.png (512x512)${NC}"
echo -e "${GREEN}   - icon-512-maskable.png (512x512, для Android)${NC}"
echo -e "${GREEN}   - icon-1024.png (1024x1024)${NC}"
echo -e "${GREEN}   - icon-1024-maskable.png (1024x1024, для Android)${NC}"

echo -e "${YELLOW}🚀 Теперь запустите: ./deploy.sh${NC}"
