import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const EditProfileModal = ({ isOpen, onClose, currentUser }) => {
  const [formData, setFormData] = useState({
    editProfileName: '',
    editProfileEmail: '',
    editCurrentPassword: '',
    editNewPassword: '',
    editConfirmPassword: ''
  });
  
  const { setCurrentUser, showNotification } = useAppContext();
  
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        editProfileName: currentUser.name || '',
        editProfileEmail: currentUser.email || ''
      }));
    }
  }, [currentUser, isOpen]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { editProfileName, editProfileEmail } = formData;
    
    if (!editProfileName || !editProfileEmail) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Check password fields if user is trying to change password
    const { editCurrentPassword, editNewPassword, editConfirmPassword } = formData;
    if (editCurrentPassword || editNewPassword || editConfirmPassword) {
      if (!editCurrentPassword || !editNewPassword || !editConfirmPassword) {
        showNotification('Please fill in all password fields to change password', 'error');
        return;
      }
      
      if (editNewPassword !== editConfirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
      }
      
      // In a real app, you would verify the current password here
    }
    
    const updatedUser = {
      ...currentUser,
      name: editProfileName,
      email: editProfileEmail
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('smartPantryUser', JSON.stringify(updatedUser));
    
    onClose();
    showNotification('Profile updated successfully!', 'success');
  };
  
  const changeProfilePicture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        showNotification('Profile picture updated!', 'success');
        // In a real app, you would upload and store the image
      }
    };
    input.click();
  };

  return (
    <div id="editProfileModal" className={`modal ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form id="editProfileForm" onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div 
              style={{
                width: '80px',
                height: '80px',
                background: '#667eea',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}
            >
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={changeProfilePicture}
            >
              Change Picture
            </button>
          </div>
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              id="editProfileName" 
              className="form-input" 
              value={formData.editProfileName}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              id="editProfileEmail" 
              className="form-input" 
              value={formData.editProfileEmail}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input 
              type="password" 
              id="editCurrentPassword" 
              className="form-input" 
              value={formData.editCurrentPassword}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              id="editNewPassword" 
              className="form-input" 
              value={formData.editNewPassword}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input 
              type="password" 
              id="editConfirmPassword" 
              className="form-input" 
              value={formData.editConfirmPassword}
              onChange={handleChange}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;