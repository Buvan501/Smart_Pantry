import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './styles.css';

// Components
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import AuthModal from './components/modals/AuthModal';
import AddItemModal from './components/modals/AddItemModal';
import EditItemModal from './components/modals/EditItemModal';
import RecipeSelectionModal from './components/modals/RecipeSelectionModal';
import ExportMealPlanModal from './components/modals/ExportMealPlanModal';
import EditProfileModal from './components/modals/EditProfileModal';
import AddGroceryItemModal from './components/modals/AddGroceryItemModal';
import Notification from './components/Notification';

// Context
import { AppProvider } from './context/AppContext';

function App() {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('smartPantryUser') || 'null'));
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

  // Show notification
  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  // Modal controls
  const toggleModal = (modalName, isOpen = null) => {
    setModals(prevModals => ({
      ...prevModals,
      [modalName]: isOpen !== null ? isOpen : !prevModals[modalName]
    }));
  };

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

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
        <div className="app-container">
          <button className="mobile-toggle" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
          
          <Sidebar 
            isVisible={sidebarVisible} 
            toggleSidebar={toggleSidebar}
            currentUser={currentUser}
            toggleModal={toggleModal}
          />
          
          <MainContent 
            activePage={activePage} 
            setActivePage={setActivePage}
            toggleModal={toggleModal}
          />
        </div>

        {/* Modals */}
        <AuthModal 
          isOpen={modals.authModal} 
          onClose={() => toggleModal('authModal', false)}
        />
        
        <AddItemModal 
          isOpen={modals.addItemModal} 
          onClose={() => toggleModal('addItemModal', false)}
        />
        
        <EditItemModal 
          isOpen={modals.editItemModal} 
          onClose={() => toggleModal('editItemModal', false)}
          itemToEdit={currentEditingItem}
        />
        
        <RecipeSelectionModal 
          isOpen={modals.recipeSelectionModal} 
          onClose={() => toggleModal('recipeSelectionModal', false)}
          mealSlot={currentMealSlot}
        />
        
        <ExportMealPlanModal 
          isOpen={modals.exportMealPlanModal} 
          onClose={() => toggleModal('exportMealPlanModal', false)}
        />
        
        <EditProfileModal 
          isOpen={modals.editProfileModal} 
          onClose={() => toggleModal('editProfileModal', false)}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
        
        <AddGroceryItemModal 
          isOpen={modals.addGroceryItemModal} 
          onClose={() => toggleModal('addGroceryItemModal', false)}
        />
        
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            id={notification.id}
          />
        )}
      </Router>
    </AppProvider>
  );
}

export default App;