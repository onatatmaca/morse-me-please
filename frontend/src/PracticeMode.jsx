// src/PracticeMode.jsx
/**
 * Main Practice Mode Component
 * Orchestrates the entire practice experience:
 * - Lesson selection
 * - Exercise execution
 * - Progress tracking
 * - Achievement unlocking
 */

import React, { useState, useEffect } from 'react';
import LessonSelector from './components/LessonSelector';
import ExerciseRunner from './practice/ExerciseRunner';
import { getLessonById } from './lessons/lessonData';
import {
  loadProgress,
  completeLesson,
  recordExerciseResult,
  updateCharacterMastery,
  unlockAchievement
} from './utils/lessonManager';
import './PracticeMode.css';

export default function PracticeMode({ username, onExit }) {
  const [view, setView] = useState('selector'); // 'selector', 'lesson', 'progress'
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [progress, setProgress] = useState(null);
  const [settings, setSettings] = useState({
    wpm: 12,
    submitDelay: 2500,
    showLetters: true,
    keyboardEnabled: true,
    twoCircleMode: false,
    myVolume: 0.3,
    partnerVolume: 0.3,
    myFrequency: 600,
    partnerFrequency: 900
  });

  useEffect(() => {
    const progressData = loadProgress();
    setProgress(progressData);
  }, []);

  const handleSelectLesson = (lessonId) => {
    const lesson = getLessonById(lessonId);
    if (lesson) {
      setCurrentLesson(lesson);
      setCurrentExerciseIndex(0);
      setView('lesson');
    }
  };

  const handleExerciseComplete = (result) => {
    // Record exercise result
    const exerciseId = currentLesson.exercises[currentExerciseIndex].id;
    recordExerciseResult(exerciseId, result.accuracy, result.wpm, result.timeSpent);

    // Update character mastery for each character in the target
    if (result.targetText) {
      const chars = result.targetText.split('');
      chars.forEach(char => {
        // Check if user got it right (simplified)
        const correct = result.accuracy >= 80; // Consider 80%+ as correct
        updateCharacterMastery(char, correct);
      });
    }

    // Move to next exercise
    if (currentExerciseIndex < currentLesson.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Lesson completed
      handleLessonComplete(result);
    }

    // Reload progress
    setProgress(loadProgress());
  };

  const handleLessonComplete = (lastResult) => {
    // Calculate overall lesson stats (simplified)
    const lessonAccuracy = lastResult.accuracy;
    const lessonWPM = lastResult.wpm || settings.wpm;

    // Complete the lesson
    completeLesson(currentLesson.id, lessonAccuracy, lessonWPM);

    // Unlock achievements
    if (currentLesson.achievements) {
      currentLesson.achievements.forEach(achievementId => {
        unlockAchievement(achievementId);
      });
    }

    // Check special achievements
    checkAchievements(lessonAccuracy, lessonWPM);

    // Reload progress and return to selector
    setProgress(loadProgress());
    setView('selector');
    setCurrentLesson(null);
    setCurrentExerciseIndex(0);

    // TODO: Show "Lesson Complete" celebration
    alert(`🎉 Lesson Complete!\n\nAccuracy: ${lessonAccuracy}%\nWPM: ${lessonWPM}\n\nGreat job!`);
  };

  const checkAchievements = (accuracy, wpm) => {
    // Check for accuracy achievements
    if (accuracy === 100) {
      unlockAchievement('perfect-score');
    }

    // Check for speed achievements
    if (wpm >= 15) {
      unlockAchievement('speed-demon-15');
    }
    if (wpm >= 20) {
      unlockAchievement('speed-demon-20');
    }
    if (wpm >= 25) {
      unlockAchievement('speed-demon-25');
    }
  };

  const handleViewProgress = () => {
    setView('progress');
  };

  const handleBackToSelector = () => {
    setView('selector');
    setCurrentLesson(null);
    setCurrentExerciseIndex(0);
  };

  const handlePlayMorse = (morseCode) => {
    // TODO: Implement morse code audio playback
    // This would use the Web Audio API to play dots and dashes
    console.log('Play morse:', morseCode);
  };

  if (!progress) {
    return (
      <div className="practice-mode-loading">
        <div className="loading-spinner"></div>
        <p>Loading practice mode...</p>
      </div>
    );
  }

  return (
    <div className="practice-mode">
      {/* Header */}
      <div className="practice-mode-header">
        <div className="header-left">
          {view !== 'selector' && (
            <button className="back-btn" onClick={handleBackToSelector}>
              ← Back
            </button>
          )}
          <h1 className="practice-mode-title">
            🎓 Practice Mode
          </h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{username}</span>
            <span className="user-progress">{progress.completedLessons.length}/15 lessons</span>
          </div>
          <button className="exit-practice-btn" onClick={onExit}>
            Exit to Chat
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="practice-mode-content">
        {view === 'selector' && (
          <LessonSelector
            onSelectLesson={handleSelectLesson}
            onViewProgress={handleViewProgress}
          />
        )}

        {view === 'lesson' && currentLesson && (
          <div className="lesson-view">
            {/* Lesson Progress Indicator */}
            <div className="lesson-progress-bar">
              <div className="progress-info">
                <span className="lesson-name">{currentLesson.title}</span>
                <span className="exercise-count">
                  Exercise {currentExerciseIndex + 1} / {currentLesson.exercises.length}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((currentExerciseIndex + 1) / currentLesson.exercises.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Exercise Runner */}
            <ExerciseRunner
              exercise={currentLesson.exercises[currentExerciseIndex]}
              settings={settings}
              onComplete={handleExerciseComplete}
              onExit={handleBackToSelector}
              onPlayMorse={handlePlayMorse}
            />
          </div>
        )}

        {view === 'progress' && (
          <div className="progress-view">
            <h2>Progress Dashboard</h2>
            <p>Coming soon: Detailed stats, achievements, and character mastery!</p>
            <button onClick={handleBackToSelector}>Back to Lessons</button>
          </div>
        )}
      </div>
    </div>
  );
}
