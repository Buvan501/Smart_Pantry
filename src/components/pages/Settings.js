import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAppContext } from '../../context/AppContext';

const Settings = memo(() => {
  const { 
    pantryItems, 
    mealPlans, 
    groceryList, 
    currentUser, 
    setCurrentUser, 
    showNotification,
    setActivePage,
    toggleModal,
    setPantryItems,
    setMealPlans,
    setGroceryList
  } = useAppContext();
  
  const [settings, setSettings] = useState(() =>
    JSON.parse(localStorage.getItem('smartPantrySettings') || '{}')
  );
  
  useEffect(() => {
    localStorage.setItem('smartPantrySettings', JSON.stringify(settings));
  }, [settings]);
  
  const requestBrowserNotifications = useCallback(async () => {
    if (!('Notification' in window)) {
      showNotification('Browser notifications not supported', 'error');
      return;
    }
    try {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        new Notification('Smart Pantry', { body: 'Notifications enabled!'});
        showNotification('Notifications enabled', 'success');
      } else if (res === 'denied') {
        showNotification('Notifications denied in browser', 'warning');
      }
    } catch {
      showNotification('Failed to request notifications', 'error');
    }
  }, [showNotification]);
  
  const toggleSetting = useCallback((settingName) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: !prev[settingName]
    }));
    
    const isActive = !settings[settingName];
    showNotification(
      `${settingName} ${isActive ? 'enabled' : 'disabled'}`, 
      isActive ? 'success' : 'info', 
      2000
    );
  }, [settings, showNotification]);
  
  const exportData = useCallback(() => {
    const data = { 
      pantryItems, 
      mealPlans, 
      groceryItems: groceryList, 
      userProfile: currentUser, 
      exportDate: new Date().toISOString(),
      version: 1
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart-pantry-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!', 'success');
  }, [pantryItems, mealPlans, groceryList, currentUser, showNotification]);
  
  const importData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const json = JSON.parse(e.target.result);
            if (!json || typeof json !== 'object') throw new Error('Invalid file');
            if (!Array.isArray(json.pantryItems) || !json.mealPlans || !Array.isArray(json.groceryItems)) {
              throw new Error('Missing required keys');
            }
            if (window.confirm('Import data and replace current items?')) {
              setPantryItems(json.pantryItems);
              setMealPlans(json.mealPlans);
              setGroceryList(json.groceryItems);
              if (json.userProfile) setCurrentUser(json.userProfile);
              showNotification('Data imported successfully!', 'success');
            }
          } catch (error) {
            showNotification('Error importing data', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setPantryItems, setMealPlans, setGroceryList, setCurrentUser, showNotification]);
  
  const resetApp = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);
  
  const deleteAccount = useCallback(() => {
    if (window.confirm('Are you sure you want to delete your account? This will remove all your data and cannot be undone.')) {
      localStorage.clear();
      setCurrentUser(null);
      showNotification('Account deleted. You will be redirected to the login page.', 'info');
      const timer = setTimeout(() => window.location.reload(), 2000);
      return () => clearTimeout(timer);
    }
  }, [setCurrentUser, showNotification]);
  
  const logout = useCallback(() => {
    localStorage.removeItem('smartPantryUser');
    setCurrentUser(null);
    toggleModal('authModal', true);
    showNotification('Logged out successfully', 'info');
  }, [setCurrentUser, toggleModal, showNotification]);
  
  const openEditProfileModal = useCallback(() => {
    toggleModal('editProfileModal', true);
  }, [toggleModal]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize your experience</p>
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header"><h2>Notifications</h2></div>
          <div className="card-content">
            <div className="setting-item">
              <div>
                <strong>Enable Browser Notifications</strong>
                <p>Allow Smart Pantry to send alerts</p>
              </div>
              <button className="btn btn-secondary" onClick={requestBrowserNotifications}>Enable</button>
            </div>
            <div className="setting-item">
              <div>
                <strong>Expiry Alerts</strong>
                <p>Get notified when items are about to expire</p>
              </div>
              <div 
                className={`toggle ${settings['Expiry Alerts'] ? 'active' : ''}`} 
                onClick={() => toggleSetting('Expiry Alerts')}
              ></div>
            </div>
            <div className="setting-item">
              <div>
                <strong>Low Stock Alerts</strong>
                <p>Get notified when items are running low</p>
              </div>
              <div 
                className={`toggle ${settings['Low Stock Alerts'] ? 'active' : ''}`} 
                onClick={() => toggleSetting('Low Stock Alerts')}
              ></div>
            </div>
            <div className="setting-item">
              <div>
                <strong>Daily Digest</strong>
                <p>Get a daily summary of expiring and low-stock items</p>
              </div>
              <div 
                className={`toggle ${settings['Daily Digest'] ? 'active' : ''}`} 
                onClick={() => toggleSetting('Daily Digest')}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>Data Management</h2></div>
          <div className="card-content">
            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={exportData}>
                <i className="fas fa-download"></i>Export Data
              </button>
              <button className="btn btn-secondary" onClick={importData}>
                <i className="fas fa-upload"></i>Import Data
              </button>
              <button className="btn btn-danger" onClick={resetApp}>
                <i className="fas fa-trash"></i>Reset App
              </button>
              <button className="btn btn-danger" onClick={deleteAccount}>
                <i className="fas fa-user-times"></i>Delete Account
              </button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header"><h2>Account</h2></div>
          <div className="card-content">
            <div className="action-buttons">
              <button 
                className="btn btn-primary" 
                onClick={openEditProfileModal}
                style={{
                  backgroundColor: '#667eea',
                  borderColor: '#667eea'
                }}
              >
                <i className="fas fa-user-edit"></i>Edit Profile
              </button>
              <button 
                className="btn btn-danger" 
                onClick={logout}
                style={{
                  backgroundColor: 'rgba(220, 53, 69, 0.9)',
                  borderColor: 'rgba(220, 53, 69, 1)'
                }}
              >
                <i className="fas fa-sign-out-alt"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default Settings;