import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const WelcomeOnboarding = ({ onComplete }) => {
  const { pantryItems, showNotification, setActivePage } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [userPreferences, setUserPreferences] = useState({
    dietaryRestrictions: [],
    cookingSkill: 'beginner',
    householdSize: 1,
    shoppingFrequency: 'weekly',
    goals: []
  });

  const steps = [
    {
      title: "Welcome to Smart Pantry! 🎉",
      subtitle: "Your intelligent kitchen companion",
      content: (
        <div className="welcome-intro">
          <div className="feature-highlights">
            <div className="feature">
              <i className="fas fa-warehouse"></i>
              <h4>Smart Inventory Management</h4>
              <p>Track expiry dates, quantities, and categories automatically</p>
            </div>
            <div className="feature">
              <i className="fas fa-chart-bar"></i>
              <h4>Reduce Food Waste</h4>
              <p>Get alerts and suggestions to minimize food waste</p>
            </div>
            <div className="feature">
              <i className="fas fa-brain"></i>
              <h4>AI-Powered Shopping</h4>
              <p>Smart shopping lists based on your consumption patterns</p>
            </div>
            <div className="feature">
              <i className="fas fa-utensils"></i>
              <h4>Meal Planning</h4>
              <p>Plan meals around what you have and what's expiring</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Tell us about yourself",
      subtitle: "Help us personalize your experience",
      content: (
        <div className="preferences-form">
          <div className="form-group">
            <label>Household Size</label>
            <select 
              value={userPreferences.householdSize} 
              onChange={(e) => setUserPreferences({...userPreferences, householdSize: parseInt(e.target.value)})}
            >
              <option value={1}>1 person</option>
              <option value={2}>2 people</option>
              <option value={3}>3-4 people</option>
              <option value={4}>5+ people</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Cooking Skill Level</label>
            <div className="radio-group">
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <label key={level} className="radio-label">
                  <input 
                    type="radio" 
                    name="cookingSkill" 
                    value={level}
                    checked={userPreferences.cookingSkill === level}
                    onChange={(e) => setUserPreferences({...userPreferences, cookingSkill: e.target.value})}
                  />
                  <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Shopping Frequency</label>
            <select 
              value={userPreferences.shoppingFrequency} 
              onChange={(e) => setUserPreferences({...userPreferences, shoppingFrequency: e.target.value})}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: "Your Goals",
      subtitle: "What would you like to achieve?",
      content: (
        <div className="goals-selection">
          {[
            { id: 'reduce-waste', label: 'Reduce Food Waste', icon: 'fas fa-recycle' },
            { id: 'save-money', label: 'Save Money', icon: 'fas fa-piggy-bank' },
            { id: 'eat-healthier', label: 'Eat Healthier', icon: 'fas fa-apple-alt' },
            { id: 'meal-planning', label: 'Better Meal Planning', icon: 'fas fa-calendar-alt' },
            { id: 'organization', label: 'Kitchen Organization', icon: 'fas fa-tasks' },
            { id: 'cooking-skills', label: 'Improve Cooking Skills', icon: 'fas fa-chef-hat' }
          ].map(goal => (
            <div 
              key={goal.id}
              className={`goal-option ${userPreferences.goals.includes(goal.id) ? 'selected' : ''}`}
              onClick={() => {
                const updatedGoals = userPreferences.goals.includes(goal.id)
                  ? userPreferences.goals.filter(g => g !== goal.id)
                  : [...userPreferences.goals, goal.id];
                setUserPreferences({...userPreferences, goals: updatedGoals});
              }}
            >
              <i className={goal.icon}></i>
              <span>{goal.label}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Quick Start Guide",
      subtitle: "Get the most out of Smart Pantry",
      content: (
        <div className="quick-start">
          <div className="start-steps">
            <div className="start-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Add Your Pantry Items</h4>
                <p>Start by adding items you currently have in your pantry, fridge, and freezer</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setActivePage('inventory');
                    onComplete();
                  }}
                >
                  Go to Inventory
                </button>
              </div>
            </div>
            
            <div className="start-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Set Up Notifications</h4>
                <p>Enable notifications to get alerts about expiring items and low stock</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setActivePage('settings');
                    onComplete();
                  }}
                >
                  Configure Settings
                </button>
              </div>
            </div>
            
            <div className="start-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Plan Your First Meal</h4>
                <p>Use the meal planner to create your weekly menu and shopping list</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setActivePage('meal-planner');
                    onComplete();
                  }}
                >
                  Start Planning
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    // Save user preferences
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    localStorage.setItem('onboardingCompleted', 'true');
    
    showNotification('Welcome to Smart Pantry! 🎉', 'success');
    onComplete();
  };

  return (
    <div className="welcome-onboarding">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="step-indicator">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        <div className="onboarding-content">
          <h2>{steps[currentStep].title}</h2>
          <p className="subtitle">{steps[currentStep].subtitle}</p>
          <div className="step-content">
            {steps[currentStep].content}
          </div>
        </div>

        <div className="onboarding-footer">
          <button 
            className="btn btn-secondary" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button 
              className="btn btn-primary" 
              onClick={completeOnboarding}
            >
              Get Started! 🚀
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={nextStep}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeOnboarding;
