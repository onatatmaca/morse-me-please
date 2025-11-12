import React, { useState, useEffect, useRef } from 'react';
import socket from './socket';
import UsernameForm from './UsernameForm';
import MorseKey from './MorseKey';
import MessageTranscript from './MessageTranscript';
import ControlPanel from './ControlPanel';
import MorseHelper, { translateMorse } from './MorseHelper';
import SettingsPanel from './SettingsPanel';
import './App.css';

const DEFAULT_SETTINGS = {
  wpm: 12,              // Morse speed (5-40 WPM) - Starting slower for beginners
  submitDelay: 2500,    // Auto-send delay in ms (1000-5000ms) - More time to compose
  showLetters: true,    // Show translation while typing
  keyboardEnabled: true,
  twoButtonMode: true,  // Z=dot, X=dash, Left CTRL=dot, Right CTRL=dash (default ON)
  twoCircleMode: false  // Separate dot/dash buttons for mobile
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
  const [autoSendProgress, setAutoSendProgress] = useState(0); // Progress bar for auto-send (0-100)
  const [isMousePressed, setIsMousePressed] = useState(false); // Track if mouse is currently pressed

  const lastSignalTime = useRef(null);
  const letterSpaceTimeout = useRef(null);
  const wordSpaceTimeout = useRef(null);
  const typingTimeout = useRef(null);
  const morseKeyRef = useRef(null);
  const autoSendTimeout = useRef(null); // Auto-send after submit delay
  const progressInterval = useRef(null); // Progress bar animation interval

  // Calculate timing from WPM (simple formula)
  const calculateTiming = (wpm) => {
    const timeUnit = 1200 / wpm;
    return {
      timeUnit,
      dotLength: timeUnit,
      dashLength: timeUnit * 3,
      dashThreshold: timeUnit * 2, // Midpoint between dot and dash
      letterPause: timeUnit * 3,
      wordPause: timeUnit * 7
    };
  };

  const timing = calculateTiming(settings.wpm);

  // Keyboard event handler
  useEffect(() => {
    if (!settings.keyboardEnabled || !isMyTurn) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Two-button mode: Z=dot, X=dash, Left CTRL=dot, Right CTRL=dash
      if (settings.twoButtonMode) {
        if (e.key === 'z' || e.key === 'Z' || e.code === 'ControlLeft') {
          e.preventDefault();
          if (!e.repeat) {
            handleMorseSignal('dot');
          }
        } else if (e.key === 'x' || e.key === 'X' || e.code === 'ControlRight') {
          e.preventDefault();
          if (!e.repeat) {
            handleMorseSignal('dash');
          }
        }
      } else {
        // Hold mode: Spacebar only
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

      if (!settings.twoButtonMode) {
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          handleKeyPress('end');
        }
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
      const isDash = duration > timing.dashThreshold;
      const signal = isDash ? 'dash' : 'dot';

      handleMorseSignal(signal);
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

    // Handle completed morse message from partner
    socket.on('morse-message-complete', (data) => {
      setMessages(prev => [...prev, {
        from: data.from,
        content: data.message,
        timestamp: data.timestamp,
        wpm: data.wpm
      }]);
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

    // No longer needed - we use morse-message-complete now

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
      socket.off('morse-message-complete');
      socket.off('auto-passed');
      socket.off('inactivity-warning');
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
    if (autoSendTimeout.current) {
      clearTimeout(autoSendTimeout.current);
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    // Reset progress bar
    setAutoSendProgress(0);

    // Only schedule letter/word spacing if mouse is NOT currently pressed
    // This prevents the issue where holding the mouse button triggers spacing too early
    if (!isMousePressed) {
      // Letter space
      letterSpaceTimeout.current = setTimeout(() => {
        setLiveMessage(prev => {
          if (prev.endsWith(' ') || prev.endsWith(' | ')) return prev;
          return prev + ' ';
        });
      }, timing.letterPause);

      // Word boundary
      wordSpaceTimeout.current = setTimeout(() => {
        setLiveMessage(prev => {
          const trimmed = prev.endsWith(' ') && !prev.endsWith(' | ')
            ? prev.slice(0, -1)
            : prev;
          return trimmed + ' | ';
        });
      }, timing.wordPause);

      // Auto-send after submit delay with progress bar
      const startTime = Date.now();
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / settings.submitDelay) * 100, 100);
        setAutoSendProgress(progress);
      }, 50); // Update every 50ms for smooth animation

      autoSendTimeout.current = setTimeout(() => {
        autoSendMessage();
        setAutoSendProgress(0);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      }, settings.submitDelay);
    }
  };

  // Auto-send function (triggered after submit delay)
  const autoSendMessage = () => {
    if (!liveMessage.trim()) return;

    const endTime = Date.now();
    const wpm = calculateWPM(liveMessage, currentMessageStartTime, endTime);

    // Send to partner
    socket.emit('morse-message-complete', {
      message: liveMessage,
      wpm: wpm,
      timestamp: endTime
    });

    // Add to own messages
    setMessages(prev => [...prev, {
      from: username,
      content: liveMessage,
      timestamp: endTime,
      wpm: wpm
    }]);

    // Update total WPM
    setTotalWPM(prev => {
      const msgCount = messages.filter(m => m.from === username).length + 1;
      return ((prev * (msgCount - 1)) + wpm) / msgCount;
    });

    // Clear live message
    setLiveMessage('');
    setCurrentMessageStartTime(null);
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
          {/* Two-Button Mode Toggle - iOS style */}
          <div className="input-mode-toggle">
            <span className="toggle-label">Input Mode:</span>
            <button
              className={`mode-toggle ${settings.twoButtonMode ? 'active' : ''}`}
              onClick={() => setSettings({ ...settings, twoButtonMode: !settings.twoButtonMode })}
            >
              <div className="toggle-slider">
                <span className="toggle-option">{settings.twoButtonMode ? 'Z/X' : 'HOLD'}</span>
              </div>
            </button>
            <span className="toggle-hint">
              {settings.twoButtonMode ? 'Z=· | X=−' : 'Hold for −'}
            </span>
          </div>

          {!settings.twoCircleMode ? (
            <MorseKey
              ref={morseKeyRef}
              onSignal={handleMorseSignal}
              disabled={!isMyTurn}
              volume={volume}
              dashThreshold={timing.dashThreshold}
              onMouseStateChange={setIsMousePressed}
            />
          ) : (
            <div className="two-circle-container">
              <button
                className="circle-button dot-button"
                onMouseDown={() => {
                  handleMorseSignal('dot');
                  // Play sound
                  if (morseKeyRef.current) {
                    morseKeyRef.current.playSound(false);
                  }
                }}
                onTouchStart={() => {
                  handleMorseSignal('dot');
                  if (morseKeyRef.current) {
                    morseKeyRef.current.playSound(false);
                  }
                }}
                disabled={!isMyTurn}
              >
                <span className="circle-label">DOT</span>
                <span className="circle-symbol">·</span>
              </button>
              <button
                className="circle-button dash-button"
                onMouseDown={() => {
                  handleMorseSignal('dash');
                  // Play sound
                  if (morseKeyRef.current) {
                    morseKeyRef.current.playSound(true);
                  }
                }}
                onTouchStart={() => {
                  handleMorseSignal('dash');
                  if (morseKeyRef.current) {
                    morseKeyRef.current.playSound(true);
                  }
                }}
                disabled={!isMyTurn}
              >
                <span className="circle-label">DASH</span>
                <span className="circle-symbol">−</span>
              </button>
            </div>
          )}

          {settings.showLetters && liveMessage && (
            <div className="live-translation">
              <div className="morse-symbols">{liveMessage}</div>
              <div className="translated-text">
                {translateMorse(liveMessage)}
              </div>
              {/* Auto-send progress bar */}
              {autoSendProgress > 0 && (
                <div className="auto-send-progress-container">
                  <div className="auto-send-progress-bar" style={{ width: `${autoSendProgress}%` }} />
                </div>
              )}
            </div>
          )}

          <div className="timing-guide">
            <div className="timing-item">
              <span className="timing-icon">🎵</span>
              <span className="timing-label">{settings.wpm} WPM</span>
              <span className="timing-desc">Speed</span>
            </div>
            <div className="timing-divider">|</div>
            <div className="timing-item">
              <span className="timing-icon">⏱️</span>
              <span className="timing-label">{(settings.submitDelay / 1000).toFixed(1)}s</span>
              <span className="timing-desc">Auto-send delay</span>
            </div>
          </div>

          {settings.keyboardEnabled && (
            <div className="keyboard-hint">
              {settings.twoButtonMode
                ? '⌨️ Z / Left CTRL = Dot (·) | X / Right CTRL = Dash (−)'
                : '⌨️ Hold Spacebar (duration = dot/dash)'
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