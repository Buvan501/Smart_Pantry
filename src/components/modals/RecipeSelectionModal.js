import React from 'react';
import { useAppContext } from '../../context/AppContext';

const RecipeSelectionModal = ({ isOpen, onClose, mealSlot }) => {
  const { mealPlans, setMealPlans, showNotification } = useAppContext();
  
  const recipeOptions = [
    'Spaghetti Carbonara',
    'Chicken Stir Fry',
    'Grilled Salmon',
    'Vegetable Curry'
  ];
  
  const selectRecipeForMeal = (recipeName) => {
    if (!mealSlot) return;
    
    const { day, meal } = mealSlot;
    
    setMealPlans(prevPlans => {
      const updatedPlans = { ...prevPlans };
      if (!updatedPlans[day]) updatedPlans[day] = {};
      updatedPlans[day][meal] = recipeName;
      return updatedPlans;
    });
    
    onClose();
    showNotification(`${recipeName} added to ${day} ${meal}!`, 'success');
  };

  return (
    <div id="recipeSelectionModal" className={`modal ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Select Recipe</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {mealSlot && (
          <div id="mealSlotInfo" style={{ marginBottom: '1rem', color: '#666' }}>
            Select a recipe for {mealSlot.meal} on {mealSlot.day}
          </div>
        )}
        
        <div className="recipe-selection-list">
          {recipeOptions.map((recipe, index) => (
            <div 
              key={index} 
              className="recipe-option" 
              onClick={() => selectRecipeForMeal(recipe)}
            >
              {recipe}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeSelectionModal;