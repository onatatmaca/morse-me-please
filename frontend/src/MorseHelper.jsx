import React, { useState } from 'react';
import './MorseHelper.css';

const MORSE_CODE = {
  // Letters A-Z
  'A': '·−', 'B': '−···', 'C': '−·−·', 'D': '−··', 'E': '·',
  'F': '··−·', 'G': '−−·', 'H': '····', 'I': '··', 'J': '·−−−',
  'K': '−·−', 'L': '·−··', 'M': '−−', 'N': '−·', 'O': '−−−',
  'P': '·−−·', 'Q': '−−·−', 'R': '·−·', 'S': '···', 'T': '−',
  'U': '··−', 'V': '···−', 'W': '·−−', 'X': '−··−', 'Y': '−·−−',
  'Z': '−−··',
  // Numbers 0-9
  '0': '−−−−−', '1': '·−−−−', '2': '··−−−', '3': '···−−',
  '4': '····−', '5': '·····', '6': '−····', '7': '−−···',
  '8': '−−−··', '9': '−−−−·',
  // Punctuation
  '.': '·−·−·−',  // Period
  ',': '−−··−−',  // Comma
  '?': '··−−··',  // Question mark
  "'": '·−−−−·',  // Apostrophe
  '"': '·−··−·',  // Quotation mark
  '!': '−·−·−−',  // Exclamation mark
  '/': '−··−·',   // Slash
  ':': '−−−···',  // Colon
  ';': '−·−·−·',  // Semicolon
  '(': '−·−−·',   // Opening parenthesis
  ')': '−·−−·−',  // Closing parenthesis
  '=': '−···−',   // Equals sign
  '-': '−····−',  // Hyphen
  '_': '··−−·−',  // Underscore
  '+': '·−·−·',   // Plus sign
  '@': '·−−·−·'   // At sign
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

            <div className="morse-section">
              <h4 className="morse-section-title">Letters (A-Z)</h4>
              <div className="morse-grid">
                {Object.entries(MORSE_CODE)
                  .filter(([char]) => /[A-Z]/.test(char))
                  .map(([letter, code]) => (
                    <div key={letter} className="morse-item">
                      <span className="morse-letter">{letter}</span>
                      <span className="morse-code">{code}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="morse-section">
              <h4 className="morse-section-title">Numbers (0-9)</h4>
              <div className="morse-grid">
                {Object.entries(MORSE_CODE)
                  .filter(([char]) => /[0-9]/.test(char))
                  .map(([number, code]) => (
                    <div key={number} className="morse-item">
                      <span className="morse-letter">{number}</span>
                      <span className="morse-code">{code}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="morse-section">
              <h4 className="morse-section-title">Punctuation</h4>
              <div className="morse-grid morse-grid-punctuation">
                {Object.entries(MORSE_CODE)
                  .filter(([char]) => !/[A-Z0-9]/.test(char))
                  .map(([punct, code]) => (
                    <div key={punct} className="morse-item">
                      <span className="morse-letter">{punct}</span>
                      <span className="morse-code">{code}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export MORSE_CODE for use in other components
export { MORSE_CODE };

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