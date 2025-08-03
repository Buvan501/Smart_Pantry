import React, { useState, useCallback, useEffect } from 'react';
import Notification from '../components/Notification';

/**
 * NotificationManager handles the display and management of notifications
 * It provides a clean API for creating and dismissing notifications
 */
const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  
  // Add a new notification to the stack
  const addNotification = useCallback(({
    type = 'info',
    message = '',
    title = '',
    duration = 5000,
    position = 'top-right',
    dismissible = true
  }) => {
    const id = `notification_${Date.now()}`;
    
    setNotifications(prev => [
      ...prev,
      { id, type, message, title, duration, position, dismissible }
    ]);
    
    return id;
  }, []);
  
  // Remove a notification from the stack
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  // Convenience methods for common notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({ type: 'success', message, ...options });
  }, [addNotification]);
  
  const showError = useCallback((message, options = {}) => {
    return addNotification({ type: 'error', message, ...options });
  }, [addNotification]);
  
  const showWarning = useCallback((message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options });
  }, [addNotification]);
  
  const showInfo = useCallback((message, options = {}) => {
    return addNotification({ type: 'info', message, ...options });
  }, [addNotification]);
  
  // Expose the API to the parent component
  React.useImperativeHandle(React.useRef(), () => ({
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }));
  
  return (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          title={notification.title}
          duration={notification.duration}
          position={notification.position}
          dismissible={notification.dismissible}
          onClose={removeNotification}
        />
      ))}
    </>
  );
};

export default NotificationManager;
