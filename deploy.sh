#!/bin/bash
# Quick deployment script for TrueNAS

set -e

echo "🚀 Deploying Morse Me Please..."

# Build frontend
echo "📦 Building frontend..."
cd frontend && npm ci && npm run build && cd ..

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t morsemeplease:latest .

# Stop and remove existing container
echo "🛑 Stopping existing container..."
docker stop morsemeplease 2>/dev/null || true
docker rm morsemeplease 2>/dev/null || true

# Start new container
echo "▶️  Starting new container..."
docker run -d \
  --name morsemeplease \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  morsemeplease:latest

echo "✅ Deployment complete!"
echo "📊 Container status:"
docker ps | grep morsemeplease

echo ""
echo "📝 View logs with: docker logs morsemeplease -f"
echo "🌐 Test local: curl http://localhost:3000"
