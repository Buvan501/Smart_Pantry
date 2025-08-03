import React from 'react';

/**
 * Reusable Button component with different variants and sizes
 */
const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',  // primary, secondary, outline, danger, success
  size = 'md',          // sm, md, lg
  fullWidth = false,
  disabled = false,
  icon = null,
  className = '',
  ...rest
}) => {
  // Base classes
  const baseClasses = 'button transition-all duration-200 font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-5 text-lg'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-purple-500 text-purple-500 hover:bg-purple-50 focus:ring-purple-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  
  // Width classes
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Disabled classes
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...rest}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span className="button-icon">{icon}</span>}
        {children}
      </div>
    </button>
  );
};

export default Button;
