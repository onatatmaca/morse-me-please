import React, { useState } from 'react';
import './MorseHelper.css';

const MORSE_CODE = {
  'A': '·−', 'B': '−···', 'C': '−·−·', 'D': '−··', 'E': '·',
  'F': '··−·', 'G': '−−·', 'H': '····', 'I': '··', 'J': '·−−−',
  'K': '−·−', 'L': '·−··', 'M': '−−', 'N': '−·', 'O': '−−−',
  'P': '·−−·', 'Q': '−−·−', 'R': '·−·', 'S': '···', 'T': '−',
  'U': '··−', 'V': '···−', 'W': '·−−', 'X': '−··−', 'Y': '−·−−',
  'Z': '−−··',
  '0': '−−−−−', '1': '·−−−−', '2': '··−−−', '3': '···−−',
  '4': '····−', '5': '·····', '6': '−····', '7': '−−···',
  '8': '−−−··', '9': '−−−−·'
};

export default function MorseHelper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="morse-helper">
      <button
        className="helper-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="helper-icon">📖</span>
        <span className="helper-text">{isOpen ? 'Hide' : 'Morse'} Reference</span>
      </button>

      {isOpen && (
        <div className="helper-panel">
          <div className="helper-header">
            <h3>Morse Code Reference</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="helper-content">
            <div className="timing-info">
              <p><strong>How to use:</strong></p>
              <p>• Tap/release quickly for dot (·)</p>
              <p>• Hold longer for dash (−)</p>
              <p>• Pause creates letter space</p>
              <p>• Longer pause (|) creates word space</p>
              <p>• Customize timing in Settings ⚙️</p>
            </div>

            <div className="morse-grid">
              {Object.entries(MORSE_CODE).map(([letter, code]) => (
                <div key={letter} className="morse-item">
                  <span className="morse-letter">{letter}</span>
                  <span className="morse-code">{code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fixed translation function - removes spaces from individual morse characters
export function translateMorse(morseString) {
  // Create reverse lookup - morse patterns without internal spaces
  const reverseMorse = {};
  for (const [letter, code] of Object.entries(MORSE_CODE)) {
    // Remove all spaces from the morse pattern for lookup
    const cleanCode = code.replace(/\s+/g, '');
    reverseMorse[cleanCode] = letter;
  }
  
  // Split by word boundary marker |
  const words = morseString.split(' | ');
  
  return words.map(word => {
    // Split each word into letters (separated by single space)
    return word.trim()
      .split(' ')
      .filter(char => char.length > 0)
      .map(char => {
        // Remove any spaces within the character itself
        const cleanChar = char.replace(/\s+/g, '');
        return reverseMorse[cleanChar] || '?';
      })
      .join('');
  }).join(' ');
}