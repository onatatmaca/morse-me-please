# Deployment Guide for TrueNAS with Cloudflare Tunnel

This guide will help you deploy Morse Omegle to your TrueNAS server and expose it via Cloudflare Tunnel.

## Prerequisites

- TrueNAS server with Docker support (TrueNAS SCALE recommended)
- Cloudflare account with a domain
- SSH access to your TrueNAS server
- `cloudflared` installed on TrueNAS

## Step 1: Transfer Files to TrueNAS

### Option A: Using rsync (Recommended)
```bash
# From your local PC, run:
rsync -avz --exclude 'node_modules' --exclude '.git' \
  /home/user/morse-omegle/ \
  your-username@truenas-ip:/mnt/tank/apps/morse-omegle/
```

### Option B: Using Git
```bash
# SSH into TrueNAS
ssh your-username@truenas-ip

# Clone the repository
cd /mnt/tank/apps
git clone YOUR_REPO_URL morse-omegle
cd morse-omegle
git checkout claude/morse-bpm-timing-system-011CV2y9wBWKKt32FJRETR4L
```

### Option C: Using scp
```bash
# Create a tarball
cd /home/user
tar -czf morse-omegle.tar.gz morse-omegle/

# Copy to TrueNAS
scp morse-omegle.tar.gz your-username@truenas-ip:/mnt/tank/apps/

# SSH in and extract
ssh your-username@truenas-ip
cd /mnt/tank/apps
tar -xzf morse-omegle.tar.gz
```

## Step 2: Build and Run with Docker

SSH into your TrueNAS server and run:

```bash
cd /mnt/tank/apps/morse-omegle

# Build the Docker image
docker build -t morse-omegle:latest .

# Run the container
docker run -d \
  --name morse-omegle \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  morse-omegle:latest

# Or use docker-compose
docker-compose up -d
```

### Verify the application is running:
```bash
docker ps | grep morse-omegle
docker logs morse-omegle
curl http://localhost:3000
```

## Step 3: Set Up Cloudflare Tunnel

### Install cloudflared on TrueNAS (if not already installed)

```bash
# For FreeBSD-based TrueNAS (CORE)
pkg install cloudflared

# For Debian-based TrueNAS (SCALE)
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared.deb
```

### Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This will open a browser window. Select your domain.

### Create a tunnel

```bash
# Create a new tunnel
cloudflared tunnel create morse-omegle

# This will output a Tunnel ID - save it!
# Example output: Created tunnel morse-omegle with id: abc123-def456-ghi789
```

### Configure the tunnel

Create the config file at `~/.cloudflared/config.yml`:

```yaml
tunnel: abc123-def456-ghi789  # Replace with your Tunnel ID
credentials-file: /root/.cloudflared/abc123-def456-ghi789.json  # Replace with your Tunnel ID

ingress:
  - hostname: morse.yourdomain.com  # Replace with your desired subdomain
    service: http://localhost:3000
  - service: http_status:404
```

### Route DNS to your tunnel

```bash
cloudflared tunnel route dns morse-omegle morse.yourdomain.com
```

### Run the tunnel

#### Option A: Run as a service (recommended)

```bash
# Install as a system service
cloudflared service install

# Start the service
systemctl start cloudflared
systemctl enable cloudflared

# Check status
systemctl status cloudflared
```

#### Option B: Run in Docker (alternative)

Create `docker-compose-with-tunnel.yml`:

```yaml
version: '3.8'

services:
  morse-omegle:
    build: .
    container_name: morse-omegle
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    networks:
      - morse-network

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-morse
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token YOUR_TUNNEL_TOKEN
    networks:
      - morse-network
    depends_on:
      - morse-omegle

networks:
  morse-network:
    driver: bridge
```

Get your tunnel token from Cloudflare dashboard and run:
```bash
docker-compose -f docker-compose-with-tunnel.yml up -d
```

## Step 4: Configure Firewall (if needed)

If you're using TrueNAS firewall, you don't need to open any ports since Cloudflare Tunnel creates an outbound connection. This is one of the main benefits!

## Step 5: Test Your Deployment

Visit your domain: `https://morse.yourdomain.com`

### Troubleshooting

#### Check application logs:
```bash
docker logs morse-omegle -f
```

#### Check tunnel status:
```bash
cloudflared tunnel info morse-omegle
systemctl status cloudflared
```

#### Check tunnel logs:
```bash
journalctl -u cloudflared -f
```

#### Test WebSocket connection:
Open browser console and check for WebSocket errors. The app should connect via WSS (secure WebSocket) automatically.

## Step 6: Updates and Maintenance

### Update the application:

```bash
cd /mnt/tank/apps/morse-omegle

# Pull latest changes (if using git)
git pull

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Or manually:
docker stop morse-omegle
docker rm morse-omegle
docker build -t morse-omegle:latest .
docker run -d --name morse-omegle --restart unless-stopped -p 3000:3000 -e NODE_ENV=production morse-omegle:latest
```

### View logs:
```bash
docker logs morse-omegle --tail 100 -f
```

### Restart application:
```bash
docker restart morse-omegle
```

## Additional Configuration

### Environment Variables

You can add more environment variables to the docker-compose.yml:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - LOG_LEVEL=info
```

### Persistent Data (if needed in future)

Add volumes to docker-compose.yml:

```yaml
volumes:
  - ./data:/app/data
  - ./logs:/app/logs
```

## Security Considerations

1. **Cloudflare Tunnel** provides automatic HTTPS/TLS
2. **WebSocket security** is handled by Cloudflare
3. **No exposed ports** - all traffic goes through Cloudflare
4. Consider adding **rate limiting** in Cloudflare dashboard
5. Enable **Cloudflare WAF** for additional protection

## Cloudflare Dashboard Configuration

In your Cloudflare dashboard:

1. Go to Zero Trust > Access > Tunnels
2. You should see your tunnel status
3. Configure additional settings:
   - Enable **HTTP/2**
   - Enable **WebSocket** support (should be on by default)
   - Set **Connection timeout** if needed

## Performance Tuning

For better performance:

1. Enable **Argo Smart Routing** in Cloudflare (paid feature)
2. Use **Cloudflare's WebSocket compression**
3. Enable **Cloudflare's Automatic Platform Optimization**

---

## Quick Reference Commands

```bash
# Check app status
docker ps | grep morse-omegle
docker logs morse-omegle --tail 50

# Check tunnel status
cloudflared tunnel info morse-omegle
systemctl status cloudflared

# Restart services
docker restart morse-omegle
systemctl restart cloudflared

# Update app
cd /mnt/tank/apps/morse-omegle && docker-compose down && docker-compose build && docker-compose up -d
```

## Support

If you encounter issues:

1. Check Docker logs: `docker logs morse-omegle -f`
2. Check tunnel logs: `journalctl -u cloudflared -f`
3. Test local connection: `curl http://localhost:3000`
4. Check Cloudflare tunnel dashboard for connection status
