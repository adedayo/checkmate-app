FROM node:14.17.0-alpine AS builder
LABEL authors="Dr. Adedayo Adetoye"
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm --version
RUN npm install --silent
COPY . .
RUN npm run build:lib
RUN npm run ng build -- --configuration docker

FROM nginx:1.21.6-alpine
COPY --from=builder /app/dist/checkmate-app /usr/share/nginx/html/
EXPOSE 80
