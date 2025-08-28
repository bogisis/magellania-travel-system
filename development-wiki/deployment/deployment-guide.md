# Руководство по развертыванию

## 🚀 Обзор развертывания

MAGELLANIA Travel System поддерживает несколько способов развертывания для различных сред и требований.

### Доступные варианты развертывания

1. **Development** - Локальная разработка
2. **Staging** - Тестовая среда
3. **Production** - Продакшн среда
4. **Docker** - Контейнеризированное развертывание
5. **PM2** - Управление процессами

## 🛠 Локальная разработка

### Требования

```bash
# Системные требования
Node.js >= 18.0.0
npm >= 8.0.0
Git >= 2.0.0

# Проверка версий
node --version
npm --version
git --version
```

### Установка и запуск

```bash
# 1. Клонирование репозитория
git clone <repository-url>
cd magellania-travel-system

# 2. Установка зависимостей
npm install

# 3. Запуск в режиме разработки
npm start
```

### Доступные команды

```bash
# Основные команды
npm start              # Запуск фронтенда + API
npm run dev            # Только фронтенд
npm run api            # Только API сервер

# Утилиты
npm run status         # Проверка статуса сервисов
npm run build          # Сборка для продакшена
npm run preview        # Предпросмотр сборки

# Качество кода
npm run lint           # Проверка кода
npm run format         # Форматирование кода
```

### Конфигурация

#### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# API Server
API_PORT=3001
API_HOST=localhost
NODE_ENV=development

# Database
DB_PATH=./api-server/data/magellania.db

# Frontend
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE=MAGELLANIA Travel System

# Security
CORS_ORIGIN=http://localhost:5173
```

## 🐳 Docker развертывание

### Docker Compose

Создайте файл `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - '80:80'
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:3001
    networks:
      - magellania-network

  # Backend API
  backend:
    build:
      context: ./api-server
      dockerfile: Dockerfile
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
      - DB_PATH=/app/data/magellania.db
      - CORS_ORIGIN=http://localhost
    volumes:
      - ./api-server/data:/app/data
    networks:
      - magellania-network

  # Nginx (опционально)
  nginx:
    image: nginx:alpine
    ports:
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - magellania-network

networks:
  magellania-network:
    driver: bridge

volumes:
  magellania-data:
```

### Dockerfile для Frontend

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Dockerfile для Backend

```dockerfile
# api-server/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Создание директории для данных
RUN mkdir -p /app/data

# Открытие порта
EXPOSE 3001

# Запуск приложения
CMD ["node", "working-server.js"]
```

### Запуск Docker

```bash
# Сборка и запуск
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f
```

## ⚡ PM2 развертывание

### Установка PM2

```bash
# Глобальная установка
npm install -g pm2

# Проверка установки
pm2 --version
```

### Конфигурация PM2

Создайте файл `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'magellania-api',
      script: './api-server/working-server.js',
      cwd: './api-server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_PATH: './data/magellania.db',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_PATH: './data/magellania.db',
      },
    },
    {
      name: 'magellania-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
```

### Команды PM2

```bash
# Запуск приложений
pm2 start ecosystem.config.js

# Запуск в продакшн режиме
pm2 start ecosystem.config.js --env production

# Мониторинг
pm2 monit

# Просмотр логов
pm2 logs

# Перезапуск
pm2 restart all

# Остановка
pm2 stop all

# Удаление из PM2
pm2 delete all

# Сохранение конфигурации
pm2 save

# Автозапуск при перезагрузке
pm2 startup
```

## 🌐 Nginx конфигурация

### Основная конфигурация

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Логирование
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Основные настройки
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend сервер
    server {
        listen 80;
        server_name localhost;

        # Корневая директория
        root /usr/share/nginx/html;
        index index.html;

        # Обработка SPA роутинга
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Статические файлы
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API прокси
        location /api/ {
            proxy_pass http://backend:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Безопасность
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # HTTPS сервер (опционально)
    server {
        listen 443 ssl http2;
        server_name localhost;

        # SSL сертификаты
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # SSL настройки
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Остальные настройки аналогичны HTTP
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://backend:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

## 🔒 Безопасность

### SSL/TLS сертификаты

#### Let's Encrypt (автоматическое обновление)

```bash
# Установка Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com

# Автоматическое обновление
sudo crontab -e
# Добавить строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

#### Самоподписанные сертификаты (для разработки)

```bash
# Генерация сертификатов
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem -out ssl/cert.pem \
    -subj "/C=RU/ST=State/L=City/O=Organization/CN=localhost"
```

### Firewall настройки

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# iptables (CentOS/RHEL)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo service iptables save
```

## 📊 Мониторинг

### Health Checks

```bash
# Проверка API
curl -f http://localhost:3001/api/health

# Проверка Frontend
curl -f http://localhost

# Автоматическая проверка
#!/bin/bash
# health-check.sh
API_URL="http://localhost:3001/api/health"
FRONTEND_URL="http://localhost"

if curl -f $API_URL > /dev/null 2>&1; then
    echo "API: OK"
else
    echo "API: FAILED"
    exit 1
fi

if curl -f $FRONTEND_URL > /dev/null 2>&1; then
    echo "Frontend: OK"
else
    echo "Frontend: FAILED"
    exit 1
fi
```

### Логирование

```bash
# PM2 логи
pm2 logs --lines 100

# Nginx логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Docker логи
docker-compose logs -f
```

## 🔄 Обновления

### Автоматическое обновление

```bash
#!/bin/bash
# update.sh
echo "Starting update..."

# Остановка сервисов
pm2 stop all

# Обновление кода
git pull origin main

# Установка зависимостей
npm install

# Сборка фронтенда
npm run build

# Запуск сервисов
pm2 start ecosystem.config.js --env production

echo "Update completed!"
```

### Откат изменений

```bash
#!/bin/bash
# rollback.sh
echo "Starting rollback..."

# Остановка сервисов
pm2 stop all

# Откат к предыдущей версии
git reset --hard HEAD~1

# Установка зависимостей
npm install

# Сборка фронтенда
npm run build

# Запуск сервисов
pm2 start ecosystem.config.js --env production

echo "Rollback completed!"
```

## 📋 Чек-лист развертывания

### Pre-deployment

- [ ] Проверка системных требований
- [ ] Настройка переменных окружения
- [ ] Подготовка SSL сертификатов
- [ ] Настройка firewall
- [ ] Создание резервной копии

### Deployment

- [ ] Остановка старых сервисов
- [ ] Обновление кода
- [ ] Установка зависимостей
- [ ] Сборка приложения
- [ ] Запуск новых сервисов
- [ ] Проверка health checks

### Post-deployment

- [ ] Проверка функциональности
- [ ] Мониторинг логов
- [ ] Тестирование производительности
- [ ] Обновление документации

---

**Версия**: 2.0.0  
**Последнее обновление**: 2024-08-28  
**Автор**: MAGELLANIA DevOps Team
