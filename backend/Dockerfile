FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev
RUN npx prisma generate

COPY src ./src

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
