import React, { useEffect, useState } from 'react';

const Notification = ({ message, type = 'success', id }) => {
  const [exit, setExit] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setExit(true);
    }, 2700); // Slightly shorter than parent timeout to allow animation

    return () => clearTimeout(timer);
  }, []);

  const notificationStyles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    color: 'white',
    zIndex: 3000,
    maxWidth: '300px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: exit ? 'slideOutRight 0.3s ease' : 'slideInRight 0.3s ease',
    fontWeight: 500,
    background: {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    }[type] || '#28a745'
  };

  return (
    <div className="notification" style={notificationStyles}>
      {message}
    </div>
  );
};

export default Notification;