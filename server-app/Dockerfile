FROM node:20-alpine

# Install build dependencies pour TypeScript
RUN apk add --no-cache g++ make python3

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Copy source code first (needed for build)
COPY . .

# Install dependencies et build TypeScript avec --legacy-peer-deps
RUN npm ci --legacy-peer-deps && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

EXPOSE 3000

# Run compiled JavaScript pour les performances
CMD ["npm", "start"]
