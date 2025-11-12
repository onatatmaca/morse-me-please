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

# Install server dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
