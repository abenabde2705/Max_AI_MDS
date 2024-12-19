# Étape 1: Build de l'application Vue.js
FROM node:20 AS build
WORKDIR /app

# Copier les fichiers source dans le conteneur
COPY package*.json ./
RUN npm install

COPY . .

# Étape 2: Ajouter une commande pour le développement
CMD ["npm", "run", "dev"]
