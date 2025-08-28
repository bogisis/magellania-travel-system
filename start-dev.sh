#!/bin/bash

# MAGELLANIA Travel System - Автоматический запуск
# Запускает фронтенд и API сервер одновременно

echo "🚀 Запуск MAGELLANIA Travel System..."

# Проверяем, что мы в корневой папке проекта
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой папки проекта"
    exit 1
fi

# Проверяем, что api-server существует
if [ ! -d "api-server" ]; then
    echo "❌ Ошибка: Папка api-server не найдена"
    exit 1
fi

# Проверяем, что working-server.js существует
if [ ! -f "api-server/working-server.js" ]; then
    echo "❌ Ошибка: api-server/working-server.js не найден"
    exit 1
fi

# Функция для очистки при выходе
cleanup() {
    echo ""
    echo "🛑 Остановка серверов..."
    kill $FRONTEND_PID $API_PID 2>/dev/null
    exit 0
}

# Устанавливаем обработчик сигналов
trap cleanup SIGINT SIGTERM

echo "📦 Установка зависимостей..."
npm install

echo "🗄️ Запуск API сервера..."
cd api-server
node working-server.js &
API_PID=$!
cd ..

echo "⏳ Ожидание запуска API сервера..."
sleep 3

# Проверяем, что API сервер запустился
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ API сервер запущен на http://localhost:3001"
else
    echo "❌ Ошибка: API сервер не запустился"
    kill $API_PID 2>/dev/null
    exit 1
fi

echo "🌐 Запуск фронтенда..."
npm run dev &
FRONTEND_PID=$!

echo "⏳ Ожидание запуска фронтенда..."
sleep 5

# Проверяем, что фронтенд запустился
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Фронтенд запущен на http://localhost:5173"
else
    echo "⚠️ Фронтенд может быть еще не готов, проверьте http://localhost:5173"
fi

echo ""
echo "🎉 MAGELLANIA Travel System запущена!"
echo "📊 API: http://localhost:3001"
echo "🌐 Фронтенд: http://localhost:5173"
echo "🗄️ Миграция БД: http://localhost:5173/migration"
echo ""
echo "Нажмите Ctrl+C для остановки всех серверов"

# Ждем завершения
wait
