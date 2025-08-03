import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const FoodWasteTracker = () => {
  const { pantryItems, getItemStatus, showNotification } = useAppContext();
  const [wasteLog, setWasteLog] = useState(() => 
    JSON.parse(localStorage.getItem('foodWasteLog') || '[]')
  );
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Calculate waste statistics
  const wasteStats = useMemo(() => {
    const now = new Date();
    const periods = {
      week: 7,
      month: 30,
      year: 365
    };

    const cutoffDate = new Date(now.getTime() - (periods[selectedPeriod] * 24 * 60 * 60 * 1000));
    const periodWaste = wasteLog.filter(item => new Date(item.dateWasted) >= cutoffDate);

    const totalItems = periodWaste.length;
    const totalValue = periodWaste.reduce((sum, item) => sum + (parseFloat(item.estimatedValue) || 0), 0);
    
    const categoryBreakdown = periodWaste.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const reasonBreakdown = periodWaste.reduce((acc, item) => {
      acc[item.reason] = (acc[item.reason] || 0) + 1;
      return acc;
    }, {});

    // Current items at risk
    const currentlyExpired = pantryItems.filter(item => getItemStatus(item.expiry) === 'expired');
    const currentlyExpiring = pantryItems.filter(item => getItemStatus(item.expiry) === 'expiring');

    return {
      totalItems,
      totalValue,
      categoryBreakdown,
      reasonBreakdown,
      currentlyExpired,
      currentlyExpiring,
      averagePerWeek: selectedPeriod === 'week' ? totalItems : totalItems / (periods[selectedPeriod] / 7)
    };
  }, [wasteLog, selectedPeriod, pantryItems, getItemStatus]);

  const logWastedItem = (item, reason, estimatedValue = 0) => {
    const wasteEntry = {
      id: Date.now().toString(),
      name: item.name,
      category: item.category,
      reason,
      estimatedValue,
      dateWasted: new Date().toISOString(),
      originalExpiry: item.expiry
    };

    const updatedLog = [...wasteLog, wasteEntry];
    setWasteLog(updatedLog);
    localStorage.setItem('foodWasteLog', JSON.stringify(updatedLog));
    
    showNotification(`${item.name} logged as wasted`, 'info');
  };

  const getWasteRecommendations = () => {
    const recommendations = [];
    
    if (wasteStats.currentlyExpired.length > 0) {
      recommendations.push({
        type: 'urgent',
        message: `You have ${wasteStats.currentlyExpired.length} expired items. Remove them to prevent contamination.`,
        action: 'Remove expired items'
      });
    }

    if (wasteStats.currentlyExpiring.length > 3) {
      recommendations.push({
        type: 'warning',
        message: `${wasteStats.currentlyExpiring.length} items are expiring soon. Plan meals to use them first.`,
        action: 'Plan meals with expiring items'
      });
    }

    if (wasteStats.averagePerWeek > 5) {
      recommendations.push({
        type: 'info',
        message: 'You\'re wasting more than 5 items per week. Consider buying smaller quantities.',
        action: 'Adjust shopping habits'
      });
    }

    const topWasteCategory = Object.entries(wasteStats.categoryBreakdown)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topWasteCategory && topWasteCategory[1] > 3) {
      recommendations.push({
        type: 'info',
        message: `Most waste comes from ${topWasteCategory[0]}. Focus on better storage and planning for this category.`,
        action: `Improve ${topWasteCategory[0]} management`
      });
    }

    return recommendations;
  };

  return (
    <div className="food-waste-tracker">
      <div className="page-header">
        <h1 className="page-title">♻️ Food Waste Tracker</h1>
        <p className="page-subtitle">Monitor and reduce food waste</p>
      </div>

      <div className="waste-controls">
        <select 
          value={selectedPeriod} 
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="period-selector"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="waste-grid">
        {/* Waste Statistics */}
        <div className="waste-stats">
          <h3>📊 Waste Statistics ({selectedPeriod})</h3>
          <div className="stats-grid">
            <div className="stat-card waste">
              <div className="stat-icon">🗑️</div>
              <div className="stat-info">
                <h4>{wasteStats.totalItems}</h4>
                <p>Items Wasted</p>
              </div>
            </div>
            <div className="stat-card value">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h4>${wasteStats.totalValue.toFixed(2)}</h4>
                <p>Estimated Value Lost</p>
              </div>
            </div>
            <div className="stat-card average">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h4>{wasteStats.averagePerWeek.toFixed(1)}</h4>
                <p>Items per Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Risk Items */}
        <div className="risk-items">
          <h3>⚠️ Items at Risk</h3>
          
          {wasteStats.currentlyExpired.length > 0 && (
            <div className="risk-section expired">
              <h4>Expired Items ({wasteStats.currentlyExpired.length})</h4>
              <div className="risk-list">
                {wasteStats.currentlyExpired.map(item => (
                  <div key={item.id} className="risk-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-expiry">Expired {Math.abs(Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24)))} days ago</span>
                    </div>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => logWastedItem(item, 'expired', item.price || 0)}
                    >
                      Log as Wasted
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wasteStats.currentlyExpiring.length > 0 && (
            <div className="risk-section expiring">
              <h4>Expiring Soon ({wasteStats.currentlyExpiring.length})</h4>
              <div className="risk-list">
                {wasteStats.currentlyExpiring.slice(0, 5).map(item => (
                  <div key={item.id} className="risk-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-expiry">Expires in {Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24))} days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Waste Breakdown */}
        <div className="waste-breakdown">
          <h3>📈 Waste Analysis</h3>
          
          <div className="breakdown-section">
            <h4>By Category</h4>
            <div className="breakdown-chart">
              {Object.entries(wasteStats.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="breakdown-item">
                  <span className="category-name">{category}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${(count / wasteStats.totalItems) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="breakdown-section">
            <h4>By Reason</h4>
            <div className="breakdown-chart">
              {Object.entries(wasteStats.reasonBreakdown).map(([reason, count]) => (
                <div key={reason} className="breakdown-item">
                  <span className="reason-name">{reason}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${(count / wasteStats.totalItems) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="waste-recommendations">
          <h3>💡 Waste Reduction Tips</h3>
          <div className="recommendations-list">
            {getWasteRecommendations().map((rec, index) => (
              <div key={index} className={`recommendation ${rec.type}`}>
                <div className="rec-message">{rec.message}</div>
                <div className="rec-action">{rec.action}</div>
              </div>
            ))}
            
            <div className="general-tips">
              <h4>General Tips:</h4>
              <ul>
                <li>Store items properly - check temperature requirements</li>
                <li>Use the FIFO method (First In, First Out)</li>
                <li>Plan meals around expiring items</li>
                <li>Consider freezing items before they spoil</li>
                <li>Donate items you won't use to food banks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodWasteTracker;
