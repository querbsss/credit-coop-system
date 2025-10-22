import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <img src="/logo192.png" alt="CreditCoop" className="logo-img" />
              <span className="logo-text">CreditCoop</span>
            </div>
            <div className="user-info">
              <span className="welcome-text">Welcome back, {user?.firstName} {user?.lastName}</span>
              <span className="status-badge status-active">ACTIVE</span>
            </div>
          </div>

          <div className="header-right">
            <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
              <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <a href="#accounts" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Accounts</a>
              <Link to="/loans" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Loans</Link>
              <Link to="/payment-dues" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Payment Dues</Link>
              <a href="#profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Profile</a>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </nav>

            <div className="user-avatar">
              <div className="avatar-circle">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>

            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
