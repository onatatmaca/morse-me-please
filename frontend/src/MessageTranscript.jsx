import React, { useEffect, useRef, useState } from 'react';
import { translateMorse } from './MorseHelper';
import './MessageTranscript.css';

export default function MessageTranscript({
  messages,
  myLiveMessage,
  partnerLiveMessage,
  currentUser,
  partnerUsername,
  currentMessageStartTime,
  partnerMessageStartTime,
  partnerTyping
}) {
  const transcriptEndRef = useRef(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [partnerLiveWPM, setPartnerLiveWPM] = useState(0);

  // Only auto-scroll for partner messages and finalized messages, not for user's own typing
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerLiveMessage]); // Removed myLiveMessage from dependencies

  // Calculate partner's live WPM while typing
  useEffect(() => {
    if (!partnerMessageStartTime || !partnerLiveMessage) {
      setPartnerLiveWPM(0);
      return;
    }

    const interval = setInterval(() => {
      const words = partnerLiveMessage.split(' | ').length;
      const minutes = (Date.now() - partnerMessageStartTime) / 60000;
      const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
      setPartnerLiveWPM(wpm);
    }, 500);

    return () => clearInterval(interval);
  }, [partnerMessageStartTime, partnerLiveMessage]);

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
        <h3>💬 Chat</h3>
        <button
          className="translation-toggle"
          onClick={() => setShowTranslation(!showTranslation)}
          title={showTranslation ? "Hide translation" : "Show translation"}
        >
          {showTranslation ? '🔤' : '📖'}
        </button>
      </div>

      <div className="chat-container">
        {messages.map((msg, index) => {
          const isOwn = msg.from === currentUser;
          return (
            <div key={index} className={`chat-message ${isOwn ? 'own-message' : 'partner-message'}`}>
              <div className="message-bubble">
                <div className="message-content">{msg.content}</div>
                {showTranslation && msg.content && (
                  <div className="message-translation">
                    {translateMorse(msg.content)}
                  </div>
                )}
                <div className="message-meta">
                  {msg.wpm > 0 && (
                    <span className="message-wpm">{msg.wpm} WPM</span>
                  )}
                  {msg.timestamp && (
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Partner typing indicator (before message arrives) */}
        {partnerTyping && !partnerLiveMessage && (
          <div className="chat-message partner-message typing-indicator-message">
            <div className="message-bubble live-message">
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
              <div className="typing-text">
                {partnerUsername} is typing...
              </div>
            </div>
          </div>
        )}

        {/* Partner message being played back */}
        {partnerLiveMessage && (
          <div className="chat-message partner-message playback-indicator-message">
            <div className="message-bubble live-message">
              <div className="message-content">{partnerLiveMessage}</div>
              {showTranslation && (
                <div className="message-translation">
                  {translateMorse(partnerLiveMessage)}
                </div>
              )}
              {partnerLiveWPM > 0 && (
                <div className="message-meta">
                  <span className="message-wpm">▶ {partnerLiveWPM} WPM</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
}