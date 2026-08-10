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
# Cloudflare Access Service Token (trece de firewall-ul CF) - vine din GitHub Actions
# secrets, vezi .github/workflows/deploy.yml si prod-deploy.yml.
ARG VITE_CF_ACCESS_CLIENT_ID
ARG VITE_CF_ACCESS_CLIENT_SECRET
ENV VITE_CF_ACCESS_CLIENT_ID=$VITE_CF_ACCESS_CLIENT_ID
ENV VITE_CF_ACCESS_CLIENT_SECRET=$VITE_CF_ACCESS_CLIENT_SECRET
# URL public al proxy-ului Cloudflare Worker care tine cheia OpenRouter server-side
# (vezi cloudflare-worker/). Nu e secret, e doar adresa proxy-ului.
ARG VITE_AI_PROXY_URL
ENV VITE_AI_PROXY_URL=$VITE_AI_PROXY_URL
RUN npm run build

# Stage 2: Containerul Intern Nginx
FROM nginx:alpine

# Copiem rezultatul build-ului din Stage 1 in nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuratia Nginx: SPA fallback + gzip + cache headers pentru asset-urile hashate.
# E un template (vezi nginx.conf.template) - imaginea oficiala nginx:alpine ruleaza
# automat envsubst pe fisierele din templates/ la pornire, folosind env-ul de mai jos.
#
# BACKEND_HOST=dev-backend e intentionat, nu un placeholder uitat: atat containerul
# de dev cat si cel de prod vorbesc in acest moment cu acelasi backend/DB (dev-backend/
# dev-db). Motivul: Backend `main` a ramas cu lunile in urma fata de `dev` si serviciul
# separat de prod (`backend`/`db`) nu e folosit de nimeni - dev-db e de fapt sursa cu
# utilizatorii si datele reale. Vezi README.md, sectiunea Deploy, pentru context complet
# inainte sa schimbi asta sau sa tratezi dev-db ca fiind "doar de test".
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV BACKEND_HOST=dev-backend

EXPOSE 80

# Pornim Nginx-ul intern
CMD ["nginx", "-g", "daemon off;"]
