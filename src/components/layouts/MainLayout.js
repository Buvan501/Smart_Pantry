import React, { useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

/**
 * MainLayout component - Handles the main layout structure and responsiveness
 */
const MainLayout = ({ children, sidebarVisible, toggleSidebar }) => {
  const location = useLocation();
  const { setActivePage } = useAppContext();
  
  // Update active page based on URL
  useEffect(() => {
    const pathname = location.pathname.replace('/', '') || 'dashboard';
    setActivePage(pathname);
  }, [location, setActivePage]);
  
  // Close sidebar on route change in mobile view
  useEffect(() => {
    if (window.innerWidth <= 768) {
      toggleSidebar(false);
    }
  }, [location, toggleSidebar]);

  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback((e) => {
    // Escape key closes sidebar on mobile
    if (e.key === 'Escape' && window.innerWidth <= 768 && sidebarVisible) {
      toggleSidebar(false);
    }
  }, [sidebarVisible, toggleSidebar]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div 
      className="main-layout"
      style={{
        display: 'flex',
        minHeight: '100vh',
        position: 'relative'
      }}
    >
      {children}
      
      {/* Overlay for mobile sidebar */}
      {sidebarVisible && window.innerWidth <= 768 && (
        <div
          className="sidebar-overlay"
          onClick={() => toggleSidebar(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 900
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default React.memo(MainLayout);
