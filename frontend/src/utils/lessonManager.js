/**
 * Lesson Manager - Progress Tracking and State Management
 * Handles localStorage persistence for practice mode progress
 */

const STORAGE_KEY = 'morse_practice_progress';

/**
 * Default progress structure
 */
const DEFAULT_PROGRESS = {
  completedLessons: [], // Array of lesson IDs
  currentLesson: 1,
  lessonScores: {}, // { lessonId: { accuracy, wpm, completedAt, attempts } }
  exerciseResults: {}, // { exerciseId: { accuracy, wpm, completedAt } }
  characterMastery: {}, // { char: { attempts, correct, accuracy, lastPracticed } }
  achievements: [], // Array of achievement IDs
  totalPracticeTime: 0, // Total seconds practiced
  stats: {
    totalExercises: 0,
    totalCharactersTyped: 0,
    averageAccuracy: 0,
    averageWPM: 0,
    streak: 0, // Days in a row
    lastPracticeDate: null,
    bestWPM: 0,
    perfectExercises: 0
  },
  settings: {
    sound: true,
    showHints: true,
    autoAdvance: false
  },
  lastUpdated: Date.now()
};

/**
 * Load progress from localStorage
 * @returns {object} Progress data
 */
export function loadProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const progress = JSON.parse(stored);
      // Merge with defaults to handle new fields
      return { ...DEFAULT_PROGRESS, ...progress };
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }
  return { ...DEFAULT_PROGRESS };
}

/**
 * Save progress to localStorage
 * @param {object} progress - Progress data to save
 */
export function saveProgress(progress) {
  try {
    const toSave = {
      ...progress,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
}

/**
 * Mark a lesson as completed
 * @param {number} lessonId - Lesson ID
 * @param {number} accuracy - Accuracy percentage
 * @param {number} wpm - Words per minute
 * @returns {object} Updated progress
 */
export function completeLesson(lessonId, accuracy, wpm) {
  const progress = loadProgress();

  // Add to completed if not already there
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
  }

  // Update lesson score (keep best score)
  const existingScore = progress.lessonScores[lessonId];
  const newScore = {
    accuracy,
    wpm,
    completedAt: Date.now(),
    attempts: existingScore ? existingScore.attempts + 1 : 1
  };

  // Only update if new score is better
  if (!existingScore || accuracy > existingScore.accuracy) {
    progress.lessonScores[lessonId] = newScore;
  } else {
    // Just increment attempts
    progress.lessonScores[lessonId].attempts++;
  }

  // Update current lesson to next one
  if (progress.currentLesson <= lessonId) {
    progress.currentLesson = lessonId + 1;
  }

  // Update stats
  updateStats(progress, accuracy, wpm);

  saveProgress(progress);
  return progress;
}

/**
 * Record exercise result
 * @param {string} exerciseId - Exercise ID
 * @param {number} accuracy - Accuracy percentage
 * @param {number} wpm - Words per minute
 * @param {number} timeSpent - Time in seconds
 * @returns {object} Updated progress
 */
export function recordExerciseResult(exerciseId, accuracy, wpm, timeSpent = 0) {
  const progress = loadProgress();

  progress.exerciseResults[exerciseId] = {
    accuracy,
    wpm,
    completedAt: Date.now(),
    timeSpent
  };

  // Update stats
  progress.stats.totalExercises++;
  progress.totalPracticeTime += timeSpent;

  if (accuracy === 100) {
    progress.stats.perfectExercises++;
  }

  updateStats(progress, accuracy, wpm);

  saveProgress(progress);
  return progress;
}

/**
 * Update character mastery for a specific character
 * @param {string} character - The character practiced
 * @param {boolean} correct - Whether it was correct
 * @returns {object} Updated progress
 */
export function updateCharacterMastery(character, correct) {
  const progress = loadProgress();

  if (!progress.characterMastery[character]) {
    progress.characterMastery[character] = {
      attempts: 0,
      correct: 0,
      accuracy: 0,
      lastPracticed: null,
      mastered: false
    };
  }

  const charData = progress.characterMastery[character];
  charData.attempts++;
  if (correct) {
    charData.correct++;
  }
  charData.accuracy = Math.round((charData.correct / charData.attempts) * 100);
  charData.lastPracticed = Date.now();

  // Mark as mastered if: 20+ attempts and 90%+ accuracy
  charData.mastered = charData.attempts >= 20 && charData.accuracy >= 90;

  saveProgress(progress);
  return progress;
}

/**
 * Unlock an achievement
 * @param {string} achievementId - Achievement ID
 * @returns {object} Updated progress
 */
export function unlockAchievement(achievementId) {
  const progress = loadProgress();

  if (!progress.achievements.includes(achievementId)) {
    progress.achievements.push(achievementId);
    saveProgress(progress);
  }

  return progress;
}

/**
 * Update overall stats
 * @param {object} progress - Progress object
 * @param {number} accuracy - New accuracy value
 * @param {number} wpm - New WPM value
 */
function updateStats(progress, accuracy, wpm) {
  const stats = progress.stats;

  // Update average accuracy (running average)
  if (stats.totalExercises > 0) {
    const totalAccuracy = stats.averageAccuracy * (stats.totalExercises - 1) + accuracy;
    stats.averageAccuracy = Math.round(totalAccuracy / stats.totalExercises);
  } else {
    stats.averageAccuracy = accuracy;
  }

  // Update average WPM (running average)
  if (stats.totalExercises > 0 && wpm > 0) {
    const totalWPM = stats.averageWPM * (stats.totalExercises - 1) + wpm;
    stats.averageWPM = Math.round(totalWPM / stats.totalExercises);
  } else if (wpm > 0) {
    stats.averageWPM = wpm;
  }

  // Update best WPM
  if (wpm > stats.bestWPM) {
    stats.bestWPM = wpm;
  }

  // Update total characters typed (estimate: WPM * 5 characters per word)
  if (wpm > 0) {
    stats.totalCharactersTyped += wpm * 5;
  }

  // Update streak
  updateStreak(stats);
}

/**
 * Update practice streak
 * @param {object} stats - Stats object
 */
function updateStreak(stats) {
  const now = new Date();
  const today = now.toDateString();

  if (!stats.lastPracticeDate) {
    // First time practicing
    stats.streak = 1;
    stats.lastPracticeDate = today;
  } else {
    const lastDate = new Date(stats.lastPracticeDate);
    const lastDateString = lastDate.toDateString();

    if (lastDateString === today) {
      // Same day, streak unchanged
      return;
    }

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    if (lastDateString === yesterdayString) {
      // Consecutive day
      stats.streak++;
      stats.lastPracticeDate = today;
    } else {
      // Streak broken
      stats.streak = 1;
      stats.lastPracticeDate = today;
    }
  }
}

/**
 * Get mastered characters count
 * @returns {number} Number of mastered characters
 */
export function getMasteredCharactersCount() {
  const progress = loadProgress();
  return Object.values(progress.characterMastery).filter(char => char.mastered).length;
}

/**
 * Get character mastery level
 * @param {string} character - Character to check
 * @returns {string} 'mastered', 'learning', or 'new'
 */
export function getCharacterMasteryLevel(character) {
  const progress = loadProgress();
  const charData = progress.characterMastery[character];

  if (!charData || charData.attempts === 0) {
    return 'new';
  }

  if (charData.mastered) {
    return 'mastered';
  }

  return 'learning';
}

/**
 * Reset all progress (with confirmation)
 * @returns {object} Fresh progress
 */
export function resetProgress() {
  const freshProgress = { ...DEFAULT_PROGRESS };
  saveProgress(freshProgress);
  return freshProgress;
}

/**
 * Export progress as JSON (for backup)
 * @returns {string} JSON string
 */
export function exportProgress() {
  const progress = loadProgress();
  return JSON.stringify(progress, null, 2);
}

/**
 * Import progress from JSON
 * @param {string} jsonString - JSON progress data
 * @returns {boolean} Success
 */
export function importProgress(jsonString) {
  try {
    const progress = JSON.parse(jsonString);
    saveProgress(progress);
    return true;
  } catch (error) {
    console.error('Error importing progress:', error);
    return false;
  }
}

/**
 * Get completion percentage
 * @returns {number} Percentage (0-100)
 */
export function getCompletionPercentage() {
  const progress = loadProgress();
  const totalLessons = 15; // Update if you add more lessons
  return Math.round((progress.completedLessons.length / totalLessons) * 100);
}

/**
 * Check if all lessons are completed
 * @returns {boolean}
 */
export function isAllLessonsCompleted() {
  return getCompletionPercentage() === 100;
}

/**
 * Get weak characters (low accuracy)
 * @param {number} threshold - Accuracy threshold (default 75)
 * @returns {array} Array of {character, accuracy}
 */
export function getWeakCharacters(threshold = 75) {
  const progress = loadProgress();
  const weak = [];

  Object.entries(progress.characterMastery).forEach(([char, data]) => {
    if (data.attempts >= 5 && data.accuracy < threshold) {
      weak.push({ character: char, accuracy: data.accuracy });
    }
  });

  // Sort by accuracy (lowest first)
  return weak.sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * Get characters that need practice (not attempted recently)
 * @param {number} daysSinceLastPractice - Days threshold
 * @returns {array} Array of characters
 */
export function getCharactersNeedingPractice(daysSinceLastPractice = 7) {
  const progress = loadProgress();
  const needPractice = [];
  const threshold = Date.now() - (daysSinceLastPractice * 24 * 60 * 60 * 1000);

  Object.entries(progress.characterMastery).forEach(([char, data]) => {
    if (data.attempts > 0 && data.lastPracticed < threshold) {
      needPractice.push(char);
    }
  });

  return needPractice;
}

/**
 * Get recommended next lesson
 * @returns {number} Lesson ID or null
 */
export function getRecommendedLesson() {
  const progress = loadProgress();
  return progress.currentLesson;
}

/**
 * Calculate total practice time in formatted string
 * @returns {string} Formatted time (e.g., "2h 34m")
 */
export function getFormattedPracticeTime() {
  const progress = loadProgress();
  const seconds = progress.totalPracticeTime;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default {
  loadProgress,
  saveProgress,
  completeLesson,
  recordExerciseResult,
  updateCharacterMastery,
  unlockAchievement,
  getMasteredCharactersCount,
  getCharacterMasteryLevel,
  resetProgress,
  exportProgress,
  importProgress,
  getCompletionPercentage,
  isAllLessonsCompleted,
  getWeakCharacters,
  getCharactersNeedingPractice,
  getRecommendedLesson,
  getFormattedPracticeTime
};
