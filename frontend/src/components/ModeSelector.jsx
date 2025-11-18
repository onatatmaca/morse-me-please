// src/components/ModeSelector.jsx
import React from 'react';
import './ModeSelector.css';

export default function ModeSelector({ username, onlineUsers, onSelectMode }) {
  return (
    <div className="mode-selector-container">
      <div className="mode-selector-card">
        <div className="mode-selector-header">
          <h2 className="welcome-title">Welcome, <span className="username-highlight">{username}</span>!</h2>
          <p className="mode-selector-subtitle">How would you like to practice Morse code today?</p>

          {onlineUsers > 0 && (
            <div className="online-users-indicator">
              <span className="online-dot-pulse"></span>
              {onlineUsers} {onlineUsers === 1 ? 'user' : 'users'} online
            </div>
          )}
        </div>

        <div className="mode-options">
          {/* Practice Mode */}
          <button
            className="mode-option practice-mode"
            onClick={() => onSelectMode('practice')}
          >
            <div className="mode-icon">🎓</div>
            <div className="mode-content">
              <h3 className="mode-title">Practice Mode</h3>
              <p className="mode-description">
                Learn Morse code solo with guided lessons, interactive exercises, and progress tracking
              </p>
              <div className="mode-features">
                <span className="feature-tag">📚 15+ Lessons</span>
                <span className="feature-tag">🎯 Interactive Drills</span>
                <span className="feature-tag">📊 Progress Tracking</span>
                <span className="feature-tag">🤖 Practice Bot</span>
              </div>
            </div>
            <div className="mode-badge recommended-badge">Recommended for Beginners</div>
          </button>

          {/* Chat Mode */}
          <button
            className="mode-option chat-mode"
            onClick={() => onSelectMode('chat')}
          >
            <div className="mode-icon">💬</div>
            <div className="mode-content">
              <h3 className="mode-title">Chat Mode</h3>
              <p className="mode-description">
                Connect instantly with another Morse enthusiast for real-time conversation
              </p>
              <div className="mode-features">
                <span className="feature-tag">⚡ Instant Pairing</span>
                <span className="feature-tag">🌍 Global Users</span>
                <span className="feature-tag">🎵 Live Audio</span>
                <span className="feature-tag">💬 Real Conversations</span>
              </div>
            </div>
            {onlineUsers > 1 && (
              <div className="mode-badge active-badge">{onlineUsers - 1} available</div>
            )}
          </button>
        </div>

        <div className="mode-selector-footer">
          <p className="mode-hint">
            💡 <strong>Tip:</strong> New to Morse code? Start with Practice Mode to learn the basics!
          </p>
        </div>
      </div>
    </div>
  );
}
