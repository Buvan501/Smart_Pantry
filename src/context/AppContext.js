import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children, value }) => {
  const [pantryItems, setPantryItems] = useState(
    JSON.parse(localStorage.getItem('pantryItems') || '[]')
  );
  const [mealPlans, setMealPlans] = useState(
    JSON.parse(localStorage.getItem('mealPlans') || '{}')
  );
  const [groceryList, setGroceryList] = useState(
    JSON.parse(localStorage.getItem('groceryList') || '[]')
  );

  // Save data when it changes
  useEffect(() => {
    localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
  }, [mealPlans]);

  useEffect(() => {
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
  }, [groceryList]);

  // Item status utility
  const getItemStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'expiring';
    return 'fresh';
  };

  return (
    <AppContext.Provider value={{
      ...value,
      pantryItems,
      setPantryItems,
      mealPlans,
      setMealPlans,
      groceryList,
      setGroceryList,
      getItemStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;