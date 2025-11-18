import React from 'react';
import './ModeSelector.css';

export default function ModeSelector({ username, onlineUsers, onSelectMode }) {
  return (
    <div className="mode-selector-page">
      <div className="mode-content">
        <div className="mode-header">
          <h1>Welcome, {username}!</h1>
          <p>How would you like to practice Morse code today?</p>
          {onlineUsers > 0 && (
            <div className="online-badge">
              <span className="online-dot"></span>
              {onlineUsers} users online
            </div>
          )}
        </div>

        <div className="mode-cards">
          <button className="mode-card practice-card" onClick={() => onSelectMode('practice')}>
            <div className="card-icon">🎓</div>
            <h2>Practice Mode</h2>
            <p>Learn Morse code with simple typing exercises</p>
          </button>

          <button className="mode-card chat-card" onClick={() => onSelectMode('chat')}>
            <div className="card-icon">💬</div>
            <h2>Chat Mode</h2>
            <p>Connect and chat with others in real-time</p>
          </button>
        </div>
      </div>
    </div>
  );
}
