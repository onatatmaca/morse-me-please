import React, { useState, useEffect, useRef, useMemo } from 'react';
import MorseKey from './MorseKey';
import MessageTranscript from './MessageTranscript';
import ControlPanel from './ControlPanel';
import SettingsPanel from './SettingsPanel';
import { translateMorse } from './MorseHelper';
import './App.css'; // Reuse all the same styles from chat mode

const DEFAULT_SETTINGS = {
  wpm: 12,
  submitDelay: 2500,
  showLetters: true,
  keyboardEnabled: true,
  twoCircleMode: false,
  myVolume: 0.3,
  partnerVolume: 0.3,
  myFrequency: 600,
  partnerFrequency: 900
};

export default function SandboxMode({ username, onExit }) {
  const [messages, setMessages] = useState([]);
  const [myLiveMessage, setMyLiveMessage] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [currentMessageStartTime, setCurrentMessageStartTime] = useState(null);
  const [autoSendProgress, setAutoSendProgress] = useState(0);
  const [totalWPM, setTotalWPM] = useState(0);

  const lastSignalTime = useRef(null);
  const letterSpaceTimeout = useRef(null);
  const wordSpaceTimeout = useRef(null);
  const morseKeyRef = useRef(null);
  const autoSendTimeout = useRef(null);
  const progressInterval = useRef(null);
  const isTouchDevice = useRef(false);
  const dotButtonRef = useRef(null);
  const dashButtonRef = useRef(null);
  const audioContextRef = useRef(null);
  const myOscillatorRef = useRef(null);
  const myGainNodeRef = useRef(null);
  const keyPressStart = useRef(null);
  const myLiveMessageRef = useRef('');
  const currentMessageStartTimeRef = useRef(null);

  // Refs for keyboard handlers
  const handleMorseSignalRef = useRef(null);
  const handleKeyPressRef = useRef(null);

  // Calculate timing from WPM
  const calculateTiming = (wpm) => {
    const timeUnit = 1200 / wpm;
    const letterPause = timeUnit * 3;
    const dashThreshold = Math.min(timeUnit * 2, letterPause * 0.4);
    return {
      timeUnit,
      dotLength: timeUnit,
      dashLength: timeUnit * 3,
      dashThreshold,
      letterPause,
      wordPause: timeUnit * 7
    };
  };

  const timing = useMemo(() => calculateTiming(settings.wpm), [settings.wpm]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Audio functions (same as chat mode)
  const startMyMorseTone = () => {
    if (!audioContextRef.current || settings.myVolume === 0) return;
    if (myOscillatorRef.current) return;

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

    const attackTime = 0.01;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(settings.myVolume, now + attackTime);

    oscillator.start(now);

    myOscillatorRef.current = oscillator;
    myGainNodeRef.current = gainNode;
  };

  const stopMyMorseTone = () => {
    if (!myOscillatorRef.current || !myGainNodeRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const releaseTime = 0.05;

    myGainNodeRef.current.gain.cancelScheduledValues(now);
    myGainNodeRef.current.gain.setValueAtTime(myGainNodeRef.current.gain.value, now);
    myGainNodeRef.current.gain.linearRampToValueAtTime(0, now + releaseTime);

    myOscillatorRef.current.stop(now + releaseTime);
    myOscillatorRef.current = null;
    myGainNodeRef.current = null;
  };

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

  const handleMorseKeyTone = (start) => {
    if (start) {
      startMyMorseTone();
    } else {
      stopMyMorseTone();
    }
  };

  const calculateWPM = (morseText, startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const words = morseText.split(' | ').length;
    const minutes = (endTime - startTime) / 60000;
    return minutes > 0 ? Math.round(words / minutes) : 0;
  };

  const handleMorseSignal = (signal, playSound = true, showVisualFeedback = true) => {
    // Start timer on first signal
    if (!currentMessageStartTime) {
      const now = Date.now();
      setCurrentMessageStartTime(now);
      currentMessageStartTimeRef.current = now;
    }

    // Visual feedback
    if (showVisualFeedback) {
      if (settings.twoCircleMode) {
        if (signal === 'dot' && dotButtonRef.current) {
          dotButtonRef.current.classList.add('button-pressed');
          setTimeout(() => dotButtonRef.current?.classList.remove('button-pressed'), 150);
        } else if (signal === 'dash' && dashButtonRef.current) {
          dashButtonRef.current.classList.add('button-pressed');
          setTimeout(() => dashButtonRef.current?.classList.remove('button-pressed'), 150);
        }
      } else if (morseKeyRef.current) {
        morseKeyRef.current.triggerPress(signal);
      }
    }

    const symbol = signal === 'dot' ? '·' : '−';
    setMyLiveMessage(prev => {
      const newMessage = prev + symbol;
      myLiveMessageRef.current = newMessage;
      return newMessage;
    });

    if (playSound) {
      playMyMorseSound(signal === 'dash');
    }

    lastSignalTime.current = Date.now();

    // Clear existing timeouts
    if (letterSpaceTimeout.current) clearTimeout(letterSpaceTimeout.current);
    if (wordSpaceTimeout.current) clearTimeout(wordSpaceTimeout.current);
    if (autoSendTimeout.current) clearTimeout(autoSendTimeout.current);
    if (progressInterval.current) clearInterval(progressInterval.current);

    setAutoSendProgress(0);

    // Schedule letter/word spacing
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
    }, 50);

    autoSendTimeout.current = setTimeout(() => {
      autoSendMessage();
      setAutoSendProgress(0);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }, settings.submitDelay);
  };

  handleMorseSignalRef.current = handleMorseSignal;

  // Keyboard handlers
  const handleKeyPress = (type) => {
    if (type === 'start') {
      keyPressStart.current = Date.now();
      startMyMorseTone();
      if (!settings.twoCircleMode && morseKeyRef.current) {
        morseKeyRef.current.startPressAnimation();
      }
    } else if (type === 'end' && keyPressStart.current) {
      const duration = Date.now() - keyPressStart.current;
      const isDash = duration > timing.dashThreshold;
      const signal = isDash ? 'dash' : 'dot';

      stopMyMorseTone();
      if (!settings.twoCircleMode && morseKeyRef.current) {
        morseKeyRef.current.endPressAnimation();
      }

      handleMorseSignal(signal, false, false);
      keyPressStart.current = null;
    }
  };

  handleKeyPressRef.current = handleKeyPress;

  // Keyboard event listener
  useEffect(() => {
    if (!settings.keyboardEnabled) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

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
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat && handleKeyPressRef.current) {
          handleKeyPressRef.current('start');
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

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
  }, [settings.keyboardEnabled]);

  const handleCircleButtonPress = (signal, e) => {
    if (e.type === 'touchstart') {
      e.preventDefault();
      isTouchDevice.current = true;
    } else if (e.type === 'mousedown') {
      if (isTouchDevice.current) return;
    }
    handleMorseSignal(signal);
  };

  const autoSendMessage = () => {
    const messageToSend = myLiveMessageRef.current;
    const startTime = currentMessageStartTimeRef.current;

    if (!messageToSend.trim()) return;

    const endTime = Date.now();
    const wpm = calculateWPM(messageToSend, startTime, endTime);

    // Add to messages
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

  const handleClear = () => {
    setMessages([]);
    setMyLiveMessage('');
    setTotalWPM(0);
    setCurrentMessageStartTime(null);
    setAutoSendProgress(0);
    if (letterSpaceTimeout.current) clearTimeout(letterSpaceTimeout.current);
    if (wordSpaceTimeout.current) clearTimeout(wordSpaceTimeout.current);
    if (autoSendTimeout.current) clearTimeout(autoSendTimeout.current);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  return (
    <>
      <div className="app-container">
        <div className="status-bar">
          <div className="user-info">
            <span className="username">
              You: {username}
              {totalWPM > 0 && <span className="wpm-badge">{Math.round(totalWPM)} WPM</span>}
            </span>
            <span className="partner">
              Mode: Sandbox Practice 🎯
            </span>
          </div>
          <div className="status-info">
            <div className="status">
              Practice mode - Type and send messages to yourself!
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

        <div className="main-app-content">
          {/* Circle Mode Toggle */}
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

          {/* Morse Key */}
          {!settings.twoCircleMode ? (
            <MorseKey
              ref={morseKeyRef}
              onSignal={handleMorseSignal}
              disabled={false}
              volume={settings.myVolume}
              dashThreshold={timing.dashThreshold}
              onPlaySound={handleMorseKeyTone}
            />
          ) : (
            <div className="two-circle-container">
              <button
                ref={dotButtonRef}
                className="circle-button dot-button"
                onMouseDown={(e) => {
                  if (e.button !== 0) return;
                  handleCircleButtonPress('dot', e);
                }}
                onTouchStart={(e) => handleCircleButtonPress('dot', e)}
                disabled={false}
              >
                <span className="circle-label">DOT</span>
                <span className="circle-symbol">·</span>
              </button>
              <button
                ref={dashButtonRef}
                className="circle-button dash-button"
                onMouseDown={(e) => {
                  if (e.button !== 0) return;
                  handleCircleButtonPress('dash', e);
                }}
                onTouchStart={(e) => handleCircleButtonPress('dash', e)}
                disabled={false}
              >
                <span className="circle-label">DASH</span>
                <span className="circle-symbol">−</span>
              </button>
            </div>
          )}

          {/* Live Translation */}
          {settings.showLetters && myLiveMessage && (
            <div className="live-translation">
              <div className="morse-symbols">{myLiveMessage}</div>
              <div className="translated-text">
                {translateMorse(myLiveMessage)}
              </div>
              <div className="auto-send-progress-container">
                <div
                  className="auto-send-progress-bar"
                  style={{ width: `${autoSendProgress}%`, opacity: autoSendProgress > 0 ? 1 : 0 }}
                />
              </div>
            </div>
          )}

          {/* Timing Guide */}
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

          {/* Keyboard Hint */}
          {settings.keyboardEnabled && (
            <div className="keyboard-hint">
              ⌨️ Z / Left CTRL = Dot (·) | X / Right CTRL = Dash (−) | Hold Spacebar (duration = dot/dash)
            </div>
          )}

          {/* Control Panel - Simplified for Sandbox */}
          <div className="control-panel">
            <button
              onClick={handleClear}
              className="control-btn find-new-btn"
            >
              <span className="btn-icon">🗑️</span>
              <span className="btn-text">Clear Messages</span>
            </button>

            <button
              onClick={onExit}
              className="control-btn back-btn"
            >
              <span className="btn-icon">←</span>
              <span className="btn-text">Back to Practice</span>
            </button>
          </div>

          {/* Message Transcript */}
          <MessageTranscript
            messages={messages}
            myLiveMessage={myLiveMessage}
            partnerLiveMessage=""
            currentUser={username}
            partnerUsername="Sandbox"
            currentMessageStartTime={currentMessageStartTime}
            partnerMessageStartTime={null}
            partnerTyping={false}
          />
        </div>

        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </>
  );
}
