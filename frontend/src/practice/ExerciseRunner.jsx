// src/practice/ExerciseRunner.jsx
/**
 * Unified Exercise Runner
 * Handles all exercise types: learn, type, listen, mixed, word, etc.
 */

import React, { useState, useEffect, useRef } from 'react';
import { encodeTextToMorse, calculateMorseAccuracy } from '../utils/morseEncoder';
import { MORSE_CODE } from '../MorseHelper';
import PracticeFeedback from '../components/PracticeFeedback';
import './ExerciseRunner.css';

export default function ExerciseRunner({
  exercise,
  settings,
  onComplete,
  onExit,
  onPlayMorse
}) {
  const [userInput, setUserInput] = useState('');
  const [targetText, setTargetText] = useState('');
  const [targetMorse, setTargetMorse] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    initializeExercise();
  }, [exercise]);

  const initializeExercise = () => {
    setUserInput('');
    setIsComplete(false);
    setShowFeedback(false);
    setResult(null);
    setStartTime(Date.now());
    setCurrentCharIndex(0);

    // Set up based on exercise type
    switch (exercise.type) {
      case 'learn':
      case 'listen':
        // Show character and its morse code
        setTargetText(exercise.character || exercise.characters?.[0] || '');
        setTargetMorse(MORSE_CODE[exercise.character] || '');
        break;

      case 'type':
        // User types a specific target
        setTargetText(exercise.target || '');
        setTargetMorse(encodeTextToMorse(exercise.target));
        break;

      case 'word':
        // Select first target word
        const firstWord = exercise.targets?.[0] || exercise.target || '';
        setTargetText(firstWord);
        setTargetMorse(encodeTextToMorse(firstWord));
        break;

      case 'mixed':
        // Random character from the set
        const chars = exercise.characters || [];
        if (chars.length > 0) {
          const randomChar = chars[Math.floor(Math.random() * chars.length)];
          setTargetText(randomChar);
          setTargetMorse(MORSE_CODE[randomChar]);
        }
        break;

      default:
        setTargetText('');
        setTargetMorse('');
    }
  };

  const handleMorseInput = (morseCode) => {
    setUserInput(morseCode);
  };

  const handleSubmit = () => {
    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 1000);

    // Calculate accuracy
    const accuracy = calculateMorseAccuracy(userInput, targetMorse);

    // Calculate WPM (words = characters / 5)
    const words = targetText.length / 5;
    const minutes = timeSpent / 60;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

    // Count mistakes (simple character difference)
    const userChars = userInput.split(' ');
    const targetChars = targetMorse.split(' ');
    const mistakes = Math.abs(userChars.length - targetChars.length);

    const exerciseResult = {
      accuracy,
      wpm,
      timeSpent,
      mistakes,
      targetMorse,
      userMorse: userInput,
      targetText
    };

    setResult(exerciseResult);
    setShowFeedback(true);
  };

  const handleContinue = () => {
    if (onComplete && result) {
      onComplete(result);
    }
  };

  const handleRetry = () => {
    initializeExercise();
  };

  const handlePlayAudio = () => {
    if (onPlayMorse && targetMorse) {
      onPlayMorse(targetMorse);
    }
  };

  // Render different exercise UIs based on type
  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'learn':
        return <LearnExerciseUI
          character={targetText}
          morse={targetMorse}
          instruction={exercise.instruction}
          showCode={exercise.showCode}
          onPlayAudio={handlePlayAudio}
          onContinue={handleContinue}
        />;

      case 'listen':
        return <ListenExerciseUI
          morse={targetMorse}
          instruction={exercise.instruction}
          onPlayAudio={handlePlayAudio}
          userInput={userInput}
          onInputChange={handleMorseInput}
          onSubmit={handleSubmit}
        />;

      case 'type':
      case 'word':
      case 'mixed':
        return <TypeExerciseUI
          targetText={targetText}
          targetMorse={targetMorse}
          instruction={exercise.instruction}
          userInput={userInput}
          onInputChange={handleMorseInput}
          onSubmit={handleSubmit}
          onPlayAudio={handlePlayAudio}
          showTarget={exercise.showCode !== false}
        />;

      default:
        return <div className="exercise-error">Unknown exercise type: {exercise.type}</div>;
    }
  };

  return (
    <div className="exercise-runner">
      <div className="exercise-header">
        <div className="exercise-title">
          <span className="exercise-icon">📝</span>
          <span>{exercise.title || 'Exercise'}</span>
        </div>
        <button className="exit-btn" onClick={onExit}>
          ✕
        </button>
      </div>

      <div className="exercise-content">
        {renderExerciseContent()}
      </div>

      {showFeedback && result && (
        <PracticeFeedback
          accuracy={result.accuracy}
          wpm={result.wpm}
          targetMorse={result.targetMorse}
          userMorse={result.userMorse}
          timeSpent={result.timeSpent}
          mistakes={result.mistakes}
          onContinue={handleContinue}
          onRetry={handleRetry}
          onExit={onExit}
        />
      )}
    </div>
  );
}

// Learn Exercise UI (show character and code)
function LearnExerciseUI({ character, morse, instruction, showCode, onPlayAudio, onContinue }) {
  return (
    <div className="learn-exercise">
      <p className="exercise-instruction">{instruction}</p>

      <div className="character-display">
        <div className="character-large">{character}</div>
        {showCode && <div className="morse-display">{morse}</div>}
      </div>

      <button className="audio-btn" onClick={onPlayAudio}>
        <span className="btn-icon">🔊</span>
        <span className="btn-text">Play Sound</span>
      </button>

      <button className="continue-btn-primary" onClick={onContinue}>
        <span className="btn-text">Continue →</span>
      </button>
    </div>
  );
}

// Listen Exercise UI (play sound, user guesses)
function ListenExerciseUI({ morse, instruction, onPlayAudio, userInput, onInputChange, onSubmit }) {
  return (
    <div className="listen-exercise">
      <p className="exercise-instruction">{instruction}</p>

      <button className="audio-btn-large" onClick={onPlayAudio}>
        <span className="btn-icon">🔊</span>
        <span className="btn-text">Play Morse Code</span>
      </button>

      <div className="input-section">
        <label className="input-label">What did you hear?</label>
        <input
          type="text"
          className="exercise-input"
          value={userInput}
          onChange={(e) => onInputChange(e.target.value.toUpperCase())}
          placeholder="Type the letter..."
          maxLength={10}
          autoFocus
        />
      </div>

      <button
        className="submit-btn"
        onClick={onSubmit}
        disabled={!userInput.trim()}
      >
        Submit Answer
      </button>
    </div>
  );
}

// Type Exercise UI (show target, user types morse)
function TypeExerciseUI({
  targetText,
  targetMorse,
  instruction,
  userInput,
  onInputChange,
  onSubmit,
  onPlayAudio,
  showTarget
}) {
  return (
    <div className="type-exercise">
      <p className="exercise-instruction">{instruction}</p>

      <div className="target-display">
        <div className="target-label">Type this:</div>
        <div className="target-text">{targetText}</div>
        {showTarget && (
          <>
            <div className="target-morse-label">Morse code:</div>
            <div className="target-morse">{targetMorse}</div>
          </>
        )}
      </div>

      <button className="audio-btn-small" onClick={onPlayAudio}>
        🔊 Hear it
      </button>

      <div className="morse-input-section">
        <label className="input-label">Your morse code:</label>
        <textarea
          className="morse-textarea"
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type morse code here (e.g., ·−·· )"
          rows={3}
          autoFocus
        />
        <div className="input-hint">
          Use · for dot and − for dash, or type dots/dashes. Spaces separate characters.
        </div>
      </div>

      <button
        className="submit-btn"
        onClick={onSubmit}
        disabled={!userInput.trim()}
      >
        Check Answer
      </button>
    </div>
  );
}
