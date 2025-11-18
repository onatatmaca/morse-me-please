// src/AppRouter.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import App from './App.jsx';
import About from './pages/About.jsx';
import Guide from './pages/Guide.jsx';
import Privacy from './pages/Privacy.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import HamburgerMenu from './components/HamburgerMenu.jsx';
import LandingOverlay from './components/LandingOverlay.jsx';

function AppContent() {
  const [showLandingOverlay, setShowLandingOverlay] = useState(true);
  const location = useLocation();

  const handleLandingEnter = () => {
    setShowLandingOverlay(false);
  };

  // Check if we're on the home page to show landing overlay
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname === '/admin';

  return (
    <>
      {/* Hamburger Menu - visible on all pages except admin */}
      {!isAdminPage && <HamburgerMenu />}

      {/* Landing Overlay - only on home page, only on first visit */}
      {isHomePage && showLandingOverlay && (
        <LandingOverlay onEnter={handleLandingEnter} />
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default AppRouter;
