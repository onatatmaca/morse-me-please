// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

let waitingUser = null;
const activePairs = new Map();

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

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

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});