FROM node:20-alpine

RUN apk add --no-cache g++ make python3

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build TypeScript
RUN npm run build

# On exécute dist
CMD ["node", "dist/index.js"]
