# Docker Configuration

## Estructura de Archivos Docker

```
/
├── docker-compose.yml           # Desarrollo
├── docker-compose.prod.yml      # Producción
├── backend/
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile
│   └── .dockerignore
└── nginx/
    ├── Dockerfile
    └── nginx.conf
```

---

## docker-compose.yml (Desarrollo)

```yaml
version: '3.8'

services:
  # ==========================================
  # PostgreSQL Database
  # ==========================================
  postgres:
    image: postgres:alpine
    container_name: catalogo_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-catalogo}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-catalogo123}
      POSTGRES_DB: ${DB_NAME:-catalogo_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-catalogo} -d ${DB_NAME:-catalogo_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ==========================================
  # Redis (Cache + Queues)
  # ==========================================
  redis:
    image: redis:alpine
    container_name: catalogo_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-redis123}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-redis123}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ==========================================
  # Backend (NestJS)
  # ==========================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    container_name: catalogo_backend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      PORT: 3001
      DATABASE_URL: postgresql://${DB_USER:-catalogo}:${DB_PASSWORD:-catalogo123}@postgres:5432/${DB_NAME:-catalogo_db}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:-redis123}
      JWT_SECRET: ${JWT_SECRET:-dev-secret-change-in-prod}
      JWT_EXPIRES_IN: 15m
      JWT_REFRESH_EXPIRES_IN: 7d
      FRONTEND_URL: http://localhost:3000
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run start:dev

  # ==========================================
  # Frontend (Next.js)
  # ==========================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: catalogo_frontend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:3001/api/v1
      NEXT_PUBLIC_SITE_URL: http://localhost:3000
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    command: npm run dev

  # ==========================================
  # Redis Commander (Dev Tool)
  # ==========================================
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: catalogo_redis_commander
    restart: unless-stopped
    environment:
      REDIS_HOSTS: local:redis:6379:0:${REDIS_PASSWORD:-redis123}
    ports:
      - "8081:8081"
    depends_on:
      - redis
    profiles:
      - tools

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: catalogo_network
```

---

## docker-compose.prod.yml (Producción)

```yaml
version: '3.8'

services:
  # ==========================================
  # PostgreSQL Database
  # ==========================================
  postgres:
    image: postgres:alpine
    container_name: catalogo_postgres
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

  # ==========================================
  # Redis
  # ==========================================
  redis:
    image: redis:alpine
    container_name: catalogo_redis
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal

  # ==========================================
  # Backend (NestJS)
  # ==========================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: catalogo_backend
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 15m
      JWT_REFRESH_EXPIRES_IN: 7d
      FRONTEND_URL: ${FRONTEND_URL}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - internal
    deploy:
      resources:
        limits:
          memory: 512M

  # ==========================================
  # Frontend (Next.js)
  # ==========================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
        NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
    container_name: catalogo_frontend
    restart: always
    environment:
      NODE_ENV: production
    depends_on:
      - backend
    networks:
      - internal
    deploy:
      resources:
        limits:
          memory: 256M

  # ==========================================
  # Nginx (Reverse Proxy)
  # ==========================================
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: catalogo_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - internal
      - external

volumes:
  postgres_data:
  redis_data:

networks:
  internal:
    driver: bridge
  external:
    driver: bridge
```

---

## Backend Dockerfile

```dockerfile
# backend/Dockerfile

# ==========================================
# Base Stage
# ==========================================
FROM node:alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

# ==========================================
# Dependencies Stage
# ==========================================
FROM base AS deps

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# ==========================================
# Development Stage
# ==========================================
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

# ==========================================
# Builder Stage
# ==========================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# ==========================================
# Production Stage
# ==========================================
FROM base AS production

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

USER nestjs

EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

---

## Backend .dockerignore

```
# backend/.dockerignore
node_modules
npm-debug.log
dist
.git
.gitignore
.env
.env.*
!.env.example
*.md
.vscode
.idea
coverage
test
*.log
.DS_Store
Thumbs.db
```

---

## Frontend Dockerfile

```dockerfile
# frontend/Dockerfile

# ==========================================
# Base Stage
# ==========================================
FROM node:alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

# ==========================================
# Dependencies Stage
# ==========================================
FROM base AS deps

COPY package*.json ./
RUN npm ci

# ==========================================
# Development Stage
# ==========================================
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "run", "dev"]

# ==========================================
# Builder Stage
# ==========================================
FROM base AS builder

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# ==========================================
# Production Stage
# ==========================================
FROM base AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## Frontend .dockerignore

```
# frontend/.dockerignore
node_modules
npm-debug.log
.next
out
.git
.gitignore
.env
.env.*
!.env.example
*.md
.vscode
.idea
coverage
*.log
.DS_Store
Thumbs.db
```

---

## Nginx Configuration

```dockerfile
# nginx/Dockerfile
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx/nginx.conf

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript
               application/xml application/xml+rss text/javascript image/svg+xml;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    # Upstream servers
    upstream frontend {
        server frontend:3000;
        keepalive 32;
    }

    upstream backend {
        server backend:3001;
        keepalive 32;
    }

    # HTTP -> HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name _;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;

        # HSTS
        add_header Strict-Transport-Security "max-age=63072000" always;

        # API Backend
        location /api/ {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 90s;
        }

        # Frontend
        location / {
            limit_req zone=general burst=50 nodelay;

            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static files cache
        location /_next/static {
            proxy_pass http://frontend;
            proxy_cache_valid 60m;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## Comandos Docker

```bash
# ==========================================
# DESARROLLO
# ==========================================

# Iniciar todos los servicios
docker-compose up -d

# Iniciar con logs
docker-compose up

# Iniciar con herramientas (Redis Commander)
docker-compose --profile tools up -d

# Ver logs de un servicio
docker-compose logs -f backend

# Reconstruir un servicio
docker-compose up -d --build backend

# Ejecutar migraciones manualmente
docker-compose exec backend npx prisma migrate dev

# Acceder al contenedor
docker-compose exec backend sh

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (CUIDADO: borra datos)
docker-compose down -v

# ==========================================
# PRODUCCIÓN
# ==========================================

# Construir imágenes de producción
docker-compose -f docker-compose.prod.yml build

# Iniciar en producción
docker-compose -f docker-compose.prod.yml up -d

# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Actualizar un servicio
docker-compose -f docker-compose.prod.yml up -d --build backend

# Backup de base de datos
docker-compose exec postgres pg_dump -U catalogo catalogo_db > backup.sql

# Restaurar base de datos
docker-compose exec -T postgres psql -U catalogo catalogo_db < backup.sql
```

---

## Variables de Entorno (.env)

```env
# .env (desarrollo)

# Database
DB_USER=catalogo
DB_PASSWORD=catalogo123
DB_NAME=catalogo_db

# Redis
REDIS_PASSWORD=redis123

# JWT
JWT_SECRET=mi-super-secreto-para-desarrollo

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

```env
# .env.production

# Database
DB_USER=catalogo_prod
DB_PASSWORD=contraseña-muy-segura-123!
DB_NAME=catalogo_prod

# Redis
REDIS_PASSWORD=otra-contraseña-segura-456!

# JWT
JWT_SECRET=jwt-secret-muy-largo-y-aleatorio-para-produccion

# URLs
FRONTEND_URL=https://tudominio.com
NEXT_PUBLIC_API_URL=https://tudominio.com/api/v1
NEXT_PUBLIC_SITE_URL=https://tudominio.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```
