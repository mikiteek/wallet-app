FROM node:24-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Test stage - includes all devDependencies
FROM development AS test

RUN npm run test

# Builder stage - compiles the application
FROM development AS builder

RUN npm run build

# Production stage - minimal dependencies
FROM node:24-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
