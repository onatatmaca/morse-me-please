const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'morse_admin.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const initDb = () => {
  // User sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      socket_id TEXT NOT NULL,
      username TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      join_time DATETIME NOT NULL,
      leave_time DATETIME,
      duration_seconds INTEGER,
      messages_sent INTEGER DEFAULT 0,
      messages_received INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Chat messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_session_id INTEGER NOT NULL,
      sender_username TEXT NOT NULL,
      sender_ip TEXT NOT NULL,
      receiver_username TEXT NOT NULL,
      receiver_ip TEXT NOT NULL,
      morse_code TEXT NOT NULL,
      translated_text TEXT NOT NULL,
      wpm INTEGER NOT NULL,
      timestamp DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_session_id) REFERENCES user_sessions(id)
    )
  `);

  // Daily statistics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL UNIQUE,
      total_users INTEGER DEFAULT 0,
      total_messages INTEGER DEFAULT 0,
      avg_wpm REAL DEFAULT 0,
      peak_concurrent_users INTEGER DEFAULT 0,
      unique_ips INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_username ON user_sessions(username);
    CREATE INDEX IF NOT EXISTS idx_sessions_ip ON user_sessions(ip_address);
    CREATE INDEX IF NOT EXISTS idx_sessions_join_time ON user_sessions(join_time);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON chat_messages(sender_username);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON chat_messages(receiver_username);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON chat_messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
  `);

  console.log('✅ Database initialized successfully');
};

// Initialize on module load
initDb();

// ========== SESSION MANAGEMENT ==========

// Start a new user session
const createSession = (socketId, username, ipAddress) => {
  const stmt = db.prepare(`
    INSERT INTO user_sessions (socket_id, username, ip_address, join_time)
    VALUES (?, ?, ?, datetime('now'))
  `);

  const result = stmt.run(socketId, username, ipAddress);
  return result.lastInsertRowid;
};

// End a user session
const endSession = (socketId) => {
  const stmt = db.prepare(`
    UPDATE user_sessions
    SET leave_time = datetime('now'),
        duration_seconds = (strftime('%s', 'now') - strftime('%s', join_time))
    WHERE socket_id = ? AND leave_time IS NULL
  `);

  stmt.run(socketId);
};

// Increment message count for a session
const incrementMessageCount = (socketId, type = 'sent') => {
  const column = type === 'sent' ? 'messages_sent' : 'messages_received';
  const stmt = db.prepare(`
    UPDATE user_sessions
    SET ${column} = ${column} + 1
    WHERE socket_id = ? AND leave_time IS NULL
  `);

  stmt.run(socketId);
};

// ========== MESSAGE LOGGING ==========

// Log a chat message
const logMessage = (senderSocketId, senderUsername, senderIp, receiverUsername, receiverIp, morseCode, translatedText, wpm) => {
  // Get sender session ID
  const sessionStmt = db.prepare(`
    SELECT id FROM user_sessions WHERE socket_id = ? AND leave_time IS NULL
  `);
  const session = sessionStmt.get(senderSocketId);

  if (!session) {
    console.error('Session not found for socket:', senderSocketId);
    return;
  }

  const stmt = db.prepare(`
    INSERT INTO chat_messages (
      sender_session_id, sender_username, sender_ip, receiver_username, receiver_ip,
      morse_code, translated_text, wpm, timestamp
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  stmt.run(
    session.id,
    senderUsername,
    senderIp,
    receiverUsername,
    receiverIp,
    morseCode,
    translatedText,
    wpm
  );
};

// ========== STATISTICS ==========

// Update daily statistics
const updateDailyStats = (date, users, messages, avgWpm, peakConcurrent, uniqueIps) => {
  const stmt = db.prepare(`
    INSERT INTO daily_stats (date, total_users, total_messages, avg_wpm, peak_concurrent_users, unique_ips)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      total_users = total_users + excluded.total_users,
      total_messages = total_messages + excluded.total_messages,
      avg_wpm = (avg_wpm + excluded.avg_wpm) / 2,
      peak_concurrent_users = MAX(peak_concurrent_users, excluded.peak_concurrent_users),
      unique_ips = excluded.unique_ips
  `);

  stmt.run(date, users, messages, avgWpm, peakConcurrent, uniqueIps);
};

// ========== QUERIES FOR ADMIN PANEL ==========

// Get all sessions (with pagination)
const getSessions = (limit = 100, offset = 0, filters = {}) => {
  let query = `
    SELECT id, username, ip_address, join_time, leave_time, duration_seconds, messages_sent, messages_received
    FROM user_sessions
    WHERE 1=1
  `;
  const params = [];

  if (filters.username) {
    query += ` AND username LIKE ?`;
    params.push(`%${filters.username}%`);
  }

  if (filters.ip) {
    query += ` AND ip_address LIKE ?`;
    params.push(`%${filters.ip}%`);
  }

  if (filters.dateFrom) {
    query += ` AND join_time >= ?`;
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    query += ` AND join_time <= ?`;
    params.push(filters.dateTo);
  }

  query += ` ORDER BY join_time DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const stmt = db.prepare(query);
  return stmt.all(...params);
};

// Get total session count (for pagination)
const getSessionCount = (filters = {}) => {
  let query = `SELECT COUNT(*) as count FROM user_sessions WHERE 1=1`;
  const params = [];

  if (filters.username) {
    query += ` AND username LIKE ?`;
    params.push(`%${filters.username}%`);
  }

  if (filters.ip) {
    query += ` AND ip_address LIKE ?`;
    params.push(`%${filters.ip}%`);
  }

  if (filters.dateFrom) {
    query += ` AND join_time >= ?`;
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    query += ` AND join_time <= ?`;
    params.push(filters.dateTo);
  }

  const stmt = db.prepare(query);
  return stmt.get(...params).count;
};

// Get all messages (with pagination)
const getMessages = (limit = 100, offset = 0, filters = {}) => {
  let query = `
    SELECT id, sender_username, sender_ip, receiver_username, receiver_ip,
           morse_code, translated_text, wpm, timestamp
    FROM chat_messages
    WHERE 1=1
  `;
  const params = [];

  if (filters.username) {
    query += ` AND (sender_username LIKE ? OR receiver_username LIKE ?)`;
    params.push(`%${filters.username}%`, `%${filters.username}%`);
  }

  if (filters.search) {
    query += ` AND (morse_code LIKE ? OR translated_text LIKE ?)`;
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.dateFrom) {
    query += ` AND timestamp >= ?`;
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    query += ` AND timestamp <= ?`;
    params.push(filters.dateTo);
  }

  query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const stmt = db.prepare(query);
  return stmt.all(...params);
};

// Get total message count (for pagination)
const getMessageCount = (filters = {}) => {
  let query = `SELECT COUNT(*) as count FROM chat_messages WHERE 1=1`;
  const params = [];

  if (filters.username) {
    query += ` AND (sender_username LIKE ? OR receiver_username LIKE ?)`;
    params.push(`%${filters.username}%`, `%${filters.username}%`);
  }

  if (filters.search) {
    query += ` AND (morse_code LIKE ? OR translated_text LIKE ?)`;
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.dateFrom) {
    query += ` AND timestamp >= ?`;
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    query += ` AND timestamp <= ?`;
    params.push(filters.dateTo);
  }

  const stmt = db.prepare(query);
  return stmt.get(...params).count;
};

// Get conversation between two users
const getConversation = (user1, user2, limit = 100) => {
  const stmt = db.prepare(`
    SELECT sender_username, receiver_username, morse_code, translated_text, wpm, timestamp
    FROM chat_messages
    WHERE (sender_username = ? AND receiver_username = ?)
       OR (sender_username = ? AND receiver_username = ?)
    ORDER BY timestamp ASC
    LIMIT ?
  `);

  return stmt.all(user1, user2, user2, user1, limit);
};

// Get general statistics
const getGeneralStats = () => {
  const stmt = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM user_sessions) as total_sessions,
      (SELECT COUNT(DISTINCT username) FROM user_sessions) as unique_users,
      (SELECT COUNT(DISTINCT ip_address) FROM user_sessions) as unique_ips,
      (SELECT COUNT(*) FROM chat_messages) as total_messages,
      (SELECT AVG(wpm) FROM chat_messages) as avg_wpm,
      (SELECT AVG(duration_seconds) FROM user_sessions WHERE duration_seconds IS NOT NULL) as avg_session_duration
  `);

  return stmt.get();
};

// Get daily stats for a date range
const getDailyStatsRange = (dateFrom, dateTo) => {
  const stmt = db.prepare(`
    SELECT date, total_users, total_messages, avg_wpm, peak_concurrent_users, unique_ips
    FROM daily_stats
    WHERE date >= ? AND date <= ?
    ORDER BY date DESC
  `);

  return stmt.all(dateFrom, dateTo);
};

// Get top users by message count
const getTopUsers = (limit = 10) => {
  const stmt = db.prepare(`
    SELECT username, SUM(messages_sent) as total_sent, COUNT(*) as session_count
    FROM user_sessions
    GROUP BY username
    ORDER BY total_sent DESC
    LIMIT ?
  `);

  return stmt.all(limit);
};

// Get IP address statistics
const getIpStats = () => {
  const stmt = db.prepare(`
    SELECT ip_address, COUNT(*) as session_count, GROUP_CONCAT(DISTINCT username) as usernames
    FROM user_sessions
    GROUP BY ip_address
    ORDER BY session_count DESC
  `);

  return stmt.all();
};

// ========== DATA CLEANUP ==========

// Delete records older than N days
const deleteOldRecords = (days = 30) => {
  const messagesDeleted = db.prepare(`
    DELETE FROM chat_messages WHERE timestamp < datetime('now', '-' || ? || ' days')
  `).run(days).changes;

  const sessionsDeleted = db.prepare(`
    DELETE FROM user_sessions WHERE join_time < datetime('now', '-' || ? || ' days')
  `).run(days).changes;

  const statsDeleted = db.prepare(`
    DELETE FROM daily_stats WHERE date < date('now', '-' || ? || ' days')
  `).run(days).changes;

  console.log(`🗑️  Deleted old records: ${messagesDeleted} messages, ${sessionsDeleted} sessions, ${statsDeleted} daily stats`);

  return { messagesDeleted, sessionsDeleted, statsDeleted };
};

// Get database size
const getDatabaseSize = () => {
  const fs = require('fs');
  const stats = fs.statSync(dbPath);
  return {
    bytes: stats.size,
    kilobytes: (stats.size / 1024).toFixed(2),
    megabytes: (stats.size / (1024 * 1024)).toFixed(2)
  };
};

module.exports = {
  db,
  // Session management
  createSession,
  endSession,
  incrementMessageCount,
  // Message logging
  logMessage,
  // Statistics
  updateDailyStats,
  // Queries
  getSessions,
  getSessionCount,
  getMessages,
  getMessageCount,
  getConversation,
  getGeneralStats,
  getDailyStatsRange,
  getTopUsers,
  getIpStats,
  // Cleanup
  deleteOldRecords,
  getDatabaseSize
};
