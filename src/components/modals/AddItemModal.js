import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const AddItemModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    itemCategory: '',
    itemQuantity: '',
    itemExpiry: ''
  });
  
  const { pantryItems, setPantryItems, getItemStatus, showNotification } = useAppContext();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { itemName, itemCategory, itemQuantity, itemExpiry } = formData;
    
    if (!itemName || !itemCategory || !itemQuantity || !itemExpiry) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    const existingItem = pantryItems.find(item => 
      item.name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (existingItem) {
      if (window.confirm(`${itemName} already exists. Update quantity instead?`)) {
        setPantryItems(pantryItems.map(item => 
          item.name.toLowerCase() === itemName.toLowerCase() 
            ? { ...item, quantity: itemQuantity, expiry: itemExpiry, status: getItemStatus(itemExpiry) }
            : item
        ));
        onClose();
        showNotification(`${itemName} updated successfully!`, 'success');
      }
      return;
    }
    
    const newItem = {
      id: Date.now(),
      name: itemName,
      category: itemCategory,
      quantity: itemQuantity,
      expiry: itemExpiry,
      status: getItemStatus(itemExpiry)
    };
    
    setPantryItems([...pantryItems, newItem]);
    onClose();
    showNotification(`${itemName} added to pantry!`, 'success');
  };

  return (
    <div id="addItemModal" className={`modal ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Add New Item</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form id="addItemForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input 
              type="text" 
              id="itemName" 
              className="form-input" 
              value={formData.itemName}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              id="itemCategory" 
              className="form-select" 
              value={formData.itemCategory}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="condiments">Condiments</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input 
              type="text" 
              id="itemQuantity" 
              className="form-input" 
              placeholder="e.g., 2 lbs, 1 gallon" 
              value={formData.itemQuantity}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input 
              type="date" 
              id="itemExpiry" 
              className="form-input" 
              value={formData.itemExpiry}
              onChange={handleChange}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Item</button>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;