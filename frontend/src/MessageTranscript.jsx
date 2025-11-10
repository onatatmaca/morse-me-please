import React, { useEffect, useRef, useState } from 'react';
import { translateMorse } from './MorseHelper';
import './MessageTranscript.css';

export default function MessageTranscript({ 
  messages, 
  liveMessage, 
  currentUser,
  partnerTyping,
  currentMessageStartTime
}) {
  const transcriptEndRef = useRef(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [liveWPM, setLiveWPM] = useState(0);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveMessage]);

  // Calculate live WPM while typing
  useEffect(() => {
    if (!currentMessageStartTime || !liveMessage) {
      setLiveWPM(0);
      return;
    }

    const interval = setInterval(() => {
      const words = liveMessage.split(' | ').length;
      const minutes = (Date.now() - currentMessageStartTime) / 60000;
      const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
      setLiveWPM(wpm);
    }, 500);

    return () => clearInterval(interval);
  }, [currentMessageStartTime, liveMessage]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="transcript">
      <div className="transcript-header">
        <h3>📝 Message Transcript</h3>
        <button 
          className="translation-toggle"
          onClick={() => setShowTranslation(!showTranslation)}
          title={showTranslation ? "Hide translation" : "Show translation"}
        >
          {showTranslation ? '🔤' : '📖'}
        </button>
      </div>
      
      <div className="transcript-content">
        {messages.length === 0 && !liveMessage && !partnerTyping && (
          <p className="empty-state">Start sending Morse code...</p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.from === currentUser ? 'own-message' : 'partner-message'}`}
          >
            <div className="message-header">
              <span className="message-sender">{msg.from}</span>
              <div className="message-meta">
                {msg.wpm > 0 && !msg.isLive && (
                  <span className="message-wpm">{msg.wpm} WPM</span>
                )}
                {msg.timestamp && !msg.isLive && (
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                )}
              </div>
            </div>
            <div className="message-content">{msg.content}</div>
            {showTranslation && msg.content && !msg.isLive && (
              <div className="message-translation">
                {translateMorse(msg.content)}
              </div>
            )}
          </div>
        ))}

        {partnerTyping && !liveMessage && (
          <div className="message partner-message typing-indicator">
            <div className="message-sender">Partner is typing...</div>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {liveMessage && (
          <div className="message own-message live-message">
            <div className="message-header">
              <span className="message-sender">{currentUser} (typing...)</span>
              {liveWPM > 0 && (
                <span className="live-wpm-badge">{liveWPM} WPM</span>
              )}
            </div>
            <div className="message-content">{liveMessage}</div>
            {showTranslation && liveMessage && (
              <div className="message-translation">
                {translateMorse(liveMessage)}
              </div>
            )}
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
}