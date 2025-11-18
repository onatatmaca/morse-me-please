// src/components/LessonSelector.jsx
import React, { useState, useEffect } from 'react';
import { LESSONS, isLessonUnlocked } from '../lessons/lessonData';
import { loadProgress, getCompletionPercentage } from '../utils/lessonManager';
import './LessonSelector.css';

export default function LessonSelector({ onSelectLesson, onViewProgress }) {
  const [progress, setProgress] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'beginner', 'intermediate', 'advanced', 'expert'

  useEffect(() => {
    const progressData = loadProgress();
    setProgress(progressData);
  }, []);

  if (!progress) {
    return <div className="lesson-selector-loading">Loading lessons...</div>;
  }

  const completionPercentage = getCompletionPercentage();

  // Filter lessons
  const filteredLessons = LESSONS.filter(lesson => {
    if (filter === 'all') return true;
    return lesson.difficulty === filter;
  });

  // Group lessons by difficulty
  const lessonsByDifficulty = {
    beginner: LESSONS.filter(l => l.difficulty === 'beginner'),
    intermediate: LESSONS.filter(l => l.difficulty === 'intermediate'),
    advanced: LESSONS.filter(l => l.difficulty === 'advanced'),
    expert: LESSONS.filter(l => l.difficulty === 'expert')
  };

  return (
    <div className="lesson-selector-container">
      {/* Header */}
      <div className="lesson-selector-header">
        <div className="header-top">
          <h1 className="lesson-title">📚 Practice Lessons</h1>
          <button className="progress-btn" onClick={onViewProgress}>
            <span className="progress-icon">📊</span>
            <span className="progress-text">Progress</span>
          </button>
        </div>

        {/* Overall Progress Bar */}
        <div className="overall-progress">
          <div className="progress-info">
            <span className="progress-label">Overall Progress</span>
            <span className="progress-percentage">{completionPercentage}%</span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="progress-stats">
            <span>{progress.completedLessons.length} / {LESSONS.length} lessons completed</span>
            <span>⭐ {progress.achievements.length} achievements</span>
          </div>
        </div>

        {/* Filters */}
        <div className="lesson-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Lessons
          </button>
          <button
            className={`filter-btn ${filter === 'beginner' ? 'active' : ''}`}
            onClick={() => setFilter('beginner')}
          >
            🎯 Beginner
          </button>
          <button
            className={`filter-btn ${filter === 'intermediate' ? 'active' : ''}`}
            onClick={() => setFilter('intermediate')}
          >
            📖 Intermediate
          </button>
          <button
            className={`filter-btn ${filter === 'advanced' ? 'active' : ''}`}
            onClick={() => setFilter('advanced')}
          >
            ⚡ Advanced
          </button>
          <button
            className={`filter-btn ${filter === 'expert' ? 'active' : ''}`}
            onClick={() => setFilter('expert')}
          >
            👑 Expert
          </button>
        </div>
      </div>

      {/* Lesson Grid */}
      <div className="lesson-grid">
        {filteredLessons.map((lesson) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);
          const isUnlocked = isLessonUnlocked(lesson.id, progress.completedLessons);
          const isCurrent = progress.currentLesson === lesson.id;
          const lessonScore = progress.lessonScores[lesson.id];

          return (
            <div
              key={lesson.id}
              className={`lesson-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}`}
              onClick={() => isUnlocked && onSelectLesson(lesson.id)}
            >
              {/* Status Badge */}
              <div className="lesson-status">
                {!isUnlocked && <span className="status-badge locked-badge">🔒 Locked</span>}
                {isCompleted && <span className="status-badge completed-badge">✓ Completed</span>}
                {isCurrent && !isCompleted && <span className="status-badge current-badge">→ Continue</span>}
              </div>

              {/* Lesson Number & Icon */}
              <div className="lesson-header">
                <div className="lesson-number">#{lesson.id}</div>
                <div className="lesson-icon">{lesson.icon}</div>
              </div>

              {/* Lesson Info */}
              <div className="lesson-info">
                <h3 className="lesson-name">{lesson.title}</h3>
                <p className="lesson-description">{lesson.description}</p>

                {/* New Characters Preview */}
                {lesson.newCharacters && lesson.newCharacters.length > 0 && (
                  <div className="new-characters">
                    <span className="new-label">New:</span>
                    <span className="characters-list">
                      {lesson.newCharacters.join(', ')}
                    </span>
                  </div>
                )}

                {/* Lesson Meta */}
                <div className="lesson-meta">
                  <span className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    {lesson.estimatedTime}
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">🎯</span>
                    {lesson.exercises.length} exercises
                  </span>
                  <span className="meta-item difficulty-badge difficulty-{lesson.difficulty}">
                    {lesson.difficulty}
                  </span>
                </div>

                {/* Score (if completed) */}
                {isCompleted && lessonScore && (
                  <div className="lesson-score">
                    <div className="score-item">
                      <span className="score-label">Best:</span>
                      <span className="score-value">{lessonScore.accuracy}%</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">WPM:</span>
                      <span className="score-value">{lessonScore.wpm}</span>
                    </div>
                    {lessonScore.attempts > 1 && (
                      <div className="score-item">
                        <span className="score-label">Tries:</span>
                        <span className="score-value">{lessonScore.attempts}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Hint */}
              {isUnlocked && !isCompleted && (
                <div className="lesson-action-hint">Click to start →</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLessons.length === 0 && (
        <div className="empty-state">
          <p>No lessons found in this category.</p>
          <button onClick={() => setFilter('all')}>Show All Lessons</button>
        </div>
      )}
    </div>
  );
}
