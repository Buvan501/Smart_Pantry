import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const SmartShoppingAssistant = ({ toggleModal }) => {
  const { pantryItems, groceryList, setGroceryList, showNotification } = useAppContext();
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());

  const userPreferences = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('userPreferences') || '{}'); } catch { return {}; }
  }, []);

  const hasRestriction = (catOrName) => {
    const dr = (userPreferences.dietaryRestrictions||[]).map(s=>s.toLowerCase());
    if (dr.includes('vegetarian') || dr.includes('vegan')) {
      if (typeof catOrName === 'string') {
        return /meat|fish|poultry|salmon|chicken/i.test(catOrName);
      }
    }
    return false;
  };

  // Smart suggestions based on low stock and commonly used items
  const suggestions = useMemo(() => {
    const lowStockItems = pantryItems.filter(item => {
      const qty = parseInt(item.quantity || 0);
      return qty <= 2;
    });

    const healthyBoost = (userPreferences.goals||[]).includes('eat-healthier');

    const frequentItems = [
      { name: 'Milk', category: 'dairy', priority: 'high' },
      { name: 'Bread', category: 'grains', priority: 'medium' },
      { name: 'Eggs', category: 'dairy', priority: 'high' },
      { name: 'Chicken Breast', category: 'meat', priority: 'medium' },
      { name: 'Rice', category: 'grains', priority: 'low' },
      { name: 'Onions', category: 'vegetables', priority: 'medium' },
      { name: 'Tomatoes', category: 'vegetables', priority: 'medium' },
      { name: 'Olive Oil', category: 'condiments', priority: 'low' },
      ...(healthyBoost ? [
        { name: 'Spinach', category: 'vegetables', priority: 'high' },
        { name: 'Apples', category: 'fruits', priority: 'medium' }
      ] : [])
    ];

    const smartSuggestions = [
      ...lowStockItems.map(item => ({
        name: item.name,
        category: item.category,
        priority: 'high',
        reason: 'Low stock'
      })),
      ...frequentItems.filter(freq => 
        !hasRestriction(freq.category) &&
        !pantryItems.some(pantry => 
          pantry.name.toLowerCase().includes(freq.name.toLowerCase())
        ) &&
        !groceryList.some(grocery => 
          grocery.name.toLowerCase().includes(freq.name.toLowerCase())
        )
      ).map(item => ({
        ...item,
        reason: healthyBoost && (item.category === 'vegetables' || item.category === 'fruits') ? 'Healthy choice' : 'Commonly needed'
      }))
    ];

    return smartSuggestions.slice(0, 12);
  }, [pantryItems, groceryList, userPreferences]);

  const toggleSuggestion = (index) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const addSelectedToGroceryList = () => {
    const itemsToAdd = Array.from(selectedSuggestions).map(index => {
      const suggestion = suggestions[index];
      return {
        id: Date.now().toString() + Math.random(),
        name: suggestion.name,
        category: suggestion.category,
        quantity: '1',
        priority: suggestion.priority,
        completed: false,
        addedDate: new Date().toISOString()
      };
    });

    setGroceryList(prev => [...prev, ...itemsToAdd]);
    showNotification(`Added ${itemsToAdd.length} items to grocery list!`, 'success');
    setSelectedSuggestions(new Set());
  };

  return (
    <div className="smart-shopping-assistant">
      <div className="page-header">
        <h1 className="page-title">🛒 Smart Shopping Assistant</h1>
        <p className="page-subtitle">AI-powered suggestions based on your pantry</p>
      </div>

      <div className="suggestions-grid">
        <div className="suggestions-section">
          <h3>🎯 Suggested Items</h3>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className={`suggestion-item ${selectedSuggestions.has(index) ? 'selected' : ''}`}
                onClick={() => toggleSuggestion(index)}
              >
                <div className="suggestion-content">
                  <div className="suggestion-name">{suggestion.name}</div>
                  <div className="suggestion-meta">
                    <span className={`priority priority-${suggestion.priority}`}>
                      {suggestion.priority}
                    </span>
                    <span className="reason">{suggestion.reason}</span>
                  </div>
                </div>
                <div className="suggestion-checkbox">
                  {selectedSuggestions.has(index) && <i className="fas fa-check"></i>}
                </div>
              </div>
            ))}
          </div>

          {selectedSuggestions.size > 0 && (
            <button 
              className="btn btn-primary add-selected-btn"
              onClick={addSelectedToGroceryList}
            >
              <i className="fas fa-plus"></i>
              Add {selectedSuggestions.size} Selected Items
            </button>
          )}
        </div>

        <div className="shopping-insights">
          <h3>📊 Shopping Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Low Stock Alert</h4>
              <p>{pantryItems.filter(item => parseInt(item.quantity || 0) <= 2).length} items</p>
            </div>
            <div className="insight-card">
              <h4>Grocery List</h4>
              <p>{groceryList.length} items pending</p>
            </div>
            <div className="insight-card">
              <h4>Categories Needed</h4>
              <p>{new Set(suggestions.map(s => s.category)).size} categories</p>
            </div>
          </div>

          <div className="quick-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => toggleModal('addGroceryItemModal', true)}
            >
              <i className="fas fa-plus"></i>Add Custom Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartShoppingAssistant;
