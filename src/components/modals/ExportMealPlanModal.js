import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const ExportMealPlanModal = ({ isOpen, onClose }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeGroceryList, setIncludeGroceryList] = useState(false);
  
  const { mealPlans, groceryList, showNotification } = useAppContext();
  
  const handleExportFormatChange = (e) => {
    setExportFormat(e.target.value);
  };
  
  const handleIncludeGroceryListChange = (e) => {
    setIncludeGroceryList(e.target.checked);
  };
  
  const downloadMealPlan = () => {
    showNotification(`Exporting meal plan as ${exportFormat.toUpperCase()}...`, 'info');
    
    setTimeout(() => {
      let content = `SMART PANTRY - MEAL PLAN\n${new Date().toLocaleDateString()}\n${'='.repeat(35)}\n\n`;
      
      Object.entries(mealPlans).forEach(([day, meals]) => {
        content += `${day.toUpperCase()}:\n`;
        ['breakfast', 'lunch', 'dinner'].forEach(meal => 
          content += `  ${meal.charAt(0).toUpperCase() + meal.slice(1)}: ${meals[meal] || 'Not planned'}\n`
        );
        content += '\n';
      });
      
      if (includeGroceryList) {
        content += '\nGROCERY LIST:\n=============\n';
        groceryList.forEach(item => content += `- ${item.name} (${item.category})\n`);
      }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meal-plan-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('Meal plan exported successfully!', 'success');
      onClose();
    }, 1000);
  };

  return (
    <div id="exportMealPlanModal" className={`modal ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Export Meal Plan</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="form-group">
          <label className="form-label">Export Format</label>
          <div className="radio-group">
            <label>
              <input 
                type="radio" 
                name="exportFormat" 
                value="pdf" 
                checked={exportFormat === 'pdf'}
                onChange={handleExportFormatChange} 
              /> PDF
            </label>
            <label>
              <input 
                type="radio" 
                name="exportFormat" 
                value="calendar" 
                checked={exportFormat === 'calendar'}
                onChange={handleExportFormatChange} 
              /> Calendar (ICS)
            </label>
            <label>
              <input 
                type="radio" 
                name="exportFormat" 
                value="excel" 
                checked={exportFormat === 'excel'}
                onChange={handleExportFormatChange} 
              /> Excel (CSV)
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={includeGroceryList}
              onChange={handleIncludeGroceryListChange}
            /> Include grocery list
          </label>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={downloadMealPlan} 
          style={{ width: '100%' }}
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default ExportMealPlanModal;