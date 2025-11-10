import React from 'react';
import './SettingsPanel.css';

export default function SettingsPanel({ 
  settings, 
  onSettingsChange, 
  isOpen, 
  onClose 
}) {
  const handleChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: parseFloat(value) });
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
              <div className="setting-group">
                <h4>Morse Timing (Pro Mode)</h4>
                
                <div className="setting-item">
                  <label>
                    Dash Threshold
                    <span className="setting-hint">Hold duration to register as dash</span>
                  </label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="150"
                      max="500"
                      step="50"
                      value={settings.dashThreshold}
                      onChange={(e) => handleChange('dashThreshold', e.target.value)}
                    />
                    <span className="setting-value">{settings.dashThreshold}ms</span>
                  </div>
                </div>

                <div className="setting-item">
                  <label>
                    Letter Pause
                    <span className="setting-hint">Pause before starting new letter</span>
                  </label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="500"
                      max="3000"
                      step="100"
                      value={settings.letterPause}
                      onChange={(e) => handleChange('letterPause', e.target.value)}
                    />
                    <span className="setting-value">{(settings.letterPause / 1000).toFixed(1)}s</span>
                  </div>
                </div>

                <div className="setting-item">
                  <label>
                    Word Pause
                    <span className="setting-hint">Pause before starting new word</span>
                  </label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="1000"
                      max="5000"
                      step="200"
                      value={settings.wordPause}
                      onChange={(e) => handleChange('wordPause', e.target.value)}
                    />
                    <span className="setting-value">{(settings.wordPause / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </div>

              <div className="setting-group">
                <h4>Input Mode</h4>
                
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.keyboardEnabled}
                      onChange={(e) => onSettingsChange({ ...settings, keyboardEnabled: e.target.checked })}
                    />
                    Enable Keyboard (Spacebar)
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.twoButtonMode}
                      onChange={(e) => onSettingsChange({ ...settings, twoButtonMode: e.target.checked })}
                    />
                    Two-Button Mode (Z = Dot, X = Dash)
                  </label>
                </div>
              </div>

              <div className="setting-info">
                <p><strong>Professional Morse speeds:</strong></p>
                <p>• Beginner: 5-10 WPM (slower timing)</p>
                <p>• Intermediate: 10-20 WPM (default)</p>
                <p>• Expert: 20-40 WPM (faster timing)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}