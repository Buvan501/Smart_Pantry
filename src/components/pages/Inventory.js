import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const Inventory = memo(({ toggleModal }) => {
  const { pantryItems, setPantryItems, getItemStatus, setCurrentEditingItem, showNotification, groceryList, setGroceryList } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all | fresh | expiring | expired
  const [hideExpired, setHideExpired] = useState(false);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('expiry'); // name | quantity | expiry
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingExpiryId, setEditingExpiryId] = useState(null);
  const [expiryDraft, setExpiryDraft] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Load/save UI preferences
  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('inv_ui_prefs') || '{}');
      if (prefs.filter) setFilter(prefs.filter);
      if (prefs.statusFilter) setStatusFilter(prefs.statusFilter);
      if (typeof prefs.hideExpired === 'boolean') setHideExpired(prefs.hideExpired);
      if (typeof prefs.hideOutOfStock === 'boolean') setHideOutOfStock(prefs.hideOutOfStock);
      if (prefs.sortBy) setSortBy(prefs.sortBy);
      if (prefs.itemsPerPage) setItemsPerPage(prefs.itemsPerPage);
    } catch {}
  }, []);

  useEffect(() => {
    const prefs = { filter, statusFilter, hideExpired, hideOutOfStock, sortBy, itemsPerPage };
    localStorage.setItem('inv_ui_prefs', JSON.stringify(prefs));
  }, [filter, statusFilter, hideExpired, hideOutOfStock, sortBy, itemsPerPage]);

  // Keep page in range when filters change
  useEffect(() => { setPage(1); }, [searchTerm, filter, statusFilter, hideExpired, hideOutOfStock, sortBy]);

  const daysUntil = useCallback((expiry) => {
    const today = new Date();
    const ex = new Date(expiry);
    const diff = Math.ceil((ex - today) / (1000*60*60*24));
    return diff; // negative means past
  }, []);

  const categories = useMemo(() => {
    const base = new Set(['dairy','meat','vegetables','grains','fruits','condiments']);
    pantryItems.forEach(i => base.add(i.category));
    return Array.from(base);
  }, [pantryItems]);
  
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

    if (statusFilter !== 'all' || hideExpired) {
      items = items.filter(item => {
        const status = getItemStatus(item.expiry);
        if (hideExpired && status === 'expired') return false;
        return statusFilter === 'all' ? true : status === statusFilter;
      });
    }

    if (hideOutOfStock) {
      items = items.filter(i => (parseInt(i.quantity)||0) > 0);
    }

    // sorting
    items.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'quantity') return (parseInt(b.quantity)||0) - (parseInt(a.quantity)||0);
      // expiry default
      const ea = new Date(a.expiry).getTime();
      const eb = new Date(b.expiry).getTime();
      return ea - eb;
    });
    
    return items;
  }, [pantryItems, filter, searchTerm, sortBy, statusFilter, hideExpired, hideOutOfStock, getItemStatus]);
  
  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAllFiltered = useCallback(() => {
    setSelectedIds(new Set(filteredItems.map(i => i.id)));
  }, [filteredItems]);

  const selectByStatus = useCallback((status) => {
    setSelectedIds(new Set(filteredItems.filter(i => getItemStatus(i.expiry) === status).map(i => i.id)));
  }, [filteredItems, getItemStatus]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
  
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

  const clearExpiredItems = useCallback(() => {
    const expired = pantryItems.filter(i => getItemStatus(i.expiry) === 'expired');
    if (expired.length === 0) { showNotification('No expired items', 'info'); return; }
    if (!window.confirm(`Remove ${expired.length} expired item(s)?`)) return;
    const expiredIds = new Set(expired.map(i => i.id));
    setPantryItems(prev => prev.filter(i => !expiredIds.has(i.id)));
    showNotification('Expired items removed', 'success');
  }, [pantryItems, getItemStatus, setPantryItems, showNotification]);

  const bulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected item(s)?`)) return;
    setPantryItems(prev => prev.filter(i => !selectedIds.has(i.id)));
    clearSelection();
    showNotification('Selected items deleted', 'success');
  }, [selectedIds, setPantryItems, clearSelection, showNotification]);

  const moveSelectedToGrocery = useCallback(() => {
    if (selectedIds.size === 0) return;
    const toMove = pantryItems.filter(i => selectedIds.has(i.id));
    const newGroceries = toMove.map(i => ({
      id: `${Date.now()}-${i.id}`,
      name: i.name,
      quantity: '1',
      category: i.category || 'other',
      priority: 'normal',
      notes: 'Auto-added from Inventory',
      completed: false,
      addedDate: new Date().toISOString()
    }));
    setGroceryList(prev => [...prev, ...newGroceries]);
    showNotification(`${newGroceries.length} item(s) added to grocery list`, 'success');
    clearSelection();
  }, [selectedIds, pantryItems, setGroceryList, showNotification, clearSelection]);

  const addLowStockToGrocery = useCallback((item) => {
    const exists = (groceryList||[]).some(g => g.name.toLowerCase() === item.name.toLowerCase());
    if (!exists) {
      setGroceryList(prev => [...prev, {
        id: `${Date.now()}-${item.id}`,
        name: item.name,
        quantity: '1',
        category: item.category || 'other',
        priority: 'high',
        notes: 'Auto-added: low stock',
        completed: false,
        addedDate: new Date().toISOString()
      }]);
      showNotification(`${item.name} is low. Added to grocery list.`, 'info');
    }
  }, [groceryList, setGroceryList, showNotification]);

  const changeQuantity = useCallback((itemId, delta) => {
    let affected;
    setPantryItems(prev => prev.map(i => {
      if (i.id !== itemId) return i;
      affected = i;
      const current = parseInt(i.quantity) || 0;
      const next = Math.max(0, current + delta);
      return { ...i, quantity: String(next) };
    }));
    if (!affected) return;
    const current = parseInt(affected.quantity)||0;
    const newQty = Math.max(0, current + delta);
    if (newQty <= 1 && delta < 0) {
      addLowStockToGrocery(affected);
    }
  }, [setPantryItems, addLowStockToGrocery]);

  // Rename to avoid eslint hooks rule false-positive
  const consumeOne = useCallback((itemId) => {
    changeQuantity(itemId, -1);
  }, [changeQuantity]);

  const bulkConsumeSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    setPantryItems(prev => prev.map(i => {
      if (!selectedIds.has(i.id)) return i;
      const next = Math.max(0, (parseInt(i.quantity)||0) - 1);
      return { ...i, quantity: String(next) };
    }));
    // After state update, add low-stock ones to grocery based on current snapshot
    pantryItems.forEach(i => {
      if (selectedIds.has(i.id)) {
        const newQty = Math.max(0, (parseInt(i.quantity)||0) - 1);
        if (newQty <= 1) addLowStockToGrocery(i);
      }
    });
    clearSelection();
    showNotification('Consumed 1 from selected items', 'success');
  }, [selectedIds, pantryItems, setPantryItems, addLowStockToGrocery, clearSelection, showNotification]);

  const exportInventory = useCallback(() => {
    const headers = ['name','category','quantity','expiry'];
    const rows = filteredItems.map(i => [i.name, i.category, i.quantity, new Date(i.expiry).toISOString().slice(0,10)]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `inventory-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showNotification('Inventory exported (CSV)', 'success');
  }, [filteredItems, showNotification]);

  const importInventory = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result || '');
          const lines = text.split(/\r?\n/).filter(Boolean);
          if (lines.length === 0) return;
          const header = lines[0].toLowerCase();
          const hasHeader = ['name','category','quantity','expiry'].every(h => header.includes(h));
          const dataLines = hasHeader ? lines.slice(1) : lines;
          const parsed = dataLines.map(line => {
            // naive CSV split respecting quoted commas
            const parts = [];
            let cur = '', inQ = false;
            for (let ch of line) {
              if (ch === '"') { inQ = !inQ; cur += ch; }
              else if (ch === ',' && !inQ) { parts.push(cur); cur = ''; }
              else { cur += ch; }
            }
            parts.push(cur);
            const unq = parts.map(p => p.replace(/^\s*"|"\s*$/g,'').replace(/""/g,'"'));
            const [name, category, quantity, expiry] = unq;
            return { name, category: category||'other', quantity: quantity||'1', expiry: expiry || new Date().toISOString() };
          }).filter(p => p.name);

          if (!parsed.length) { showNotification('No items found in CSV', 'warning'); return; }

          setPantryItems(prev => {
            const byName = new Map(prev.map(i => [i.name.toLowerCase(), i]));
            const added = [];
            parsed.forEach(p => {
              const key = p.name.toLowerCase();
              if (byName.has(key)) {
                const existing = byName.get(key);
                existing.quantity = String((parseInt(existing.quantity)||0) + (parseInt(p.quantity)||0));
                existing.expiry = p.expiry || existing.expiry;
              } else {
                added.push({ id: Date.now() + Math.random(), name: p.name, category: p.category, quantity: p.quantity, expiry: p.expiry });
              }
            });
            return [...prev, ...added];
          });
          showNotification('Inventory imported from CSV', 'success');
        } catch {
          showNotification('Failed to import CSV', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setPantryItems, showNotification]);

  const startEditExpiry = useCallback((item) => {
    setEditingExpiryId(item.id);
    try {
      const d = new Date(item.expiry);
      setExpiryDraft(d.toISOString().slice(0,10));
    } catch {
      setExpiryDraft('');
    }
  }, []);

  const saveExpiry = useCallback(() => {
    if (!editingExpiryId) return;
    setPantryItems(prev => prev.map(i => i.id === editingExpiryId ? { ...i, expiry: new Date(expiryDraft).toISOString() } : i));
    setEditingExpiryId(null);
    setExpiryDraft('');
    showNotification('Expiry updated', 'success');
  }, [editingExpiryId, expiryDraft, setPantryItems, showNotification]);

  const cancelExpiryEdit = useCallback(() => {
    setEditingExpiryId(null);
    setExpiryDraft('');
  }, []);

  const extendExpiry = useCallback((itemId, days = 7) => {
    setPantryItems(prev => prev.map(i => {
      if (i.id !== itemId) return i;
      const base = new Date(i.expiry);
      const extended = new Date(base.getTime() + days*24*60*60*1000);
      return { ...i, expiry: extended.toISOString() };
    }));
    showNotification(`Expiry extended by ${days} day(s)`, 'info');
  }, [setPantryItems, showNotification]);

  // Derived: paginated items
  const totalItemsFiltered = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItemsFiltered / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pagedItems = filteredItems.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Ignore if typing in inputs
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (e.key === 'a') { selectAllFiltered(); }
      if (e.key === 'c') { bulkConsumeSelected(); }
      if (e.key === 'Delete') { bulkDelete(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectAllFiltered, bulkConsumeSelected, bulkDelete]);

  const mergeDuplicates = useCallback(() => {
    const map = new Map();
    const merged = [];
    pantryItems.forEach(i => {
      const key = i.name.trim().toLowerCase();
      if (!map.has(key)) { map.set(key, { ...i }); }
      else {
        const ex = map.get(key);
        const qty = (parseInt(ex.quantity)||0) + (parseInt(i.quantity)||0);
        const earliest = new Date(Math.min(new Date(ex.expiry).getTime(), new Date(i.expiry).getTime())).toISOString();
        map.set(key, { ...ex, quantity: String(qty), expiry: earliest });
      }
    });
    map.forEach(v => merged.push(v));
    if (merged.length !== pantryItems.length) {
      setPantryItems(merged);
      showNotification('Merged duplicate items', 'success');
    } else {
      showNotification('No duplicates found', 'info');
    }
  }, [pantryItems, setPantryItems, showNotification]);

  const moveOutOfStockToGrocery = useCallback(() => {
    const oos = filteredItems.filter(i => (parseInt(i.quantity)||0) === 0);
    if (oos.length === 0) { showNotification('No out-of-stock items', 'info'); return; }
    const toAdd = oos.filter(i => !(groceryList||[]).some(g => g.name.toLowerCase() === i.name.toLowerCase()))
      .map(i => ({ id: `${Date.now()}-${i.id}`, name: i.name, quantity: '1', category: i.category||'other', priority:'high', notes:'Auto: out of stock', completed:false, addedDate: new Date().toISOString() }));
    if (toAdd.length === 0) { showNotification('All out-of-stock already in grocery list', 'info'); return; }
    setGroceryList(prev => [...prev, ...toAdd]);
    showNotification(`Added ${toAdd.length} out-of-stock item(s) to grocery`, 'success');
  }, [filteredItems, groceryList, setGroceryList, showNotification]);

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
          {categories.map(c => (<option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>))}
        </select>

        <select className="form-select" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} style={{maxWidth:'200px'}}>
          <option value="all">All Statuses</option>
          <option value="fresh">Fresh</option>
          <option value="expiring">Expiring</option>
          <option value="expired">Expired</option>
        </select>

        <select className="form-select" value={sortBy} onChange={(e)=>setSortBy(e.target.value)} style={{maxWidth:'200px'}}>
          <option value="expiry">Sort by Expiry</option>
          <option value="name">Sort by Name</option>
          <option value="quantity">Sort by Quantity</option>
        </select>

        <label style={{display:'inline-flex',alignItems:'center',gap:'6px'}}>
          <input type="checkbox" checked={hideExpired} onChange={(e)=>setHideExpired(e.target.checked)} /> Hide expired
        </label>
        <label style={{display:'inline-flex',alignItems:'center',gap:'6px'}}>
          <input type="checkbox" checked={hideOutOfStock} onChange={(e)=>setHideOutOfStock(e.target.checked)} /> Hide out of stock
        </label>
        
        <button 
          className="btn btn-primary" 
          onClick={() => toggleModal('addItemModal', true)}
        >
          <i className="fas fa-plus"></i>Add Item
        </button>
        <button className="btn btn-secondary" onClick={exportInventory}><i className="fas fa-file-export"></i>Export CSV</button>
        <button className="btn btn-secondary" onClick={importInventory}><i className="fas fa-file-import"></i>Import CSV</button>
      </div>

      {/* Quick category chips */}
      <div className="category-chips" style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'12px'}}>
        <button className={`chip ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>All</button>
        {categories.map(c => (
          <button key={c} className={`chip ${filter===c?'active':''}`} onClick={()=>setFilter(c)}>{c}</button>
        ))}
      </div>

      {/* Bulk actions */}
      <div className="bulk-actions" style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px'}}>
        <span>{selectedIds.size} selected</span>
        <button className="btn btn-secondary" onClick={selectAllFiltered}>Select All</button>
        <button className="btn btn-secondary" onClick={clearSelection}>Clear</button>
        <button className="btn btn-secondary" onClick={()=>selectByStatus('expiring')}><i className="fas fa-hourglass-half"></i>Select Expiring</button>
        <button className="btn btn-secondary" onClick={()=>selectByStatus('expired')}><i className="fas fa-times-circle"></i>Select Expired</button>
        <button className="btn btn-secondary" onClick={bulkConsumeSelected} disabled={selectedIds.size===0}><i className="fas fa-drumstick-bite"></i>Consume 1</button>
        <button className="btn btn-secondary" onClick={moveSelectedToGrocery} disabled={selectedIds.size===0}><i className="fas fa-cart-plus"></i>To Grocery</button>
        <button className="btn btn-danger" onClick={bulkDelete} disabled={selectedIds.size===0}><i className="fas fa-trash"></i>Delete</button>
        <button className="btn btn-danger" onClick={clearExpiredItems}><i className="fas fa-broom"></i>Clear Expired</button>
        <button className="btn btn-secondary" onClick={moveOutOfStockToGrocery}><i className="fas fa-exclamation-circle"></i>OOS to Grocery</button>
        <button className="btn btn-secondary" onClick={mergeDuplicates}><i className="fas fa-compress-arrows-alt"></i>Merge Duplicates</button>
      </div>

      <div className="inventory-grid">
        {pagedItems.length > 0 ? (
          pagedItems.map(item => {
            const status = getItemStatus(item.expiry);
            const d = daysUntil(item.expiry);
            const statusNote = d < 0 ? `${Math.abs(d)} day(s) ago` : `in ${d} day(s)`;
            return (
              <div key={item.id} className={`inventory-item ${status}`} data-category={item.category} title={`Expires ${statusNote}`}>
                <div className="item-header">
                  <h3 className="item-name">{item.name}</h3>
                  <span className={`item-status ${status}`}>{status}</span>
                </div>
                <div className="item-details">
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <p><strong>Expiry:</strong>{' '}
                    {editingExpiryId === item.id ? (
                      <span style={{display:'inline-flex',gap:'6px',alignItems:'center'}}>
                        <input type="date" className="form-input" value={expiryDraft} onChange={(e)=>setExpiryDraft(e.target.value)} />
                        <button className="btn-small btn-primary" onClick={saveExpiry}>Save</button>
                        <button className="btn-small" onClick={cancelExpiryEdit}>Cancel</button>
                      </span>
                    ) : (
                      <span style={{display:'inline-flex',gap:'6px',alignItems:'center'}}>
                        {new Date(item.expiry).toLocaleDateString()}
                        <button className="btn-small" title="Edit expiry" onClick={()=>startEditExpiry(item)}><i className="fas fa-edit"></i></button>
                        <button className="btn-small" title="Extend 7 days" onClick={()=>extendExpiry(item.id, 7)}><i className="fas fa-calendar-plus"></i></button>
                      </span>
                    )}
                  </p>
                </div>
                <div className="item-actions" style={{display:'flex', gap:'8px', alignItems:'center'}}>
                  <label style={{display:'flex', alignItems:'center', gap:'6px'}}>
                    <input type="checkbox" checked={selectedIds.has(item.id)} onChange={()=>toggleSelect(item.id)} />
                    Select
                  </label>
                  <div className="qty-controls" style={{display:'inline-flex',gap:'4px',alignItems:'center'}}>
                    <button className="btn-small" onClick={() => changeQuantity(item.id, -1)} title="Decrease"><i className="fas fa-minus"></i></button>
                    <button className="btn-small" onClick={() => changeQuantity(item.id, +1)} title="Increase"><i className="fas fa-plus"></i></button>
                  </div>
                  <button 
                    className="btn-small btn-outline" 
                    onClick={() => consumeOne(item.id)}
                    title="Use 1"
                  >
                    Use 1
                  </button>
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

      {/* Pagination footer */}
      <div className="pagination" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'12px'}}>
        <div>Showing {Math.min(totalItemsFiltered, startIdx + 1)}–{Math.min(totalItemsFiltered, startIdx + pagedItems.length)} of {totalItemsFiltered}</div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <label>Per page
            <select className="form-select" value={itemsPerPage} onChange={(e)=>{ setItemsPerPage(parseInt(e.target.value)||20); setPage(1); }} style={{width:'90px', display:'inline-block', marginLeft:'6px'}}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          <button className="btn btn-secondary" disabled={currentPage<=1} onClick={()=>setPage(p=>Math.max(1, p-1))}>Prev</button>
          <span>Page {currentPage} / {totalPages}</span>
          <button className="btn btn-secondary" disabled={currentPage>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages, p+1))}>Next</button>
        </div>
      </div>
    </>
  );
});

export default Inventory;