# Security Documentation

## Overview
This document outlines the security measures implemented in Morse Me Please to protect against various attacks.

## Security Measures

### 1. Input Sanitization
- **Username sanitization**: Removes HTML tags, script tags, XSS vectors
- **Message sanitization**: Ensures only valid Morse code characters
- **Text sanitization**: Removes HTML/script injection attempts
- **Numeric validation**: Enforces bounds on WPM and other numeric inputs

### 2. SQL Injection Prevention
- All database queries use parameterized statements (prepared statements)
- No string concatenation in SQL queries
- Uses `better-sqlite3` with proper parameter binding

### 3. XSS Protection
- Multi-layer defense:
  1. Server-side input sanitization
  2. React auto-escaping in JSX
  3. Content Security Policy headers
  4. No use of `dangerouslySetInnerHTML`

### 4. Rate Limiting
- **Connection limit**: Max 5 concurrent connections per IP address
- **Message limit**: Max 60 messages per minute per socket
- Prevents DoS attacks and spam
- Automatic cleanup of stale tracking data

### 5. CORS Protection
- Restricts WebSocket connections to whitelisted origins only
- Production: `https://morsemeplease.com`, `https://www.morsemeplease.com`
- Development: `http://localhost:5173`, `http://localhost:3000`
- Blocks unauthorized cross-origin requests

### 6. Security Headers
- **Strict-Transport-Security (HSTS)**: Forces HTTPS
- **Content-Security-Policy (CSP)**: Restricts script sources
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### 7. Authentication Security
- **Admin panel**:
  - bcrypt password hashing (10 rounds)
  - Rate limiting (5 attempts, 15-minute lockout)
  - HTTP-only cookies (prevents XSS cookie theft)
  - SameSite=strict (prevents CSRF)
  - 30-minute session timeout

### 8. WebSocket Security
- Connection timeout: 10 seconds
- Ping/pong for dead connection detection
- Max payload size: 1MB (prevents large payload attacks)
- Preferred transport: WebSocket (more secure than polling)

### 9. Data Security
- Automatic 30-day data retention with cleanup
- No passwords stored in database (admin credentials in hashed .env)
- Session IDs are cryptographically random
- IP addresses logged for security monitoring

### 10. Environment Security
- `.env` file excluded from git (contains credentials)
- `.env.example` provided for setup reference
- Database files excluded from git

## Attack Scenarios Blocked

| Attack Type | Protection |
|------------|------------|
| XSS via username/messages | Input sanitization + React escaping + CSP |
| SQL Injection | Parameterized queries |
| DoS (connection flood) | Rate limiting (5 connections/IP) |
| DoS (message spam) | Rate limiting (60 messages/min) |
| CSRF | SameSite cookies |
| Clickjacking | X-Frame-Options |
| MIME sniffing attacks | X-Content-Type-Options |
| Admin brute force | Rate limiting + bcrypt |
| Credential exposure | .env in .gitignore |
| Large payload attacks | 1MB max buffer size |
| Cross-origin attacks | CORS whitelist |

## Important Security Notes

### Credential Rotation
**⚠️ CRITICAL**: The admin credentials were previously committed to git. You MUST:
1. Generate a new strong password
2. Hash it with bcrypt: `node -e "console.log(require('bcryptjs').hashSync('new_password', 10))"`
3. Update `server/.env` with new hash
4. Deploy the change
5. Notify any collaborators to delete their local git history

### SSH/Infrastructure Security
Application-level security is implemented. For server-level security:
- Use SSH key authentication (disable password auth)
- Configure firewall (UFW/iptables)
- Keep server OS and packages updated
- Use fail2ban for SSH brute force protection
- Enable automatic security updates
- Use non-root user for running the application
- Consider using a process manager (PM2) with restart limits

### Dependencies
- Run `npm audit` regularly to check for vulnerable packages
- Keep dependencies updated
- Current audit status: ✅ No vulnerabilities

### Monitoring
- Admin panel tracks all sessions and messages
- Rate limit violations are logged
- Failed admin login attempts are tracked
- Monitor logs for suspicious patterns

## Reporting Security Issues
If you discover a security vulnerability, please email [your-email] with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Do not** create public GitHub issues for security vulnerabilities.

## Security Checklist for Deployment

- [ ] Change default admin credentials
- [ ] Verify `.env` file is not in git
- [ ] Enable HTTPS (with valid SSL certificate)
- [ ] Configure firewall rules
- [ ] Set up SSH key authentication
- [ ] Enable server auto-updates
- [ ] Configure backup strategy
- [ ] Set up monitoring/alerting
- [ ] Review and adjust rate limits if needed
- [ ] Test CORS configuration
- [ ] Verify CSP doesn't block legitimate resources
