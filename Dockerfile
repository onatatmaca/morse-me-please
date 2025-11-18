# Multi-stage build for Morse Me Please
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy server code first (excluding node_modules via .dockerignore)
COPY server/ ./

# Install server dependencies (this compiles better-sqlite3)
RUN npm ci --only=production

# Remove build dependencies to keep image small
RUN apk del python3 make g++

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
