ARG CHECKMATE_APP_CONFIG_FILE="checkmate_app_config.json"

FROM node:14.17.0-alpine AS builder
LABEL authors="Dr. Adedayo Adetoye"
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm --version
RUN npm install --silent
COPY . .
RUN npm run build:lib
RUN npm run ng build -- --configuration docker

FROM nginx:alpine
COPY --from=builder /app/dist/checkmate-app /usr/share/nginx/html/
COPY ./nginx/templates /etc/nginx/templates
EXPOSE 80
