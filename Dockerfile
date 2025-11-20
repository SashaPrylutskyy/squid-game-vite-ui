# --- Stage 1: Build (Node.js) ---
FROM node:20-alpine as build
WORKDIR /app

# Копіюємо package.json
COPY package.json package-lock.json ./
RUN npm install

# Копіюємо весь код
COPY . .

# Оголошуємо аргумент, який прийде з docker-compose
ARG VITE_API_BASE_URL
# Робимо його доступним для Vite під час білда
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Збираємо проект (створюється папка dist)
RUN npm run build

# --- Stage 2: Production (Nginx) ---
FROM nginx:alpine

# Копіюємо зібрані файли з першого етапу в папку Nginx
# Увага: Vite створює папку 'dist'. Якщо у тебе CRA, заміни на 'build'
COPY --from=build /app/dist /usr/share/nginx/html

# Копіюємо наш кастомний конфіг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]