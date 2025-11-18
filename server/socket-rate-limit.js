// Socket.io rate limiting to prevent DoS attacks

// Track connection attempts per IP
const connectionAttempts = new Map();
const messageAttempts = new Map();

// Configuration
const MAX_CONNECTIONS_PER_IP = 5; // Max concurrent connections from same IP
const MAX_MESSAGES_PER_MINUTE = 60; // Max messages per minute per socket
const MESSAGE_WINDOW = 60 * 1000; // 1 minute window
const CONNECTION_CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up every 5 minutes

/**
 * Check if IP can establish a new connection
 * @param {string} ip - Client IP address
 * @returns {boolean} - Whether connection is allowed
 */
const canConnect = (ip) => {
  const connections = connectionAttempts.get(ip) || [];

  // Clean up disconnected sockets
  const activeConnections = connections.filter(conn => conn.connected);
  connectionAttempts.set(ip, activeConnections);

  // Check if limit exceeded
  if (activeConnections.length >= MAX_CONNECTIONS_PER_IP) {
    console.log(`⚠️ Connection limit exceeded for IP: ${ip} (${activeConnections.length}/${MAX_CONNECTIONS_PER_IP})`);
    return false;
  }

  return true;
};

/**
 * Register a new connection from an IP
 * @param {string} ip - Client IP address
 * @param {object} socket - Socket.io socket object
 */
const registerConnection = (ip, socket) => {
  const connections = connectionAttempts.get(ip) || [];
  connections.push({ socketId: socket.id, connected: true, timestamp: Date.now() });
  connectionAttempts.set(ip, connections);

  // Remove on disconnect
  socket.on('disconnect', () => {
    const conns = connectionAttempts.get(ip) || [];
    const updated = conns.filter(c => c.socketId !== socket.id);
    if (updated.length > 0) {
      connectionAttempts.set(ip, updated);
    } else {
      connectionAttempts.delete(ip);
    }
  });
};

/**
 * Check if socket can send a message (rate limiting)
 * @param {string} socketId - Socket ID
 * @returns {object} - { allowed: boolean, remaining: number }
 */
const canSendMessage = (socketId) => {
  const now = Date.now();
  let attempts = messageAttempts.get(socketId) || [];

  // Clean up old attempts outside the time window
  attempts = attempts.filter(timestamp => (now - timestamp) < MESSAGE_WINDOW);

  // Check if limit exceeded
  if (attempts.length >= MAX_MESSAGES_PER_MINUTE) {
    console.log(`⚠️ Message rate limit exceeded for socket: ${socketId} (${attempts.length}/${MAX_MESSAGES_PER_MINUTE} per minute)`);
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((MESSAGE_WINDOW - (now - attempts[0])) / 1000)
    };
  }

  // Add current attempt
  attempts.push(now);
  messageAttempts.set(socketId, attempts);

  return {
    allowed: true,
    remaining: MAX_MESSAGES_PER_MINUTE - attempts.length
  };
};

/**
 * Clean up message rate limit tracking for disconnected socket
 * @param {string} socketId - Socket ID
 */
const cleanupSocket = (socketId) => {
  messageAttempts.delete(socketId);
};

/**
 * Periodic cleanup of stale entries
 */
const startCleanupTask = () => {
  setInterval(() => {
    const now = Date.now();

    // Clean up old message attempts
    for (const [socketId, attempts] of messageAttempts.entries()) {
      const recentAttempts = attempts.filter(timestamp => (now - timestamp) < MESSAGE_WINDOW);
      if (recentAttempts.length === 0) {
        messageAttempts.delete(socketId);
      } else {
        messageAttempts.set(socketId, recentAttempts);
      }
    }

    // Clean up old connection tracking
    for (const [ip, connections] of connectionAttempts.entries()) {
      const activeConnections = connections.filter(conn =>
        conn.connected && (now - conn.timestamp) < CONNECTION_CLEANUP_INTERVAL
      );
      if (activeConnections.length === 0) {
        connectionAttempts.delete(ip);
      } else {
        connectionAttempts.set(ip, activeConnections);
      }
    }

    console.log(`🧹 Rate limit cleanup: ${messageAttempts.size} sockets tracked, ${connectionAttempts.size} IPs tracked`);
  }, CONNECTION_CLEANUP_INTERVAL);
};

// Start cleanup task
startCleanupTask();

module.exports = {
  canConnect,
  registerConnection,
  canSendMessage,
  cleanupSocket,
  MAX_CONNECTIONS_PER_IP,
  MAX_MESSAGES_PER_MINUTE
};
