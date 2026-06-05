FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/comandas_db?schema=public

COPY backend/package*.json ./
COPY backend/prisma ./prisma

RUN npm ci --omit=dev
RUN npx prisma generate

COPY backend/src ./src

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
