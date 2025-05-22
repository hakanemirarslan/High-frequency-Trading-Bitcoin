import React, { useState, useEffect } from 'react';
import '../styles/Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    emailAlerts: true,
    priceAlerts: false,
    twoFactorAuth: false,
    currency: 'USD',
    language: 'en',
  });

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    // Load user data (in a real app, this would come from an API)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || ''
    }));
  }, []);

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      setIsSaving(false);
      setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ type: '', message: '' });
      }, 3000);
    }, 1000);
  };

  const updatePassword = (e) => {
    e.preventDefault();
    
    if (userData.newPassword !== userData.confirmPassword) {
      setSaveStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    
    // In a real app, you would validate the current password and update it via an API
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus({ type: 'success', message: 'Password updated successfully!' });
      
      // Clear form and status
      setTimeout(() => {
        setUserData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setSaveStatus({ type: '', message: '' });
      }, 3000);
    }, 1000);
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Settings</h1>
        <p className="settings-description">
          Manage your account preferences and application settings
        </p>
      </header>

      <div className="settings-content">
        <div className="settings-sidebar">
          <button 
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="tab-icon">⚙️</i>
            <span>General</span>
          </button>
          <button 
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="tab-icon">🔒</i>
            <span>Security</span>
          </button>
          <button 
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <i className="tab-icon">🔔</i>
            <span>Notifications</span>
          </button>
          <button 
            className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <i className="tab-icon">👤</i>
            <span>Account</span>
          </button>
        </div>

        <div className="settings-main">
          {saveStatus.message && (
            <div className={`alert alert-${saveStatus.type}`}>
              {saveStatus.message}
            </div>
          )}

          {activeTab === 'general' && (
            <form onSubmit={saveSettings} className="settings-form">
              <h2>General Settings</h2>
              <div className="form-group">
                <label htmlFor="theme">Theme</label>
                <select
                  id="theme"
                  name="theme"
                  value={settings.theme}
                  onChange={handleSettingChange}
                  className="form-control"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={settings.currency}
                  onChange={handleSettingChange}
                  className="form-control"
                >
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="JPY">Japanese Yen (¥)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  name="language"
                  value={settings.language}
                  onChange={handleSettingChange}
                  className="form-control"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={updatePassword} className="settings-form">
              <h2>Security Settings</h2>
              
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={userData.currentPassword}
                  onChange={handleUserDataChange}
                  className="form-control"
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={userData.newPassword}
                  onChange={handleUserDataChange}
                  className="form-control"
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleUserDataChange}
                  className="form-control"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>

              <div className="security-options">
                <h3>Security Options</h3>
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    name="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onChange={handleSettingChange}
                    className="form-check-input"
                  />
                  <label htmlFor="twoFactorAuth" className="form-check-label">
                    Enable Two-Factor Authentication (2FA)
                  </label>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={saveSettings} className="settings-form">
              <h2>Notification Settings</h2>
              
              <div className="form-check">
                <input
                  type="checkbox"
                  id="notifications"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleSettingChange}
                  className="form-check-input"
                />
                <label htmlFor="notifications" className="form-check-label">
                  Enable Notifications
                </label>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  id="emailAlerts"
                  name="emailAlerts"
                  checked={settings.emailAlerts}
                  onChange={handleSettingChange}
                  className="form-check-input"
                  disabled={!settings.notifications}
                />
                <label htmlFor="emailAlerts" className="form-check-label">
                  Email Alerts
                </label>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  id="priceAlerts"
                  name="priceAlerts"
                  checked={settings.priceAlerts}
                  onChange={handleSettingChange}
                  className="form-check-input"
                  disabled={!settings.notifications}
                />
                <label htmlFor="priceAlerts" className="form-check-label">
                  Price Alert Notifications
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'account' && (
            <form onSubmit={saveSettings} className="settings-form">
              <h2>Account Information</h2>
              
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleUserDataChange}
                  className="form-control"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleUserDataChange}
                  className="form-control"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Update Account'}
                </button>
              </div>

              <div className="account-actions">
                <h3>Danger Zone</h3>
                <div className="danger-zone">
                  <p>Deleting your account will remove all your data. This action cannot be undone.</p>
                  <button type="button" className="btn btn-danger">
                    Delete My Account
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
