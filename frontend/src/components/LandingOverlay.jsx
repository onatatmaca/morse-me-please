// src/components/LandingOverlay.jsx
import React, { useState, useEffect } from 'react';
import './LandingOverlay.css';

function LandingOverlay({ onEnter }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen the landing overlay before
    const hasSeenLanding = localStorage.getItem('hasSeenMorseLanding');

    if (!hasSeenLanding) {
      setShow(true);
    } else {
      // If they've seen it, call onEnter immediately
      onEnter();
    }
  }, [onEnter]);

  const handleEnter = () => {
    // Store that user has seen the landing
    localStorage.setItem('hasSeenMorseLanding', 'true');
    setShow(false);
    onEnter();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="landing-overlay">
      <div className="landing-content">
        <div className="landing-header">
          <img src="/logo250_transparent.png" alt="Morse Me Please Logo" className="landing-logo" />
          <h1 className="landing-title">Morse Code Chat</h1>
          <div className="morse-animation">
            <span className="morse-dot">·</span>
            <span className="morse-dash">—</span>
            <span className="morse-dot">·</span>
          </div>
        </div>

        <p className="landing-tagline">
          Connect with strangers worldwide through the timeless art of Morse code
        </p>

        <div className="landing-features">
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <h3>Real-Time Communication</h3>
            <p>Instant Morse code messaging with live translation</p>
          </div>

          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <h3>Learn & Practice</h3>
            <p>Improve your Morse code skills while chatting</p>
          </div>

          <div className="feature-item">
            <span className="feature-icon">🌍</span>
            <h3>Global Connections</h3>
            <p>Match with Morse enthusiasts from around the world</p>
          </div>
        </div>

        <div className="landing-about">
          <h2>What is Morse Code?</h2>
          <p>
            Morse code is a communication method that encodes text using sequences of dots (·) and
            dashes (—). Invented in the 1830s, it remains a fascinating and useful skill practiced by
            radio amateurs, pilots, and communication enthusiasts worldwide.
          </p>
        </div>

        <div className="landing-actions">
          <button className="enter-chat-btn" onClick={handleEnter}>
            <span className="btn-icon">▸</span>
            Enter Chat Room
          </button>
          <p className="landing-note">Free forever • No registration required • Start instantly</p>
        </div>
      </div>
    </div>
  );
}

export default LandingOverlay;
