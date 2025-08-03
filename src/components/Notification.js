import React, { useEffect, useState, memo, useCallback, useRef } from 'react';
// Import icons directly
import statusFresh from '../assets/icons/status-fresh.svg';
import statusExpiring from '../assets/icons/status-expiring.svg';
import statusExpired from '../assets/icons/status-expired.svg';
import dashboardIcon from '../assets/icons/dashboard.svg';
// Import notification stack manager
import { notificationStackManager } from './hooks/useNotificationStack';

/**
 * Enhanced Notification Component
 * Displays toast notifications with animated progress bar and icons
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - The notification message
 * @param {string} [props.title] - Optional title for the notification
 * @param {string} [props.type='success'] - Type of notification (success, error, warning, info)
 * @param {string|number} props.id - Unique identifier for the notification
 * @param {number} [props.duration=3000] - Duration in milliseconds before auto-closing
 * @param {Function} props.onClose - Callback function when notification closes
 * @param {string} [props.position='top-right'] - Position of the notification (top-right, top-left, bottom-right, bottom-left)
 * @param {boolean} [props.dismissible=true] - Whether notification can be dismissed manually
 * @param {boolean} [props.pauseOnHover=true] - Whether to pause the auto-close timer when hovering
 * @param {Function} [props.onClick] - Callback function when notification is clicked
 * @param {string} [props.className] - Additional CSS class names
 * @param {Object} [props.style] - Additional inline styles
 */
const Notification = memo(function Notification({ 
  message, 
  title, 
  type = 'success', 
  id, 
  duration = 3000, 
  onClose,
  position = 'top-right',
  dismissible = true,
  pauseOnHover = true,
  onClick,
  className = '',
  style = {}
}) {
  const [exit, setExit] = useState(false);
  const [width, setWidth] = useState(0);
  const [intervalID, setIntervalID] = useState(null);
  const [stackIndex, setStackIndex] = useState(0);
  const notifRef = useRef(null);
  
  // Start progress bar timer with useCallback for better performance
  const handleStartTimer = useCallback(() => {
    const id = setInterval(() => {
      setWidth(prev => {
        if (prev < 100) {
          return prev + 0.5;
        }
        clearInterval(id);
        return prev;
      });
    }, duration / 200);
    
    setIntervalID(id);
  }, [duration]);
  
  // Pause timer when hovering
  const handlePauseTimer = useCallback(() => {
    clearInterval(intervalID);
  }, [intervalID]);
  
  // Handle close button click
  const handleCloseNotification = useCallback(() => {
    handlePauseTimer();
    setExit(true);
    setTimeout(() => {
      if (onClose) {
        onClose(id);
        // Unregister from stack
        notificationStackManager.remove(id, position);
      }
    }, 300);
  }, [handlePauseTimer, id, onClose, position]);
  
  // Initialize timer and handle cleanup
  useEffect(() => {
    handleStartTimer();
    
    // Register notification in the stack
    const index = notificationStackManager.register(id, position);
    setStackIndex(index);
    
    // Auto-close after duration
    const timeout = setTimeout(() => {
      setExit(true);
      if (onClose) {
        setTimeout(() => {
          onClose(id);
          // Unregister from stack when closed
          notificationStackManager.remove(id, position);
        }, 300);
      }
    }, duration - 300); // Slightly shorter to allow animation
    
    return () => {
      clearTimeout(timeout);
      clearInterval(intervalID);
      // Clean up stack entry when unmounting
      notificationStackManager.remove(id, position);
    };
  }, [handleStartTimer, duration, id, intervalID, onClose, position]);
  
  // Configuration for different notification types
  const typeConfig = {
    success: {
      icon: statusFresh,
      iconFallback: 'fas fa-check-circle',
      backgroundColor: '#28a745',
      progressBarColor: '#1e7e34'
    },
    error: {
      icon: statusExpired,
      iconFallback: 'fas fa-times-circle',
      backgroundColor: '#dc3545',
      progressBarColor: '#bd2130'
    },
    warning: {
      icon: statusExpiring,
      iconFallback: 'fas fa-exclamation-triangle',
      backgroundColor: '#ffc107',
      progressBarColor: '#d39e00'
    },
    info: {
      icon: dashboardIcon,
      iconFallback: 'fas fa-info-circle',
      backgroundColor: '#17a2b8',
      progressBarColor: '#117a8b'
    }
  };
  
  const config = typeConfig[type] || typeConfig.success;

  // Calculate the offset based on stack position
  const NOTIFICATION_HEIGHT = 80; // Approximate height of notification + margin
  const NOTIFICATION_MARGIN = 10; // Margin between stacked notifications
  
  // Determine position styles based on position prop and stack index
  const getPositionStyles = () => {
    const offset = stackIndex * (NOTIFICATION_HEIGHT + NOTIFICATION_MARGIN);
    
    switch (position) {
      case 'top-right':
        return { top: `${20 + offset}px`, right: '20px' };
      case 'top-left':
        return { top: `${20 + offset}px`, left: '20px' };
      case 'bottom-right':
        return { bottom: `${20 + offset}px`, right: '20px' };
      case 'bottom-left':
        return { bottom: `${20 + offset}px`, left: '20px' };
      default:
        return { top: `${20 + offset}px`, right: '20px' };
    }
  };

  // Determine animation based on position
  const getAnimationName = () => {
    if (position.includes('right')) {
      return exit ? 'slideOutRight' : 'slideInRight';
    } else {
      return exit ? 'slideOutLeft' : 'slideInLeft';
    }
  };
  
  // Handle notification click
  const handleClick = useCallback((e) => {
    if (onClick) {
      onClick(id, e);
    }
  }, [id, onClick]);

  return (
    <div 
      className={`notification ${exit ? 'notification-exit' : ''} ${className}`}
      style={{
        position: 'fixed',
        padding: '0',
        borderRadius: '8px',
        color: 'white',
        zIndex: 3000,
        maxWidth: '350px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
        animation: `${getAnimationName()} 0.3s ease forwards`,
        backgroundColor: config.backgroundColor,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...getPositionStyles(),
        ...style
      }}
      onMouseEnter={pauseOnHover ? handlePauseTimer : undefined}
      onMouseLeave={pauseOnHover ? handleStartTimer : undefined}
      onClick={handleClick}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      data-notification-id={id}
      data-notification-type={type}
    >
      <div 
        className="notification-content"
        style={{ 
          display: 'flex',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          position: 'relative'
        }}
      >
        <div style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}>
          {config.icon ? (
            <img 
              src={config.icon} 
              alt="" 
              style={{ width: '1.5rem', height: '1.5rem' }} 
              aria-hidden="true"
            />
          ) : (
            <i className={config.iconFallback} aria-hidden="true"></i>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {title && (
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '0.25rem',
              fontSize: '1rem'
            }}>
              {title}
            </div>
          )}
          <div style={{ fontSize: '0.9rem' }}>
            {message}
          </div>
        </div>
        {dismissible && (
          <button
            onClick={handleCloseNotification}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              opacity: 0.7,
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.25rem'
            }}
            aria-label="Close notification"
          >
            <img 
              src={require('../assets/icons/close.svg').default} 
              alt="Close" 
              style={{ width: '14px', height: '14px' }} 
              aria-hidden="true" 
            />
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      <div 
        style={{
          height: '3px',
          backgroundColor: config.progressBarColor,
          width: `${width}%`,
          transition: 'width 0.3s linear'
        }}
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={width}
      />
    </div>
  );
});

export default Notification;