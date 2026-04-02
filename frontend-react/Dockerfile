# Image de base Node.js
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chown -R node:node /app

USER node

# Exposer le port 5173
EXPOSE 5173

# Commande pour lancer le serveur de développement
CMD ["npm", "run", "dev"]
