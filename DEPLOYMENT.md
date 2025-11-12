# 🚀 Deployment Guide for TrueNAS SCALE

This guide will help you deploy Morse Me Please to your TrueNAS SCALE server using the Apps GUI and expose it via Cloudflare Tunnel. **No SSH required** - everything is done through the web interface!

## Why This Approach?

- ✅ **GUI-based**: Manage everything through TrueNAS web interface
- ✅ **Visible Status**: See app status, logs, and health at a glance
- ✅ **Easy Updates**: One-click redeploy when you update the image
- ✅ **Resource Monitoring**: Track CPU, RAM, and network usage
- ✅ **No SSH Needed**: Perfect for non-technical management

## Prerequisites

- TrueNAS SCALE (not CORE)
- Docker installed on your local PC (for building the image)
- Docker Hub account (free)
- Cloudflare account with a domain (for public access)

---

## ⚙️ Step 1: Build & Push the Image

You build your container on your **local PC** (since TrueNAS SCALE doesn't need Docker CLI).

### On Your Local PC:

```bash
# Navigate to project directory
cd /home/user/morse-omegle

# Build the Docker image (replace 'yourdockeruser' with your Docker Hub username)
docker build -t yourdockeruser/morsemeplease:latest .

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push yourdockeruser/morsemeplease:latest
```

**Note**: Replace `yourdockeruser` with your actual Docker Hub username throughout this guide.

Your app image is now online at `docker.io/yourdockeruser/morsemeplease:latest` 🎉

---

## 🧩 Step 2: Open TrueNAS SCALE Apps

1. Open your **TrueNAS SCALE web dashboard** (usually `http://your-nas-ip`)
2. Click **Apps** in the left sidebar
3. Click the **"Launch Docker Image"** button (top-right)

A configuration wizard will open.

---

## 🧱 Step 3: Configure the App

Fill out the form with these settings:

### 📦 Container Image

- **Image repository**: `yourdockeruser/morsemeplease:latest`
- **Image tag**: `latest` (usually auto-filled)
- **Pull policy**: `Always` (ensures you get updates)

### 🏷️ Application Name

- **Application Name**: `morsemeplease`

### 🌐 Networking

Click **"Add"** under Port Forwards:

| Setting | Value |
|---------|-------|
| **Container Port** | `3000` |
| **Node Port** | `3000` |
| **Protocol** | `TCP` |

This makes the app available at: `http://<your-nas-ip>:3000`

### 🔧 Environment Variables

Click **"Add"** under Environment Variables (add these two):

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

### 💾 Storage (Optional but Recommended)

If your app writes logs or data in the future:

Click **"Add"** under Host Path Volumes:

| Setting | Value |
|---------|-------|
| **Host Path** | `/mnt/SamsungSSD_2TB/morsemeplease/data` |
| **Mount Path** | `/app/data` |

**Note**: Make sure this directory exists on TrueNAS first, or TrueNAS will create it.

### 🎛️ Resources

You can leave defaults or adjust:

- **CPU**: `1` (or adjust based on your needs)
- **Memory**: `512 MB` (or adjust based on your needs)

---

## 🚀 Step 4: Deploy

1. Review all settings
2. Click **"Save"** at the bottom
3. Wait for the status to change to **"Running"** ✅

You'll see:
- Green status indicator
- Container logs in real-time
- Resource usage graphs

Your app is now live locally at: **`http://<your-truenas-ip>:3000`** 🎉

### 📊 Monitoring Your App

In **Apps → Installed**:
- **Status**: Running, Stopped, Error
- **Logs**: Click on the app → "Logs" tab (real-time)
- **Shell**: Access container shell if needed
- **Stats**: CPU, RAM, network usage

---

## ☁️ Step 5: Add Cloudflare Tunnel (Public Access)

Now let's expose your app to the internet securely via Cloudflare Tunnel.

### Get Your Cloudflare Tunnel Token

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Networks → Tunnels**
3. Click **"Create a tunnel"**
4. Choose **"Cloudflared"**
5. Name it: `morsemeplease-tunnel`
6. Copy the tunnel token (looks like: `eyJhIjoiXXXX...`)

### Configure the Tunnel Route

In the Cloudflare dashboard, before finishing:

1. **Public Hostnames** → **Add a public hostname**
2. Configure:
   - **Subdomain**: `*` (or leave empty for apex domain)
   - **Domain**: Select your domain (e.g., `morsemeplease.com`)
   - **Type**: `HTTP`
   - **URL**: `morsemeplease:3000` (container name:port)

3. Save the tunnel

### Deploy Cloudflare Tunnel in TrueNAS

1. Go back to **TrueNAS → Apps → Launch Docker Image**
2. Fill in:

| Setting | Value |
|---------|-------|
| **Image repository** | `cloudflare/cloudflared:latest` |
| **Application Name** | `cloudflared-morsemeplease` |

3. Under **Advanced Settings → Command**:
   - Click **"Add"** under arguments
   - Add these arguments in order:

   ```
   tunnel
   --no-autoupdate
   run
   --token
   YOUR_TUNNEL_TOKEN_HERE
   ```

   (Replace `YOUR_TUNNEL_TOKEN_HERE` with your actual token from Cloudflare)

4. Under **Networking**:
   - **Network Mode**: `bridge` (default)
   - No port forwarding needed! (Cloudflare connects outbound)

5. Click **"Save"** and wait for it to start

### Verify Tunnel Connection

1. Check **TrueNAS → Apps → cloudflared-morsemeplease** → Status should be **"Running"**
2. Check **Cloudflare Dashboard → Tunnels** → Your tunnel should show **"Healthy"** 🟢
3. Visit your domain: **`https://morsemeplease.com`** or **`https://www.morsemeplease.com`**

🎉 **Your app is now publicly accessible with automatic HTTPS!**

---

## 🔄 Step 6: Updating Your App

When you make changes to your code:

### On Your Local PC:

```bash
# Rebuild and push
cd /home/user/morse-omegle
docker build -t yourdockeruser/morsemeplease:latest .
docker push yourdockeruser/morsemeplease:latest
```

### In TrueNAS SCALE:

1. Go to **Apps → Installed**
2. Find **morsemeplease**
3. Click the **⋮** (three dots) menu
4. Click **"Edit"**
5. Scroll down and click **"Update"** or **"Save"**
6. TrueNAS will pull the new image and restart the container

**Alternatively:**
- Click **"Stop"** → Wait → Click **"Start"** (if pull policy is "Always")

---

## 📊 Management & Monitoring

### View Logs

1. **Apps → Installed → morsemeplease**
2. Click **"Logs"** tab
3. See real-time application logs
4. Use filters and search

### Check Status

In the Apps dashboard you'll see:
- 🟢 **Green**: Running healthy
- 🟡 **Yellow**: Starting/Updating
- 🔴 **Red**: Error/Stopped

### Restart App

1. **Apps → Installed → morsemeplease**
2. Click **⋮** menu
3. Click **"Restart"**

### Stop/Start App

Use the **Stop/Start** buttons to control the application without deleting it.

### Delete App

**Warning**: This removes the container but **not** the Docker image from the system.

1. Click **⋮** menu
2. Click **"Delete"**
3. Confirm

---

## 🐛 Troubleshooting

### App Won't Start

1. Check **Logs** tab for error messages
2. Verify image name is correct: `yourdockeruser/morsemeplease:latest`
3. Verify port 3000 isn't already in use
4. Check environment variables are set correctly

### Can't Access Locally

1. Verify app status is **"Running"**
2. Try: `http://<truenas-ip>:3000`
3. Check TrueNAS firewall settings if enabled
4. Verify port forwarding is set to 3000:3000

### Cloudflare Tunnel Not Working

1. Check **cloudflared-morsemeplease** status is **"Running"**
2. Check logs for authentication errors
3. Verify tunnel token is correct
4. Check Cloudflare dashboard shows tunnel as **"Healthy"**
5. Verify DNS records are set up correctly
6. Wait 1-2 minutes for DNS propagation

### Check Connectivity

From TrueNAS Shell (or via Apps → morsemeplease → Shell):

```bash
# Test if app is responding
curl http://localhost:3000

# Check if container is running
# (Can't do this in container shell - check TrueNAS Apps dashboard instead)
```

### View Detailed Container Info

1. **Apps → Installed → morsemeplease**
2. Click **"Details"** tab
3. See container ID, image, network, volumes, etc.

---

## 🔒 Security Considerations

1. ✅ **Cloudflare Tunnel** provides automatic HTTPS/TLS
2. ✅ **WebSocket security** is handled by Cloudflare
3. ✅ **No exposed ports** - all traffic goes through Cloudflare
4. ✅ **No port forwarding** needed on your router
5. Consider adding **rate limiting** in Cloudflare dashboard
6. Enable **Cloudflare WAF** (Web Application Firewall) for additional protection
7. Enable **Cloudflare Bot Management** if you experience abuse

---

## ⚡ Performance Tuning

### In Cloudflare Dashboard

1. **Enable HTTP/2 and HTTP/3** (Settings → Network)
2. **Enable WebSocket support** (should be on by default)
3. **Enable Brotli compression** (Speed → Optimization)
4. **Enable Argo Smart Routing** (Traffic → Argo - paid feature)
5. Set **Browser Cache TTL** appropriately
6. Enable **Auto Minify** for JS/CSS/HTML

### In TrueNAS

1. Increase CPU/RAM allocation if needed:
   - **Apps → morsemeplease → Edit → Resources**
2. Use SSD storage for container data:
   - Already using `/mnt/SamsungSSD_2TB/morsemeplease/data`
3. Monitor resource usage in the Apps dashboard

---

## 📋 Quick Reference

### App URLs

| Location | URL |
|----------|-----|
| **Local (TrueNAS)** | `http://<truenas-ip>:3000` |
| **Public (Cloudflare)** | `https://morsemeplease.com` |
| **Public WWW** | `https://www.morsemeplease.com` |

### TrueNAS Apps Dashboard

| Action | Steps |
|--------|-------|
| **View Logs** | Apps → morsemeplease → Logs tab |
| **Restart** | Apps → morsemeplease → ⋮ → Restart |
| **Update** | Apps → morsemeplease → ⋮ → Edit → Update |
| **Stop/Start** | Apps → morsemeplease → Stop/Start button |
| **Shell Access** | Apps → morsemeplease → Shell tab |
| **View Stats** | Apps → morsemeplease → Details tab |

### Cloudflare Dashboard

| Action | Location |
|--------|----------|
| **Check Tunnel Status** | Zero Trust → Networks → Tunnels |
| **View Analytics** | Analytics & Logs → Web Analytics |
| **Configure WAF** | Security → WAF |
| **Set up Rate Limiting** | Security → WAF → Rate limiting rules |

---

## 🎯 Alternative: Using Docker Compose File

If you prefer to use docker-compose.yml for app configuration, you can:

1. Create a dataset on TrueNAS: `/mnt/SamsungSSD_2TB/morsemeplease`
2. Upload your `docker-compose.yml` there
3. In TrueNAS Apps → Use **"Custom App"** instead of "Launch Docker Image"
4. Point it to your compose file location

However, the GUI method described above is simpler and provides better visibility.

---

## 📚 Additional Resources

- [TrueNAS SCALE Apps Documentation](https://www.truenas.com/docs/scale/scaletutorials/apps/)
- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Docker Hub](https://hub.docker.com/) - for managing your images

---

## 🆘 Support

### Check App Status:
1. TrueNAS → Apps → Installed
2. Look for 🟢 green status
3. Click "Logs" for real-time output

### Check Tunnel Status:
1. Cloudflare Dashboard → Networks → Tunnels
2. Look for 🟢 "Healthy" status

### Test Local Connection:
```bash
curl http://<truenas-ip>:3000
```

### Test Public Connection:
```bash
curl https://morsemeplease.com
```

---

## 🎉 You're Done!

Your Morse Me Please app is now:
- ✅ Deployed on TrueNAS SCALE
- ✅ Managed via GUI
- ✅ Monitored with real-time logs
- ✅ Publicly accessible via Cloudflare
- ✅ Secured with automatic HTTPS
- ✅ Protected by Cloudflare's network

Visit **https://morsemeplease.com** and start chatting in Morse code! 📡

---

**Questions or issues?** Check the troubleshooting section above or open an issue on GitHub.
