import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './AppRouter.jsx'

// Hide SEO pre-render content when React loads
const seoContent = document.getElementById('seo-content');
if (seoContent) {
  seoContent.style.display = 'none';
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)