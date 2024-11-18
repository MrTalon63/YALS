FROM node:lts-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:lts-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY static ./static
COPY package.json .
RUN npm install --omit=dev
CMD ["npm", "start"]