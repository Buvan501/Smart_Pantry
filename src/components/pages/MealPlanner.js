import React from 'react';
import { useAppContext } from '../../context/AppContext';

const MealPlanner = ({ toggleModal }) => {
  const { mealPlans, setMealPlans, setCurrentMealSlot, setActivePage, showNotification, pantryItems, setGroceryList, groceryList } = useAppContext();
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  
  const openRecipeSelectionModal = (day, meal) => {
    setCurrentMealSlot({ day, meal });
    toggleModal('recipeSelectionModal', true);
  };
  
  const addMealToDay = (day, meal, recipeName) => {
    setMealPlans(prevPlans => {
      const updatedPlans = { ...prevPlans };
      if (!updatedPlans[day]) updatedPlans[day] = {};
      updatedPlans[day][meal] = recipeName;
      return updatedPlans;
    });
    showNotification(`${recipeName} added to ${day} ${meal}!`, 'success');
  };

  const clearWeek = () => {
    if (!window.confirm('Clear all meals for this week?')) return;
    setMealPlans({});
    showNotification('Cleared this week\'s meal plan', 'info');
  };

  const copyWeek = () => {
    if (!Object.keys(mealPlans||{}).length) {
      showNotification('Nothing to copy', 'info');
      return;
    }
    const copied = JSON.parse(JSON.stringify(mealPlans));
    setMealPlans(copied);
    showNotification('Copied this week\'s plan (you can edit)', 'success');
  };

  // naive recipe -> ingredients mapping for demo
  const recipeIngredients = (recipeName) => {
    const map = {
      'Chicken Stir Fry': [{name:'chicken', qty:1, category:'meat'}, {name:'broccoli', qty:1, category:'vegetables'}, {name:'soy sauce', qty:1, category:'condiments'}],
      'Pasta Primavera': [{name:'pasta', qty:1, category:'grains'}, {name:'tomato', qty:2, category:'vegetables'}],
      'Grilled Salmon': [{name:'salmon', qty:2, category:'meat'}, {name:'lemon', qty:1, category:'fruits'}],
      'Vegetable Curry': [{name:'mixed vegetables', qty:1, category:'vegetables'}, {name:'coconut milk', qty:1, category:'condiments'}],
    };
    return map[recipeName] || [];
  };

  const generateGroceryFromPlan = () => {
    // collect needed ingredients
    const needs = new Map();
    for (const day of days) {
      for (const meal of mealTypes) {
        const recipe = mealPlans[day]?.[meal];
        if (!recipe) continue;
        for (const ing of recipeIngredients(recipe)) {
          const key = ing.name.toLowerCase();
          const cur = needs.get(key) || { ...ing };
          cur.qty = (cur.qty || 0) + (ing.qty || 0);
          needs.set(key, cur);
        }
      }
    }
    if (needs.size === 0) {
      showNotification('No meals planned', 'info');
      return;
    }

    // subtract inventory
    const inventoryMap = new Map();
    (pantryItems||[]).forEach(i => inventoryMap.set(i.name.toLowerCase(), parseInt(i.quantity)||0));
    const toBuy = [];
    for (const [name, ing] of needs.entries()) {
      const have = inventoryMap.get(name) || 0;
      const needQty = Math.max(0, (ing.qty||0) - have);
      if (needQty > 0) {
        // avoid duplicates in grocery list by name
        const exists = (groceryList||[]).some(g => g.name.toLowerCase() === name);
        if (!exists) {
          toBuy.push({
            id: `${Date.now()}-${name}`,
            name,
            quantity: String(needQty),
            category: ing.category || 'other',
            priority: 'normal',
            notes: 'From meal plan',
            completed: false,
            addedDate: new Date().toISOString()
          });
        }
      }
    }

    if (toBuy.length === 0) {
      showNotification('All ingredients already available', 'success');
      return;
    }

    setGroceryList(prev => [...prev, ...toBuy]);
    showNotification(`Added ${toBuy.length} item(s) to grocery list`, 'success');
    setActivePage('grocery-list');
  };

  const onDragStart = (e, day, meal) => {
    const recipe = mealPlans[day]?.[meal];
    if (!recipe) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ day, meal }));
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, targetDay, targetMeal) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const sourceRecipe = mealPlans[data.day]?.[data.meal];
      if (!sourceRecipe) return;
      setMealPlans(prev => {
        const updated = { ...prev };
        if (!updated[targetDay]) updated[targetDay] = {};
        updated[targetDay][targetMeal] = sourceRecipe;
        // clear source
        if (updated[data.day]) delete updated[data.day][data.meal];
        return updated;
      });
      showNotification(`Moved ${sourceRecipe} to ${targetDay} ${targetMeal}`, 'success');
    } catch {}
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Meal Planner</h1>
        <p className="page-subtitle">Plan your weekly meals</p>
      </div>

      <div className="action-buttons">
        <button 
          className="btn btn-primary" 
          onClick={() => toggleModal('exportMealPlanModal', true)}
        >
          <i className="fas fa-download"></i>Export Plan
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => setActivePage('recipes')}
        >
          <i className="fas fa-search"></i>Browse Recipes
        </button>
        <button className="btn btn-secondary" onClick={generateGroceryFromPlan}>
          <i className="fas fa-list"></i>Generate Grocery List
        </button>
        <button className="btn btn-secondary" onClick={copyWeek}>
          <i className="fas fa-copy"></i>Copy Week
        </button>
        <button className="btn btn-danger" onClick={clearWeek}>
          <i className="fas fa-eraser"></i>Clear Week
        </button>
      </div>

      <div className="meal-plan-grid">
        {days.map(day => (
          <div key={day} className="day-column">
            <div className="day-header">{day}</div>
            {mealTypes.map(meal => (
              <div 
                key={`${day}-${meal}`} 
                className="meal-slot" 
                onClick={() => openRecipeSelectionModal(day, meal)}
                draggable={!!mealPlans[day]?.[meal]}
                onDragStart={(e)=>onDragStart(e, day, meal)}
                onDragOver={onDragOver}
                onDrop={(e)=>onDrop(e, day, meal)}
                title={mealPlans[day]?.[meal] ? 'Drag to move' : 'Click to add'}
              >
                <div className="meal-type">
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </div>
                <div className="meal-content">
                  {mealPlans[day]?.[meal] || 'Click to add'}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default MealPlanner;