import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const Dashboard = ({ toggleModal }) => {
  const { pantryItems, mealPlans, getItemStatus, setActivePage } = useAppContext();
  const [stats, setStats] = useState({
    totalItems: 0,
    expiringItems: 0,
    expiredItems: 0,
    lowStockItems: 0
  });
  
  useEffect(() => {
    // Update dashboard stats
    const totalItems = pantryItems.length;
    const expiringItems = pantryItems.filter(item => getItemStatus(item.expiry) === 'expiring').length;
    const expiredItems = pantryItems.filter(item => getItemStatus(item.expiry) === 'expired').length;
    const lowStockItems = pantryItems.filter(item => parseInt(item.quantity) <= 2).length;
    
    setStats({
      totalItems,
      expiringItems,
      expiredItems,
      lowStockItems
    });
  }, [pantryItems, getItemStatus]);

  // Generate alerts
  const generateAlerts = () => {
    const alerts = [];
    
    pantryItems.forEach(item => {
      const status = getItemStatus(item.expiry);
      if (status === 'expired') alerts.push(`${item.name} has expired!`);
      else if (status === 'expiring') alerts.push(`${item.name} expires soon`);
      if (parseInt(item.quantity) <= 2) alerts.push(`${item.name} is running low`);
    });
    
    return alerts;
  };
  
  const alerts = generateAlerts();

  // Get today's planned meals
  const getTodaysPlannedMeals = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return mealPlans[today] || {};
  };
  
  const todayMeals = getTodaysPlannedMeals();

  // Recipe suggestions
  const recipeSuggestions = ['Chicken Stir Fry', 'Pasta Primavera', 'Grilled Salmon', 'Vegetable Curry'];
  
  // Add recipe to meal plan
  const addRecipeToMealPlan = (recipeName) => {
    const { showNotification } = useAppContext();
    showNotification(`${recipeName} would be added to your meal plan`, 'info');
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to your Smart Pantry</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalItems}</div>
          <div className="stat-label">Items in Pantry</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.expiringItems}</div>
          <div className="stat-label">Expiring Soon</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.expiredItems}</div>
          <div className="stat-label">Expired Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.lowStockItems}</div>
          <div className="stat-label">Low Stock</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h2>Notifications</h2></div>
          <div className="card-content">
            {alerts.length > 0 ? (
              alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="alert">{alert}</div>
              ))
            ) : (
              <div className="no-alerts">No alerts - everything looks good!</div>
            )}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header"><h2>Quick Actions</h2></div>
          <div className="card-content">
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={() => toggleModal('addItemModal', true)}>
                <i className="fas fa-plus"></i>Add Item
              </button>
              <button className="btn btn-secondary" onClick={() => setActivePage('meal-planner')}>
                <i className="fas fa-calendar-plus"></i>Plan Meals
              </button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header"><h2>This Week's Plan</h2></div>
          <div className="card-content">
            <div className="meal-preview">
              <strong>Today's Meals:</strong>
              <div>Breakfast: {todayMeals.breakfast || 'Not planned'}</div>
              <div>Lunch: {todayMeals.lunch || 'Not planned'}</div>
              <div>Dinner: {todayMeals.dinner || 'Not planned'}</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header"><h2>Recipe Suggestions</h2></div>
          <div className="card-content">
            {recipeSuggestions.map((recipe, index) => (
              <div 
                key={index} 
                className="recipe-suggestion" 
                onClick={() => addRecipeToMealPlan(recipe)}
              >
                {recipe}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;