const express = require('express');
const router = express.Router();
const db = require('./db');
const auth = require('./admin-auth');
const sanitize = require('./sanitize');

// ========== MIDDLEWARE ==========

// Rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
  const ip = auth.getClientIp(req);
  const rateLimit = auth.checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Too many login attempts',
      lockoutRemaining: rateLimit.lockoutRemaining
    });
  }

  req.rateLimitInfo = rateLimit;
  next();
};

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const sessionId = req.cookies?.admin_session;

  if (!sessionId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const ip = auth.getClientIp(req);
  const verification = auth.verifySession(sessionId, ip);

  if (!verification.valid) {
    return res.status(401).json({ success: false, error: verification.reason });
  }

  req.session = verification.session;
  next();
};

// ========== AUTHENTICATION ROUTES ==========

// Login
router.post('/login', rateLimitMiddleware, async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = auth.getClientIp(req);

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    const isValid = await auth.verifyCredentials(username, password);

    if (!isValid) {
      auth.recordFailedAttempt(ip);
      const rateLimit = auth.checkRateLimit(ip);

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        remainingAttempts: rateLimit.remainingAttempts
      });
    }

    // Clear failed attempts on successful login
    auth.clearFailedAttempts(ip);

    // Create session
    const sessionId = auth.createSession(username, ip);

    // Set secure cookie
    res.cookie('admin_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000 // 30 minutes
    });

    res.json({
      success: true,
      username,
      message: 'Logged in successfully'
    });

    console.log(`🔐 Admin logged in from IP: ${ip}`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Logout
router.post('/logout', authMiddleware, (req, res) => {
  try {
    const sessionId = req.cookies?.admin_session;
    if (sessionId) {
      auth.destroySession(sessionId);
    }

    res.clearCookie('admin_session');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Verify session
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    username: req.session.username,
    sessionStart: req.session.createdAt
  });
});

// ========== STATISTICS ROUTES ==========

// Get general statistics
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const generalStats = db.getGeneralStats();
    const topUsers = db.getTopUsers(10);
    const dbSize = db.getDatabaseSize();

    res.json({
      success: true,
      data: {
        general: generalStats,
        topUsers,
        dbSize
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get live monitoring data
router.get('/live', authMiddleware, (req, res) => {
  try {
    // This will be populated by the main server via a shared module
    // For now, return a placeholder
    const io = req.app.get('io');
    const activePairs = req.app.get('activePairs');

    const onlineCount = io ? io.sockets.sockets.size : 0;
    const activeChats = activePairs ? activePairs.size / 2 : 0; // Divide by 2 since pairs are bidirectional

    // Get active users with usernames
    const activeUsers = [];
    if (io) {
      for (const [id, socket] of io.sockets.sockets) {
        activeUsers.push({
          id,
          username: socket.username || 'Anonymous',
          partnerId: activePairs ? activePairs.get(id) : null,
          partnerUsername: activePairs && activePairs.get(id) ?
            io.sockets.sockets.get(activePairs.get(id))?.username : null
        });
      }
    }

    res.json({
      success: true,
      data: {
        onlineCount,
        activeChats,
        activeUsers
      }
    });
  } catch (error) {
    console.error('Live data error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ========== SESSION DATA ROUTES ==========

// Get sessions (paginated)
router.get('/sessions', authMiddleware, (req, res) => {
  try {
    const limit = sanitize.sanitizeNumber(req.query.limit, 1, 1000, 50);
    const offset = sanitize.sanitizeNumber(req.query.offset, 0, 1000000, 0);

    const filters = {};
    if (req.query.username) filters.username = sanitize.sanitizeUsername(req.query.username);
    if (req.query.ip) filters.ip = sanitize.sanitizeText(req.query.ip);
    if (req.query.dateFrom) filters.dateFrom = sanitize.sanitizeText(req.query.dateFrom);
    if (req.query.dateTo) filters.dateTo = sanitize.sanitizeText(req.query.dateTo);

    const sessions = db.getSessions(limit, offset, filters);
    const total = db.getSessionCount(filters);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });
  } catch (error) {
    console.error('Sessions error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ========== MESSAGE DATA ROUTES ==========

// Get messages (paginated)
router.get('/messages', authMiddleware, (req, res) => {
  try {
    const limit = sanitize.sanitizeNumber(req.query.limit, 1, 1000, 50);
    const offset = sanitize.sanitizeNumber(req.query.offset, 0, 1000000, 0);

    const filters = {};
    if (req.query.username) filters.username = sanitize.sanitizeUsername(req.query.username);
    if (req.query.search) filters.search = sanitize.sanitizeText(req.query.search);
    if (req.query.dateFrom) filters.dateFrom = sanitize.sanitizeText(req.query.dateFrom);
    if (req.query.dateTo) filters.dateTo = sanitize.sanitizeText(req.query.dateTo);

    const messages = db.getMessages(limit, offset, filters);
    const total = db.getMessageCount(filters);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });
  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get conversation between two users
router.get('/conversation', authMiddleware, (req, res) => {
  try {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
      return res.status(400).json({ success: false, error: 'user1 and user2 required' });
    }

    const messages = db.getConversation(user1, user2, 200);

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Conversation error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ========== IP TRACKING ROUTES ==========

// Get IP statistics
router.get('/ip-stats', authMiddleware, (req, res) => {
  try {
    const ipStats = db.getIpStats();

    res.json({
      success: true,
      data: { ipStats }
    });
  } catch (error) {
    console.error('IP stats error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ========== MAINTENANCE ROUTES ==========

// Delete old records
router.delete('/cleanup', authMiddleware, (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const result = db.deleteOldRecords(days);

    res.json({
      success: true,
      data: result,
      message: `Deleted records older than ${days} days`
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get database size
router.get('/db-size', authMiddleware, (req, res) => {
  try {
    const size = db.getDatabaseSize();

    res.json({
      success: true,
      data: size
    });
  } catch (error) {
    console.error('DB size error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ========== DAILY STATS ROUTES ==========

// Get daily stats for date range
router.get('/daily-stats', authMiddleware, (req, res) => {
  try {
    const dateFrom = req.query.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateTo = req.query.dateTo || new Date().toISOString().split('T')[0];

    const dailyStats = db.getDailyStatsRange(dateFrom, dateTo);

    res.json({
      success: true,
      data: { dailyStats }
    });
  } catch (error) {
    console.error('Daily stats error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
