import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './styles.css';

// Context
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './components/NotificationContainer';

// Base Components
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Notification from './components/Notification';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded Modal Components
const AuthModal = lazy(() => import('./components/modals/AuthModal'));
const AddItemModal = lazy(() => import('./components/modals/AddItemModal'));
const EditItemModal = lazy(() => import('./components/modals/EditItemModal'));
const RecipeSelectionModal = lazy(() => import('./components/modals/RecipeSelectionModal'));
const ExportMealPlanModal = lazy(() => import('./components/modals/ExportMealPlanModal'));
const EditProfileModal = lazy(() => import('./components/modals/EditProfileModal'));
const AddGroceryItemModal = lazy(() => import('./components/modals/AddGroceryItemModal'));

// Loading Fallback
const LoadingFallback = () => (
  <div className="modal-loading-fallback" aria-label="Loading content">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  // User state with safe parsing
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smartPantryUser') || 'null');
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  });
  
  const [activePage, setActivePage] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [modals, setModals] = useState({
    authModal: !currentUser,
    addItemModal: false,
    editItemModal: false,
    recipeSelectionModal: false,
    exportMealPlanModal: false,
    editProfileModal: false,
    addGroceryItemModal: false
  });
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth > 768);
  const [currentEditingItem, setCurrentEditingItem] = useState(null);
  const [currentMealSlot, setCurrentMealSlot] = useState(null);

  // Show notification with memoization
  const showNotification = useCallback((message, type = 'success', duration = 3000) => {
    setNotification({ message, type, id: Date.now() });
    const timer = setTimeout(() => {
      setNotification(null);
    }, duration);
    
    // Clear timeout if component unmounts
    return () => clearTimeout(timer);
  }, []);

  // Modal controls with memoization
  const toggleModal = useCallback((modalName, isOpen = null) => {
    setModals(prevModals => ({
      ...prevModals,
      [modalName]: isOpen !== null ? isOpen : !prevModals[modalName]
    }));
  }, []);

  // Toggle sidebar for mobile with memoization
  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  // Check auth status on load
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('smartPantryUser') || 'null');
    if (storedUser) {
      setCurrentUser(storedUser);
      toggleModal('authModal', false);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarVisible(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider value={{
        currentUser,
        setCurrentUser,
        activePage,
        setActivePage,
        showNotification,
        toggleModal,
        currentEditingItem,
        setCurrentEditingItem,
        currentMealSlot,
        setCurrentMealSlot
      }}>
        <Router>
          <div className="app-container" role="application">
            <button 
              className="mobile-toggle" 
              onClick={toggleSidebar}
              aria-label="Toggle sidebar menu"
              aria-expanded={sidebarVisible}
            >
              <i className="fas fa-bars" aria-hidden="true"></i>
            </button>
            
            <Sidebar 
              isVisible={sidebarVisible} 
              toggleSidebar={toggleSidebar}
              currentUser={currentUser}
              toggleModal={toggleModal}
            />
            
            <ErrorBoundary fallback={(error) => (
              <div className="main-error-container">
                <h2>Error loading content</h2>
                <p>Sorry, we encountered a problem loading this page.</p>
                <button onClick={() => window.location.reload()}>Reload Page</button>
              </div>
            )}>
              <MainContent 
                activePage={activePage} 
                setActivePage={setActivePage}
                toggleModal={toggleModal}
              />
            </ErrorBoundary>
          </div>

          {/* Modals with Suspense for lazy loading */}
          <Suspense fallback={<LoadingFallback />}>
            {modals.authModal && (
              <AuthModal 
                isOpen={modals.authModal} 
                onClose={() => toggleModal('authModal', false)}
              />
            )}
            
            {modals.addItemModal && (
              <AddItemModal 
                isOpen={modals.addItemModal} 
                onClose={() => toggleModal('addItemModal', false)}
              />
            )}
            
            {modals.editItemModal && (
              <EditItemModal 
                isOpen={modals.editItemModal} 
                onClose={() => toggleModal('editItemModal', false)}
                itemToEdit={currentEditingItem}
              />
            )}
            
            {modals.recipeSelectionModal && (
              <RecipeSelectionModal 
                isOpen={modals.recipeSelectionModal} 
                onClose={() => toggleModal('recipeSelectionModal', false)}
                mealSlot={currentMealSlot}
              />
            )}
            
            {modals.exportMealPlanModal && (
              <ExportMealPlanModal 
                isOpen={modals.exportMealPlanModal} 
                onClose={() => toggleModal('exportMealPlanModal', false)}
              />
            )}
            
            {modals.editProfileModal && (
              <EditProfileModal 
                isOpen={modals.editProfileModal} 
                onClose={() => toggleModal('editProfileModal', false)}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            )}
            
            {modals.addGroceryItemModal && (
              <AddGroceryItemModal 
                isOpen={modals.addGroceryItemModal} 
                onClose={() => toggleModal('addGroceryItemModal', false)}
              />
            )}
          </Suspense>
          
          {notification && (
            <Notification 
              message={notification.message} 
              type={notification.type} 
              id={notification.id}
            />
          )}
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;