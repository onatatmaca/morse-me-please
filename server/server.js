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
const userActivity = new Map(); // Track last activity time

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
      userActivity.delete(socket.id);
      userActivity.delete(partnerId);
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
        
        const currentUserStarts = Math.random() < 0.5;
        
        // Initialize activity tracking
        const now = Date.now();
        userActivity.set(socket.id, now);
        userActivity.set(waitingUser, now);
        
        socket.emit('paired', {
          partnerUsername: partnerSocket.username,
          yourTurn: currentUserStarts
        });
        
        partnerSocket.emit('paired', {
          partnerUsername: username,
          yourTurn: !currentUserStarts
        });
        
        console.log(`🤝 Paired: ${socket.username} ↔️ ${partnerSocket.username}`);
        
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

  socket.on('morse-message', (signal) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      // Update activity timestamp
      userActivity.set(socket.id, Date.now());
      
      io.to(partnerId).emit('morse-message', {
        signal,
        from: socket.username
      });
      
      // Notify partner that user is typing
      io.to(partnerId).emit('partner-typing', true);
    }
  });

  socket.on('pass-turn', () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      userActivity.set(socket.id, Date.now());
      userActivity.set(partnerId, Date.now());
      
      io.to(partnerId).emit('your-turn');
      io.to(partnerId).emit('partner-typing', false);
      socket.emit('turn-passed');
      console.log(`🔄 ${socket.username} passed turn`);
    }
  });

  socket.on('disconnect-partner', () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('partner-disconnected');
      activePairs.delete(partnerId);
      activePairs.delete(socket.id);
      userActivity.delete(socket.id);
      userActivity.delete(partnerId);
      console.log(`💔 ${socket.username} disconnected from partner`);
    }
  });

  socket.on('find-new-partner', () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('partner-disconnected');
      activePairs.delete(partnerId);
      activePairs.delete(socket.id);
      userActivity.delete(socket.id);
      userActivity.delete(partnerId);
    }
    
    // Put user back in queue
    if (waitingUser && waitingUser !== socket.id) {
      const partnerSocket = io.sockets.sockets.get(waitingUser);
      
      if (partnerSocket) {
        activePairs.set(socket.id, waitingUser);
        activePairs.set(waitingUser, socket.id);
        
        const currentUserStarts = Math.random() < 0.5;
        const now = Date.now();
        userActivity.set(socket.id, now);
        userActivity.set(waitingUser, now);
        
        socket.emit('paired', {
          partnerUsername: partnerSocket.username,
          yourTurn: currentUserStarts
        });
        
        partnerSocket.emit('paired', {
          partnerUsername: socket.username,
          yourTurn: !currentUserStarts
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

  socket.on('typing-stopped', () => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('partner-typing', false);
    }
  });
});

// Check for inactive users and auto-pass turn
setInterval(() => {
  const now = Date.now();
  const INACTIVITY_WARNING = 10000; // 10 seconds
  const AUTO_PASS_TIME = 25000; // 25 seconds total (10s + 15s)
  
  for (const [socketId, lastActivity] of userActivity.entries()) {
    const inactiveTime = now - lastActivity;
    const socket = io.sockets.sockets.get(socketId);
    
    if (!socket) {
      userActivity.delete(socketId);
      continue;
    }
    
    const partnerId = activePairs.get(socketId);
    if (!partnerId) continue;
    
    if (inactiveTime >= AUTO_PASS_TIME) {
      // Auto-pass turn
      userActivity.set(socketId, now);
      userActivity.set(partnerId, now);
      
      io.to(partnerId).emit('your-turn');
      socket.emit('turn-passed');
      socket.emit('auto-passed');
      console.log(`⏱️ Auto-passed turn for ${socket.username}`);
    } else if (inactiveTime >= INACTIVITY_WARNING) {
      // Send warning countdown
      const remaining = Math.ceil((AUTO_PASS_TIME - inactiveTime) / 1000);
      socket.emit('inactivity-warning', remaining);
    }
  }
}, 1000); // Check every second

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});