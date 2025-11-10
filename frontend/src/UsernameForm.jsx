import React, { useState } from 'react';
import './UsernameForm.css';

export default function UsernameForm({ onSubmit }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <div className="username-form-container">
      <div className="username-card">
        <h1>🎯 Morse Omegle</h1>
        <p className="subtitle">Connect with strangers through Morse code</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <button type="submit">Connect</button>
        </form>
      </div>
    </div>
  );
}