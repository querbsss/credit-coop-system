import React from 'react';
import './Header.css';

const Header = ({ setAuth }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(false);
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
              <span className="staff-name">Staff User</span>
              <span className="staff-role">Administrator • Operations</span>
            </div>
            <div className="staff-avatar">
              👤
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
