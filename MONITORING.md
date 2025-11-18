# Security Monitoring Guide

## Your Security Setup

You're running **Morse Me Please** on:
- **TrueNAS** (server)
- **Cloudflare Tunnel** (cloudflared)
- **Docker** container

### Security Level: ⭐⭐⭐⭐⭐ EXCELLENT

Cloudflare Tunnel provides enterprise-grade protection that blocks most attacks before they reach your server.

---

## How to Monitor Attacks

### 1. **Cloudflare Dashboard** (PRIMARY - Check This First!)

**URL**: https://dash.cloudflare.com

#### What to Monitor:

**Analytics Tab:**
- Total requests per day/hour
- Threats blocked
- Bandwidth usage
- **Spike in traffic = potential attack**

**Security > Events:**
- **Attack types blocked** (DDoS, XSS, SQL injection, etc.)
- **Country of origin** for attacks
- **Attack timeline** - see when attacks happened
- **IP addresses** that were blocked

**Firewall > Activity Log:**
- Shows all blocked requests
- Filter by: Country, IP, User Agent, Path
- See what rules triggered

**How to Access:**
1. Go to https://dash.cloudflare.com
2. Select your domain: `morsemeplease.com`
3. Click **Security** > **Events**
4. Look for:
   - ⚠️ **Threats Mitigated** (number should be > 0 if attacks occurred)
   - 🚨 **Challenge Solve Rate** (low rate = likely bots)
   - 🔴 **Firewall Events** (shows blocked requests)

**What "Under Attack" Looks Like:**
```
Threats Mitigated: 12,450 in last 24 hours
Top Attack Type: Layer 7 DDoS
Top Source Country: Unknown/VPN
Blocked IPs: 234
```

**Normal Traffic:**
```
Threats Mitigated: 0-5 in last 24 hours
Requests: Normal pattern (steady)
```

---

### 2. **Admin Panel** (Your Application Dashboard)

**URL**: https://morsemeplease.com/admin

Login with your credentials and check:

#### **Live Tab:**
- Current connected users
- Real-time activity
- **Unusual spike in connections = possible attack**

#### **Statistics Tab:**
- Total messages, sessions, WPM averages
- **Sudden spike in sessions from one IP = suspicious**

#### **IP Tracking Tab:**
- See IPs connecting to your service
- **Multiple sessions from same IP = rate limiting working**
- **Unusual country/region = investigate**

**Red Flags:**
- 🚨 Same IP with 5+ concurrent sessions (hitting rate limit)
- 🚨 Hundreds of sessions in short time
- 🚨 Messages with very high WPM (60+) repeatedly = bot
- 🚨 Usernames that look like scripts (random characters)

---

### 3. **Docker Container Logs** (TrueNAS)

**How to Access:**
```bash
# SSH into TrueNAS
ssh your-truenas-ip

# Find your container
docker ps

# View real-time logs
docker logs -f <container-name>

# Search logs for security events
docker logs <container-name> | grep "SECURITY"
docker logs <container-name> | grep "rate limit"
docker logs <container-name> | grep "blocked"
```

**What to Look For:**
```bash
# Rate limiting (connection flood detected)
🚫 Connection rejected: Rate limit exceeded for IP 1.2.3.4

# Message spam (DoS attempt)
⏱️ Message rate limit exceeded for user (socket-id)

# XSS/injection attempt (malicious username)
⚠️ Invalid username. Please use alphanumeric characters only.

# CORS attack (unauthorized origin)
⚠️ CORS blocked origin: http://evil-site.com
```

---

### 4. **Security Log Files** (NEW - Coming in Next Update)

Your app creates daily security logs in `server/logs/`:
```
logs/security-2025-11-18.log
logs/security-2025-11-19.log
```

**Access via Docker:**
```bash
docker exec -it <container-name> cat /app/server/logs/security-$(date +%Y-%m-%d).log
```

**What's Logged:**
- Rate limit violations
- Invalid username attempts
- XSS/injection attempts
- Admin login failures
- CORS blocks

---

## Attack Scenarios & How to Detect

### Scenario 1: **DDoS Attack** (Denial of Service)

**What It Is:**
Attacker floods your site with millions of requests to crash it.

**How Cloudflare Protects:**
- Blocks attack at Cloudflare's edge (your server never sees it)
- Automatic DDoS mitigation kicks in
- Rate limiting prevents overload

**How to Detect:**
1. ✅ **Cloudflare Dashboard** > Security > Events
   - Look for: "DDoS Attack Detected"
   - Shows: Requests blocked, attack duration
2. ⚠️ Your server logs: **Nothing unusual** (Cloudflare blocked it)
3. ✅ Site remains **online and fast** (protected)

**You're Safe**: Cloudflare handles DDoS attacks automatically!

---

### Scenario 2: **Connection Flooding** (Application-Level DoS)

**What It Is:**
Attacker opens many connections to exhaust your WebSocket server.

**How Your App Protects:**
- Rate limit: Max 5 connections per IP
- Rejects additional connections

**How to Detect:**
1. ⚠️ **Docker Logs:**
   ```
   🚫 Connection rejected: Rate limit exceeded for IP 1.2.3.4
   🚫 Connection rejected: Rate limit exceeded for IP 1.2.3.4
   🚫 Connection rejected: Rate limit exceeded for IP 1.2.3.4
   ```
2. ✅ **Admin Panel** > IP Tracking:
   - Same IP shows multiple failed attempts
3. 🔴 **Repeated from same IP** = Ongoing attack

**Action**: Cloudflare will auto-block after too many failures

---

### Scenario 3: **Message Spam** (Chat Flood)

**What It Is:**
Attacker sends rapid messages to flood chat or database.

**How Your App Protects:**
- Rate limit: Max 60 messages/minute per user
- Blocks excessive messages

**How to Detect:**
1. ⚠️ **Docker Logs:**
   ```
   🚫 Message rate limit exceeded for user123 (abc-socket-id)
   ```
2. ✅ **Admin Panel** > Messages:
   - Same user with 60+ messages in 1 minute
3. 🔴 **Database size** grows rapidly

**Action**: Rate limit automatically blocks, user gets error

---

### Scenario 4: **XSS/Injection Attack**

**What It Is:**
Attacker tries to inject `<script>` or HTML in username/messages.

**How Your App Protects:**
- Input sanitization strips all HTML tags
- CSP headers block inline scripts

**How to Detect:**
1. ⚠️ **Docker Logs:**
   ```
   ⚠️ Empty message after sanitization from user
   ⚠️ Invalid username. Please use alphanumeric characters only.
   ```
2. ✅ **Admin Panel** > Sessions:
   - Username shows sanitized version (e.g., "script" instead of "<script>")
3. 🔴 **Security log** shows sanitization events

**You're Safe**: Input is cleaned before storage!

---

### Scenario 5: **Credential Stuffing** (Admin Panel Attack)

**What It Is:**
Attacker tries many passwords to break into admin panel.

**How Your App Protects:**
- Rate limit: 5 failed attempts = 15-minute lockout
- bcrypt password hashing

**How to Detect:**
1. ⚠️ **Docker Logs:**
   ```
   🔐 Admin login failed from IP 1.2.3.4 (2/5 attempts remaining)
   🔐 Admin login failed from IP 1.2.3.4 (1/5 attempts remaining)
   🚫 Too many login attempts - IP locked out for 15 minutes
   ```
2. ✅ **Cloudflare** > Security > Events:
   - Shows failed POST requests to /api/admin/login
3. 🔴 **Repeated failures** from same IP

**Action**: IP is auto-locked out for 15 minutes

---

## Setting Up Alerts

### Cloudflare Email Alerts (Recommended!)

1. Go to **Cloudflare Dashboard** > **Notifications**
2. Click **Add**
3. Enable these alerts:
   - ✅ **DDoS Attack** - Get notified when attack detected
   - ✅ **Firewall Events** - Get notified when rules trigger
   - ✅ **SSL/TLS Expiration** - Certificate issues
   - ✅ **Health Check Failures** - Site goes down
4. Enter your email
5. Save

**You'll receive emails like:**
```
Subject: DDoS Attack Detected on morsemeplease.com

Cloudflare detected and mitigated a DDoS attack.
- Attack Duration: 5 minutes
- Requests Blocked: 124,523
- Your site remained online ✓
```

---

### TrueNAS Alerts

Configure TrueNAS to alert on:
- High CPU usage (>80%)
- High memory usage (>90%)
- Docker container restarts

---

## Monitoring Checklist

### Daily (Automated):
- ✅ Check Cloudflare email alerts (if any)
- ✅ Glance at Docker container status (should be "running")

### Weekly:
- ✅ Check **Cloudflare Dashboard** > Security > Events (5 min)
- ✅ Check **Admin Panel** > Statistics (2 min)
- ✅ Review **IP Tracking** for unusual patterns (3 min)

### Monthly:
- ✅ Review **Docker logs** for patterns (10 min)
- ✅ Check **database size** growth (should be gradual)
- ✅ Verify **automatic data cleanup** is working (30-day retention)

---

## What "Normal" Looks Like

**Cloudflare Dashboard:**
- Requests: Steady pattern (100-1000/day for new site)
- Threats: 0-10/day (mostly bots)
- Countries: Mix of legitimate users

**Admin Panel:**
- Sessions: Gradual growth
- Messages: Varies by popularity
- IPs: Different IPs per session

**Docker Logs:**
- Mostly: Connection, pairing, message events
- Few: Rate limit warnings (1-5/day is normal)

---

## What "Under Attack" Looks Like

**Cloudflare Dashboard:**
- 🚨 Requests: Massive spike (10,000+ in minutes)
- 🚨 Threats: Hundreds or thousands blocked
- 🚨 Source: Single country or "Unknown"
- 🚨 Challenge rate: Very low (bots can't solve)

**Admin Panel:**
- 🚨 Multiple sessions from same IP (5+)
- 🚨 Sessions created and destroyed rapidly
- 🚨 Messages all from one user with high WPM

**Docker Logs:**
- 🚨 Repeated rate limit messages
- 🚨 Same IP over and over
- 🚨 CORS blocks from unusual origins

---

## If You Detect an Attack

### Immediate Actions:

1. **Stay Calm** - Cloudflare is likely already handling it
2. **Check Cloudflare Dashboard** - Verify attack is being blocked
3. **Site Still Online?** - Test https://morsemeplease.com
4. **Enable "Under Attack Mode"** (if needed):
   - Cloudflare Dashboard > Security > Settings
   - Enable "Under Attack Mode"
   - This shows a challenge page to all visitors for 5 seconds
   - Blocks most bots

### Cloudflare Firewall Rules (Block Specific IPs):

If you see a specific IP attacking:
1. Go to **Cloudflare** > **Security** > **WAF**
2. Click **Create Rule**
3. Rule name: "Block malicious IP"
4. Expression: `ip.src eq 1.2.3.4` (replace with attacker IP)
5. Action: **Block**
6. Deploy

### Long-term Actions:

- Review attack pattern
- Adjust rate limits if needed (in `socket-rate-limit.js`)
- Consider geoblocking countries if persistent attacks
- Update Cloudflare firewall rules

---

## Why You're Very Safe with Cloudflare Tunnel

1. **Hidden Server IP**
   - Attackers can't find your TrueNAS server
   - No direct attacks possible

2. **No Open Ports**
   - Your firewall doesn't expose 80/443
   - Only outbound cloudflared tunnel

3. **Cloudflare Protection Layer**
   - DDoS protection (multi-terabit capacity)
   - WAF blocks malicious requests
   - Bot detection and challenges

4. **Application Security**
   - Rate limiting (your code)
   - Input sanitization (your code)
   - CORS restrictions (your code)

**Attack Path:**
```
Attacker → Cloudflare (blocks DDoS, malicious requests)
         → Cloudflare Tunnel (encrypted)
         → Your TrueNAS (protected, hidden)
         → Your App (rate limiting, sanitization)
```

Most attacks are blocked at Cloudflare - they never reach your server!

---

## Quick Reference

| Where to Check | What to Look For | How Often |
|----------------|------------------|-----------|
| **Cloudflare Dashboard** | DDoS attacks, blocked threats | Weekly |
| **Admin Panel** | Session patterns, IP tracking | Weekly |
| **Docker Logs** | Rate limits, errors | As needed |
| **Email Alerts** | Attack notifications | Auto |

---

## Bottom Line

**Your Setup is Very Secure!** ✅

Cloudflare Tunnel + your application's security measures create multiple layers of protection. Most attacks will be blocked by Cloudflare before they ever reach your TrueNAS server.

**Focus on:**
1. Monitor Cloudflare Dashboard weekly
2. Set up email alerts in Cloudflare
3. Check Admin Panel for unusual patterns
4. Review Docker logs if you suspect issues

**You'll know if you're under attack** - Cloudflare will email you and block it automatically! 🛡️
