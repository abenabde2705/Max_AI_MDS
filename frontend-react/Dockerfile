# Image de base Node.js
FROM node:20

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Exposer le port 3001
EXPOSE 3001

# Commande pour lancer le serveur de développement
CMD ["npm", "run", "dev"]