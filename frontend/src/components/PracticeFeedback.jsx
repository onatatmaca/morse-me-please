// src/components/PracticeFeedback.jsx
import React from 'react';
import './PracticeFeedback.css';

export default function PracticeFeedback({
  accuracy,
  wpm,
  targetMorse,
  userMorse,
  timeSpent,
  mistakes,
  onContinue,
  onRetry,
  onExit,
  showComparison = true
}) {
  // Determine feedback level
  const getFeedbackLevel = () => {
    if (accuracy >= 95) return 'excellent';
    if (accuracy >= 85) return 'great';
    if (accuracy >= 75) return 'good';
    if (accuracy >= 60) return 'fair';
    return 'needs-practice';
  };

  const getFeedbackMessage = () => {
    const level = getFeedbackLevel();
    const messages = {
      excellent: ['🎉 Perfect!', 'Outstanding!', 'Flawless!', 'Exceptional!'],
      great: ['👍 Great job!', 'Well done!', 'Excellent work!', 'Impressive!'],
      good: ['✨ Good work!', 'Nice job!', 'Keep it up!', 'You\'re improving!'],
      fair: ['💪 Keep practicing!', 'You\'re getting there!', 'Making progress!'],
      'needs-practice': ['🔄 Try again!', 'Practice makes perfect!', 'Keep trying!']
    };
    const options = messages[level];
    return options[Math.floor(Math.random() * options.length)];
  };

  const getFeedbackColor = () => {
    const level = getFeedbackLevel();
    const colors = {
      excellent: '#39d353',
      great: '#4a9eff',
      good: '#ffa500',
      fair: '#ff9800',
      'needs-practice': '#ff6b6b'
    };
    return colors[level];
  };

  // Calculate stars (0-5)
  const getStars = () => {
    if (accuracy >= 95) return 5;
    if (accuracy >= 85) return 4;
    if (accuracy >= 75) return 3;
    if (accuracy >= 60) return 2;
    if (accuracy >= 40) return 1;
    return 0;
  };

  const stars = getStars();

  return (
    <div className="practice-feedback-overlay">
      <div className="practice-feedback-card">
        {/* Header */}
        <div className="feedback-header" style={{ borderColor: getFeedbackColor() }}>
          <h2 className="feedback-title" style={{ color: getFeedbackColor() }}>
            {getFeedbackMessage()}
          </h2>
          <div className="star-rating">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`star ${i < stars ? 'filled' : ''}`}>
                {i < stars ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="feedback-stats">
          <div className="stat-card accuracy-stat">
            <div className="stat-label">Accuracy</div>
            <div className="stat-value" style={{ color: getFeedbackColor() }}>
              {accuracy}%
            </div>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${accuracy}%`, background: getFeedbackColor() }}
              />
            </div>
          </div>

          {wpm > 0 && (
            <div className="stat-card wpm-stat">
              <div className="stat-label">Speed</div>
              <div className="stat-value">{wpm} WPM</div>
              <div className="stat-subtitle">
                {wpm < 10 && 'Beginner'}
                {wpm >= 10 && wpm < 15 && 'Intermediate'}
                {wpm >= 15 && wpm < 20 && 'Advanced'}
                {wpm >= 20 && 'Expert'}
              </div>
            </div>
          )}

          {timeSpent > 0 && (
            <div className="stat-card time-stat">
              <div className="stat-label">Time</div>
              <div className="stat-value">{timeSpent}s</div>
            </div>
          )}

          {mistakes && mistakes > 0 && (
            <div className="stat-card mistakes-stat">
              <div className="stat-label">Mistakes</div>
              <div className="stat-value">{mistakes}</div>
            </div>
          )}
        </div>

        {/* Comparison (if enabled and both morse codes provided) */}
        {showComparison && targetMorse && userMorse && (
          <div className="morse-comparison">
            <h3 className="comparison-title">Comparison</h3>

            <div className="comparison-row">
              <div className="comparison-label">Target:</div>
              <div className="comparison-morse target-morse">{targetMorse}</div>
            </div>

            <div className="comparison-row">
              <div className="comparison-label">Yours:</div>
              <div className="comparison-morse user-morse">
                {highlightDifferences(targetMorse, userMorse)}
              </div>
            </div>
          </div>
        )}

        {/* Encouragement & Tips */}
        <div className="feedback-tips">
          {getEncouragementTip(accuracy, wpm)}
        </div>

        {/* Action Buttons */}
        <div className="feedback-actions">
          {onRetry && (
            <button className="feedback-btn retry-btn" onClick={onRetry}>
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Try Again</span>
            </button>
          )}

          {onContinue && (
            <button className="feedback-btn continue-btn" onClick={onContinue}>
              <span className="btn-icon">→</span>
              <span className="btn-text">Continue</span>
            </button>
          )}

          {onExit && (
            <button className="feedback-btn exit-btn" onClick={onExit}>
              <span className="btn-icon">✕</span>
              <span className="btn-text">Exit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper: Highlight differences between target and user morse
function highlightDifferences(target, user) {
  if (!target || !user) return user || '';

  const targetChars = target.split(' ');
  const userChars = user.split(' ');
  const maxLength = Math.max(targetChars.length, userChars.length);

  const result = [];
  for (let i = 0; i < maxLength; i++) {
    const targetChar = targetChars[i] || '';
    const userChar = userChars[i] || '';

    if (targetChar === userChar) {
      result.push(<span key={i} className="char-correct">{userChar} </span>);
    } else {
      result.push(<span key={i} className="char-wrong">{userChar || '?'} </span>);
    }
  }

  return result;
}

// Helper: Get encouragement tip based on performance
function getEncouragementTip(accuracy, wpm) {
  if (accuracy >= 95 && wpm >= 20) {
    return (
      <p className="tip-text">
        <strong>🏆 Expert Level!</strong> You're operating at professional speed with excellent accuracy. Keep up the amazing work!
      </p>
    );
  }

  if (accuracy >= 85) {
    return (
      <p className="tip-text">
        <strong>💡 Tip:</strong> You're doing great! Try increasing your WPM in settings to challenge yourself further.
      </p>
    );
  }

  if (accuracy >= 75) {
    return (
      <p className="tip-text">
        <strong>💡 Tip:</strong> Good progress! Focus on consistent timing between dots and dashes to improve accuracy.
      </p>
    );
  }

  if (accuracy >= 60) {
    return (
      <p className="tip-text">
        <strong>💡 Tip:</strong> You're learning! Try slowing down the WPM in settings and focus on getting each character right before speeding up.
      </p>
    );
  }

  return (
    <p className="tip-text">
      <strong>💡 Tip:</strong> Don't get discouraged! Morse code takes practice. Review the character reference and try the exercise again.
    </p>
  );
}
