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
  wpm: 12,              // Morse speed (5-50 WPM) - Starting slower for beginners
  submitDelay: 2500,    // Auto-send delay in ms (1000-5000ms) - More time to compose
  showLetters: true,    // Show translation while typing
  keyboardEnabled: true,
  twoCircleMode: false, // Separate dot/dash buttons for mobile (toggle between Single/Two-Circle)
  myVolume: 0.3,        // Volume for own morse code
  partnerVolume: 0.3,   // Volume for partner's morse code
  myFrequency: 600,     // Frequency for own morse code (Hz)
  partnerFrequency: 900 // Frequency for partner's morse code (Hz)
};

export default function App() {
  const [username, setUsername] = useState('');
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('');
  const [partnerUsername, setPartnerUsername] = useState('');
  // DUPLEX MODE: Removed isMyTurn - both users can send anytime
  const [messages, setMessages] = useState([]);
  const [myLiveMessage, setMyLiveMessage] = useState(''); // User's own live message
  const [partnerLiveMessage, setPartnerLiveMessage] = useState(''); // Partner's live message (being played back)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [currentMessageStartTime, setCurrentMessageStartTime] = useState(null);
  const [partnerMessageStartTime, setPartnerMessageStartTime] = useState(null);
  const [totalWPM, setTotalWPM] = useState(0);
  const [autoSendProgress, setAutoSendProgress] = useState(0); // Progress bar for auto-send (0-100)
  const [onlineUsers, setOnlineUsers] = useState(0); // Total online users
  const [playbackQueue, setPlaybackQueue] = useState([]); // Queue for partner messages to play
  const [isPlayingBack, setIsPlayingBack] = useState(false); // Whether playback is in progress
  const [partnerTyping, setPartnerTyping] = useState(false); // Whether partner is currently typing

  const lastSignalTime = useRef(null);
  const letterSpaceTimeout = useRef(null);
  const wordSpaceTimeout = useRef(null);
  const typingTimeout = useRef(null);
  const morseKeyRef = useRef(null);
  const autoSendTimeout = useRef(null); // Auto-send after submit delay
  const progressInterval = useRef(null); // Progress bar animation interval
  const isTouchDevice = useRef(false); // Track if we're using touch to prevent double events
  const dotButtonRef = useRef(null); // Ref for dot button in two-circle mode
  const dashButtonRef = useRef(null); // Ref for dash button in two-circle mode

  // Calculate timing from WPM (optimized for high-speed dash input)
  const calculateTiming = (wpm) => {
    const timeUnit = 1200 / wpm;
    const letterPause = timeUnit * 3;
    // Dash threshold scales with WPM - at higher speeds, shorter hold needed
    // Ensures users can input consecutive dashes without triggering letter spacing
    const dashThreshold = Math.min(timeUnit * 2, letterPause * 0.4);
    return {
      timeUnit,
      dotLength: timeUnit,
      dashLength: timeUnit * 3,
      dashThreshold, // Adaptive threshold for better high-speed performance
      letterPause,
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

  // Play sound for user's own morse code
  const playMyMorseSound = (isDash) => {
    if (!audioContextRef.current || settings.myVolume === 0) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.value = settings.myFrequency;

    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    const duration = isDash ? 0.25 : 0.12;
    const attackTime = 0.01;
    const decayTime = 0.03;
    const sustainLevel = settings.myVolume * 0.6;
    const releaseTime = 0.08;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(settings.myVolume, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  // Play sound for partner's morse code
  const playPartnerMorseSound = (isDash) => {
    if (!audioContextRef.current || settings.partnerVolume === 0) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.value = settings.partnerFrequency;

    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    const duration = isDash ? 0.25 : 0.12;
    const attackTime = 0.01;
    const decayTime = 0.03;
    const sustainLevel = settings.partnerVolume * 0.6;
    const releaseTime = 0.08;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(settings.partnerVolume, now + attackTime);
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

  // Refs for values needed in socket handlers (to avoid re-registering handlers constantly)
  const timingRef = useRef(timing);
  const submitDelayRef = useRef(settings.submitDelay);
  const settingsRef = useRef(settings);

  // Update refs when values change
  useEffect(() => {
    timingRef.current = timing;
    submitDelayRef.current = settings.submitDelay;
    settingsRef.current = settings;
  }, [timing, settings]);

  // Character-by-character playback system for partner messages
  useEffect(() => {
    if (isPlayingBack || playbackQueue.length === 0) return;

    setIsPlayingBack(true);
    const messageToPlay = playbackQueue[0];

    // Start playback
    setPartnerMessageStartTime(Date.now());
    let currentIndex = 0;
    const symbols = messageToPlay.morseText.split('');

    const playNextSymbol = () => {
      if (currentIndex >= symbols.length) {
        // Playback complete
        setPartnerLiveMessage('');
        setPartnerMessageStartTime(null);
        setIsPlayingBack(false);
        setPlaybackQueue(prev => prev.slice(1)); // Remove played message

        // Add to finalized messages
        setMessages(prev => [...prev, {
          from: messageToPlay.from,
          content: messageToPlay.morseText,
          timestamp: messageToPlay.timestamp,
          wpm: messageToPlay.wpm
        }]);
        return;
      }

      const symbol = symbols[currentIndex];

      // Handle spaces (letter and word separators)
      if (symbol === ' ') {
        currentIndex++;
        const nextSymbol = symbols[currentIndex];

        if (nextSymbol === '|') {
          // Word separator: " | "
          setPartnerLiveMessage(prev => prev + ' | ');
          currentIndex += 2; // Skip " | "
          setTimeout(playNextSymbol, timing.wordPause);
        } else {
          // Letter separator: " "
          setPartnerLiveMessage(prev => prev + ' ');
          setTimeout(playNextSymbol, timing.letterPause);
        }
      } else if (symbol === '|') {
        // Skip standalone "|"
        currentIndex++;
        playNextSymbol();
      } else {
        // Dot or dash
        const isDash = (symbol === '−' || symbol === '-');
        setPartnerLiveMessage(prev => prev + symbol);
        playPartnerMorseSound(isDash);

        currentIndex++;
        const duration = isDash ? timing.dashLength : timing.dotLength;
        setTimeout(playNextSymbol, duration + 50); // Add 50ms gap between signals
      }
    };

    playNextSymbol();
  }, [playbackQueue, isPlayingBack, timing]);

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
      setPlaybackQueue([]);
      setIsPlayingBack(false);
      setCurrentMessageStartTime(null);
      setPartnerMessageStartTime(null);
    };

    const handleTyping = () => {
      setPartnerTyping(true);
    };

    const handleTypingStop = () => {
      setPartnerTyping(false);
    };

    const handleMessageComplete = (data) => {
      // Partner stopped typing - message is coming
      setPartnerTyping(false);

      // Add message to playback queue
      setPlaybackQueue(prev => [...prev, {
        from: data.from,
        morseText: data.message,
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
      setPlaybackQueue([]);
      setIsPlayingBack(false);
      setCurrentMessageStartTime(null);
      setPartnerMessageStartTime(null);
    };

    const handleUserCount = (count) => {
      setOnlineUsers(count);
    };

    socket.on('connect', handleConnect);
    socket.on('waiting', handleWaiting);
    socket.on('paired', handlePaired);
    socket.on('typing', handleTyping);
    socket.on('typing-stop', handleTypingStop);
    socket.on('morse-message-complete', handleMessageComplete);
    socket.on('partner-disconnected', handlePartnerDisconnected);
    socket.on('user-count', handleUserCount);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('waiting', handleWaiting);
      socket.off('paired', handlePaired);
      socket.off('typing', handleTyping);
      socket.off('typing-stop', handleTypingStop);
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

      // Emit typing event to partner
      socket.emit('typing');
    }

    // Trigger visual feedback on the button
    if (morseKeyRef.current) {
      morseKeyRef.current.triggerPress(signal);
    }

    // Trigger visual feedback on two-circle buttons (for keyboard input)
    if (settings.twoCircleMode) {
      if (signal === 'dot' && dotButtonRef.current) {
        dotButtonRef.current.classList.add('button-pressed');
        setTimeout(() => dotButtonRef.current?.classList.remove('button-pressed'), 150);
      } else if (signal === 'dash' && dashButtonRef.current) {
        dashButtonRef.current.classList.add('button-pressed');
        setTimeout(() => dashButtonRef.current?.classList.remove('button-pressed'), 150);
      }
    }

    const symbol = signal === 'dot' ? '·' : '−';
    setMyLiveMessage(prev => {
      const newMessage = prev + symbol;
      myLiveMessageRef.current = newMessage;
      return newMessage;
    });

    // Play own morse sound
    playMyMorseSound(signal === 'dash');

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
  };

  // Auto-send function (triggered after submit delay)
  const autoSendMessage = () => {
    // Read from refs to avoid stale closure values
    const messageToSend = myLiveMessageRef.current;
    const startTime = currentMessageStartTimeRef.current;

    if (!messageToSend.trim()) return;

    const endTime = Date.now();
    const wpm = calculateWPM(messageToSend, startTime, endTime);

    // Translate morse to text for database logging
    const translatedText = translateMorse(messageToSend);

    // Emit typing-stop and send message to partner
    socket.emit('typing-stop');
    socket.emit('morse-message-complete', {
      message: messageToSend,
      translatedText: translatedText, // For admin panel logging
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
    setPlaybackQueue([]);
    setIsPlayingBack(false);
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
    setPlaybackQueue([]);
    setIsPlayingBack(false);
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
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          title="Settings (Volume & Sound)"
        >
          ⚙️
        </button>
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
              volume={settings.myVolume}
              dashThreshold={timing.dashThreshold}
              onPlaySound={playMyMorseSound}
            />
          ) : (
            <div className="two-circle-container">
              <button
                ref={dotButtonRef}
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
                ref={dashButtonRef}
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
              {/* Auto-send progress bar - always render container to prevent layout shift */}
              <div className="auto-send-progress-container">
                <div
                  className="auto-send-progress-bar"
                  style={{ width: `${autoSendProgress}%`, opacity: autoSendProgress > 0 ? 1 : 0 }}
                />
              </div>
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
            partnerTyping={partnerTyping}
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