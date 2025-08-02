import React from 'react';
import { useAppContext } from '../../context/AppContext';

const Recipes = () => {
  const { setCurrentMealSlot, toggleModal } = useAppContext();
  
  const selectRecipeForMeal = (recipeName) => {
    setCurrentMealSlot({
      day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      meal: 'dinner'
    });
    toggleModal('recipeSelectionModal', true);
  };
  
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Recipe Collection</h1>
        <p className="page-subtitle">Discover delicious meals</p>
      </div>

      <div className="recipe-grid">
        <div className="recipe-card">
          <div className="recipe-image" style={{
            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            height: '200px',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '3rem'
          }}>
            <i className="fas fa-utensils"></i>
          </div>
          <div className="recipe-content" style={{padding: '1.5rem'}}>
            <h3 className="recipe-title">Spaghetti Carbonara</h3>
            <p className="recipe-description">Classic Italian pasta dish with eggs, cheese, and pancetta</p>
            <div className="recipe-meta" style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '1rem 0',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <span><i className="fas fa-clock"></i> 20 mins</span>
              <span><i className="fas fa-users"></i> 4 servings</span>
            </div>
            <div className="recipe-actions" style={{display: 'flex', gap: '0.5rem'}}>
              <button 
                className="btn btn-primary" 
                onClick={() => selectRecipeForMeal('Spaghetti Carbonara')}
              >
                Add to Plan
              </button>
              <button className="btn btn-secondary">Save</button>
            </div>
          </div>
        </div>

        <div className="recipe-card">
          <div className="recipe-image" style={{
            background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
            height: '200px',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '3rem'
          }}>
            <i className="fas fa-leaf"></i>
          </div>
          <div className="recipe-content" style={{padding: '1.5rem'}}>
            <h3 className="recipe-title">Chicken Stir Fry</h3>
            <p className="recipe-description">Quick and healthy stir-fried chicken with vegetables</p>
            <div className="recipe-meta" style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '1rem 0',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <span><i className="fas fa-clock"></i> 15 mins</span>
              <span><i className="fas fa-users"></i> 3 servings</span>
            </div>
            <div className="recipe-actions" style={{display: 'flex', gap: '0.5rem'}}>
              <button 
                className="btn btn-primary" 
                onClick={() => selectRecipeForMeal('Chicken Stir Fry')}
              >
                Add to Plan
              </button>
              <button className="btn btn-secondary">Save</button>
            </div>
          </div>
        </div>

        <div className="recipe-card">
          <div className="recipe-image" style={{
            background: 'linear-gradient(45deg, #ffa726, #ff7043)',
            height: '200px',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '3rem'
          }}>
            <i className="fas fa-fish"></i>
          </div>
          <div className="recipe-content" style={{padding: '1.5rem'}}>
            <h3 className="recipe-title">Grilled Salmon</h3>
            <p className="recipe-description">Fresh salmon with herbs and lemon</p>
            <div className="recipe-meta" style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '1rem 0',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <span><i className="fas fa-clock"></i> 25 mins</span>
              <span><i className="fas fa-users"></i> 2 servings</span>
            </div>
            <div className="recipe-actions" style={{display: 'flex', gap: '0.5rem'}}>
              <button 
                className="btn btn-primary" 
                onClick={() => selectRecipeForMeal('Grilled Salmon')}
              >
                Add to Plan
              </button>
              <button className="btn btn-secondary">Save</button>
            </div>
          </div>
        </div>

        <div className="recipe-card">
          <div className="recipe-image" style={{
            background: 'linear-gradient(45deg, #ab47bc, #8e24aa)',
            height: '200px',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '3rem'
          }}>
            <i className="fas fa-seedling"></i>
          </div>
          <div className="recipe-content" style={{padding: '1.5rem'}}>
            <h3 className="recipe-title">Vegetable Curry</h3>
            <p className="recipe-description">Spiced vegetable curry with coconut milk</p>
            <div className="recipe-meta" style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '1rem 0',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <span><i className="fas fa-clock"></i> 30 mins</span>
              <span><i className="fas fa-users"></i> 4 servings</span>
            </div>
            <div className="recipe-actions" style={{display: 'flex', gap: '0.5rem'}}>
              <button 
                className="btn btn-primary" 
                onClick={() => selectRecipeForMeal('Vegetable Curry')}
              >
                Add to Plan
              </button>
              <button className="btn btn-secondary">Save</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Recipes;