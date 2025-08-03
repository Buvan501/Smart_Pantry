import React from 'react';

/**
 * Reusable Card component with different variants
 */
const Card = ({ 
  children,
  title,
  footer,
  variant = 'default',  // default, elevated, flat
  className = '',
  headerAction = null,
  ...rest 
}) => {
  // Base classes
  const baseClasses = 'card overflow-hidden rounded-lg';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-white shadow',
    elevated: 'bg-white shadow-lg',
    flat: 'bg-gray-50 border border-gray-200'
  };
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {title && (
        <div className="card-header border-b border-gray-100 px-5 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {headerAction}
        </div>
      )}
      <div className="card-body p-5">
        {children}
      </div>
      {footer && (
        <div className="card-footer border-t border-gray-100 px-5 py-4 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
