# Stage 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app

# Deoarece în docker-compose calea de build este `./Frontend/fiicoder-frontend`,
# suntem deja în folder-ul corect.
COPY package*.json ./
RUN npm install

# Copiem sursele
COPY . .
RUN npm run build

# Stage 2: Containerul Intern Nginx
FROM nginx:alpine

# Copiem rezultatul build-ului din Stage 1 in nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Scriem configuratia Nginx pentru acest sub-container, fallback de vite
RUN echo 'server { \
    listen 80; \
    location / { \
        root   /usr/share/nginx/html; \
        index  index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Pornim Nginx-ul intern
CMD ["nginx", "-g", "daemon off;"]
