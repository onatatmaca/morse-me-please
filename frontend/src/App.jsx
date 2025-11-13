import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  twoCircleMode: false  // Separate dot/dash buttons for mobile (toggle between Single/Two-Circle)
};

export default function App() {
  const [username, setUsername] = useState('');
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('');
  const [partnerUsername, setPartnerUsername] = useState('');
  // DUPLEX MODE: Removed isMyTurn - both users can send anytime
  const [messages, setMessages] = useState([]);
  const [myLiveMessage, setMyLiveMessage] = useState(''); // User's own live message
  const [partnerLiveMessage, setPartnerLiveMessage] = useState(''); // Partner's live message
  const [volume, setVolume] = useState(0.3);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [currentMessageStartTime, setCurrentMessageStartTime] = useState(null);
  const [partnerMessageStartTime, setPartnerMessageStartTime] = useState(null);
  const [totalWPM, setTotalWPM] = useState(0);
  const [autoSendProgress, setAutoSendProgress] = useState(0); // Progress bar for auto-send (0-100)
  const [userFrequency, setUserFrequency] = useState(600); // User's tone frequency
  const [partnerFrequency, setPartnerFrequency] = useState(900); // Partner's tone frequency
  const [onlineUsers, setOnlineUsers] = useState(0); // Total online users

  const lastSignalTime = useRef(null);
  const letterSpaceTimeout = useRef(null);
  const wordSpaceTimeout = useRef(null);
  const typingTimeout = useRef(null);
  const morseKeyRef = useRef(null);
  const autoSendTimeout = useRef(null); // Auto-send after submit delay
  const progressInterval = useRef(null); // Progress bar animation interval
  const isTouchDevice = useRef(false); // Track if we're using touch to prevent double events

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

  // Memoize timing so it only changes when WPM changes
  const timing = useMemo(() => calculateTiming(settings.wpm), [settings.wpm]);

  // Audio context for two-circle buttons
  const audioContextRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Refs to store current handlers to avoid stale closures in event listeners
  const handleMorseSignalRef = useRef(null);
  const handleKeyPressRef = useRef(null);

  // Refs to store current message state for auto-send (to avoid stale closures)
  const myLiveMessageRef = useRef('');
  const currentMessageStartTimeRef = useRef(null);

  // Standalone sound function with frequency parameter (DUPLEX: different tones for user/partner)
  const playMorseSound = (isDash, frequency = userFrequency) => {
    if (!audioContextRef.current || volume === 0) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency; // Use provided frequency (600Hz for user, 900Hz for partner)

    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    const duration = isDash ? 0.25 : 0.12;
    const attackTime = 0.01;
    const decayTime = 0.03;
    const sustainLevel = volume * 0.6;
    const releaseTime = 0.08;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  // Keyboard event handler - Both input methods work together (DUPLEX: always enabled)
  useEffect(() => {
    if (!settings.keyboardEnabled || !partnerUsername) return; // Only disable if not connected

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Direct input: Z=dot, X=dash, Left CTRL=dot, Right CTRL=dash
      if (e.key === 'z' || e.key === 'Z' || e.code === 'ControlLeft') {
        e.preventDefault();
        if (!e.repeat && handleMorseSignalRef.current) {
          handleMorseSignalRef.current('dot');
        }
      } else if (e.key === 'x' || e.key === 'X' || e.code === 'ControlRight') {
        e.preventDefault();
        if (!e.repeat && handleMorseSignalRef.current) {
          handleMorseSignalRef.current('dash');
        }
      }
      // Hold mode: Spacebar timing
      else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat && handleKeyPressRef.current) {
          handleKeyPressRef.current('start');
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Spacebar hold timing
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (handleKeyPressRef.current) {
          handleKeyPressRef.current('end');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [settings.keyboardEnabled, partnerUsername]);

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

  // Update ref so keyboard handlers always call the current version
  handleKeyPressRef.current = handleKeyPress;

  // Refs for partner's message timing
  const partnerLetterSpaceTimeout = useRef(null);
  const partnerWordSpaceTimeout = useRef(null);

  // Refs for values needed in socket handlers (to avoid re-registering handlers constantly)
  const volumeRef = useRef(volume);
  const timingRef = useRef(timing);
  const submitDelayRef = useRef(settings.submitDelay);

  // Update refs when values change
  useEffect(() => {
    volumeRef.current = volume;
    timingRef.current = timing;
    submitDelayRef.current = settings.submitDelay;
  }, [volume, timing, settings.submitDelay]);

  // Setup socket listeners - STABLE handlers that don't need constant re-registration
  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
    };

    const handleWaiting = () => {
      setStatus('Waiting for a partner...');
      setPartnerUsername('');
      setMessages([]);
      setMyLiveMessage('');
      setPartnerLiveMessage('');
    };

    const handlePaired = (data) => {
      setPartnerUsername(data.partnerUsername);
      setStatus(`Connected with ${data.partnerUsername}! Both can send anytime.`);
      setMessages([]);
      setMyLiveMessage('');
      setPartnerLiveMessage('');
      setCurrentMessageStartTime(null);
      setPartnerMessageStartTime(null);
    };

    const handleMorseSignal = (data) => {

      setPartnerMessageStartTime(prev => {
        if (!prev) return Date.now();
        return prev;
      });

      // Play partner's tone at 900 Hz - inline audio to avoid closure issues
      const isDash = data.signal === 'dash';
      const vol = volumeRef.current;
      if (audioContextRef.current && vol > 0) {
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'triangle';
        oscillator.frequency.value = 900; // Partner frequency

        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;

        const duration = isDash ? 0.25 : 0.12;
        const attackTime = 0.01;
        const decayTime = 0.03;
        const sustainLevel = vol * 0.6;
        const releaseTime = 0.08;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(vol, now + attackTime);
        gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
      }

      // Add signal to partner's live message
      const symbol = data.signal === 'dot' ? '·' : '−';
      setPartnerLiveMessage(prev => prev + symbol);

      // Clear existing partner timeouts
      if (partnerLetterSpaceTimeout.current) {
        clearTimeout(partnerLetterSpaceTimeout.current);
      }
      if (partnerWordSpaceTimeout.current) {
        clearTimeout(partnerWordSpaceTimeout.current);
      }

      // Schedule partner's letter/word spacing using ref values
      const currentTiming = timingRef.current;
      partnerLetterSpaceTimeout.current = setTimeout(() => {
        setPartnerLiveMessage(prev => {
          if (prev.endsWith(' ') || prev.endsWith(' | ')) return prev;
          return prev + ' ';
        });
      }, currentTiming.letterPause);

      partnerWordSpaceTimeout.current = setTimeout(() => {
        setPartnerLiveMessage(prev => {
          const trimmed = prev.endsWith(' ') && !prev.endsWith(' | ')
            ? prev.slice(0, -1)
            : prev;
          return trimmed + ' | ';
        });
      }, currentTiming.wordPause);
    };

    const handleMessageComplete = (data) => {
      // Clear partner's timeouts
      if (partnerLetterSpaceTimeout.current) {
        clearTimeout(partnerLetterSpaceTimeout.current);
      }
      if (partnerWordSpaceTimeout.current) {
        clearTimeout(partnerWordSpaceTimeout.current);
      }

      // Clear partner's live message and add to finalized messages
      setPartnerLiveMessage('');
      setPartnerMessageStartTime(null);

      setMessages(prev => [...prev, {
        from: data.from,
        content: data.message,
        timestamp: data.timestamp,
        wpm: data.wpm
      }]);
    };

    const handlePartnerDisconnected = () => {
      setStatus('Partner disconnected');
      setPartnerUsername('');
      setMessages([]);
      setMyLiveMessage('');
      setPartnerLiveMessage('');
      setCurrentMessageStartTime(null);
      setPartnerMessageStartTime(null);
    };

    const handleUserCount = (count) => {
      setOnlineUsers(count);
    };

    socket.on('connect', handleConnect);
    socket.on('waiting', handleWaiting);
    socket.on('paired', handlePaired);
    socket.on('morse-signal', handleMorseSignal);
    socket.on('morse-message-complete', handleMessageComplete);
    socket.on('partner-disconnected', handlePartnerDisconnected);
    socket.on('user-count', handleUserCount);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('waiting', handleWaiting);
      socket.off('paired', handlePaired);
      socket.off('morse-signal', handleMorseSignal);
      socket.off('morse-message-complete', handleMessageComplete);
      socket.off('partner-disconnected', handlePartnerDisconnected);
      socket.off('user-count', handleUserCount);
    };
  }, []); // Empty dependency - handlers use refs for current values, so no need to re-register

  // Connect socket and emit username AFTER handlers are registered
  useEffect(() => {
    if (username && !socket.connected) {
      socket.connect();
      socket.emit('set-username', username);
    }
  }, [username]); // Run when username changes

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
      const now = Date.now();
      setCurrentMessageStartTime(now);
      currentMessageStartTimeRef.current = now;
    }

    // Trigger visual feedback on the button
    if (morseKeyRef.current) {
      morseKeyRef.current.triggerPress(signal);
    }

    const symbol = signal === 'dot' ? '·' : '−';
    setMyLiveMessage(prev => {
      const newMessage = prev + symbol;
      myLiveMessageRef.current = newMessage;
      return newMessage;
    });

    // DUPLEX: Send signal to partner in real-time
    socket.emit('morse-signal', {
      signal: signal,
      timestamp: Date.now()
    });

    lastSignalTime.current = Date.now();

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

    // Schedule letter/word spacing (always schedule - timeouts are cleared on next signal)
    letterSpaceTimeout.current = setTimeout(() => {
      setMyLiveMessage(prev => {
        if (prev.endsWith(' ') || prev.endsWith(' | ')) return prev;
        return prev + ' ';
      });
    }, timing.letterPause);

    wordSpaceTimeout.current = setTimeout(() => {
      setMyLiveMessage(prev => {
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
  };

  // Update ref so keyboard handlers always call the current version
  handleMorseSignalRef.current = handleMorseSignal;

  // Handler for two-circle buttons that prevents double-firing
  const handleCircleButtonPress = (signal, e) => {
    // If this is a touch event, mark that we're using touch and prevent mouse events
    if (e.type === 'touchstart') {
      e.preventDefault();
      isTouchDevice.current = true;
    }
    // If this is a mouse event and we recently had a touch event, ignore it
    else if (e.type === 'mousedown') {
      if (isTouchDevice.current) {
        return; // Ignore mouse event after touch
      }
    }

    handleMorseSignal(signal);
    playMorseSound(signal === 'dash', userFrequency);
  };

  // Auto-send function (triggered after submit delay)
  const autoSendMessage = () => {
    // Read from refs to avoid stale closure values
    const messageToSend = myLiveMessageRef.current;
    const startTime = currentMessageStartTimeRef.current;

    if (!messageToSend.trim()) return;

    const endTime = Date.now();
    const wpm = calculateWPM(messageToSend, startTime, endTime);

    // Send to partner
    socket.emit('morse-message-complete', {
      message: messageToSend,
      wpm: wpm,
      timestamp: endTime
    });

    // Add to own messages
    setMessages(prev => [...prev, {
      from: username,
      content: messageToSend,
      timestamp: endTime,
      wpm: wpm
    }]);

    // Update total WPM
    setTotalWPM(prev => {
      const msgCount = prev === 0 ? 0 : messages.filter(m => m.from === username).length;
      const newMsgCount = msgCount + 1;
      return ((prev * msgCount) + wpm) / newMsgCount;
    });

    // Clear live message
    setMyLiveMessage('');
    myLiveMessageRef.current = '';
    setCurrentMessageStartTime(null);
    currentMessageStartTimeRef.current = null;
  };

  const handleDisconnect = () => {
    socket.emit('disconnect-partner');
    setPartnerUsername('');
    setStatus('Disconnected');
    setMessages([]);
    setMyLiveMessage('');
    setPartnerLiveMessage('');
    setTotalWPM(0);
    setCurrentMessageStartTime(null);
    setPartnerMessageStartTime(null);
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
    setMyLiveMessage('');
    setPartnerLiveMessage('');
    setTotalWPM(0);
    setCurrentMessageStartTime(null);
    setPartnerMessageStartTime(null);
  };

  const handleUsernameSubmit = (name) => {
    setUsername(name);
    // Don't connect here - let useEffect handle it after handlers are registered
  };

  if (!username) {
    return <UsernameForm onSubmit={handleUsernameSubmit} onlineUsers={onlineUsers} />;
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
            <span className="partner">
              Partner: {partnerUsername}
            </span>
          )}
        </div>
        <div className="status-info">
          <div className="status">
            {partnerUsername ? (
              <>
                {myLiveMessage && partnerLiveMessage && (
                  <span className="both-typing-badge">⚠️ Both typing!</span>
                )}
              </>
            ) : (
              status
            )}
          </div>

          <div className="right-status-group">
            {onlineUsers > 0 && (
              <div className="online-count-indicator">
                <span className="online-dot-small"></span>
                {onlineUsers} online
              </div>
            )}
            <div className="connection-status">
              <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`}></span>
              {connected ? 'Connected' : 'Disconnected'}
            </div>
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
          {/* Circle Mode Toggle - iOS style */}
          <div className="input-mode-toggle">
            <button
              className={`mode-toggle ${settings.twoCircleMode ? 'active' : ''}`}
              onClick={() => setSettings({ ...settings, twoCircleMode: !settings.twoCircleMode })}
            >
              <div className="toggle-slider">
                <span className="toggle-option">{settings.twoCircleMode ? 'Two Circles' : 'Single Circle'}</span>
              </div>
            </button>
          </div>

          {!settings.twoCircleMode ? (
            <MorseKey
              ref={morseKeyRef}
              onSignal={handleMorseSignal}
              disabled={false}
              volume={volume}
              dashThreshold={timing.dashThreshold}
              onPlaySound={(isDash) => playMorseSound(isDash, userFrequency)}
            />
          ) : (
            <div className="two-circle-container">
              <button
                className="circle-button dot-button"
                onMouseDown={(e) => {
                  if (e.button !== 0) return; // Only left click
                  handleCircleButtonPress('dot', e);
                }}
                onTouchStart={(e) => {
                  handleCircleButtonPress('dot', e);
                }}
                disabled={false}
              >
                <span className="circle-label">DOT</span>
                <span className="circle-symbol">·</span>
              </button>
              <button
                className="circle-button dash-button"
                onMouseDown={(e) => {
                  if (e.button !== 0) return; // Only left click
                  handleCircleButtonPress('dash', e);
                }}
                onTouchStart={(e) => {
                  handleCircleButtonPress('dash', e);
                }}
                disabled={false}
              >
                <span className="circle-label">DASH</span>
                <span className="circle-symbol">−</span>
              </button>
            </div>
          )}

          {settings.showLetters && myLiveMessage && (
            <div className="live-translation">
              <div className="morse-symbols">{myLiveMessage}</div>
              <div className="translated-text">
                {translateMorse(myLiveMessage)}
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
              ⌨️ Z / Left CTRL = Dot (·) | X / Right CTRL = Dash (−) | Hold Spacebar (duration = dot/dash)
            </div>
          )}
          
          <ControlPanel
            onDisconnect={handleDisconnect}
            onFindNew={handleFindNew}
          />

          <MessageTranscript
            messages={messages}
            myLiveMessage={myLiveMessage}
            partnerLiveMessage={partnerLiveMessage}
            currentUser={username}
            partnerUsername={partnerUsername}
            currentMessageStartTime={currentMessageStartTime}
            partnerMessageStartTime={partnerMessageStartTime}
          />
        </div>
      ) : (
        <div className="main-content">
          <h2>⏳ {status}</h2>
          <p className="waiting-hint">Open another tab or share with a friend to connect!</p>
          {status === 'Partner disconnected' && (
            <button className="find-partner-btn" onClick={handleFindNew}>
              🔄 Find New Partner
            </button>
          )}
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