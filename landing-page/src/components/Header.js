import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <span>CC</span>
            </div>
            <span className="logo-text">CreditCoop</span>
          </div>
          
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul className="nav-list">
              <li><a href="#home" className="nav-link">Home</a></li>
              <li><a href="#services" className="nav-link">Services</a></li>
              <li><a href="#about" className="nav-link">About Us</a></li>
              <li><a href="#membership" className="nav-link">Membership</a></li>
              <li><a href="#contact" className="nav-link">Contact</a></li>
            </ul>
            
            <div className="nav-actions">
              <a href="/member-portal" className="btn-login">
                <Icon name="user" size={16} />
                Member Login
              </a>
              <a href="#membership" className="btn btn-primary btn-join">
                Join Now
              </a>
            </div>
          </nav>

          <button 
            className={`hamburger ${isMenuOpen ? 'hamburger-active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
