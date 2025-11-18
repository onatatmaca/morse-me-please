import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './MorseKey.css';

const MorseKey = forwardRef(({
  onSignal,
  disabled,
  volume = 0.3,
  dashThreshold = 120,
  onPlaySound = null  // Optional custom sound function
}, ref) => {
  const [isPressed, setIsPressed] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [ripples, setRipples] = useState([]);
  const pressStartTime = useRef(null);
  const audioContext = useRef(null);
  const progressInterval = useRef(null);
  const rippleCounter = useRef(0);
  const currentOscillator = useRef(null);
  const currentGainNode = useRef(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Start continuous tone (for hold-based input)
  const startTone = () => {
    if (!audioContext.current || volume === 0) return;
    if (currentOscillator.current) return; // Already playing

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
    oscillator.frequency.value = 620; // Consistent tone while holding

    // Low-pass filter for smoother sound
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    // Quick attack to full volume
    const attackTime = 0.01;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);

    oscillator.start(now);

    currentOscillator.current = oscillator;
    currentGainNode.current = gainNode;
  };

  // Stop continuous tone (for hold-based input)
  const stopTone = () => {
    if (!currentOscillator.current || !currentGainNode.current) return;

    const ctx = audioContext.current;
    const now = ctx.currentTime;
    const releaseTime = 0.05;

    // Quick fade out
    currentGainNode.current.gain.cancelScheduledValues(now);
    currentGainNode.current.gain.setValueAtTime(currentGainNode.current.gain.value, now);
    currentGainNode.current.gain.linearRampToValueAtTime(0, now + releaseTime);

    currentOscillator.current.stop(now + releaseTime);
    currentOscillator.current = null;
    currentGainNode.current = null;
  };

  // Enhanced sound with more pleasant tones and envelopes (for instant dot/dash via keyboard)
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

  const handlePressStart = (e) => {
    if (disabled) return;

    // Prevent mouse events from firing after touch events
    if (e.type === 'touchstart') {
      e.preventDefault();
    }

    setIsPressed(true);
    pressStartTime.current = Date.now();
    setPressProgress(0);
    addRipple();

    // Start the tone immediately when pressed (like a real CW key)
    if (onPlaySound) {
      onPlaySound(true); // Start tone via custom function
    } else {
      startTone(); // Start internal tone
    }

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - pressStartTime.current;
      const progress = Math.min((elapsed / dashThreshold) * 100, 100);
      setPressProgress(progress);
    }, 10);
  };

  const handlePressEnd = (e) => {
    if (disabled || !pressStartTime.current) return;

    // Prevent mouse events from firing after touch events
    if (e.type === 'touchend') {
      e.preventDefault();
    }

    const pressDuration = Date.now() - pressStartTime.current;
    const isDash = pressDuration > dashThreshold;
    const signal = isDash ? 'dash' : 'dot';

    // Stop the tone when released (like a real CW key)
    if (onPlaySound) {
      onPlaySound(false); // Stop tone via custom function
    } else {
      stopTone(); // Stop internal tone
    }

    // Send signal without playing extra sound (continuous tone already played)
    onSignal(signal, false);

    setIsPressed(false);
    setPressProgress(0);
    pressStartTime.current = null;

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  // Expose methods to parent component for keyboard triggers and visual feedback
  useImperativeHandle(ref, () => ({
    triggerPress: (signal) => {
      if (disabled) return;

      const isDash = signal === 'dash';

      // Visual feedback only - sound is handled by handleMorseSignal in App.jsx
      setIsPressed(true);
      addRipple();

      if (isDash) {
        setPressProgress(100);
      }

      // Reset visual state
      setTimeout(() => {
        setIsPressed(false);
        setPressProgress(0);
      }, isDash ? 250 : 120);
    },
    playSound: (isDash) => {
      // Exposed method for two-circle buttons to play sound
      if (onPlaySound) {
        onPlaySound(isDash);
      } else {
        playBeep(isDash);
      }
    }
  }));

  return (
    <div className="morse-key-container">
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
    </div>
  );
});

MorseKey.displayName = 'MorseKey';

export default MorseKey;
