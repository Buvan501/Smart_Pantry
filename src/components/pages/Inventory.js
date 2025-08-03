import React, { useState, useMemo, useCallback, memo } from 'react';
import { useAppContext } from '../../context/AppContext';

const Inventory = memo(({ toggleModal }) => {
  const { pantryItems, setPantryItems, getItemStatus, setCurrentEditingItem, showNotification } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use useMemo for filteredItems instead of state to avoid unnecessary re-renders
  const filteredItems = useMemo(() => {
    let items = [...pantryItems];
    
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter !== 'all') {
      items = items.filter(item => item.category === filter);
    }
    
    return items;
  }, [pantryItems, filter, searchTerm]);
  
  const editInventoryItem = useCallback((itemId) => {
    const item = pantryItems.find(i => i.id === itemId);
    if (item) {
      setCurrentEditingItem(item);
      toggleModal('editItemModal', true);
    }
  }, [pantryItems, setCurrentEditingItem, toggleModal]);
  
  const deleteInventoryItem = useCallback((itemId) => {
    const item = pantryItems.find(i => i.id === itemId);
    if (item && window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      setPantryItems(prev => prev.filter(i => i.id !== itemId));
      showNotification(`${item.name} deleted successfully!`, 'success');
    }
  }, [pantryItems, setPantryItems, showNotification]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Pantry Inventory</h1>
        <p className="page-subtitle">Manage your kitchen items</p>
      </div>

      <div className="inventory-controls">
        <input 
          type="text" 
          placeholder="Search items..." 
          className="form-input" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{maxWidth: '300px'}}
        />
        
        <select 
          className="form-select" 
          value={filter}
          onChange={(e) => setFilter(e.target.value)} 
          style={{maxWidth: '200px'}}
        >
          <option value="all">All Categories</option>
          <option value="dairy">Dairy</option>
          <option value="meat">Meat</option>
          <option value="vegetables">Vegetables</option>
          <option value="grains">Grains</option>
          <option value="fruits">Fruits</option>
          <option value="condiments">Condiments</option>
        </select>
        
        <button 
          className="btn btn-primary" 
          onClick={() => toggleModal('addItemModal', true)}
        >
          <i className="fas fa-plus"></i>Add Item
        </button>
      </div>

      <div className="inventory-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => {
            const status = getItemStatus(item.expiry);
            return (
              <div key={item.id} className={`inventory-item ${status}`} data-category={item.category}>
                <div className="item-header">
                  <h3 className="item-name">{item.name}</h3>
                  <span className={`item-status ${status}`}>{status}</span>
                </div>
                <div className="item-details">
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <p><strong>Expiry:</strong> {new Date(item.expiry).toLocaleDateString()}</p>
                </div>
                <div className="item-actions">
                  <button 
                    className="btn-small btn-primary" 
                    onClick={() => editInventoryItem(item.id)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-small btn-danger" 
                    onClick={() => deleteInventoryItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#666'}}>
            No items found
          </div>
        )}
      </div>
    </>
  );
});

export default Inventory;