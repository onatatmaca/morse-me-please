/**
 * BPM-Based Morse Code Timing System
 *
 * Implements International Morse Code standards with:
 * - WPM (Words Per Minute) based timing
 * - Tolerance windows for human error
 * - Farnsworth timing for learning
 * - Adaptive learning from user patterns
 * - Custom weight ratios
 */

// ============================================================================
// CONSTANTS
// ============================================================================

export const MORSE_STANDARDS = {
  DOT_UNITS: 1,
  DASH_UNITS: 3,
  INTRA_CHAR_GAP_UNITS: 1,  // Gap between dots/dashes in same letter
  LETTER_GAP_UNITS: 3,       // Gap between letters
  WORD_GAP_UNITS: 7,         // Gap between words
  PARIS_UNITS: 50,           // Standard word "PARIS" = 50 time units
};

export const WPM_RANGE = {
  MIN: 5,
  MAX: 40,
  DEFAULT: 20,
};

export const TOLERANCE_PRESETS = {
  strict: {
    name: 'Strict',
    description: 'Perfect timing required (±30%)',
    dotMin: 0.7,
    dotMax: 1.3,
    dashMin: 2.5,
    dashMax: 3.5,
    letterPauseMin: 2.5,
    letterPauseMax: 4,
    wordPauseMin: 6,
    wordPauseMax: 9,
  },
  medium: {
    name: 'Medium',
    description: 'Forgiving timing (±50-100%)',
    dotMin: 0.5,
    dotMax: 2.0,
    dashMin: 2.0,
    dashMax: 5.0,
    letterPauseMin: 2,
    letterPauseMax: 6,
    wordPauseMin: 5,
    wordPauseMax: 10,
  },
  relaxed: {
    name: 'Relaxed',
    description: 'Very forgiving (±200%)',
    dotMin: 0.3,
    dotMax: 2.5,
    dashMin: 1.5,
    dashMax: 6.0,
    letterPauseMin: 1.5,
    letterPauseMax: 8,
    wordPauseMin: 4,
    wordPauseMax: 12,
  },
};

// ============================================================================
// CORE TIMING CALCULATIONS
// ============================================================================

/**
 * Calculate the base time unit from WPM
 * Formula: Time Unit (ms) = 1200 / WPM
 *
 * Examples:
 * - 5 WPM:  240ms per unit
 * - 20 WPM: 60ms per unit
 * - 40 WPM: 30ms per unit
 */
export function calculateTimeUnit(wpm) {
  return 1200 / wpm;
}

/**
 * Calculate standard timing values from WPM
 * Uses International Morse Code ratios (1:3:7)
 */
export function calculateStandardTimings(wpm) {
  const timeUnit = calculateTimeUnit(wpm);

  return {
    timeUnit,
    dotLength: timeUnit * MORSE_STANDARDS.DOT_UNITS,
    dashLength: timeUnit * MORSE_STANDARDS.DASH_UNITS,
    letterPause: timeUnit * MORSE_STANDARDS.LETTER_GAP_UNITS,
    wordPause: timeUnit * MORSE_STANDARDS.WORD_GAP_UNITS,
  };
}

/**
 * Calculate Farnsworth timing
 *
 * Farnsworth method: Characters sent at higher speed (charSpeed),
 * but pauses stretched for learners (effectiveSpeed)
 *
 * Used by: LCWO.net, MorseCodeNinja, Ham Radio training apps
 *
 * @param {number} charSpeed - Character speed in WPM (how fast dots/dashes)
 * @param {number} effectiveSpeed - Overall speed in WPM (with pauses)
 */
export function calculateFarnsworthTimings(charSpeed, effectiveSpeed) {
  const charTimeUnit = calculateTimeUnit(charSpeed);
  const effectiveTimeUnit = calculateTimeUnit(effectiveSpeed);

  return {
    timeUnit: charTimeUnit,
    dotLength: charTimeUnit * MORSE_STANDARDS.DOT_UNITS,
    dashLength: charTimeUnit * MORSE_STANDARDS.DASH_UNITS,
    letterPause: effectiveTimeUnit * MORSE_STANDARDS.LETTER_GAP_UNITS,
    wordPause: effectiveTimeUnit * MORSE_STANDARDS.WORD_GAP_UNITS,
  };
}

/**
 * Calculate timing with custom weight ratio
 *
 * Weight = dash-to-dot ratio
 * Standard: 3:1
 * Adjustable: 2.5:1 to 4:1 (compensates for operator's "fist")
 *
 * Used by: Ham Radio contest apps (N1MM, etc.)
 */
export function calculateWeightedTimings(wpm, weight = 3.0) {
  const timeUnit = calculateTimeUnit(wpm);

  return {
    timeUnit,
    dotLength: timeUnit * MORSE_STANDARDS.DOT_UNITS,
    dashLength: timeUnit * weight,  // Custom ratio
    letterPause: timeUnit * MORSE_STANDARDS.LETTER_GAP_UNITS,
    wordPause: timeUnit * MORSE_STANDARDS.WORD_GAP_UNITS,
  };
}

// ============================================================================
// TOLERANCE WINDOWS
// ============================================================================

/**
 * Calculate recognition windows with tolerance
 * Returns min/max ranges for dot, dash, and pause detection
 */
export function calculateToleranceWindows(timings, tolerance = 'medium') {
  const tol = TOLERANCE_PRESETS[tolerance];
  const { timeUnit } = timings;

  return {
    dot: {
      min: timeUnit * tol.dotMin,
      max: timeUnit * tol.dotMax,
    },
    dash: {
      min: timeUnit * tol.dashMin,
      max: timeUnit * tol.dashMax,
    },
    // Dash threshold = midpoint between max dot and min dash
    dashThreshold: (timeUnit * tol.dotMax + timeUnit * tol.dashMin) / 2,
    letterPause: {
      min: timeUnit * tol.letterPauseMin,
      max: timeUnit * tol.letterPauseMax,
    },
    wordPause: {
      min: timeUnit * tol.wordPauseMin,
      max: timeUnit * tol.wordPauseMax,
    },
  };
}

/**
 * Check if a press duration is a valid dot or dash
 */
export function classifyPress(duration, windows) {
  if (duration >= windows.dot.min && duration <= windows.dot.max) {
    return 'dot';
  }
  if (duration >= windows.dash.min && duration <= windows.dash.max) {
    return 'dash';
  }
  return null; // Invalid timing
}

/**
 * Calculate timing accuracy (0-100%)
 * Returns how close the user's timing is to perfect
 */
export function calculateAccuracy(actualDuration, targetDuration) {
  const error = Math.abs(actualDuration - targetDuration);
  const maxError = targetDuration; // 100% error = 2x target
  const accuracy = Math.max(0, 100 - (error / maxError) * 100);
  return Math.round(accuracy);
}

// ============================================================================
// ADAPTIVE LEARNING
// ============================================================================

export class AdaptiveTiming {
  constructor() {
    this.dotSamples = [];
    this.dashSamples = [];
    this.maxSamples = 50; // Keep last 50 samples

    // Load from localStorage if available
    this.load();
  }

  /**
   * Record a user's dot or dash timing
   */
  recordPress(type, duration) {
    if (type === 'dot') {
      this.dotSamples.push(duration);
      if (this.dotSamples.length > this.maxSamples) {
        this.dotSamples.shift();
      }
    } else if (type === 'dash') {
      this.dashSamples.push(duration);
      if (this.dashSamples.length > this.maxSamples) {
        this.dashSamples.shift();
      }
    }

    this.save();
  }

  /**
   * Get average timings from user's history
   */
  getAverages() {
    const avgDot = this.dotSamples.length > 0
      ? this.dotSamples.reduce((a, b) => a + b, 0) / this.dotSamples.length
      : null;

    const avgDash = this.dashSamples.length > 0
      ? this.dashSamples.reduce((a, b) => a + b, 0) / this.dashSamples.length
      : null;

    return { avgDot, avgDash };
  }

  /**
   * Calculate adaptive dash threshold based on user's patterns
   */
  getAdaptiveDashThreshold() {
    const { avgDot, avgDash } = this.getAverages();

    if (avgDot && avgDash) {
      // Midpoint between user's average dot and dash
      return (avgDot + avgDash) / 2;
    }

    return null; // Not enough data
  }

  /**
   * Get sample count for UI feedback
   */
  getSampleCount() {
    return {
      dots: this.dotSamples.length,
      dashes: this.dashSamples.length,
    };
  }

  /**
   * Reset all learned data
   */
  reset() {
    this.dotSamples = [];
    this.dashSamples = [];
    this.save();
  }

  /**
   * Save to localStorage
   */
  save() {
    try {
      localStorage.setItem('morse_adaptive_timing', JSON.stringify({
        dotSamples: this.dotSamples,
        dashSamples: this.dashSamples,
      }));
    } catch (e) {
      console.error('Failed to save adaptive timing data:', e);
    }
  }

  /**
   * Load from localStorage
   */
  load() {
    try {
      const data = localStorage.getItem('morse_adaptive_timing');
      if (data) {
        const parsed = JSON.parse(data);
        this.dotSamples = parsed.dotSamples || [];
        this.dashSamples = parsed.dashSamples || [];
      }
    } catch (e) {
      console.error('Failed to load adaptive timing data:', e);
    }
  }
}

// ============================================================================
// COMPLETE TIMING SYSTEM
// ============================================================================

/**
 * Generate complete timing configuration based on settings
 *
 * This is the main function used by the app
 */
export function generateTimingConfig(settings, adaptiveTiming = null) {
  const {
    wpm = WPM_RANGE.DEFAULT,
    tolerance = 'medium',
    farnsworthEnabled = false,
    farnsworthEffectiveWPM = 15,
    customWeight = 3.0,
    customWeightEnabled = false,
    adaptiveEnabled = false,
  } = settings;

  // Calculate base timings
  let timings;
  if (farnsworthEnabled) {
    timings = calculateFarnsworthTimings(wpm, farnsworthEffectiveWPM);
  } else if (customWeightEnabled) {
    timings = calculateWeightedTimings(wpm, customWeight);
  } else {
    timings = calculateStandardTimings(wpm);
  }

  // Calculate tolerance windows
  const windows = calculateToleranceWindows(timings, tolerance);

  // Apply adaptive learning if enabled
  let dashThreshold = windows.dashThreshold;
  if (adaptiveEnabled && adaptiveTiming) {
    const adaptiveThreshold = adaptiveTiming.getAdaptiveDashThreshold();
    if (adaptiveThreshold) {
      dashThreshold = adaptiveThreshold;
    }
  }

  return {
    ...timings,
    ...windows,
    dashThreshold, // Override with adaptive if available
    // Legacy compatibility (for old code that expects these)
    letterPause: timings.letterPause,
    wordPause: timings.wordPause,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format timing value for display
 */
export function formatTiming(ms) {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Get timing guide text for UI
 */
export function getTimingGuide(timings) {
  return {
    dot: `Dot: ${formatTiming(timings.dotLength)}`,
    dash: `Dash: ${formatTiming(timings.dashLength)}`,
    letterPause: `Letter gap: ${formatTiming(timings.letterPause)}`,
    wordPause: `Word gap: ${formatTiming(timings.wordPause)}`,
    ratio: `Ratio: 1:${(timings.dashLength / timings.dotLength).toFixed(1)}:${(timings.wordPause / timings.dotLength).toFixed(1)}`,
  };
}

/**
 * Export for use in components
 */
export default {
  calculateTimeUnit,
  calculateStandardTimings,
  calculateFarnsworthTimings,
  calculateWeightedTimings,
  calculateToleranceWindows,
  classifyPress,
  calculateAccuracy,
  generateTimingConfig,
  formatTiming,
  getTimingGuide,
  AdaptiveTiming,
  MORSE_STANDARDS,
  WPM_RANGE,
  TOLERANCE_PRESETS,
};
