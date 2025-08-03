import React, { useEffect, memo } from 'react';
import { useAppContext } from '../context/AppContext';

// Pages - use lazy loading to improve performance
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import MealPlanner from './pages/MealPlanner';
import GroceryList from './pages/GroceryList';
import Settings from './pages/Settings';

const MainContent = memo(({ activePage, toggleModal }) => {
  const { setActivePage } = useAppContext();
  
  // Effect to handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActivePage(hash);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActivePage]);

  return (
    <main className="main-content" id="main-content">
      <div id="dashboard" className={`page ${activePage === 'dashboard' ? 'active' : ''}`}>
        <Dashboard toggleModal={toggleModal} />
      </div>

      <div id="inventory" className={`page ${activePage === 'inventory' ? 'active' : ''}`}>
        <Inventory toggleModal={toggleModal} />
      </div>

      <div id="recipes" className={`page ${activePage === 'recipes' ? 'active' : ''}`}>
        <Recipes />
      </div>

      <div id="meal-planner" className={`page ${activePage === 'meal-planner' ? 'active' : ''}`}>
        <MealPlanner toggleModal={toggleModal} />
      </div>

      <div id="grocery-list" className={`page ${activePage === 'grocery-list' ? 'active' : ''}`}>
        <GroceryList toggleModal={toggleModal} />
      </div>

      <div id="settings" className={`page ${activePage === 'settings' ? 'active' : ''}`}>
        <Settings />
      </div>
    </main>
  );
});

export default MainContent;