import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useAppContext } from '../../context/AppContext';

const Dashboard = memo(({ toggleModal }) => {
  const { pantryItems, mealPlans, groceryList, getItemStatus, setActivePage, showNotification } = useAppContext();
  
  // Enhanced stats calculation with more insights
  const stats = useMemo(() => {
    const totalItems = pantryItems.length;
    const expiringItems = pantryItems.filter(item => getItemStatus(item.expiry) === 'expiring').length;
    const expiredItems = pantryItems.filter(item => getItemStatus(item.expiry) === 'expired').length;
    const lowStockItems = pantryItems.filter(item => {
      const qty = parseInt(item.quantity);
      return !isNaN(qty) && qty <= 2;
    }).length;
    
    // Category breakdown
    const categories = pantryItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    
    // Value estimation (if available)
    const estimatedValue = pantryItems.reduce((total, item) => {
      const price = parseFloat(item.price || 0);
      const qty = parseInt(item.quantity || 1);
      return total + (price * qty);
    }, 0);
    
    return {
      totalItems,
      expiringItems,
      expiredItems,
      lowStockItems,
      categories,
      estimatedValue,
      groceryCount: groceryList.length
    };
  }, [pantryItems, groceryList, getItemStatus]);

  // Generate alerts with useMemo
  const alerts = useMemo(() => {
    const alertList = [];
    
    pantryItems.forEach(item => {
      const status = getItemStatus(item.expiry);
      if (status === 'expired') alertList.push(`${item.name} has expired!`);
      else if (status === 'expiring') alertList.push(`${item.name} expires soon`);
      
      const qty = parseInt(item.quantity);
      if (!isNaN(qty) && qty <= 2) alertList.push(`${item.name} is running low`);
    });
    
    return alertList;
  }, [pantryItems, getItemStatus]);

  // Get today's planned meals with useMemo
  const todayMeals = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return mealPlans[today] || {};
  }, [mealPlans]);

  // Recipe suggestions (static, could be moved outside component if needed)
  const recipeSuggestions = useMemo(() => 
    ['Chicken Stir Fry', 'Pasta Primavera', 'Grilled Salmon', 'Vegetable Curry'],
    []
  );
  
  // Add recipe to meal plan with useCallback
  const addRecipeToMealPlan = useCallback((recipeName) => {
    showNotification(`${recipeName} would be added to your meal plan`, 'info');
  }, [showNotification]);

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
});

export default Dashboard;