import React, { memo, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

const Sidebar = memo(({ isVisible, toggleSidebar, currentUser, toggleModal }) => {
  const { activePage, setActivePage, setCurrentUser, showNotification } = useAppContext();
  
  const showPage = useCallback((pageId) => {
    setActivePage(pageId);
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  }, [setActivePage, toggleSidebar]);

  const logout = useCallback(() => {
    localStorage.removeItem('smartPantryUser');
    setCurrentUser(null);
    toggleModal('authModal', true);
    showNotification('Logged out successfully', 'info');
  }, [setCurrentUser, showNotification, toggleModal]);

  const openEditProfileModal = useCallback((e) => {
    if (e) e.stopPropagation();
    toggleModal('editProfileModal', true);
  }, [toggleModal]);

  return (
    <nav className={`sidebar ${isVisible ? 'mobile-visible' : ''}`} id="sidebar">
      <div className="logo">
        <h1><i className="fas fa-utensils"></i> Smart Pantry</h1>
        <p>Your Kitchen Assistant</p>
      </div>

      {currentUser && (
        <div className="user-profile" style={{ display: 'block' }}>
          <div onClick={openEditProfileModal} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', marginBottom: '0.5rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <div style={{ width: '50px', height: '50px', background: '#667eea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', color: 'white' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>{currentUser.email}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); openEditProfileModal(); }} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'rgba(255,255,255,0.7)', 
                  cursor: 'pointer', 
                  padding: '0.3rem' 
                }} 
                title="Edit Profile"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); logout(); }} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'rgba(255,255,255,0.7)', 
                  cursor: 'pointer', 
                  padding: '0.3rem' 
                }} 
                title="Logout"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
          
          {/* Prominent Logout Button */}
          <button 
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(220, 53, 69, 0.2)',
              color: '#fff',
              border: '1px solid rgba(220, 53, 69, 0.4)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              marginBottom: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
            title="Log out of your account"
          >
            <i className="fas fa-sign-out-alt"></i> 
            <span>Logout</span>
          </button>
        </div>
      )}

      <ul className="nav-menu">
        <li className="nav-item">
          <a href="#" className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`} 
             onClick={() => showPage('dashboard')}>
            <i className="fas fa-tachometer-alt"></i>Dashboard
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className={`nav-link ${activePage === 'inventory' ? 'active' : ''}`} 
             onClick={() => showPage('inventory')}>
            <i className="fas fa-boxes"></i>Pantry Inventory
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className={`nav-link ${activePage === 'recipes' ? 'active' : ''}`} 
             onClick={() => showPage('recipes')}>
            <i className="fas fa-utensils"></i>Recipes
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className={`nav-link ${activePage === 'meal-planner' ? 'active' : ''}`} 
             onClick={() => showPage('meal-planner')}>
            <i className="fas fa-calendar-alt"></i>Meal Planner
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className={`nav-link ${activePage === 'grocery-list' ? 'active' : ''}`} 
             onClick={() => showPage('grocery-list')}>
            <i className="fas fa-shopping-cart"></i>Grocery List
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className={`nav-link ${activePage === 'settings' ? 'active' : ''}`} 
             onClick={() => showPage('settings')}>
            <i className="fas fa-cog"></i>Settings
          </a>
        </li>
      </ul>
    </nav>
  );
});

export default Sidebar;