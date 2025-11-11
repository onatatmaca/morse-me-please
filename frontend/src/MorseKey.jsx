import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { classifyPress, calculateAccuracy } from './BPMTiming';
import './MorseKey.css';

const MorseKey = forwardRef(({
  onSignal,
  disabled,
  volume = 0.3,
  dashThreshold = 300,
  timingConfig = null,
  settings = {},
  adaptiveTiming = null,
  lastPressTiming = null
}, ref) => {
  const [isPressed, setIsPressed] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [ripples, setRipples] = useState([]);
  const [lastAccuracy, setLastAccuracy] = useState(null); // For timing feedback
  const [showAccuracyFeedback, setShowAccuracyFeedback] = useState(false);
  const pressStartTime = useRef(null);
  const audioContext = useRef(null);
  const progressInterval = useRef(null);
  const rippleCounter = useRef(0);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Enhanced sound with more pleasant tones and envelopes
  const playBeep = (isDash) => {
    if (!audioContext.current || volume === 0) return;

    const ctx = audioContext.current;
    const now = ctx.currentTime;

    // Create oscillator with warmer tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Connect the audio graph
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Use triangle wave for warmer, less harsh sound
    oscillator.type = 'triangle';

    // Different frequencies for dot vs dash
    oscillator.frequency.value = isDash ? 380 : 620;

    // Low-pass filter for smoother sound
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    // ADSR envelope for more satisfying sound
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

  const addRipple = () => {
    const id = rippleCounter.current++;
    setRipples(prev => [...prev, { id, timestamp: Date.now() }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 800);
  };

  const handlePressStart = () => {
    if (disabled) return;
    setIsPressed(true);
    pressStartTime.current = Date.now();
    setPressProgress(0);
    addRipple();

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - pressStartTime.current;
      const progress = Math.min((elapsed / dashThreshold) * 100, 100);
      setPressProgress(progress);
    }, 10);
  };

  const handlePressEnd = () => {
    if (disabled || !pressStartTime.current) return;

    const pressDuration = Date.now() - pressStartTime.current;
    let isDash = pressDuration > dashThreshold;
    let signal = isDash ? 'dash' : 'dot';

    // Use tolerance windows if timing config is available
    if (timingConfig && timingConfig.dot && timingConfig.dash) {
      const classified = classifyPress(pressDuration, timingConfig);
      if (classified) {
        signal = classified;
        isDash = signal === 'dash';
      }
    }

    // Calculate accuracy for feedback
    if (timingConfig) {
      const targetDuration = isDash ? timingConfig.dashLength : timingConfig.dotLength;
      const accuracy = calculateAccuracy(pressDuration, targetDuration);
      setLastAccuracy({ accuracy, signal, duration: pressDuration, target: targetDuration });
      setShowAccuracyFeedback(true);

      // Hide feedback after 2 seconds
      setTimeout(() => setShowAccuracyFeedback(false), 2000);
    }

    // Record for adaptive learning
    if (settings.adaptiveEnabled && adaptiveTiming) {
      adaptiveTiming.recordPress(signal, pressDuration);
    }

    onSignal(signal, pressDuration);
    playBeep(isDash);

    setIsPressed(false);
    setPressProgress(0);
    pressStartTime.current = null;

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  // Expose methods to parent component for keyboard triggers
  useImperativeHandle(ref, () => ({
    triggerPress: (signal) => {
      if (disabled) return;

      const isDash = signal === 'dash';

      // Visual feedback
      setIsPressed(true);
      addRipple();

      if (isDash) {
        setPressProgress(100);
      }

      // Play sound
      playBeep(isDash);

      // Reset visual state
      setTimeout(() => {
        setIsPressed(false);
        setPressProgress(0);
      }, isDash ? 250 : 120);
    }
  }));

  // Get accuracy color
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return '#4CAF50'; // Green - Excellent
    if (accuracy >= 75) return '#8BC34A'; // Light Green - Good
    if (accuracy >= 60) return '#FFC107'; // Yellow - Fair
    if (accuracy >= 40) return '#FF9800'; // Orange - Poor
    return '#F44336'; // Red - Very Poor
  };

  return (
    <div className="morse-key-container">
      {/* Timing Feedback Display */}
      {showAccuracyFeedback && lastAccuracy && (
        <div className="timing-feedback" style={{ borderColor: getAccuracyColor(lastAccuracy.accuracy) }}>
          <div className="timing-feedback-header">
            <span className="timing-feedback-signal">
              {lastAccuracy.signal === 'dot' ? '·' : '−'}
            </span>
            <span className="timing-feedback-accuracy" style={{ color: getAccuracyColor(lastAccuracy.accuracy) }}>
              {lastAccuracy.accuracy}%
            </span>
          </div>
          <div className="timing-feedback-details">
            <span className="timing-feedback-label">Your timing:</span>
            <span className="timing-feedback-value">{lastAccuracy.duration}ms</span>
            <span className="timing-feedback-label">Target:</span>
            <span className="timing-feedback-value">{Math.round(lastAccuracy.target)}ms</span>
          </div>
        </div>
      )}

      {/* Adaptive Learning Stats */}
      {settings.adaptiveEnabled && adaptiveTiming && (
        <div className="adaptive-stats">
          <span className="adaptive-stats-label">📊 Learning:</span>
          <span className="adaptive-stats-value">
            {adaptiveTiming.getSampleCount().dots} dots, {adaptiveTiming.getSampleCount().dashes} dashes
          </span>
        </div>
      )}

      <button
        className={`morse-key ${isPressed ? 'pressed' : ''} ${disabled ? 'disabled' : ''}`}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        disabled={disabled}
      >
        {ripples.map(ripple => (
          <div key={ripple.id} className="ripple" />
        ))}

        {isPressed && pressProgress > 0 && (
          <div className="press-progress" style={{ width: `${pressProgress}%` }} />
        )}

        <div className="morse-key-content">
          <span className="morse-key-label">Morse Key</span>
          <span className="morse-key-hint">
            {disabled ? '⏸️ Not your turn' : 'Tap = · | Hold = −'}
          </span>
        </div>
      </button>

      {/* Target timing guide */}
      {timingConfig && !disabled && (
        <div className="timing-targets">
          <div className="timing-target">
            <span className="timing-target-symbol">·</span>
            <span className="timing-target-value">{Math.round(timingConfig.dotLength)}ms</span>
          </div>
          <div className="timing-target">
            <span className="timing-target-symbol">−</span>
            <span className="timing-target-value">{Math.round(timingConfig.dashLength)}ms</span>
          </div>
        </div>
      )}
    </div>
  );
});

MorseKey.displayName = 'MorseKey';

export default MorseKey;