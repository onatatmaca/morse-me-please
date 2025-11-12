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
  partnerMessageStartTime
}) {
  const transcriptEndRef = useRef(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [myLiveWPM, setMyLiveWPM] = useState(0);
  const [partnerLiveWPM, setPartnerLiveWPM] = useState(0);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, myLiveMessage, partnerLiveMessage]);

  // Calculate user's live WPM while typing
  useEffect(() => {
    if (!currentMessageStartTime || !myLiveMessage) {
      setMyLiveWPM(0);
      return;
    }

    const interval = setInterval(() => {
      const words = myLiveMessage.split(' | ').length;
      const minutes = (Date.now() - currentMessageStartTime) / 60000;
      const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
      setMyLiveWPM(wpm);
    }, 500);

    return () => clearInterval(interval);
  }, [currentMessageStartTime, myLiveMessage]);

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
        <h3>📝 Dual-Lane Transcript</h3>
        <button
          className="translation-toggle"
          onClick={() => setShowTranslation(!showTranslation)}
          title={showTranslation ? "Hide translation" : "Show translation"}
        >
          {showTranslation ? '🔤' : '📖'}
        </button>
      </div>

      <div className="dual-lane-container">
        {/* User Lane */}
        <div className="lane user-lane">
          <div className="lane-header">
            <span className="lane-title">You ({currentUser})</span>
            <span className="lane-freq">600 Hz</span>
          </div>
          <div className="lane-content">
            {messages.filter(m => m.from === currentUser).map((msg, index) => (
              <div key={index} className="message own-message">
                <div className="message-header">
                  <div className="message-meta">
                    {msg.wpm > 0 && (
                      <span className="message-wpm">{msg.wpm} WPM</span>
                    )}
                    {msg.timestamp && (
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    )}
                  </div>
                </div>
                <div className="message-content">{msg.content}</div>
                {showTranslation && msg.content && (
                  <div className="message-translation">
                    {translateMorse(msg.content)}
                  </div>
                )}
              </div>
            ))}

            {myLiveMessage && (
              <div className="message own-message live-message">
                <div className="message-header">
                  <span className="live-indicator">typing...</span>
                  {myLiveWPM > 0 && (
                    <span className="live-wpm-badge">{myLiveWPM} WPM</span>
                  )}
                </div>
                <div className="message-content">{myLiveMessage}</div>
                {showTranslation && myLiveMessage && (
                  <div className="message-translation">
                    {translateMorse(myLiveMessage)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Partner Lane */}
        <div className="lane partner-lane">
          <div className="lane-header">
            <span className="lane-title">Partner ({partnerUsername})</span>
            <span className="lane-freq">900 Hz</span>
          </div>
          <div className="lane-content">
            {messages.filter(m => m.from !== currentUser).map((msg, index) => (
              <div key={index} className="message partner-message">
                <div className="message-header">
                  <div className="message-meta">
                    {msg.wpm > 0 && (
                      <span className="message-wpm">{msg.wpm} WPM</span>
                    )}
                    {msg.timestamp && (
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    )}
                  </div>
                </div>
                <div className="message-content">{msg.content}</div>
                {showTranslation && msg.content && (
                  <div className="message-translation">
                    {translateMorse(msg.content)}
                  </div>
                )}
              </div>
            ))}

            {partnerLiveMessage && (
              <div className="message partner-message live-message">
                <div className="message-header">
                  <span className="live-indicator">typing...</span>
                  {partnerLiveWPM > 0 && (
                    <span className="live-wpm-badge">{partnerLiveWPM} WPM</span>
                  )}
                </div>
                <div className="message-content">{partnerLiveMessage}</div>
                {showTranslation && partnerLiveMessage && (
                  <div className="message-translation">
                    {translateMorse(partnerLiveMessage)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
}