import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

const Analytics = () => {
  const { pantryItems, groceryList, mealPlans } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    // Category distribution
    const categoryData = pantryItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    // Expiry analysis
    const today = new Date();
    const expiryAnalysis = {
      expired: 0,
      expiring: 0,
      fresh: 0
    };

    pantryItems.forEach(item => {
      const expiry = new Date(item.expiry);
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) expiryAnalysis.expired++;
      else if (diffDays <= 3) expiryAnalysis.expiring++;
      else expiryAnalysis.fresh++;
    });

    // Shopping patterns
    const shoppingPatterns = {
      mostAddedCategory: Object.entries(categoryData).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None',
      averageItemsPerCategory: Object.keys(categoryData).length > 0 ? 
        (pantryItems.length / Object.keys(categoryData).length).toFixed(1) : 0,
      totalValue: pantryItems.reduce((total, item) => {
        return total + (parseFloat(item.price || 0) * parseInt(item.quantity || 1));
      }, 0)
    };

    // Meal planning efficiency
    const mealPlanningData = {
      plannedMeals: Object.values(mealPlans).reduce((total, dayPlan) => {
        return total + Object.keys(dayPlan || {}).length;
      }, 0),
      daysWithPlans: Object.keys(mealPlans).length,
      completionRate: Object.keys(mealPlans).length > 0 ? 
        ((Object.keys(mealPlans).length / 7) * 100).toFixed(1) : 0
    };

    return {
      categoryData,
      expiryAnalysis,
      shoppingPatterns,
      mealPlanningData,
      totalItems: pantryItems.length,
      groceryItems: groceryList.length
    };
  }, [pantryItems, groceryList, mealPlans]);

  // Chart data for visualization
  const categoryChartData = Object.entries(analytics.categoryData).map(([category, count]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count,
    percentage: ((count / analytics.totalItems) * 100).toFixed(1)
  }));

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1 className="page-title">📊 Analytics Dashboard</h1>
        <p className="page-subtitle">Insights into your pantry management</p>
      </div>

      <div className="analytics-grid">
        {/* Overview Cards */}
        <div className="analytics-section overview-cards">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{analytics.totalItems}</h3>
              <p>Total Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <h3>{analytics.groceryItems}</h3>
              <p>Grocery Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>${analytics.shoppingPatterns.totalValue.toFixed(2)}</h3>
              <p>Estimated Value</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{analytics.mealPlanningData.completionRate}%</h3>
              <p>Meal Plan Complete</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="analytics-section">
          <h3>📈 Category Distribution</h3>
          <div className="category-chart">
            {categoryChartData.map((item, index) => (
              <div key={item.category} className="category-bar">
                <div className="category-info">
                  <span className="category-name">{item.category}</span>
                  <span className="category-count">{item.count} items ({item.percentage}%)</span>
                </div>
                <div className="category-progress">
                  <div 
                    className="category-fill" 
                    style={{
                      width: `${item.percentage}%`,
                      background: `hsl(${index * 45}, 70%, 60%)`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiry Analysis */}
        <div className="analytics-section">
          <h3>⏰ Expiry Status</h3>
          <div className="expiry-chart">
            <div className="expiry-item fresh">
              <div className="expiry-icon">✅</div>
              <div className="expiry-info">
                <h4>{analytics.expiryAnalysis.fresh}</h4>
                <p>Fresh Items</p>
              </div>
            </div>
            <div className="expiry-item expiring">
              <div className="expiry-icon">⚠️</div>
              <div className="expiry-info">
                <h4>{analytics.expiryAnalysis.expiring}</h4>
                <p>Expiring Soon</p>
              </div>
            </div>
            <div className="expiry-item expired">
              <div className="expiry-icon">❌</div>
              <div className="expiry-info">
                <h4>{analytics.expiryAnalysis.expired}</h4>
                <p>Expired</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shopping Insights */}
        <div className="analytics-section">
          <h3>🛍️ Shopping Insights</h3>
          <div className="insights-list">
            <div className="insight-item">
              <strong>Most Stocked Category:</strong>
              <span>{analytics.shoppingPatterns.mostAddedCategory}</span>
            </div>
            <div className="insight-item">
              <strong>Average Items per Category:</strong>
              <span>{analytics.shoppingPatterns.averageItemsPerCategory}</span>
            </div>
            <div className="insight-item">
              <strong>Planned Meals This Week:</strong>
              <span>{analytics.mealPlanningData.plannedMeals}</span>
            </div>
            <div className="insight-item">
              <strong>Days with Meal Plans:</strong>
              <span>{analytics.mealPlanningData.daysWithPlans}/7</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="analytics-section recommendations">
          <h3>💡 Smart Recommendations</h3>
          <div className="recommendations-list">
            {analytics.expiryAnalysis.expiring > 0 && (
              <div className="recommendation urgent">
                <i className="fas fa-exclamation-triangle"></i>
                <span>You have {analytics.expiryAnalysis.expiring} items expiring soon. Use them first!</span>
              </div>
            )}
            {analytics.expiryAnalysis.expired > 0 && (
              <div className="recommendation critical">
                <i className="fas fa-times-circle"></i>
                <span>Remove {analytics.expiryAnalysis.expired} expired items from your pantry.</span>
              </div>
            )}
            {analytics.mealPlanningData.completionRate < 50 && (
              <div className="recommendation info">
                <i className="fas fa-calendar-alt"></i>
                <span>Consider planning more meals to reduce food waste and save money.</span>
              </div>
            )}
            {analytics.groceryItems > 10 && (
              <div className="recommendation info">
                <i className="fas fa-shopping-cart"></i>
                <span>You have many items on your grocery list. Plan a shopping trip!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
