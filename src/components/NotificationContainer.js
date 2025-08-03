import React, { useState, useCallback } from 'react';
import Notification from './Notification';

/**
 * NotificationContainer manages multiple notifications
 * Provides an API to create and remove notifications of different types
 */
const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  // Generate a unique ID for each notification
  const generateId = () => `notification_${Date.now()}`;

  // Add a notification
  const addNotification = useCallback((options) => {
    const id = options.id || generateId();
    const newNotification = {
      id,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || 3000,
      position: options.position || 'top-right',
      dismissible: options.dismissible !== undefined ? options.dismissible : true,
      onClose: options.onClose
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  // Remove a notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && notification.onClose) {
        notification.onClose(id);
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  // Helper functions for common notification types
  const notify = {
    success: (message, options = {}) => addNotification({ message, type: 'success', ...options }),
    error: (message, options = {}) => addNotification({ message, type: 'error', ...options }),
    warning: (message, options = {}) => addNotification({ message, type: 'warning', ...options }),
    info: (message, options = {}) => addNotification({ message, type: 'info', ...options })
  };

  // Expose the notification API to parent components
  React.useImperativeHandle(React.useRef(), () => ({
    addNotification,
    removeNotification,
    ...notify
  }));

  return (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          position={notification.position}
          dismissible={notification.dismissible}
          onClose={removeNotification}
        />
      ))}
    </>
  );
};

// Create a context for accessing notifications anywhere in the app
const NotificationContext = React.createContext(null);

export const NotificationProvider = ({ children }) => {
  const notificationRef = React.useRef();

  const value = React.useMemo(() => ({
    // Forward these methods to the NotificationContainer
    success: (message, options) => notificationRef.current?.success(message, options),
    error: (message, options) => notificationRef.current?.error(message, options),
    warning: (message, options) => notificationRef.current?.warning(message, options),
    info: (message, options) => notificationRef.current?.info(message, options),
    add: (options) => notificationRef.current?.addNotification(options),
    remove: (id) => notificationRef.current?.removeNotification(id)
  }), []);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer ref={notificationRef} />
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContainer;
