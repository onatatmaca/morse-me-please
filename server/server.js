// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

const app = express();
const isDev = process.env.NODE_ENV !== 'production';

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
    "script-src 'self' 'unsafe-inline' https://cdnjs.buymeacoffee.com; " +
    "style-src 'self' 'unsafe-inline' https://cdnjs.buymeacoffee.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' wss: ws: https://cdnjs.buymeacoffee.com https://buymeacoffee.com; " +
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

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Broadcast updated user count
  broadcastUserCount();

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);

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
    console.log(`📝 User ${socket.id} set username: ${username}`);

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

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Environment: ${isDev ? 'development' : 'production'}`);
});