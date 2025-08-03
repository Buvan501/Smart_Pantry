import React, { useEffect, useRef } from 'react';

/**
 * Reusable Modal component with improved accessibility
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = '500px', 
  showCloseButton = true,
  closeOnClickOutside = true
}) => {
  const modalRef = useRef(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    // Trap focus inside modal when open
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleOutsideClick = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleOutsideClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${title?.replace(/\s+/g, '-').toLowerCase() || 'modal'}`}
    >
      <div 
        className="modal-container" 
        ref={modalRef} 
        tabIndex="-1" 
        style={{ maxWidth }}
      >
        <div className="modal-header">
          {title && (
            <h2 
              id={`modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
              className="modal-title"
            >
              {title}
            </h2>
          )}
          {showCloseButton && (
            <button 
              type="button" 
              onClick={onClose} 
              className="modal-close-btn"
              aria-label="Close modal"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
