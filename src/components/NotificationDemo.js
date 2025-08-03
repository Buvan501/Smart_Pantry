import React, { useState } from 'react';
import Notification from './Notification';

/**
 * Demo component to showcase the Notification component
 */
const NotificationDemo = () => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = (type, position) => {
    const id = Date.now();
    const newNotification = {
      id,
      type,
      position,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
      message: `This is a ${type} notification in the ${position} position.`,
      duration: 5000
    };
    
    setNotifications([...notifications, newNotification]);
  };

  // Remove a notification by ID
  const removeNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <div className="notification-demo">
      <h2>Notification Demo</h2>
      
      <div className="notification-controls">
        <h3>Create a Notification</h3>
        
        <div className="button-group">
          <h4>Type</h4>
          <button onClick={() => addNotification('success', 'top-right')}>Success</button>
          <button onClick={() => addNotification('error', 'top-right')}>Error</button>
          <button onClick={() => addNotification('warning', 'top-right')}>Warning</button>
          <button onClick={() => addNotification('info', 'top-right')}>Info</button>
        </div>
        
        <div className="button-group">
          <h4>Position</h4>
          <button onClick={() => addNotification('success', 'top-right')}>Top Right</button>
          <button onClick={() => addNotification('success', 'top-left')}>Top Left</button>
          <button onClick={() => addNotification('success', 'bottom-right')}>Bottom Right</button>
          <button onClick={() => addNotification('success', 'bottom-left')}>Bottom Left</button>
        </div>
      </div>
      
      {/* Render notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          position={notification.position}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationDemo;
