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
              {/* ========== VOLUME CONTROLS ========== */}
              <div className="setting-group">
                <h4>🔊 Volume Controls</h4>

                <div className="setting-item">
                  <label>
                    My Morse Code Volume
                    <span className="setting-hint">Volume for your own morse sounds</span>
                  </label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.myVolume || 0.3}
                      onChange={(e) => handleNumericChange('myVolume', e.target.value)}
                    />
                    <span className="setting-value">{Math.round((settings.myVolume || 0.3) * 100)}%</span>
                  </div>
                </div>

                <div className="setting-item">
                  <label>
                    Partner's Morse Code Volume
                    <span className="setting-hint">Volume for partner's morse sounds</span>
                  </label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.partnerVolume || 0.3}
                      onChange={(e) => handleNumericChange('partnerVolume', e.target.value)}
                    />
                    <span className="setting-value">{Math.round((settings.partnerVolume || 0.3) * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* ========== FREQUENCY/SOUND CONTROLS ========== */}
              <div className="setting-group">
                <h4>🎹 Sound Frequency</h4>

                <div className="setting-item">
                  <label>
                    My Morse Code Frequency
                    <span className="setting-hint">Tone frequency for your own morse code</span>
                  </label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="300"
                      max="1200"
                      step="50"
                      value={settings.myFrequency || 600}
                      onChange={(e) => handleNumericChange('myFrequency', e.target.value)}
                    />
                    <span className="setting-value">{settings.myFrequency || 600} Hz</span>
                  </div>
                </div>

                <div className="setting-item">
                  <label>
                    Partner's Morse Code Frequency
                    <span className="setting-hint">Tone frequency for partner's morse code</span>
                  </label>
                  <div className="setting-control">
                    <input
                      type="range"
                      min="300"
                      max="1200"
                      step="50"
                      value={settings.partnerFrequency || 900}
                      onChange={(e) => handleNumericChange('partnerFrequency', e.target.value)}
                    />
                    <span className="setting-value">{settings.partnerFrequency || 900} Hz</span>
                  </div>
                </div>
              </div>

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
                      max="50"
                      step="1"
                      value={settings.wpm || 20}
                      onChange={(e) => handleNumericChange('wpm', e.target.value)}
                    />
                    <span className="setting-value">{settings.wpm || 20} WPM</span>
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
                <p><strong>💡 How Messaging Works:</strong></p>
                <p>You type morse code locally (no real-time transmission). When you finish typing and the message auto-sends, it's sent to your partner who hears it played back character-by-character at their WPM speed with their chosen frequency.</p>
                <p></p>
                <p><strong>🎧 Audio Controls:</strong></p>
                <p>Set separate volumes and frequencies for your own morse code and your partner's. This helps you distinguish who's sending!</p>
                <p></p>
                <p><strong>Professional WPM standards:</strong></p>
                <p>• <strong>Beginner:</strong> 5-10 WPM</p>
                <p>• <strong>Intermediate:</strong> 10-20 WPM</p>
                <p>• <strong>Expert:</strong> 20-50 WPM</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
