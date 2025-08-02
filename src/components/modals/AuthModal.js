import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPassword: '',
    registerName: '',
    registerEmail: '',
    registerPassword: ''
  });
  
  const { setCurrentUser, showNotification } = useAppContext();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleLogin = (e) => {
    e.preventDefault();
    const { loginEmail, loginPassword } = formData;
    
    if (!loginEmail || !loginPassword) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    // In a real app, you would validate credentials with a backend
    const newUser = { name: 'John Doe', email: loginEmail };
    setCurrentUser(newUser);
    localStorage.setItem('smartPantryUser', JSON.stringify(newUser));
    onClose();
    showNotification('Login successful!', 'success');
  };
  
  const handleRegister = (e) => {
    e.preventDefault();
    const { registerName, registerEmail, registerPassword } = formData;
    
    if (!registerName || !registerEmail || !registerPassword) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    // In a real app, you would create an account with a backend
    const newUser = { name: registerName, email: registerEmail };
    setCurrentUser(newUser);
    localStorage.setItem('smartPantryUser', JSON.stringify(newUser));
    onClose();
    showNotification('Registration successful!', 'success');
  };
  
  const switchToLogin = () => setIsLogin(true);
  const switchToRegister = () => setIsLogin(false);

  return (
    <div id="authModal" className={`modal ${isOpen ? 'active' : ''}`} style={{ display: isOpen ? 'flex' : 'none' }}>
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Welcome to Smart Pantry</h2>
        </div>

        <div className="auth-toggle">
          <div className="toggle-container">
            <button 
              id="loginToggle" 
              className={`toggle-btn ${isLogin ? 'active' : ''}`} 
              onClick={switchToLogin}
            >Login</button>
            <button 
              id="registerToggle" 
              className={`toggle-btn ${!isLogin ? 'active' : ''}`} 
              onClick={switchToRegister}
            >Register</button>
            <div className={`toggle-slider ${!isLogin ? 'register' : ''}`}></div>
          </div>
        </div>

        {isLogin ? (
          <form id="loginForm" className="auth-form active" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                id="loginEmail" 
                className="form-input" 
                value={formData.loginEmail}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                id="loginPassword" 
                className="form-input" 
                value={formData.loginPassword}
                onChange={handleChange}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
          </form>
        ) : (
          <form id="registerForm" className="auth-form active" onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                id="registerName" 
                className="form-input" 
                value={formData.registerName}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                id="registerEmail" 
                className="form-input" 
                value={formData.registerEmail}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                id="registerPassword" 
                className="form-input" 
                value={formData.registerPassword}
                onChange={handleChange}
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;