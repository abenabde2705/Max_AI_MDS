# Étape 1: Build de l'application Vue.js
FROM node:20 AS build
WORKDIR /app

# Copier les fichiers source dans le conteneur
COPY package*.json ./
RUN npm install

COPY . .

# Construire l'application pour la production
RUN npm run build

# Étape 2: Utiliser un serveur web (nginx) pour servir l'app
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80 pour accéder à l'application
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
