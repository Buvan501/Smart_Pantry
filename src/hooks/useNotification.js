import { useContext, createContext } from 'react';

// Create context for notification system
const NotificationContext = createContext(null);

/**
 * Provider component that wraps app and makes notification functions available
 * to all child components
 */
export const NotificationProvider = ({ children }) => {
  // Notification state storage
  const notifications = [];
  const notificationRefs = {};

  // Add a new notification
  const showNotification = (options) => {
    const id = options.id || `notification_${Date.now()}`;
    const type = options.type || 'info';
    const message = options.message || '';
    const title = options.title || '';
    const duration = options.duration || 5000;
    const position = options.position || 'top-right';
    
    // Store the notification
    notifications.push({
      id,
      type,
      message,
      title,
      duration,
      position,
    });
    
    // Return the ID so it can be used to dismiss the notification
    return id;
  };
  
  // Convenience methods for different notification types
  const success = (message, options = {}) => showNotification({ type: 'success', message, ...options });
  const error = (message, options = {}) => showNotification({ type: 'error', message, ...options });
  const warning = (message, options = {}) => showNotification({ type: 'warning', message, ...options });
  const info = (message, options = {}) => showNotification({ type: 'info', message, ...options });
  
  // Dismiss a notification
  const dismissNotification = (id) => {
    // Find the notification and remove it
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.splice(index, 1);
    }
    
    // Call the dismiss function if it exists
    if (notificationRefs[id]) {
      notificationRefs[id].dismiss();
      delete notificationRefs[id];
    }
  };
  
  // Register a notification ref for later dismissal
  const registerNotification = (id, ref) => {
    notificationRefs[id] = ref;
  };
  
  // The notification API
  const notificationAPI = {
    show: showNotification,
    dismiss: dismissNotification,
    register: registerNotification,
    success,
    error,
    warning,
    info,
  };
  
  return (
    <NotificationContext.Provider value={notificationAPI}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook that allows any component to access the notification API
 * @returns {Object} The notification API
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};
