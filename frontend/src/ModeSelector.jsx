import React from 'react';
import './ModeSelector.css';

export default function ModeSelector({ username, onlineUsers, onSelectMode }) {
  return (
    <div className="mode-selector-page">
      <div className="mode-content">
        <div className="mode-header">
          <div className="welcome-badge">Welcome!</div>
          <h1>{username}</h1>
          <p>How would you like to practice Morse code today?</p>
          {onlineUsers > 0 && (
            <div className="online-badge">
              <span className="online-dot"></span>
              {onlineUsers} {onlineUsers === 1 ? 'user' : 'users'} online
            </div>
          )}
        </div>

        <div className="mode-cards">
          {/* CHAT MODE FIRST - This is the main feature! */}
          <button className="mode-card chat-card" onClick={() => onSelectMode('chat')}>
            <div className="card-icon">💬</div>
            <h2>Chat Mode</h2>
            <p>Connect and chat with others in real-time Morse code</p>
            <div className="card-badge primary">Main Mode</div>
          </button>

          <button className="mode-card practice-card" onClick={() => onSelectMode('practice')}>
            <div className="card-icon">🎓</div>
            <h2>Practice Mode</h2>
            <p>Learn Morse code with guided tutorials and sandbox practice</p>
            <div className="card-badge">Learn Solo</div>
          </button>
        </div>
      </div>
    </div>
  );
}
