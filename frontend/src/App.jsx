import React, { useState, useEffect, useRef } from 'react';
import socket from './socket';
import UsernameForm from './UsernameForm';
import MorseKey from './MorseKey';
import MessageTranscript from './MessageTranscript';
import ControlPanel from './ControlPanel';
import MorseHelper from './MorseHelper';
import SettingsPanel from './SettingsPanel';
import './App.css';

const DEFAULT_SETTINGS = {
  dashThreshold: 300,
  letterPause: 1500,
  wordPause: 3000,
  keyboardEnabled: true,
  twoButtonMode: false
};

export default function App() {
  const [username, setUsername] = useState('');
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('');
  const [partnerUsername, setPartnerUsername] = useState('');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [liveMessage, setLiveMessage] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [currentMessageStartTime, setCurrentMessageStartTime] = useState(null);
  const [totalWPM, setTotalWPM] = useState(0);

  const lastSignalTime = useRef(null);
  const letterSpaceTimeout = useRef(null);
  const wordSpaceTimeout = useRef(null);
  const typingTimeout = useRef(null);
  const morseKeyRef = useRef(null);

  // Keyboard event handler
  useEffect(() => {
    if (!settings.keyboardEnabled || !isMyTurn) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (settings.twoButtonMode) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          handleMorseSignal('dot');
        } else if (e.key === 'x' || e.key === 'X') {
          e.preventDefault();
          handleMorseSignal('dash');
        }
      } else {
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          if (!e.repeat) {
            handleKeyPress('start');
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (!settings.twoButtonMode && (e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        handleKeyPress('end');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [settings.keyboardEnabled, settings.twoButtonMode, isMyTurn]);

  const keyPressStart = useRef(null);

  const handleKeyPress = (type) => {
    if (type === 'start') {
      keyPressStart.current = Date.now();
    } else if (type === 'end' && keyPressStart.current) {
      const duration = Date.now() - keyPressStart.current;
      const isDash = duration > settings.dashThreshold;
      handleMorseSignal(isDash ? 'dash' : 'dot');
      keyPressStart.current = null;
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Connected to server');
      setConnected(true);
    });

    socket.on('waiting', () => {
      setStatus('Waiting for a partner...');
      setPartnerUsername('');
      setMessages([]);
      setLiveMessage('');
    });

    socket.on('paired', (data) => {
      setPartnerUsername(data.partnerUsername);
      setIsMyTurn(data.yourTurn);
      setStatus(`Connected with ${data.partnerUsername}!`);
      setMessages([]);
      setLiveMessage('');
      setInactivityCountdown(0);
      setCurrentMessageStartTime(null);
    });

    socket.on('your-turn', () => {
      setIsMyTurn(true);
      setStatus('Your turn!');
      setInactivityCountdown(0);

      // Finalize partner's last message when they pass turn
      setMessages(prev => {
        if (prev.length > 0) {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.isLive && lastMsg.from !== username) {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, isLive: false }
            ];
          }
        }
        return prev;
      });
    });

    socket.on('turn-passed', () => {
      if (liveMessage.trim()) {
        const endTime = Date.now();
        const wpm = calculateWPM(liveMessage, currentMessageStartTime, endTime);
        
        setMessages(prev => [...prev, {
          from: username,
          content: liveMessage,
          timestamp: endTime,
          wpm: wpm
        }]);
        
        // Update total WPM (running average)
        setTotalWPM(prev => {
          const msgCount = messages.filter(m => m.from === username).length + 1;
          return ((prev * (msgCount - 1)) + wpm) / msgCount;
        });
        
        setLiveMessage('');
        setCurrentMessageStartTime(null);
      }
      setIsMyTurn(false);
      setStatus(`Waiting for ${partnerUsername}...`);
      setInactivityCountdown(0);
    });

    socket.on('auto-passed', () => {
      setStatus('Turn auto-passed due to inactivity');
      setTimeout(() => {
        setStatus(`Waiting for ${partnerUsername}...`);
      }, 2000);
    });

    socket.on('inactivity-warning', (remaining) => {
      setInactivityCountdown(remaining);
    });

    socket.on('morse-message', (data) => {
      const symbol = data.signal === 'dot' ? '·' : '−';
      
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        
        if (lastMsg && lastMsg.from === data.from && lastMsg.isLive) {
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, content: lastMsg.content + symbol }
          ];
        } else {
          return [...prev, {
            from: data.from,
            content: symbol,
            isLive: true,
            timestamp: Date.now()
          }];
        }
      });
    });

    socket.on('partner-typing', (isTyping) => {
      setPartnerTyping(isTyping);
      
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      
      if (isTyping) {
        typingTimeout.current = setTimeout(() => {
          setPartnerTyping(false);
        }, 4000);
      }
    });

    socket.on('partner-disconnected', () => {
      setStatus('Partner disconnected');
      setPartnerUsername('');
      setIsMyTurn(false);
      setMessages([]);
      setLiveMessage('');
      setPartnerTyping(false);
      setInactivityCountdown(0);
      setCurrentMessageStartTime(null);
    });

    return () => {
      socket.off('connect');
      socket.off('waiting');
      socket.off('paired');
      socket.off('your-turn');
      socket.off('turn-passed');
      socket.off('auto-passed');
      socket.off('inactivity-warning');
      socket.off('morse-message');
      socket.off('partner-typing');
      socket.off('partner-disconnected');
    };
  }, [username, partnerUsername, liveMessage, messages, currentMessageStartTime]);

  const calculateWPM = (morseText, startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    // Standard: 1 word = 5 characters, "PARIS" is standard word
    const words = morseText.split(' | ').length;
    const minutes = (endTime - startTime) / 60000;
    
    return minutes > 0 ? Math.round(words / minutes) : 0;
  };

  const handleMorseSignal = (signal) => {
    // Start timer on first signal
    if (!currentMessageStartTime) {
      setCurrentMessageStartTime(Date.now());
    }

    // Trigger visual feedback on the button
    if (morseKeyRef.current) {
      morseKeyRef.current.triggerPress(signal);
    }

    socket.emit('morse-message', signal);

    const symbol = signal === 'dot' ? '·' : '−';
    setLiveMessage(prev => prev + symbol);

    lastSignalTime.current = Date.now();
    setInactivityCountdown(0);

    // Clear existing timeouts
    if (letterSpaceTimeout.current) {
      clearTimeout(letterSpaceTimeout.current);
    }
    if (wordSpaceTimeout.current) {
      clearTimeout(wordSpaceTimeout.current);
    }

    // Letter space
    letterSpaceTimeout.current = setTimeout(() => {
      setLiveMessage(prev => {
        if (prev.endsWith(' ') || prev.endsWith(' | ')) return prev;
        return prev + ' ';
      });
    }, settings.letterPause);

    // Word boundary
    wordSpaceTimeout.current = setTimeout(() => {
      setLiveMessage(prev => {
        const trimmed = prev.endsWith(' ') && !prev.endsWith(' | ')
          ? prev.slice(0, -1)
          : prev;
        return trimmed + ' | ';
      });
      socket.emit('typing-stopped');
    }, settings.wordPause);
  };

  const handlePassTurn = () => {
    if (letterSpaceTimeout.current) {
      clearTimeout(letterSpaceTimeout.current);
    }
    if (wordSpaceTimeout.current) {
      clearTimeout(wordSpaceTimeout.current);
    }
    
    socket.emit('pass-turn');
  };

  const handleDisconnect = () => {
    socket.emit('disconnect-partner');
    setPartnerUsername('');
    setIsMyTurn(false);
    setStatus('Disconnected');
    setMessages([]);
    setLiveMessage('');
    setInactivityCountdown(0);
    setTotalWPM(0);
    setCurrentMessageStartTime(null);
  };

  const handleFindNew = () => {
    if (letterSpaceTimeout.current) {
      clearTimeout(letterSpaceTimeout.current);
    }
    if (wordSpaceTimeout.current) {
      clearTimeout(wordSpaceTimeout.current);
    }
    
    socket.emit('find-new-partner');
    setStatus('Finding new partner...');
    setMessages([]);
    setLiveMessage('');
    setInactivityCountdown(0);
    setTotalWPM(0);
    setCurrentMessageStartTime(null);
  };

  const handleUsernameSubmit = (name) => {
    setUsername(name);
    socket.connect();
    socket.emit('set-username', name);
  };

  if (!username) {
    return <UsernameForm onSubmit={handleUsernameSubmit} />;
  }

  return (
    <>
    <div className="app-container">
      <div className="status-bar">
        <div className="user-info">
          <span className="username">
            You: {username}
            {totalWPM > 0 && <span className="wpm-badge">{Math.round(totalWPM)} WPM</span>}
          </span>
          {partnerUsername && (
            <span className="partner">Partner: {partnerUsername}</span>
          )}
        </div>
        <div className="status-info">
          <div className="status">
            {isMyTurn ? (
              <>
                ⏳ Your Turn
                {inactivityCountdown > 0 && (
                  <span className="warning-badge"> {inactivityCountdown}s</span>
                )}
              </>
            ) : (
              `Waiting for ${partnerUsername || '...'}...`
            )}
          </div>
          
          <div className="connection-status">
            <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`}></span>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <button 
          className="volume-btn"
          onClick={() => setShowVolumeControl(!showVolumeControl)}
          title="Volume control"
        >
          {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
        </button>

        <button 
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          ⚙️
        </button>
        
        {showVolumeControl && (
          <div className="volume-control">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
            <span>{Math.round(volume * 100)}%</span>
          </div>
        )}
      </div>

      {partnerUsername ? (
        <div className="main-app-content">
          <MorseKey
            ref={morseKeyRef}
            onSignal={handleMorseSignal}
            disabled={!isMyTurn}
            volume={volume}
            dashThreshold={settings.dashThreshold}
          />
          
          <div className="timing-guide">
            <div className="timing-item">
              <span className="timing-icon">⚡</span>
              <span className="timing-label">{(settings.letterPause / 1000).toFixed(1)}s</span>
              <span className="timing-desc">Letter space</span>
            </div>
            <div className="timing-divider">|</div>
            <div className="timing-item">
              <span className="timing-icon">⏸️</span>
              <span className="timing-label">{(settings.wordPause / 1000).toFixed(1)}s</span>
              <span className="timing-desc">New word</span>
            </div>
          </div>

          {settings.keyboardEnabled && (
            <div className="keyboard-hint">
              {settings.twoButtonMode 
                ? '⌨️ Z = Dot | X = Dash' 
                : '⌨️ Hold Spacebar to type'
              }
            </div>
          )}
          
          <ControlPanel
            onPassTurn={handlePassTurn}
            onDisconnect={handleDisconnect}
            onFindNew={handleFindNew}
            disabled={!isMyTurn}
            inactivityCountdown={inactivityCountdown}
          />

          <MessageTranscript
            messages={messages}
            liveMessage={liveMessage}
            currentUser={username}
            partnerTyping={partnerTyping}
            currentMessageStartTime={currentMessageStartTime}
          />
        </div>
      ) : (
        <div className="main-content">
          <h2>⏳ {status}</h2>
          <p className="waiting-hint">Open another tab or share with a friend to connect!</p>
        </div>
      )}

      <SettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>

    <MorseHelper />
  </>
  );
}