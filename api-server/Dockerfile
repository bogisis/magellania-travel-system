FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем папку для базы данных
RUN mkdir -p database

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["node", "working-server.js"]
