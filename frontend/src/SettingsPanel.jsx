import React, { useState } from 'react';
import { getTimingGuide, formatTiming, WPM_RANGE, TOLERANCE_PRESETS } from './BPMTiming';
import './SettingsPanel.css';

export default function SettingsPanel({
  settings,
  onSettingsChange,
  isOpen,
  onClose,
  timingConfig = null,
  adaptiveTiming = null
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleNumericChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: parseFloat(value) });
  };

  const handleCheckboxChange = (key, checked) => {
    onSettingsChange({ ...settings, [key]: checked });
  };

  const resetAdaptiveLearning = () => {
    if (adaptiveTiming && window.confirm('Reset all learned timing data?')) {
      adaptiveTiming.reset();
      alert('Adaptive learning data has been reset.');
    }
  };

  // Get timing guide for display
  const timingGuide = timingConfig ? getTimingGuide(timingConfig) : null;

  // Get adaptive stats
  const adaptiveStats = adaptiveTiming ? adaptiveTiming.getAverages() : { avgDot: null, avgDash: null };
  const sampleCount = adaptiveTiming ? adaptiveTiming.getSampleCount() : { dots: 0, dashes: 0 };

  return (
    <>
      {isOpen && (
        <div className="settings-overlay" onClick={onClose}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h3>⚙️ Morse Timing Settings</h3>
              <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="settings-content">
              {/* ========== PHASE 1: BPM CONTROL ========== */}
              <div className="setting-group bpm-group">
                <h4>🎵 Morse Speed (BPM-Based)</h4>

                <div className="setting-item">
                  <label>
                    Words Per Minute (WPM)
                    <span className="setting-hint">
                      {settings.wpm <= 10 ? 'Beginner' : settings.wpm <= 20 ? 'Intermediate' : 'Advanced'}
                    </span>
                  </label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min={WPM_RANGE.MIN}
                      max={WPM_RANGE.MAX}
                      step="1"
                      value={settings.wpm || WPM_RANGE.DEFAULT}
                      onChange={(e) => handleNumericChange('wpm', e.target.value)}
                      className="wpm-slider"
                    />
                    <span className="setting-value wpm-value">{settings.wpm || WPM_RANGE.DEFAULT} WPM</span>
                  </div>
                  <div className="wpm-markers">
                    <span className="wpm-marker">5</span>
                    <span className="wpm-marker">10</span>
                    <span className="wpm-marker">15</span>
                    <span className="wpm-marker">20</span>
                    <span className="wpm-marker">25</span>
                    <span className="wpm-marker">30</span>
                    <span className="wpm-marker">35</span>
                    <span className="wpm-marker">40</span>
                  </div>
                </div>

                {/* Show calculated timings */}
                {timingGuide && (
                  <div className="timing-preview">
                    <div className="timing-preview-header">📊 Calculated Timings</div>
                    <div className="timing-preview-grid">
                      <div className="timing-preview-item">
                        <span className="timing-preview-label">Dot (·)</span>
                        <span className="timing-preview-value">{timingGuide.dot}</span>
                      </div>
                      <div className="timing-preview-item">
                        <span className="timing-preview-label">Dash (−)</span>
                        <span className="timing-preview-value">{timingGuide.dash}</span>
                      </div>
                      <div className="timing-preview-item">
                        <span className="timing-preview-label">Letter gap</span>
                        <span className="timing-preview-value">{timingGuide.letterPause}</span>
                      </div>
                      <div className="timing-preview-item">
                        <span className="timing-preview-label">Word gap</span>
                        <span className="timing-preview-value">{timingGuide.wordPause}</span>
                      </div>
                    </div>
                    <div className="timing-preview-ratio">{timingGuide.ratio}</div>
                  </div>
                )}
              </div>

              {/* ========== PHASE 2: TOLERANCE ========== */}
              <div className="setting-group tolerance-group">
                <h4>🎯 Timing Tolerance</h4>

                <div className="tolerance-selector">
                  {Object.entries(TOLERANCE_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      className={`tolerance-option ${settings.tolerance === key ? 'active' : ''}`}
                      onClick={() => handleChange('tolerance', key)}
                    >
                      <span className="tolerance-option-name">{preset.name}</span>
                      <span className="tolerance-option-desc">{preset.description}</span>
                    </button>
                  ))}
                </div>

                <div className="tolerance-info">
                  <p><strong>Tolerance levels:</strong></p>
                  <p>• <strong>Strict:</strong> Perfect timing required - for experts</p>
                  <p>• <strong>Medium:</strong> Forgiving timing - recommended for most users</p>
                  <p>• <strong>Relaxed:</strong> Very forgiving - great for learning</p>
                </div>
              </div>

              {/* ========== PHASE 3: ADVANCED FEATURES ========== */}
              <div className="setting-group advanced-group">
                <button
                  className="advanced-toggle"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <span>⚡ Advanced Features</span>
                  <span className="toggle-icon">{showAdvanced ? '▼' : '▶'}</span>
                </button>

                {showAdvanced && (
                  <>
                    {/* Farnsworth Timing */}
                    <div className="advanced-section">
                      <div className="setting-item checkbox-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={settings.farnsworthEnabled || false}
                            onChange={(e) => handleCheckboxChange('farnsworthEnabled', e.target.checked)}
                          />
                          <span className="checkbox-label">
                            <strong>Enable Farnsworth Timing</strong>
                            <span className="setting-hint">Professional training method - fast characters, slower pauses</span>
                          </span>
                        </label>
                      </div>

                      {settings.farnsworthEnabled && (
                        <div className="setting-item indented">
                          <label>
                            Effective Speed (Overall WPM)
                            <span className="setting-hint">Characters sent at {settings.wpm} WPM, pauses stretched to {settings.farnsworthEffectiveWPM} WPM</span>
                          </label>
                          <div className="setting-control">
                            <input
                              type="range"
                              min={WPM_RANGE.MIN}
                              max={settings.wpm || WPM_RANGE.DEFAULT}
                              step="1"
                              value={settings.farnsworthEffectiveWPM || 15}
                              onChange={(e) => handleNumericChange('farnsworthEffectiveWPM', e.target.value)}
                            />
                            <span className="setting-value">{settings.farnsworthEffectiveWPM || 15} WPM</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Custom Weight Ratio */}
                    <div className="advanced-section">
                      <div className="setting-item checkbox-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={settings.customWeightEnabled || false}
                            onChange={(e) => handleCheckboxChange('customWeightEnabled', e.target.checked)}
                          />
                          <span className="checkbox-label">
                            <strong>Custom Dash Weight</strong>
                            <span className="setting-hint">Adjust dash-to-dot ratio (Ham Radio style)</span>
                          </span>
                        </label>
                      </div>

                      {settings.customWeightEnabled && (
                        <div className="setting-item indented">
                          <label>
                            Dash-to-Dot Ratio
                            <span className="setting-hint">Standard is 3:1 (dash = 3× dot length)</span>
                          </label>
                          <div className="setting-control">
                            <input
                              type="range"
                              min="2.5"
                              max="4.0"
                              step="0.1"
                              value={settings.customWeight || 3.0}
                              onChange={(e) => handleNumericChange('customWeight', e.target.value)}
                            />
                            <span className="setting-value">{(settings.customWeight || 3.0).toFixed(1)}:1</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Adaptive Learning */}
                    <div className="advanced-section">
                      <div className="setting-item checkbox-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={settings.adaptiveEnabled || false}
                            onChange={(e) => handleCheckboxChange('adaptiveEnabled', e.target.checked)}
                          />
                          <span className="checkbox-label">
                            <strong>Adaptive Learning</strong>
                            <span className="setting-hint">Learn your timing patterns automatically (like Gboard)</span>
                          </span>
                        </label>
                      </div>

                      {settings.adaptiveEnabled && (
                        <div className="adaptive-learning-stats">
                          <div className="adaptive-stat-row">
                            <span className="adaptive-stat-label">📊 Samples collected:</span>
                            <span className="adaptive-stat-value">
                              {sampleCount.dots} dots, {sampleCount.dashes} dashes
                            </span>
                          </div>

                          {adaptiveStats.avgDot && adaptiveStats.avgDash && (
                            <>
                              <div className="adaptive-stat-row">
                                <span className="adaptive-stat-label">Your avg dot:</span>
                                <span className="adaptive-stat-value">{Math.round(adaptiveStats.avgDot)}ms</span>
                              </div>
                              <div className="adaptive-stat-row">
                                <span className="adaptive-stat-label">Your avg dash:</span>
                                <span className="adaptive-stat-value">{Math.round(adaptiveStats.avgDash)}ms</span>
                              </div>
                              <div className="adaptive-stat-row">
                                <span className="adaptive-stat-label">Your ratio:</span>
                                <span className="adaptive-stat-value">
                                  1:{(adaptiveStats.avgDash / adaptiveStats.avgDot).toFixed(1)}
                                </span>
                              </div>
                            </>
                          )}

                          <button
                            className="reset-adaptive-btn"
                            onClick={resetAdaptiveLearning}
                          >
                            🔄 Reset Learning Data
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* ========== INPUT MODE ========== */}
              <div className="setting-group">
                <h4>⌨️ Input Mode</h4>

                <div className="setting-item checkbox-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.keyboardEnabled}
                      onChange={(e) => handleCheckboxChange('keyboardEnabled', e.target.checked)}
                    />
                    <span className="checkbox-label">Enable Keyboard (Spacebar)</span>
                  </label>
                </div>

                <div className="setting-item checkbox-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.twoButtonMode}
                      onChange={(e) => handleCheckboxChange('twoButtonMode', e.target.checked)}
                    />
                    <span className="checkbox-label">Two-Button Mode (Z = Dot, X = Dash)</span>
                  </label>
                </div>
              </div>

              {/* ========== INFO ========== */}
              <div className="setting-info">
                <p><strong>💡 About WPM-based timing:</strong></p>
                <p>This app uses International Morse Code standards (1:3:7 ratios). All timings are calculated from your WPM setting.</p>
                <p><br/><strong>Professional standards:</strong></p>
                <p>• <strong>Beginner:</strong> 5-10 WPM</p>
                <p>• <strong>Intermediate:</strong> 10-20 WPM</p>
                <p>• <strong>Expert:</strong> 20-40 WPM</p>
                <p>• <strong>Ham Radio:</strong> 5-13 WPM (license requirement)</p>
                <p>• <strong>Professional:</strong> 25+ WPM</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
