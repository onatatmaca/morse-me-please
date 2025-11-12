import React from 'react';
import './SettingsPanel.css';

export default function SettingsPanel({
  settings,
  onSettingsChange,
  isOpen,
  onClose
}) {
  const handleChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleNumericChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: parseFloat(value) });
  };

  const handleCheckboxChange = (key, checked) => {
    onSettingsChange({ ...settings, [key]: checked });
  };

  return (
    <>
      {isOpen && (
        <div className="settings-overlay" onClick={onClose}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h3>⚙️ Settings</h3>
              <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="settings-content">
              {/* ========== MORSE SPEED ========== */}
              <div className="setting-group">
                <h4>🎵 Morse Speed</h4>

                <div className="setting-item">
                  <label>
                    Words Per Minute (WPM)
                    <span className="setting-hint">
                      {settings.wpm <= 10 ? '🐢 Beginner' : settings.wpm <= 20 ? '👍 Intermediate' : '⚡ Advanced'}
                    </span>
                  </label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="1"
                      value={settings.wpm || 20}
                      onChange={(e) => handleNumericChange('wpm', e.target.value)}
                    />
                    <span className="setting-value">{settings.wpm || 20} WPM</span>
                  </div>
                  <div className="wpm-markers">
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                    <span>20</span>
                    <span>25</span>
                    <span>30</span>
                    <span>35</span>
                    <span>40</span>
                  </div>
                </div>
              </div>

              {/* ========== AUTO-SEND DELAY ========== */}
              <div className="setting-group">
                <h4>⏱️ Auto-Send Delay</h4>

                <div className="setting-item">
                  <label>
                    Submit Delay
                    <span className="setting-hint">Message sends automatically after this delay</span>
                  </label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="1000"
                      max="5000"
                      step="100"
                      value={settings.submitDelay || 2500}
                      onChange={(e) => handleNumericChange('submitDelay', e.target.value)}
                    />
                    <span className="setting-value">{((settings.submitDelay || 2500) / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </div>

              {/* ========== DISPLAY OPTIONS ========== */}
              <div className="setting-group">
                <h4>👁️ Display Options</h4>

                <div className="setting-item checkbox-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.showLetters}
                      onChange={(e) => handleCheckboxChange('showLetters', e.target.checked)}
                    />
                    <span className="checkbox-label">Show letter translation while typing</span>
                  </label>
                </div>
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
                    <span className="checkbox-label">Enable Keyboard Input</span>
                  </label>
                </div>

                <div className="setting-item checkbox-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.twoCircleMode}
                      onChange={(e) => handleCheckboxChange('twoCircleMode', e.target.checked)}
                    />
                    <span className="checkbox-label">
                      Two-Circle Mode
                      <span className="setting-hint">Separate buttons for Dot and Dash (great for mobile)</span>
                    </span>
                  </label>
                </div>

                <div className="setting-info">
                  <strong>Note:</strong> Input mode toggle (Z/X vs HOLD) is available in the main window when keyboard is enabled.
                </div>
              </div>

              {/* ========== INFO ========== */}
              <div className="setting-info">
                <p><strong>💡 About WPM-based timing:</strong></p>
                <p>This app uses International Morse Code standards. All timings are calculated from your WPM setting.</p>
                <p></p>
                <p><strong>Professional standards:</strong></p>
                <p>• <strong>Beginner:</strong> 5-10 WPM</p>
                <p>• <strong>Intermediate:</strong> 10-20 WPM</p>
                <p>• <strong>Expert:</strong> 20-40 WPM</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
