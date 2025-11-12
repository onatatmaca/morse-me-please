import React from 'react';
import './ControlPanel.css';

export default function ControlPanel({
  onDisconnect,
  onFindNew
}) {
  return (
    <div className="control-panel">
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