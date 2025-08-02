import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const EditItemModal = ({ isOpen, onClose, itemToEdit }) => {
  const [formData, setFormData] = useState({
    editItemName: '',
    editItemCategory: '',
    editItemQuantity: '',
    editItemExpiry: ''
  });
  
  const { pantryItems, setPantryItems, getItemStatus, showNotification } = useAppContext();
  
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        editItemName: itemToEdit.name || '',
        editItemCategory: itemToEdit.category || '',
        editItemQuantity: itemToEdit.quantity || '',
        editItemExpiry: itemToEdit.expiry || ''
      });
    }
  }, [itemToEdit]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!itemToEdit) return;
    
    const { editItemName, editItemCategory, editItemQuantity, editItemExpiry } = formData;
    
    const updatedItem = {
      ...itemToEdit,
      name: editItemName,
      category: editItemCategory,
      quantity: editItemQuantity,
      expiry: editItemExpiry,
      status: getItemStatus(editItemExpiry)
    };
    
    setPantryItems(pantryItems.map(item => 
      item.id === itemToEdit.id ? updatedItem : item
    ));
    
    onClose();
    showNotification(`${editItemName} updated successfully!`, 'success');
  };

  return (
    <div id="editItemModal" className={`modal ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Edit Item</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form id="editItemForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input 
              type="text" 
              id="editItemName" 
              className="form-input" 
              value={formData.editItemName}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              id="editItemCategory" 
              className="form-select" 
              value={formData.editItemCategory}
              onChange={handleChange}
              required
            >
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
              id="editItemQuantity" 
              className="form-input" 
              value={formData.editItemQuantity}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input 
              type="date" 
              id="editItemExpiry" 
              className="form-input" 
              value={formData.editItemExpiry}
              onChange={handleChange}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;