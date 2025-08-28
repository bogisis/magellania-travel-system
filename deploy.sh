#!/bin/bash

# MAGELLANIA Travel System - Скрипт деплоя
# Для продакшена на физический сервер

set -e

echo "🚀 Начало деплоя MAGELLANIA Travel System..."

# Проверяем окружение
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️ Внимание: NODE_ENV не установлен в production"
    export NODE_ENV=production
fi

# Проверяем наличие необходимых файлов
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден"
    exit 1
fi

if [ ! -f "api-server/working-server.js" ]; then
    echo "❌ Ошибка: API сервер не найден"
    exit 1
fi

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
npm ci --only=production

# Собираем фронтенд
echo "🔨 Сборка фронтенда..."
npm run build

# Проверяем сборку
if [ ! -d "dist" ]; then
    echo "❌ Ошибка: Сборка не создана"
    exit 1
fi

echo "✅ Сборка завершена успешно"

# Создаем папки для логов
mkdir -p logs
mkdir -p api-server/database

# Проверяем PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Установка PM2..."
    npm install -g pm2
fi

# Останавливаем существующие процессы
echo "🛑 Остановка существующих процессов..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

# Запускаем приложения через PM2
echo "🚀 Запуск приложений через PM2..."
pm2 start ecosystem.config.js --env production

# Сохраняем конфигурацию PM2
pm2 save

# Настраиваем автозапуск
pm2 startup

echo ""
echo "🎉 Деплой завершен успешно!"
echo ""
echo "📊 Статус приложений:"
pm2 status
echo ""
echo "🌐 Доступные URL:"
echo "   - Фронтенд: http://localhost:5173"
echo "   - API: http://localhost:3001"
echo "   - PM2 Dashboard: pm2 monit"
echo ""
echo "📝 Полезные команды:"
echo "   - pm2 logs - просмотр логов"
echo "   - pm2 restart all - перезапуск всех приложений"
echo "   - pm2 stop all - остановка всех приложений"
