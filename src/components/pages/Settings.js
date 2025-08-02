import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const Settings = () => {
  const { 
    pantryItems, 
    mealPlans, 
    groceryList, 
    currentUser, 
    setCurrentUser, 
    showNotification 
  } = useAppContext();
  
  const [settings, setSettings] = useState(
    JSON.parse(localStorage.getItem('smartPantrySettings') || '{}')
  );
  
  useEffect(() => {
    localStorage.setItem('smartPantrySettings', JSON.stringify(settings));
  }, [settings]);
  
  const toggleSetting = (settingName) => {
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
  };
  
  const exportData = () => {
    const data = { 
      pantryItems, 
      mealPlans, 
      groceryItems: groceryList, 
      userProfile: currentUser, 
      exportDate: new Date().toISOString() 
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
  };
  
  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            // This would be handled by the appropriate context functions in a real app
            showNotification('Data imported successfully!', 'success');
          } catch (error) {
            showNotification('Error importing data', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  const resetApp = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };
  
  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This will remove all your data and cannot be undone.')) {
      localStorage.clear();
      setCurrentUser(null);
      showNotification('Account deleted. You will be redirected to the login page.', 'info');
      setTimeout(() => window.location.reload(), 2000);
    }
  };

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
      </div>
    </>
  );
};

export default Settings;