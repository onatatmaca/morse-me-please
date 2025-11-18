import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  // ========== AUTH STATE ==========
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  // Login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ========== DASHBOARD STATE ==========
  const [activeTab, setActiveTab] = useState('live'); // live, stats, sessions, messages, ip, settings
  const [stats, setStats] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [ipStats, setIpStats] = useState([]);

  // Pagination
  const [sessionPage, setSessionPage] = useState(0);
  const [messagePage, setMessagePage] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [messageTotal, setMessageTotal] = useState(0);

  // Filters
  const [sessionFilters, setSessionFilters] = useState({});
  const [messageFilters, setMessageFilters] = useState({});

  // ========== API CALLS ==========
  const API_BASE = '/api/admin';

  const apiCall = async (endpoint, method = 'GET', body = null) => {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Include cookies
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
        }
        throw new Error(data.error || 'API error');
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // ========== AUTH FUNCTIONS ==========
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const result = await apiCall('/login', 'POST', { username, password });

      if (result.success) {
        setIsAuthenticated(true);
        setPassword(''); // Clear password
      }
    } catch (error) {
      setLoginError(error.message || 'Login failed');
      if (error.remainingAttempts !== undefined) {
        setRemainingAttempts(error.remainingAttempts);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await apiCall('/logout', 'POST');
      setIsAuthenticated(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const verifySession = async () => {
    try {
      const result = await apiCall('/verify');
      if (result.success) {
        setIsAuthenticated(true);
        setUsername(result.username);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== DATA FETCHING ==========
  const fetchStats = async () => {
    try {
      const result = await apiCall('/stats');
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchLiveData = async () => {
    try {
      const result = await apiCall('/live');
      if (result.success) {
        setLiveData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch live data:', error);
    }
  };

  const fetchSessions = async (page = 0, filters = {}) => {
    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: String(page * 50),
        ...filters
      });

      const result = await apiCall(`/sessions?${params}`);
      if (result.success) {
        setSessions(result.data.sessions);
        setSessionTotal(result.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const fetchMessages = async (page = 0, filters = {}) => {
    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: String(page * 50),
        ...filters
      });

      const result = await apiCall(`/messages?${params}`);
      if (result.success) {
        setMessages(result.data.messages);
        setMessageTotal(result.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchIpStats = async () => {
    try {
      const result = await apiCall('/ip-stats');
      if (result.success) {
        setIpStats(result.data.ipStats);
      }
    } catch (error) {
      console.error('Failed to fetch IP stats:', error);
    }
  };

  const deleteOldRecords = async (days) => {
    if (!confirm(`Delete all records older than ${days} days?`)) return;

    try {
      const result = await apiCall(`/cleanup?days=${days}`, 'DELETE');
      if (result.success) {
        alert(`Deleted: ${result.data.messagesDeleted} messages, ${result.data.sessionsDeleted} sessions`);
        // Refresh current view
        if (activeTab === 'sessions') fetchSessions(sessionPage, sessionFilters);
        if (activeTab === 'messages') fetchMessages(messagePage, messageFilters);
        if (activeTab === 'stats') fetchStats();
      }
    } catch (error) {
      alert('Cleanup failed: ' + error.message);
    }
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    verifySession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial data fetch based on active tab
    if (activeTab === 'live') {
      fetchLiveData();
      const interval = setInterval(fetchLiveData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    } else if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'sessions') {
      fetchSessions(sessionPage, sessionFilters);
    } else if (activeTab === 'messages') {
      fetchMessages(messagePage, messageFilters);
    } else if (activeTab === 'ip') {
      fetchIpStats();
    }
  }, [isAuthenticated, activeTab, sessionPage, messagePage]);

  // ========== RENDER LOADING ==========
  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Verifying session...</p>
      </div>
    );
  }

  // ========== RENDER LOGIN ==========
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <h1>🔐 Admin Panel</h1>
          <p className="login-subtitle">Morse Me Please - Administration</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {loginError && (
              <div className="login-error">
                {loginError}
                {remainingAttempts > 0 && remainingAttempts < 5 && (
                  <div className="attempts-warning">
                    {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="login-btn">
              Login
            </button>
          </form>

          <div className="login-footer">
            <p>Default credentials: admin / admin123</p>
            <p className="warning">⚠️ Change these in production!</p>
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER DASHBOARD ==========
  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>📊 Admin Dashboard</h1>
          <p>Morse Me Please</p>
        </div>
        <div className="header-right">
          <span className="username">Logged in as: {username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="admin-tabs">
        <button
          className={`tab ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          🔴 Live
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📈 Statistics
        </button>
        <button
          className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          👥 Sessions
        </button>
        <button
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Messages
        </button>
        <button
          className={`tab ${activeTab === 'ip' ? 'active' : ''}`}
          onClick={() => setActiveTab('ip')}
        >
          🌐 IP Tracking
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>

      {/* Tab Content */}
      <main className="admin-content">
        {activeTab === 'live' && <LiveTab data={liveData} />}
        {activeTab === 'stats' && <StatsTab data={stats} />}
        {activeTab === 'sessions' && (
          <SessionsTab
            sessions={sessions}
            total={sessionTotal}
            page={sessionPage}
            onPageChange={setSessionPage}
            filters={sessionFilters}
            onFilterChange={setSessionFilters}
            onRefresh={() => fetchSessions(sessionPage, sessionFilters)}
          />
        )}
        {activeTab === 'messages' && (
          <MessagesTab
            messages={messages}
            total={messageTotal}
            page={messagePage}
            onPageChange={setMessagePage}
            filters={messageFilters}
            onFilterChange={setMessageFilters}
            onRefresh={() => fetchMessages(messagePage, messageFilters)}
          />
        )}
        {activeTab === 'ip' && <IpTab data={ipStats} />}
        {activeTab === 'settings' && (
          <SettingsTab
            onDeleteRecords={deleteOldRecords}
            dbSize={stats?.dbSize}
          />
        )}
      </main>
    </div>
  );
}

// ========== TAB COMPONENTS ==========

function LiveTab({ data }) {
  if (!data) return <div className="loading">Loading live data...</div>;

  return (
    <div className="live-tab">
      <div className="stat-cards">
        <div className="stat-card">
          <h3>🟢 Online Users</h3>
          <div className="stat-value">{data.onlineCount}</div>
        </div>
        <div className="stat-card">
          <h3>💬 Active Chats</h3>
          <div className="stat-value">{data.activeChats}</div>
        </div>
      </div>

      <div className="active-users-section">
        <h3>Active Users</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Socket ID</th>
              <th>Partner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.activeUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td><code>{user.id.substring(0, 8)}...</code></td>
                <td>{user.partnerUsername || <em>Waiting...</em>}</td>
                <td>
                  {user.partnerId ? (
                    <span className="status-chatting">Chatting</span>
                  ) : (
                    <span className="status-waiting">Waiting</span>
                  )}
                </td>
              </tr>
            ))}
            {data.activeUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="no-data">No users online</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatsTab({ data }) {
  if (!data) return <div className="loading">Loading statistics...</div>;

  const { general, topUsers, dbSize } = data;

  return (
    <div className="stats-tab">
      <h2>General Statistics</h2>
      <div className="stat-cards">
        <div className="stat-card">
          <h4>Total Sessions</h4>
          <div className="stat-value">{general.total_sessions?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <h4>Unique Users</h4>
          <div className="stat-value">{general.unique_users?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <h4>Unique IPs</h4>
          <div className="stat-value">{general.unique_ips?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <h4>Total Messages</h4>
          <div className="stat-value">{general.total_messages?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <h4>Avg WPM</h4>
          <div className="stat-value">{general.avg_wpm?.toFixed(1) || 0}</div>
        </div>
        <div className="stat-card">
          <h4>Avg Session Duration</h4>
          <div className="stat-value">{formatDuration(general.avg_session_duration)}</div>
        </div>
        <div className="stat-card">
          <h4>Database Size</h4>
          <div className="stat-value">{dbSize?.megabytes} MB</div>
        </div>
      </div>

      <h3>Top Users by Messages Sent</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Messages Sent</th>
            <th>Sessions</th>
          </tr>
        </thead>
        <tbody>
          {topUsers.map((user, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{user.username}</td>
              <td>{user.total_sent}</td>
              <td>{user.session_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SessionsTab({ sessions, total, page, onPageChange, filters, onFilterChange, onRefresh }) {
  const [usernameFilter, setUsernameFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');

  const applyFilters = () => {
    const newFilters = {};
    if (usernameFilter) newFilters.username = usernameFilter;
    if (ipFilter) newFilters.ip = ipFilter;
    onFilterChange(newFilters);
    onPageChange(0);
  };

  const clearFilters = () => {
    setUsernameFilter('');
    setIpFilter('');
    onFilterChange({});
    onPageChange(0);
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="sessions-tab">
      <div className="tab-header">
        <h2>User Sessions ({total.toLocaleString()} total)</h2>
        <button onClick={onRefresh} className="refresh-btn">🔄 Refresh</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Filter by username..."
          value={usernameFilter}
          onChange={(e) => setUsernameFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by IP..."
          value={ipFilter}
          onChange={(e) => setIpFilter(e.target.value)}
        />
        <button onClick={applyFilters}>Apply</button>
        <button onClick={clearFilters}>Clear</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>IP Address</th>
            <th>Join Time</th>
            <th>Leave Time</th>
            <th>Duration</th>
            <th>Msgs Sent</th>
            <th>Msgs Received</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td>{session.username}</td>
              <td><code>{session.ip_address}</code></td>
              <td>{formatDateTime(session.join_time)}</td>
              <td>{session.leave_time ? formatDateTime(session.leave_time) : <em>Active</em>}</td>
              <td>{formatDuration(session.duration_seconds)}</td>
              <td>{session.messages_sent}</td>
              <td>{session.messages_received}</td>
            </tr>
          ))}
          {sessions.length === 0 && (
            <tr>
              <td colSpan="7" className="no-data">No sessions found</td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => onPageChange(page - 1)} disabled={page === 0}>
            « Previous
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
            Next »
          </button>
        </div>
      )}
    </div>
  );
}

function MessagesTab({ messages, total, page, onPageChange, filters, onFilterChange, onRefresh }) {
  const [usernameFilter, setUsernameFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const applyFilters = () => {
    const newFilters = {};
    if (usernameFilter) newFilters.username = usernameFilter;
    if (searchFilter) newFilters.search = searchFilter;
    onFilterChange(newFilters);
    onPageChange(0);
  };

  const clearFilters = () => {
    setUsernameFilter('');
    setSearchFilter('');
    onFilterChange({});
    onPageChange(0);
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="messages-tab">
      <div className="tab-header">
        <h2>Chat Messages ({total.toLocaleString()} total)</h2>
        <button onClick={onRefresh} className="refresh-btn">🔄 Refresh</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Filter by username..."
          value={usernameFilter}
          onChange={(e) => setUsernameFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        />
        <button onClick={applyFilters}>Apply</button>
        <button onClick={clearFilters}>Clear</button>
      </div>

      <table className="data-table messages-table">
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Message</th>
            <th>Translation</th>
            <th>WPM</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr key={msg.id}>
              <td>{msg.sender_username}</td>
              <td>{msg.receiver_username}</td>
              <td className="morse-code">{msg.morse_code}</td>
              <td className="translated-text">{msg.translated_text}</td>
              <td>{msg.wpm}</td>
              <td>{formatDateTime(msg.timestamp)}</td>
            </tr>
          ))}
          {messages.length === 0 && (
            <tr>
              <td colSpan="6" className="no-data">No messages found</td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => onPageChange(page - 1)} disabled={page === 0}>
            « Previous
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
            Next »
          </button>
        </div>
      )}
    </div>
  );
}

function IpTab({ data }) {
  if (!data) return <div className="loading">Loading IP statistics...</div>;

  return (
    <div className="ip-tab">
      <h2>IP Address Statistics</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Sessions</th>
            <th>Usernames</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ip, idx) => (
            <tr key={idx}>
              <td><code>{ip.ip_address}</code></td>
              <td>{ip.session_count}</td>
              <td className="usernames-list">{ip.usernames}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="3" className="no-data">No IP data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SettingsTab({ onDeleteRecords, dbSize }) {
  const [deletedays, setDeleteDays] = useState(30);

  return (
    <div className="settings-tab">
      <h2>Settings & Maintenance</h2>

      <div className="settings-section">
        <h3>🗑️ Data Cleanup</h3>
        <p>Delete old records to keep database size manageable.</p>
        <div className="cleanup-controls">
          <label>
            Delete records older than:
            <input
              type="number"
              min="1"
              max="365"
              value={deletedays}
              onChange={(e) => setDeleteDays(e.target.value)}
            />
            days
          </label>
          <button
            onClick={() => onDeleteRecords(deletedays)}
            className="delete-btn"
          >
            Delete Old Records
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>💾 Database Information</h3>
        <p>Current database size: <strong>{dbSize?.megabytes} MB</strong> ({dbSize?.kilobytes} KB)</p>
        <p>Automatic cleanup runs daily at midnight (deletes records older than 30 days)</p>
      </div>

      <div className="settings-section">
        <h3>🔐 Security</h3>
        <p>To change admin password, set environment variables:</p>
        <pre>
          ADMIN_USERNAME=your_username{'\n'}
          ADMIN_PASSWORD_HASH=your_bcrypt_hash
        </pre>
        <p>Generate hash with:</p>
        <code>node -e "require('bcrypt').hash('your_password', 10).then(h =&gt; console.log(h))"</code>
      </div>
    </div>
  );
}

// ========== UTILITY FUNCTIONS ==========

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString();
}

function formatDuration(seconds) {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  }
  return `${mins}m ${secs}s`;
}
