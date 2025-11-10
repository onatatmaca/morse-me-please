import React from 'react';
import './ControlPanel.css';

export default function ControlPanel({ 
  onPassTurn, 
  onDisconnect, 
  onFindNew,
  disabled,
  inactivityCountdown 
}) {
  return (
    <div className="control-panel">
      <button 
        onClick={onPassTurn} 
        disabled={disabled} 
        className="control-btn pass-turn-btn"
      >
        <span className="btn-icon">✓</span>
        <span className="btn-text">Pass Turn</span>
        {inactivityCountdown > 0 && (
          <span className="countdown-badge">{inactivityCountdown}s</span>
        )}
      </button>

      <button 
        onClick={onFindNew} 
        className="control-btn find-new-btn"
      >
        <span className="btn-icon">🔄</span>
        <span className="btn-text">Find New Partner</span>
      </button>

      <button 
        onClick={onDisconnect} 
        className="control-btn disconnect-btn"
      >
        <span className="btn-icon">✕</span>
        <span className="btn-text">Disconnect</span>
      </button>
    </div>
  );
}