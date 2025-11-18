const bcrypt = require('bcrypt');

// ========== ADMIN CREDENTIALS ==========
// In production, set these via environment variables:
// ADMIN_USERNAME=your_username
// ADMIN_PASSWORD_HASH=your_bcrypt_hash
//
// To generate a password hash, run:
// node -e "require('bcrypt').hash('your_password', 10).then(h => console.log(h))"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
// Default password is 'admin123' - CHANGE THIS IN PRODUCTION!
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ||
  '$2b$10$6FTiP1YKeWrsEoFKeGWuve1VkHVQwNk8IYuPLgB1tMh/Q.5kOuMO6'; // admin123

// ========== LOGIN ATTEMPT TRACKING ==========
const loginAttempts = new Map(); // IP -> { count, lockoutUntil }
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// ========== SESSION STORAGE ==========
const activeSessions = new Map(); // sessionId -> { username, createdAt, lastActivity, ip }
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActivity > SESSION_DURATION) {
      activeSessions.delete(sessionId);
      console.log(`🗑️  Expired admin session: ${sessionId}`);
    }
  }
}, 5 * 60 * 1000);

// ========== RATE LIMITING ==========

const checkRateLimit = (ip) => {
  const attempt = loginAttempts.get(ip);

  // Check if IP is currently locked out
  if (attempt && attempt.lockoutUntil && Date.now() < attempt.lockoutUntil) {
    const remainingTime = Math.ceil((attempt.lockoutUntil - Date.now()) / 1000 / 60);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutRemaining: remainingTime
    };
  }

  // Clear lockout if time has passed
  if (attempt && attempt.lockoutUntil && Date.now() >= attempt.lockoutUntil) {
    loginAttempts.delete(ip);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS, lockoutRemaining: 0 };
  }

  // Check remaining attempts
  const attempts = attempt ? attempt.count : 0;
  const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempts;

  return {
    allowed: remainingAttempts > 0,
    remainingAttempts,
    lockoutRemaining: 0
  };
};

const recordFailedAttempt = (ip) => {
  const attempt = loginAttempts.get(ip) || { count: 0, lockoutUntil: null };
  attempt.count += 1;

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockoutUntil = Date.now() + LOCKOUT_DURATION;
    console.log(`🚨 IP ${ip} locked out for ${LOCKOUT_DURATION / 1000 / 60} minutes`);
  }

  loginAttempts.set(ip, attempt);
};

const clearFailedAttempts = (ip) => {
  loginAttempts.delete(ip);
};

// ========== AUTHENTICATION ==========

const verifyCredentials = async (username, password) => {
  if (username !== ADMIN_USERNAME) {
    return false;
  }

  try {
    // Compare password with hash
    const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    return match;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

const createSession = (username, ip) => {
  const sessionId = generateSessionId();
  const session = {
    username,
    ip,
    createdAt: Date.now(),
    lastActivity: Date.now()
  };

  activeSessions.set(sessionId, session);
  console.log(`✅ New admin session created: ${sessionId} (IP: ${ip})`);

  return sessionId;
};

const verifySession = (sessionId, ip) => {
  const session = activeSessions.get(sessionId);

  if (!session) {
    return { valid: false, reason: 'Session not found' };
  }

  // Check if session has expired
  if (Date.now() - session.lastActivity > SESSION_DURATION) {
    activeSessions.delete(sessionId);
    return { valid: false, reason: 'Session expired' };
  }

  // Optional: Check if IP matches (security feature)
  // Commented out by default in case admin changes networks
  // if (session.ip !== ip) {
  //   return { valid: false, reason: 'IP mismatch' };
  // }

  // Update last activity
  session.lastActivity = Date.now();
  activeSessions.set(sessionId, session);

  return { valid: true, session };
};

const destroySession = (sessionId) => {
  activeSessions.delete(sessionId);
  console.log(`🗑️  Admin session destroyed: ${sessionId}`);
};

// ========== UTILITIES ==========

const generateSessionId = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress || 'unknown';
};

// ========== EXPORTS ==========

module.exports = {
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
  verifyCredentials,
  createSession,
  verifySession,
  destroySession,
  getClientIp,
  ADMIN_USERNAME
};
