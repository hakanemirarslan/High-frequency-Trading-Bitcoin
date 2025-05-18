import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    // Clear all authentication related data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    
    // Trigger storage event to update other tabs
    window.localStorage.setItem('logout', Date.now().toString());
    
    // Force a hard redirect to the login page
    window.location.href = '/login';
  };

  return (
    <div className="sidebar">
      <Link to="/" className="home-btn">
        <span className="home-icon">🏠</span>
        <span>Home</span>
      </Link>
      <div className="menu" onClick={() => setOpen(!open)}>
        <span className="menu-title">Menu</span>
        <span className="menu-arrow">{open ? '\u25B2' : '\u25BC'}</span>
      </div>
      {open && (
        <div className="submenu">
          <Link to="/profile" className="sidebar-btn">Profile</Link>
          <Link to="/wallet" className="sidebar-btn">Wallet</Link>
          <Link to="/comparison" className="sidebar-btn">Asset Comparison</Link>
          <Link to="/settings" className="sidebar-btn">Settings</Link>
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
