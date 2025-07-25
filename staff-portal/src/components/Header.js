import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="staff-header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-icon">⚛️</div>
            <div className="logo-text">
              <h1>CreditCoop</h1>
              <span className="logo-subtitle">Staff Portal</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="staff-info">
            <div className="staff-details">
              <span className="staff-name">{user?.firstName} {user?.lastName}</span>
              <span className="staff-role">{user?.role} • {user?.department}</span>
            </div>
            <div className="staff-avatar">
              {user?.avatar}
            </div>
          </div>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
