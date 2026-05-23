# Stage 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app

# Deoarece în docker-compose calea de build este `./Frontend/fiicoder-frontend`,
# suntem deja în folder-ul corect.
# Copiem doar package.json + lock pentru a beneficia de cache-ul Docker
# la layer-ul de npm ci (cel mai costisitor pas).
COPY package*.json ./
RUN npm ci --no-audit --no-fund --prefer-offline

# Copiem sursele
COPY . .
RUN npm run build

# Stage 2: Containerul Intern Nginx
FROM nginx:alpine

# Copiem rezultatul build-ului din Stage 1 in nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuratia Nginx: SPA fallback + gzip + cache headers pentru asset-urile hashate.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Pornim Nginx-ul intern
CMD ["nginx", "-g", "daemon off;"]
