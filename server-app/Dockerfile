FROM node:20-alpine

RUN apk add --no-cache g++ make python3

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY . .

# Build TypeScript (force full rebuild — tsconfig.tsbuildinfo can cause incremental skips)
RUN rm -f tsconfig.tsbuildinfo && npm run build

RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser && \
    chown -R appuser:appgroup /app

USER appuser

# On exécute dist
CMD ["node", "dist/index.js"]
