import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const AddGroceryItemModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    groceryItemName: '',
    groceryItemQuantity: '',
    groceryItemCategory: 'dairy',
    groceryItemPriority: 'normal',
    groceryItemNotes: ''
  });
  
  const { groceryList, setGroceryList, showNotification } = useAppContext();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { groceryItemName, groceryItemQuantity, groceryItemCategory, groceryItemPriority, groceryItemNotes } = formData;
    
    if (!groceryItemName || !groceryItemQuantity || !groceryItemCategory) {
      showNotification('Please fill in required fields', 'error');
      return;
    }
    
    const existingItem = groceryList.find(item => 
      item.name.toLowerCase() === groceryItemName.toLowerCase()
    );
    
    if (existingItem) {
      if (window.confirm(`${groceryItemName} is already in your grocery list. Update it?`)) {
        setGroceryList(groceryList.map(item => 
          item.name.toLowerCase() === groceryItemName.toLowerCase() 
            ? { 
                ...item, 
                quantity: groceryItemQuantity, 
                category: groceryItemCategory,
                priority: groceryItemPriority,
                notes: groceryItemNotes
              }
            : item
        ));
        onClose();
        showNotification(`${groceryItemName} updated in grocery list!`, 'success');
      }
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      name: groceryItemName,
      quantity: groceryItemQuantity,
      category: groceryItemCategory,
      priority: groceryItemPriority,
      notes: groceryItemNotes,
      completed: false,
      addedDate: new Date().toISOString()
    };
    
    setGroceryList([...groceryList, newItem]);
    onClose();
    showNotification(`${groceryItemName} added to grocery list!`, 'success');
  };

  return (
    <div id="addGroceryItemModal" className={`modal ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Add Grocery Item</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form id="addGroceryItemForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input 
              type="text" 
              id="groceryItemName" 
              className="form-input" 
              value={formData.groceryItemName}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input 
              type="text" 
              id="groceryItemQuantity" 
              className="form-input" 
              placeholder="e.g., 2 lbs, 1 gallon" 
              value={formData.groceryItemQuantity}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              id="groceryItemCategory" 
              className="form-select" 
              value={formData.groceryItemCategory}
              onChange={handleChange}
              required
            >
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="condiments">Condiments</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select 
              id="groceryItemPriority" 
              className="form-select"
              value={formData.groceryItemPriority}
              onChange={handleChange}
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea 
              id="groceryItemNotes" 
              className="form-textarea" 
              rows="3" 
              placeholder="Additional notes..."
              value={formData.groceryItemNotes}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add to List</button>
        </form>
      </div>
    </div>
  );
};

export default AddGroceryItemModal;