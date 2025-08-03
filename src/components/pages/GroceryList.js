import React, { useState, useCallback, memo, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import GroceryItem from '../GroceryItem';

const GroceryList = memo(({ toggleModal }) => {
  const { groceryList, setGroceryList, showNotification } = useAppContext();
  const [customItem, setCustomItem] = useState('');
  
  const addCustomItem = useCallback(() => {
    if (!customItem.trim()) {
      showNotification('Please enter an item name', 'warning');
      return;
    }
    
    const trimmedItem = customItem.trim();
    
    if (groceryList.some(item => item.name.toLowerCase() === trimmedItem.toLowerCase())) {
      showNotification(`${trimmedItem} is already in your list`, 'warning');
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      name: trimmedItem,
      quantity: '1',
      category: 'other',
      priority: 'normal',
      notes: '',
      completed: false,
      addedDate: new Date().toISOString()
    };
    
    setGroceryList(prevList => [...prevList, newItem]);
    setCustomItem('');
    showNotification(`${trimmedItem} added to grocery list!`, 'success');
  }, [customItem, groceryList, setGroceryList, showNotification]);
  
  const toggleGroceryItem = useCallback((itemId) => {
    setGroceryList(prevList => {
      const updatedList = prevList.map(item => 
        item.id === itemId 
          ? { ...item, completed: !item.completed }
          : item
      );
      
      // Find the item in the updated list for notification
      const updatedItem = updatedList.find(item => item.id === itemId);
      if (updatedItem) {
        showNotification(
          `${updatedItem.name} marked as ${updatedItem.completed ? 'completed' : 'pending'}`, 
          updatedItem.completed ? 'success' : 'info', 
          2000
        );
      }
      
      return updatedList;
    });
  }, [setGroceryList, showNotification]);
  
  const removeGroceryItem = useCallback((itemId) => {
    const item = groceryList.find(item => item.id === itemId);
    if (item && window.confirm(`Remove "${item.name}" from grocery list?`)) {
      setGroceryList(prevList => prevList.filter(i => i.id !== itemId));
      showNotification(`${item.name} removed from grocery list`, 'info');
    }
  }, [groceryList, setGroceryList, showNotification]);
  
  // Memoize the grocery list content for export
  const groceryListContent = useMemo(() => {
    return `SMART PANTRY - GROCERY LIST\n${new Date().toLocaleDateString()}\n${'='.repeat(32)}\n\n${
      groceryList.map(item => `□ ${item.name} (${item.quantity})`).join('\n')
    }`;
  }, [groceryList]);
  
  // Download grocery list as a text file
  const downloadGroceryList = useCallback(() => {
    const blob = new Blob([groceryListContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-list-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Grocery list downloaded!', 'success');
  }, [groceryListContent, showNotification]);
  
  // Print grocery list
  const printGroceryList = useCallback(() => {
    // HTML template for printing
    const printTemplate = `
      <html>
        <head>
          <title>Grocery List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #667eea; }
            .item { padding: 6px 0; }
            .completed { text-decoration: line-through; color: #999; }
          </style>
        </head>
        <body>
          <h1>Smart Pantry - Grocery List</h1>
          <p>${new Date().toLocaleDateString()}</p>
          <div>
            ${groceryList.map(item => `
              <div class="item ${item.completed ? 'completed' : ''}">
                □ ${item.name} (${item.quantity})
                ${item.notes ? `<br><small>${item.notes}</small>` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printTemplate);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }, [groceryList]);

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
            <GroceryItem 
              key={item.id}
              item={item}
              onToggle={toggleGroceryItem}
              onRemove={removeGroceryItem}
            />
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
});

export default GroceryList;