// Enhanced logging for security monitoring

const fs = require('fs');
const path = require('path');

// Log directory
const LOG_DIR = path.join(__dirname, 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Security event types
const SecurityEvents = {
  RATE_LIMIT_CONNECTION: 'rate_limit_connection',
  RATE_LIMIT_MESSAGE: 'rate_limit_message',
  INVALID_USERNAME: 'invalid_username',
  XSS_ATTEMPT: 'xss_attempt',
  ADMIN_LOGIN_FAILED: 'admin_login_failed',
  ADMIN_LOGIN_SUCCESS: 'admin_login_success',
  CORS_BLOCKED: 'cors_blocked',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity'
};

/**
 * Log security event to file and console
 * @param {string} eventType - Type of security event
 * @param {object} details - Event details
 */
const logSecurityEvent = (eventType, details) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    ...details
  };

  // Console output with color coding
  const emoji = getEventEmoji(eventType);
  console.log(`${emoji} [SECURITY] ${eventType}:`, JSON.stringify(details));

  // File logging
  const logFile = path.join(LOG_DIR, `security-${getDateString()}.log`);
  const logLine = JSON.stringify(logEntry) + '\n';

  fs.appendFile(logFile, logLine, (err) => {
    if (err) console.error('Failed to write security log:', err);
  });
};

/**
 * Get emoji for event type
 */
const getEventEmoji = (eventType) => {
  const emojiMap = {
    [SecurityEvents.RATE_LIMIT_CONNECTION]: '🚫',
    [SecurityEvents.RATE_LIMIT_MESSAGE]: '⏱️',
    [SecurityEvents.INVALID_USERNAME]: '⚠️',
    [SecurityEvents.XSS_ATTEMPT]: '🔴',
    [SecurityEvents.ADMIN_LOGIN_FAILED]: '🔐',
    [SecurityEvents.ADMIN_LOGIN_SUCCESS]: '✅',
    [SecurityEvents.CORS_BLOCKED]: '🛑',
    [SecurityEvents.SUSPICIOUS_ACTIVITY]: '👁️'
  };
  return emojiMap[eventType] || '📝';
};

/**
 * Get date string for log file naming (YYYY-MM-DD)
 */
const getDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Get security statistics for today
 */
const getSecurityStats = () => {
  const logFile = path.join(LOG_DIR, `security-${getDateString()}.log`);

  if (!fs.existsSync(logFile)) {
    return {
      total: 0,
      byType: {},
      recentEvents: []
    };
  }

  const logs = fs.readFileSync(logFile, 'utf8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  // Count by type
  const byType = {};
  logs.forEach(log => {
    byType[log.eventType] = (byType[log.eventType] || 0) + 1;
  });

  // Get recent events (last 20)
  const recentEvents = logs.slice(-20).reverse();

  return {
    total: logs.length,
    byType,
    recentEvents
  };
};

/**
 * Get all security logs for a date range
 */
const getSecurityLogs = (startDate, endDate) => {
  const logs = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `security-${dateStr}.log`);

    if (fs.existsSync(logFile)) {
      const dayLogs = fs.readFileSync(logFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      logs.push(...dayLogs);
    }
  }

  return logs;
};

/**
 * Clean up old log files (older than 30 days)
 */
const cleanupOldLogs = () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  fs.readdir(LOG_DIR, (err, files) => {
    if (err) return;

    files.forEach(file => {
      if (!file.startsWith('security-') || !file.endsWith('.log')) return;

      const filePath = path.join(LOG_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        if (stats.mtime < thirtyDaysAgo) {
          fs.unlink(filePath, (err) => {
            if (!err) {
              console.log(`🗑️ Deleted old security log: ${file}`);
            }
          });
        }
      });
    });
  });
};

// Run cleanup daily
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

module.exports = {
  SecurityEvents,
  logSecurityEvent,
  getSecurityStats,
  getSecurityLogs,
  cleanupOldLogs
};
