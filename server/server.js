// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const isDev = process.env.NODE_ENV !== 'production';

// CORS configuration
app.use(cors());

// Serve static files in production
if (!isDev) {
  app.use(express.static(path.join(__dirname, 'public')));
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

// Catch-all route to serve index.html in production
if (!isDev) {
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Environment: ${isDev ? 'development' : 'production'}`);
});