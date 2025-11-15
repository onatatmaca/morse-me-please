// src/components/HamburgerMenu.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './HamburgerMenu.css';

function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="hamburger-button"
        onClick={toggleMenu}
        aria-label="Menu"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay (click to close) */}
      {isOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

      {/* Slide-out Menu */}
      <nav className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h3>Navigation</h3>
          <button className="menu-close" onClick={closeMenu}>✕</button>
        </div>

        <ul className="menu-list">
          <li>
            <Link
              to="/"
              className={`menu-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="menu-icon">⚡</span>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={`menu-link ${isActive('/about') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="menu-icon">ℹ️</span>
              <span>About</span>
            </Link>
          </li>
          <li>
            <Link
              to="/guide"
              className={`menu-link ${isActive('/guide') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="menu-icon">📖</span>
              <span>How to Use</span>
            </Link>
          </li>
          <li>
            <Link
              to="/privacy"
              className={`menu-link ${isActive('/privacy') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="menu-icon">🔒</span>
              <span>Privacy</span>
            </Link>
          </li>
        </ul>

        <div className="menu-footer">
          <p>Morse Me Please</p>
          <p className="menu-version">v1.0</p>
        </div>
      </nav>
    </>
  );
}

export default HamburgerMenu;
