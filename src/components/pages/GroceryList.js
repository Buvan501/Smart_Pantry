import React, { useState, useCallback, memo, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import GroceryItem from '../GroceryItem';

const GroceryList = memo(({ toggleModal }) => {
  const { groceryList, setGroceryList, showNotification, pantryItems, setPantryItems } = useAppContext();
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
  
  // Group items by category and compute subtotals
  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of groceryList) {
      const key = item.category || 'other';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  }, [groceryList]);

  const totals = useMemo(() => ({
    total: groceryList.length,
    completed: groceryList.filter(i=>i.completed).length
  }), [groceryList]);
  
  // Memoize the grocery list content for export
  const groceryListContent = useMemo(() => {
    return `SMART PANTRY - GROCERY LIST\n${new Date().toLocaleDateString()}\n${'='.repeat(32)}\n\n${
      grouped.map(([cat, items]) => `${cat.toUpperCase()}\n${items.map(i=>`□ ${i.name} (${i.quantity})${i.completed?' [x]':''}`).join('\n')}`).join('\n\n')
    }`;
  }, [grouped]);
  
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
            h2 { margin-top: 18px; }
            .item { padding: 6px 0; }
            .completed { text-decoration: line-through; color: #999; }
          </style>
        </head>
        <body>
          <h1>Smart Pantry - Grocery List</h1>
          <p>${new Date().toLocaleDateString()}</p>
          ${grouped.map(([cat, items]) => `
            <h2>${cat.charAt(0).toUpperCase()+cat.slice(1)}</h2>
            <div>
              ${items.map(item => `
                <div class="item ${item.completed ? 'completed' : ''}">
                  □ ${item.name} (${item.quantity})
                  ${item.notes ? `<br><small>${item.notes}</small>` : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}
          <p><strong>Total:</strong> ${totals.total} | <strong>Completed:</strong> ${totals.completed}</p>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printTemplate);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }, [grouped, totals]);

  const moveCheckedToInventory = useCallback(() => {
    const checked = groceryList.filter(i => i.completed);
    if (checked.length === 0) {
      showNotification('No completed items to move', 'info');
      return;
    }
    const updatedPantry = [...pantryItems];
    const remaining = [];
    for (const item of groceryList) {
      if (item.completed) {
        const qty = parseInt(prompt(`Quantity to add for ${item.name}?`, item.quantity || '1')) || 1;
        const existing = updatedPantry.find(p => p.name.toLowerCase() === item.name.toLowerCase());
        if (existing) {
          const newQty = (parseInt(existing.quantity)||0) + qty;
          existing.quantity = String(newQty);
        } else {
          updatedPantry.push({
            id: `${Date.now()}-${item.id}`,
            name: item.name,
            category: item.category || 'other',
            quantity: String(qty),
            expiry: new Date(Date.now()+14*24*60*60*1000).toISOString(), // default 2 weeks
          });
        }
      } else {
        remaining.push(item);
      }
    }
    setPantryItems(updatedPantry);
    setGroceryList(remaining);
    showNotification('Moved purchased items to Inventory', 'success');
  }, [groceryList, pantryItems, setPantryItems, setGroceryList, showNotification]);

  const shareList = useCallback(() => {
    const text = groceryListContent;
    if (navigator.share) {
      navigator.share({ title: 'Smart Pantry Grocery List', text }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(text);
      showNotification('List copied to clipboard', 'info');
    }
  }, [groceryListContent, showNotification]);

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

        <button className="btn btn-secondary" onClick={shareList}>
          <i className="fas fa-share"></i>Share
        </button>

        <button className="btn btn-success" onClick={moveCheckedToInventory}>
          <i className="fas fa-arrow-right"></i>Move Checked to Inventory
        </button>
      </div>

      <div className="grocery-list">
        {grouped.length > 0 ? (
          grouped.map(([cat, items]) => (
            <div key={cat} className="grocery-category">
              <h3>{cat.charAt(0).toUpperCase()+cat.slice(1)} <small>({items.length})</small></h3>
              {items.map(item => (
                <GroceryItem 
                  key={item.id}
                  item={item}
                  onToggle={toggleGroceryItem}
                  onRemove={removeGroceryItem}
                />
              ))}
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
});

export default GroceryList;