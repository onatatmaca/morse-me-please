import React, { useState, useRef, useEffect } from 'react';
import './MorseKey.css';

export default function MorseKey({ onSignal, disabled, volume = 0.3, dashThreshold = 300 }) {
  const [isPressed, setIsPressed] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const pressStartTime = useRef(null);
  const audioContext = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  const playBeep = (frequency, duration) => {
    if (!audioContext.current || volume === 0) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  const handlePressStart = () => {
    if (disabled) return;
    setIsPressed(true);
    pressStartTime.current = Date.now();
    setPressProgress(0);

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - pressStartTime.current;
      const progress = Math.min((elapsed / dashThreshold) * 100, 100);
      setPressProgress(progress);
    }, 10);
  };

  const handlePressEnd = () => {
    if (disabled || !pressStartTime.current) return;

    const pressDuration = Date.now() - pressStartTime.current;
    const isDash = pressDuration > dashThreshold;

    onSignal(isDash ? 'dash' : 'dot');
    playBeep(isDash ? 400 : 800, isDash ? 0.3 : 0.15);

    setIsPressed(false);
    setPressProgress(0);
    pressStartTime.current = null;

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

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
        {isPressed && pressProgress > 0 && (
          <div className="press-progress" style={{ width: `${pressProgress}%` }} />
        )}
        
        <span className="morse-key-label">Morse Key</span>
        <span className="morse-key-hint">
          {disabled ? '⏸️ Not your turn' : 'Tap = · | Hold = −'}
        </span>
      </button>
    </div>
  );
}