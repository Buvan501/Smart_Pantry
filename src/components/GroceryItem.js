import React, { memo } from 'react';

/**
 * Optimized GroceryItem component
 * Renders a single grocery item with its own state management to prevent parent re-renders
 */
const GroceryItem = memo(({ 
  item, 
  onToggle, 
  onRemove
}) => {
  return (
    <div 
      className={`grocery-item ${item.completed ? 'completed' : ''}`} 
      data-priority={item.priority}
    >
      <input 
        type="checkbox" 
        className="grocery-checkbox" 
        checked={item.completed} 
        onChange={() => onToggle(item.id)}
        aria-label={`Mark ${item.name} as ${item.completed ? 'incomplete' : 'complete'}`}
      />
      
      <div style={{flex: 1}}>
        <strong>{item.name}</strong>
        <div style={{fontSize: '0.9rem', color: '#666'}}>
          {item.quantity} - {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </div>
        {item.notes && (
          <div style={{fontSize: '0.8rem', color: '#999', fontStyle: 'italic'}}>
            {item.notes}
          </div>
        )}
      </div>
      
      <button 
        className="btn btn-small btn-secondary" 
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name} from grocery list`}
      >
        Remove
      </button>
    </div>
  );
});

export default GroceryItem;
