import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  pantryItems: [],
  mealPlans: {},
  groceryList: [],
  isLoading: false,
  error: null
};

// Action types
const ACTION_TYPES = {
  SET_PANTRY_ITEMS: 'SET_PANTRY_ITEMS',
  ADD_PANTRY_ITEM: 'ADD_PANTRY_ITEM',
  UPDATE_PANTRY_ITEM: 'UPDATE_PANTRY_ITEM',
  DELETE_PANTRY_ITEM: 'DELETE_PANTRY_ITEM',
  
  SET_MEAL_PLANS: 'SET_MEAL_PLANS',
  ADD_MEAL_PLAN: 'ADD_MEAL_PLAN',
  UPDATE_MEAL_PLAN: 'UPDATE_MEAL_PLAN',
  DELETE_MEAL_PLAN: 'DELETE_MEAL_PLAN',
  
  SET_GROCERY_LIST: 'SET_GROCERY_LIST',
  ADD_GROCERY_ITEM: 'ADD_GROCERY_ITEM',
  UPDATE_GROCERY_ITEM: 'UPDATE_GROCERY_ITEM',
  DELETE_GROCERY_ITEM: 'DELETE_GROCERY_ITEM',
  
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_PANTRY_ITEMS:
      return { ...state, pantryItems: action.payload };
    
    case ACTION_TYPES.ADD_PANTRY_ITEM:
      return { 
        ...state, 
        pantryItems: [...state.pantryItems, action.payload] 
      };
    
    case ACTION_TYPES.UPDATE_PANTRY_ITEM:
      return { 
        ...state, 
        pantryItems: state.pantryItems.map(item => 
          item.id === action.payload.id ? action.payload : item
        ) 
      };
    
    case ACTION_TYPES.DELETE_PANTRY_ITEM:
      return { 
        ...state, 
        pantryItems: state.pantryItems.filter(item => item.id !== action.payload)
      };
    
    case ACTION_TYPES.SET_MEAL_PLANS:
      return { ...state, mealPlans: action.payload };
    
    case ACTION_TYPES.ADD_MEAL_PLAN:
      const { date, mealType, recipe } = action.payload;
      return { 
        ...state, 
        mealPlans: {
          ...state.mealPlans,
          [date]: {
            ...(state.mealPlans[date] || {}),
            [mealType]: recipe
          }
        } 
      };
    
    case ACTION_TYPES.DELETE_MEAL_PLAN:
      const { delDate, delMealType } = action.payload;
      const updatedMealPlans = { ...state.mealPlans };
      
      if (updatedMealPlans[delDate]) {
        const updatedDayPlan = { ...updatedMealPlans[delDate] };
        delete updatedDayPlan[delMealType];
        
        if (Object.keys(updatedDayPlan).length === 0) {
          delete updatedMealPlans[delDate];
        } else {
          updatedMealPlans[delDate] = updatedDayPlan;
        }
      }
      
      return { ...state, mealPlans: updatedMealPlans };
      
    case ACTION_TYPES.SET_GROCERY_LIST:
      return { ...state, groceryList: action.payload };
    
    case ACTION_TYPES.ADD_GROCERY_ITEM:
      return { 
        ...state, 
        groceryList: [...state.groceryList, action.payload] 
      };
    
    case ACTION_TYPES.UPDATE_GROCERY_ITEM:
      return { 
        ...state, 
        groceryList: state.groceryList.map(item => 
          item.id === action.payload.id ? action.payload : item
        ) 
      };
    
    case ACTION_TYPES.DELETE_GROCERY_ITEM:
      return { 
        ...state, 
        groceryList: state.groceryList.filter(item => item.id !== action.payload)
      };
    
    case ACTION_TYPES.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Custom hook for using the context
export const useAppContext = () => useContext(AppContext);

// Provider component
export const AppProvider = ({ children, value }) => {
  // Load initial state from localStorage
  const loadInitialState = () => {
    try {
      return {
        ...initialState,
        pantryItems: JSON.parse(localStorage.getItem('pantryItems') || '[]'),
        mealPlans: JSON.parse(localStorage.getItem('mealPlans') || '{}'),
        groceryList: JSON.parse(localStorage.getItem('groceryList') || '[]')
      };
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      return initialState;
    }
  };

  const [state, dispatch] = useReducer(appReducer, null, loadInitialState);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('pantryItems', JSON.stringify(state.pantryItems));
  }, [state.pantryItems]);

  useEffect(() => {
    localStorage.setItem('mealPlans', JSON.stringify(state.mealPlans));
  }, [state.mealPlans]);

  useEffect(() => {
    localStorage.setItem('groceryList', JSON.stringify(state.groceryList));
  }, [state.groceryList]);

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

  // Actions
  const actions = {
    setPantryItems: (items) => dispatch({ type: ACTION_TYPES.SET_PANTRY_ITEMS, payload: items }),
    addPantryItem: (item) => dispatch({ type: ACTION_TYPES.ADD_PANTRY_ITEM, payload: { ...item, status: getItemStatus(item.expiry) } }),
    updatePantryItem: (item) => dispatch({ type: ACTION_TYPES.UPDATE_PANTRY_ITEM, payload: { ...item, status: getItemStatus(item.expiry) } }),
    deletePantryItem: (id) => dispatch({ type: ACTION_TYPES.DELETE_PANTRY_ITEM, payload: id }),
    
    setMealPlans: (plans) => dispatch({ type: ACTION_TYPES.SET_MEAL_PLANS, payload: plans }),
    addMealPlan: (date, mealType, recipe) => dispatch({ type: ACTION_TYPES.ADD_MEAL_PLAN, payload: { date, mealType, recipe } }),
    deleteMealPlan: (date, mealType) => dispatch({ type: ACTION_TYPES.DELETE_MEAL_PLAN, payload: { delDate: date, delMealType: mealType } }),
    
    setGroceryList: (items) => dispatch({ type: ACTION_TYPES.SET_GROCERY_LIST, payload: items }),
    addGroceryItem: (item) => dispatch({ type: ACTION_TYPES.ADD_GROCERY_ITEM, payload: item }),
    updateGroceryItem: (item) => dispatch({ type: ACTION_TYPES.UPDATE_GROCERY_ITEM, payload: item }),
    deleteGroceryItem: (id) => dispatch({ type: ACTION_TYPES.DELETE_GROCERY_ITEM, payload: id }),
    
    setLoading: (isLoading) => dispatch({ type: ACTION_TYPES.SET_LOADING, payload: isLoading }),
    setError: (error) => dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error })
  };

  return (
    <AppContext.Provider 
      value={{
        ...value,
        ...state,
        ...actions,
        getItemStatus,
        dispatch,
        ACTION_TYPES
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
