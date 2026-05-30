FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN npm ci --omit=dev
RUN npm run prisma:generate
COPY --from=build /app/dist ./dist
COPY scalar.config.json ./scalar.config.json
COPY docs ./docs

CMD ["npm", "run", "start:prod"]
