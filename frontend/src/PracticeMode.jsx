import React, { useState, useRef, useMemo, useEffect } from 'react';
import MorseKey from './MorseKey';
import SettingsPanel from './SettingsPanel';
import SandboxMode from './SandboxMode';
import { translateMorse } from './MorseHelper';
import { TUTORIALS } from './tutorialData';
import './PracticeMode.css';

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

export default function PracticeMode({ username, onExit }) {
  const [view, setView] = useState('menu'); // 'menu', 'sandbox', 'tutorial'
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [myLiveMessage, setMyLiveMessage] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  const lastSignalTime = useRef(null);
  const letterSpaceTimeout = useRef(null);
  const wordSpaceTimeout = useRef(null);
  const morseKeyRef = useRef(null);
  const audioContextRef = useRef(null);
  const myOscillatorRef = useRef(null);
  const myGainNodeRef = useRef(null);
  const dotButtonRef = useRef(null);
  const dashButtonRef = useRef(null);
  const isTouchDevice = useRef(false);
  const keyPressStart = useRef(null);

  // Refs for keyboard handlers (to avoid stale closures)
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

  // Audio functions
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

  const handleMorseSignal = (signal, playSound = true, showVisualFeedback = true) => {
    // Visual feedback on buttons
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
    setMyLiveMessage(prev => prev + symbol);

    if (playSound) {
      playMyMorseSound(signal === 'dash');
    }

    lastSignalTime.current = Date.now();

    // Clear existing timeouts
    if (letterSpaceTimeout.current) clearTimeout(letterSpaceTimeout.current);
    if (wordSpaceTimeout.current) clearTimeout(wordSpaceTimeout.current);

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
  };

  // Update ref for keyboard handlers
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
    if (!settings.keyboardEnabled || !selectedTutorial) return;

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
  }, [settings.keyboardEnabled, selectedTutorial]);

  const handleCircleButtonPress = (signal, e) => {
    if (e.type === 'touchstart') {
      e.preventDefault();
      isTouchDevice.current = true;
    } else if (e.type === 'mousedown') {
      if (isTouchDevice.current) return;
    }
    handleMorseSignal(signal);
  };

  const handleCheck = () => {
    const tutorial = selectedTutorial;
    const userMorse = myLiveMessage.trim();
    const targetMorse = tutorial.targetMorse;

    // More lenient comparison - normalize spaces and remove trailing word separators
    const normalizeSpaces = (str) => {
      return str
        .replace(/\s+/g, ' ')           // Normalize multiple spaces
        .replace(/\s+\|\s+/g, ' | ')    // Normalize word separators
        .replace(/\s*\|\s*$/g, '')      // Remove trailing word separator
        .trim();
    };

    const isMatch = normalizeSpaces(userMorse) === normalizeSpaces(targetMorse);

    setIsCorrect(isMatch);
    setShowResult(true);
  };

  const handleReset = () => {
    setMyLiveMessage('');
    setShowResult(false);
    setIsCorrect(false);
    if (letterSpaceTimeout.current) clearTimeout(letterSpaceTimeout.current);
    if (wordSpaceTimeout.current) clearTimeout(wordSpaceTimeout.current);
  };

  const handleBackToTutorials = () => {
    handleReset();
    setSelectedTutorial(null);
    setView('menu');
  };

  // Show Sandbox Mode
  if (view === 'sandbox') {
    return <SandboxMode username={username} onExit={() => setView('menu')} />;
  }

  // Tutorial Selector View
  if (view === 'menu' || !selectedTutorial) {
    return (
      <div className="practice-mode-page">
        <div className="practice-content">
          <div className="practice-header">
            <h1>🎓 Practice Mode</h1>
            <p>Choose how you want to practice</p>
            <button className="back-btn" onClick={onExit}>
              ← Back to Mode Selection
            </button>
          </div>

          {/* Sandbox Mode Card - Highlighted */}
          <div className="sandbox-card-container">
            <button
              className="sandbox-card"
              onClick={() => setView('sandbox')}
            >
              <div className="sandbox-icon">🎯</div>
              <div className="sandbox-content">
                <h2>Sandbox Mode</h2>
                <p>Free practice with the exact chat interface - no tutorials, just type!</p>
                <div className="sandbox-badge">Recommended</div>
              </div>
            </button>
          </div>

          <div className="section-divider">
            <span>OR</span>
          </div>

          <h3 className="tutorial-section-title">📚 Guided Tutorials</h3>
          <div className="tutorial-list">
            {TUTORIALS.map((tutorial) => (
              <button
                key={tutorial.id}
                className="tutorial-card"
                onClick={() => {
                  setSelectedTutorial(tutorial);
                  setView('tutorial');
                }}
              >
                <div className="tutorial-number">#{tutorial.id}</div>
                <h3>{tutorial.title}</h3>
                <p>{tutorial.description}</p>
                <div className="tutorial-target">
                  Target: <span className="target-text">{tutorial.targetText}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Practice Interface View
  return (
    <div className="practice-mode-page">
      <div className="practice-interface">
        {/* Header with Settings */}
        <div className="practice-interface-header">
          <button className="back-btn-small" onClick={handleBackToTutorials}>
            ← Back
          </button>
          <h2>{selectedTutorial.title}</h2>
          <button
            className="settings-btn-practice"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            ⚙️
          </button>
        </div>

        {/* Target Display */}
        <div className="target-display">
          <h3>Type this:</h3>
          <div className="target-text-large">{selectedTutorial.targetText}</div>
          <div className="target-morse">{selectedTutorial.targetMorse}</div>
          <div className="hint-text">💡 {selectedTutorial.hint}</div>
        </div>

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
          </div>
        )}

        {/* Keyboard Hint */}
        {settings.keyboardEnabled && (
          <div className="keyboard-hint">
            ⌨️ Z / Left CTRL = Dot (·) | X / Right CTRL = Dash (−) | Hold Spacebar (duration = dot/dash)
          </div>
        )}

        {/* Action Buttons */}
        <div className="practice-actions">
          <button className="action-btn check-btn" onClick={handleCheck}>
            ✓ Check Answer
          </button>
          <button className="action-btn reset-btn" onClick={handleReset}>
            ↺ Reset
          </button>
        </div>

        {/* Result Display */}
        {showResult && (
          <div className={`result-display ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? (
              <>
                <div className="result-icon">🎉</div>
                <h3>Perfect!</h3>
                <p>You typed it correctly!</p>
                <button className="next-btn" onClick={handleBackToTutorials}>
                  Choose Next Tutorial →
                </button>
              </>
            ) : (
              <>
                <div className="result-icon">📝</div>
                <h3>Not quite</h3>
                <p>Try again! Compare your answer with the target.</p>
                <div className="comparison">
                  <div className="comparison-row">
                    <span className="comparison-label">Target:</span>
                    <span className="comparison-value">{selectedTutorial.targetMorse}</span>
                  </div>
                  <div className="comparison-row">
                    <span className="comparison-label">Your answer:</span>
                    <span className="comparison-value">{myLiveMessage}</span>
                  </div>
                </div>
                <button className="retry-btn" onClick={handleReset}>
                  Try Again
                </button>
              </>
            )}
          </div>
        )}

        {/* Settings Panel */}
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  );
}
