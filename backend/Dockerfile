# ==========================================
# Base Stage
# ==========================================
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ==========================================
# Dependencies Stage
# ==========================================
FROM base AS deps

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# ==========================================
# Development Stage
# ==========================================
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

EXPOSE 4000

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

EXPOSE 4000

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
