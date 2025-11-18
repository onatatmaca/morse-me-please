// server.js
// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const db = require('./db'); // Database logging
const adminRoutes = require('./admin-routes'); // Admin API routes
const cookieParser = require('cookie-parser'); // Cookie parsing for sessions

const app = express();
const isDev = process.env.NODE_ENV !== 'production';

// Parse JSON bodies
app.use(express.json());
// Parse cookies
app.use(cookieParser());

// Enable Gzip/Brotli compression for all responses
app.use(compression({
  level: 6, // Compression level (0-9, where 6 is a good balance)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Security headers middleware
app.use((req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Strict-Transport-Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content-Security-Policy (CSP)
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdnjs.buymeacoffee.com https://www.googletagmanager.com https://www.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline' https://cdnjs.buymeacoffee.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' wss: ws: https://cdnjs.buymeacoffee.com https://buymeacoffee.com https://www.google-analytics.com https://www.googletagmanager.com; " +
    "font-src 'self' data:; " +
    "frame-src https://www.buymeacoffee.com https://buymeacoffee.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );

  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy - Allow payment for Buy Me A Coffee widget
  res.setHeader('Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  next();
});

// Disable X-Powered-By at app level
app.disable('x-powered-by');

// CORS configuration
app.use(cors());

// Serve static files in production with caching
if (!isDev) {
  app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true, // Enable ETags for cache validation
    lastModified: true, // Send Last-Modified header
    immutable: true, // Indicate that files won't change
    setHeaders: (res, filepath) => {
      // Different cache strategies for different file types
      if (filepath.endsWith('.html')) {
        // Don't cache HTML files - always revalidate
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      } else if (filepath.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
        // Cache assets for 1 year
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (filepath.match(/\.(json|xml|txt|ico)$/)) {
        // Cache config files for 1 week
        res.setHeader('Cache-Control', 'public, max-age=604800');
      }
    }
  }));
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: isDev ? "http://localhost:5173" : "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

let waitingUser = null;
const activePairs = new Map();

// Broadcast online user count to all connected clients
const broadcastUserCount = () => {
  const userCount = io.sockets.sockets.size;
  io.emit('user-count', userCount);
};

// Helper to get client IP address
const getClientIp = (socket) => {
  const forwarded = socket.handshake.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return socket.handshake.address || 'unknown';
};

// Track concurrent user peaks for statistics
let peakConcurrentUsers = 0;
const updatePeakUsers = () => {
  const currentUsers = io.sockets.sockets.size;
  if (currentUsers > peakConcurrentUsers) {
    peakConcurrentUsers = currentUsers;
  }
};

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Track peak concurrent users
  updatePeakUsers();

  // Broadcast updated user count
  broadcastUserCount();

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);

    // End database session
    try {
      db.endSession(socket.id);
    } catch (error) {
      console.error('Error ending session:', error);
    }

    if (waitingUser === socket.id) {
      waitingUser = null;
    }

    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('partner-disconnected');
      activePairs.delete(partnerId);
      activePairs.delete(socket.id);
    }

    // Broadcast updated user count
    broadcastUserCount();
  });

  socket.on('set-username', (username) => {
    socket.username = username;
    const ipAddress = getClientIp(socket);

    // Create database session
    try {
      const sessionId = db.createSession(socket.id, username, ipAddress);
      socket.sessionId = sessionId;
      console.log(`📝 User ${socket.id} set username: ${username} (IP: ${ipAddress}, Session: ${sessionId})`);
    } catch (error) {
      console.error('Error creating session:', error);
    }

    if (waitingUser && waitingUser !== socket.id) {
      const partnerSocket = io.sockets.sockets.get(waitingUser);

      if (partnerSocket) {
        activePairs.set(socket.id, waitingUser);
        activePairs.set(waitingUser, socket.id);

        // DUPLEX MODE: No turn-based logic
        socket.emit('paired', {
          partnerUsername: partnerSocket.username
        });

        partnerSocket.emit('paired', {
          partnerUsername: username
        });

        console.log(`🤝 Paired: ${socket.username} ↔️ ${partnerSocket.username} (Duplex Mode)`);

        waitingUser = null;
      } else {
        waitingUser = socket.id;
        socket.emit('waiting');
      }
    } else {
      waitingUser = socket.id;
      socket.emit('waiting');
      console.log(`⏳ ${username} is waiting for a partner...`);
    }
  });

  // DUPLEX: Real-time morse signal relay
  socket.on('morse-signal', (data) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('morse-signal', {
        signal: data.signal,
        from: socket.username,
        timestamp: data.timestamp
      });
    }
  });

  socket.on('morse-message-complete', (data) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      const partnerSocket = io.sockets.sockets.get(partnerId);

      // Log message to database
      if (partnerSocket && partnerSocket.username) {
        try {
          const senderIp = getClientIp(socket);
          const receiverIp = getClientIp(partnerSocket);

          // Log the message
          db.logMessage(
            socket.id,
            socket.username,
            senderIp,
            partnerSocket.username,
            receiverIp,
            data.message,
            data.translatedText || '',  // Morse code translated to text
            data.wpm
          );

          // Increment message counts
          db.incrementMessageCount(socket.id, 'sent');
          db.incrementMessageCount(partnerId, 'received');
        } catch (error) {
          console.error('Error logging message:', error);
        }
      }

      // Broadcast complete message to partner
      io.to(partnerId).emit('morse-message-complete', {
        message: data.message,
        from: socket.username,
        wpm: data.wpm,
        timestamp: data.timestamp
      });

      console.log(`📨 Message from ${socket.username}: ${data.message} (${data.wpm} WPM)`);
    }
  });

  socket.on('disconnect-partner', () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('partner-disconnected');
      activePairs.delete(partnerId);
      activePairs.delete(socket.id);
      console.log(`💔 ${socket.username} disconnected from partner`);
    }
  });

  socket.on('typing', () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('typing');
    }
  });

  socket.on('typing-stop', () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('typing-stop');
    }
  });

  socket.on('find-new-partner', () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('partner-disconnected');
      activePairs.delete(partnerId);
      activePairs.delete(socket.id);
    }

    // Put user back in queue
    if (waitingUser && waitingUser !== socket.id) {
      const partnerSocket = io.sockets.sockets.get(waitingUser);

      if (partnerSocket) {
        activePairs.set(socket.id, waitingUser);
        activePairs.set(waitingUser, socket.id);

        socket.emit('paired', {
          partnerUsername: partnerSocket.username
        });

        partnerSocket.emit('paired', {
          partnerUsername: socket.username
        });

        waitingUser = null;
      } else {
        waitingUser = socket.id;
        socket.emit('waiting');
      }
    } else {
      waitingUser = socket.id;
      socket.emit('waiting');
    }

    console.log(`🔄 ${socket.username} is finding a new partner...`);
  });
});

// DUPLEX MODE: No inactivity checking needed - both users can send anytime

// ========== ADMIN API ROUTES ==========
// Make io and activePairs available to admin routes
app.set('io', io);
app.set('activePairs', activePairs);

// Mount admin routes
app.use('/api/admin', adminRoutes);

// Serve robots.txt and sitemap.xml with proper MIME types
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Redirect non-www to www (SEO best practice - choose one canonical domain)
// Comment out if you prefer non-www version
app.use((req, res, next) => {
  const host = req.headers.host;
  // Skip redirect for admin and API routes to avoid conflicts
  if (req.url.startsWith('/admin') || req.url.startsWith('/api/')) {
    return next();
  }
  // Only redirect in production and if not already www
  if (!isDev && host && !host.startsWith('www.') && !host.startsWith('localhost')) {
    return res.redirect(301, `https://www.${host}${req.url}`);
  }
  next();
});

// Catch-all route to serve index.html in production (for SPA routing)
if (!isDev) {
  app.use((req, res) => {
    // Don't cache the main HTML file
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// ========== DATABASE CLEANUP & MAINTENANCE ==========

// Run daily cleanup at midnight
const runDailyCleanup = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Next midnight

  const msUntilMidnight = midnight - now;

  // Schedule first cleanup at midnight
  setTimeout(() => {
    console.log('🗑️  Running daily cleanup...');
    db.deleteOldRecords(30); // Delete records older than 30 days

    // Then run every 24 hours
    setInterval(() => {
      console.log('🗑️  Running daily cleanup...');
      db.deleteOldRecords(30);
    }, 24 * 60 * 60 * 1000); // 24 hours
  }, msUntilMidnight);

  console.log(`⏰ Daily cleanup scheduled for ${midnight.toLocaleString()}`);
};

// Start cleanup scheduler
runDailyCleanup();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Environment: ${isDev ? 'development' : 'production'}`);

  // Log database stats on startup
  const dbSize = db.getDatabaseSize();
  console.log(`💾 Database size: ${dbSize.megabytes} MB`);
});