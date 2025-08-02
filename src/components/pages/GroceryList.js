import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const GroceryList = ({ toggleModal }) => {
  const { groceryList, setGroceryList, showNotification } = useAppContext();
  const [customItem, setCustomItem] = useState('');
  
  const addCustomItem = () => {
    if (!customItem.trim()) {
      showNotification('Please enter an item name', 'warning');
      return;
    }
    
    if (groceryList.find(item => item.name.toLowerCase() === customItem.toLowerCase())) {
      showNotification(`${customItem} is already in your list`, 'warning');
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      name: customItem.trim(),
      quantity: '1',
      category: 'other',
      priority: 'normal',
      notes: '',
      completed: false,
      addedDate: new Date().toISOString()
    };
    
    setGroceryList([...groceryList, newItem]);
    setCustomItem('');
    showNotification(`${customItem} added to grocery list!`, 'success');
  };
  
  const toggleGroceryItem = (itemId) => {
    setGroceryList(prevList => 
      prevList.map(item => 
        item.id === itemId 
          ? { ...item, completed: !item.completed }
          : item
      )
    );
    
    const item = groceryList.find(item => item.id === itemId);
    if (item) {
      const newStatus = !item.completed;
      showNotification(
        `${item.name} marked as ${newStatus ? 'completed' : 'pending'}`, 
        newStatus ? 'success' : 'info', 
        2000
      );
    }
  };
  
  const removeGroceryItem = (itemId) => {
    const item = groceryList.find(item => item.id === itemId);
    if (item && window.confirm(`Remove "${item.name}" from grocery list?`)) {
      setGroceryList(prevList => prevList.filter(item => item.id !== itemId));
      showNotification(`${item.name} removed from grocery list`, 'info');
    }
  };
  
  const downloadGroceryList = () => {
    const content = `SMART PANTRY - GROCERY LIST\n${new Date().toLocaleDateString()}\n${'='.repeat(32)}\n\n${
      groceryList.map(item => `□ ${item.name} (${item.quantity})`).join('\n')
    }`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-list-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Grocery list downloaded!', 'success');
  };
  
  const printGroceryList = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Grocery List</title>
          <style>body{font-family:Arial,sans-serif;padding:20px;}h1{color:#667eea;}</style>
        </head>
        <body>
          <h1>Smart Pantry - Grocery List</h1>
          <p>${new Date().toLocaleDateString()}</p>
          <div>
            ${groceryList.map(item => `<div>□ ${item.name} (${item.quantity})</div>`).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Grocery List</h1>
        <p className="page-subtitle">Your shopping companion</p>
      </div>

      <div className="grocery-controls">
        <input 
          type="text" 
          placeholder="Quick add item..." 
          className="form-input" 
          value={customItem}
          onChange={(e) => setCustomItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
          style={{maxWidth: '300px'}}
        />
        
        <button 
          className="btn btn-secondary" 
          onClick={addCustomItem}
        >
          <i className="fas fa-plus"></i>Quick Add
        </button>
        
        <button 
          className="btn btn-primary" 
          onClick={() => toggleModal('addGroceryItemModal', true)}
        >
          <i className="fas fa-plus-circle"></i>Add Detailed Item
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={downloadGroceryList}
        >
          <i className="fas fa-download"></i>Download
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={printGroceryList}
        >
          <i className="fas fa-print"></i>Print
        </button>
      </div>

      <div className="grocery-list">
        {groceryList.length > 0 ? (
          groceryList.map(item => (
            <div 
              key={item.id} 
              className={`grocery-item ${item.completed ? 'completed' : ''}`} 
              data-priority={item.priority}
            >
              <input 
                type="checkbox" 
                className="grocery-checkbox" 
                checked={item.completed} 
                onChange={() => toggleGroceryItem(item.id)}
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
                onClick={() => removeGroceryItem(item.id)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <div style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
            <i className="fas fa-shopping-cart" style={{fontSize: '3rem', marginBottom: '1rem', opacity: 0.3}}></i>
            <p>Your grocery list is empty</p>
          </div>
        )}
      </div>
    </>
  );
};

export default GroceryList;