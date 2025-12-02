FROM node:20-alpine

# Install build dependencies pour TypeScript
RUN apk add --no-cache g++ make python3

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies avec --legacy-peer-deps
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

EXPOSE 3000

# Use tsx to run TypeScript directly since build is having issues
CMD ["npm", "run", "start:ts"]
