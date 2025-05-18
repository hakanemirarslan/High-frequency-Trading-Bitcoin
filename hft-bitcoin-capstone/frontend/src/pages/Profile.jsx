import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Save, Edit } from 'lucide-react';
import '../styles/Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    joinDate: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !localStorage.getItem('isAuthenticated')) {
      navigate('/login');
      return;
    }
    setUserData(user);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!userData.name) {
      errors.name = 'Name is required';
    }
    
    if (!userData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (userData.phone && !/^[0-9-+()\s]*$/.test(userData.phone)) {
      errors.phone = 'Invalid phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Show success message
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>My Profile</h2>
          {!isEditing ? (
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={16} /> Edit Profile
            </button>
          ) : (
            <div className="profile-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setIsEditing(false);
                  // Reload original data
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  setUserData(user);
                }}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                className={formErrors.name ? 'error' : ''}
              />
            ) : (
              <div className="profile-field">{userData.name}</div>
            )}
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>
          
          <div className="form-group">
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                className={formErrors.email ? 'error' : ''}
              />
            ) : (
              <div className="profile-field">{userData.email}</div>
            )}
            {formErrors.email && <span className="error-message">{formErrors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Date of Birth</label>
            {isEditing ? (
              <input
                type="date"
                name="dateOfBirth"
                value={userData.dateOfBirth || ''}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
            ) : (
              <div className="profile-field">
                {userData.dateOfBirth ? formatDate(userData.dateOfBirth) : 'Not set'}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={userData.phone || ''}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className={formErrors.phone ? 'error' : ''}
              />
            ) : (
              <div className="profile-field">{userData.phone || 'Not set'}</div>
            )}
            {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
          </div>
          
          <div className="form-group">
            <label>Member Since</label>
            <div className="profile-field">
              {userData.joinDate ? formatDate(userData.joinDate) : 'N/A'}
            </div>
          </div>
          
          {isEditing && (
            <div className="form-group password-group">
              <label>Change Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="Leave blank to keep current password"
                  className={formErrors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="password-hint">
                Password must be at least 8 characters long and include uppercase, number, and special character.
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
