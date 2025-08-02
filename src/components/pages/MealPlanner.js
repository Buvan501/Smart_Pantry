import React from 'react';
import { useAppContext } from '../../context/AppContext';

const MealPlanner = ({ toggleModal }) => {
  const { mealPlans, setMealPlans, setCurrentMealSlot, setActivePage, showNotification } = useAppContext();
  
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