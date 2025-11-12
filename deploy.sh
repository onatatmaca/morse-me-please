#!/bin/bash
# Quick deployment script for TrueNAS

set -e

echo "🚀 Deploying Morse Omegle..."

# Build frontend
echo "📦 Building frontend..."
cd frontend && npm ci && npm run build && cd ..

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t morse-omegle:latest .

# Stop and remove existing container
echo "🛑 Stopping existing container..."
docker stop morse-omegle 2>/dev/null || true
docker rm morse-omegle 2>/dev/null || true

# Start new container
echo "▶️  Starting new container..."
docker run -d \
  --name morse-omegle \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  morse-omegle:latest

echo "✅ Deployment complete!"
echo "📊 Container status:"
docker ps | grep morse-omegle

echo ""
echo "📝 View logs with: docker logs morse-omegle -f"
echo "🌐 Test local: curl http://localhost:3000"
