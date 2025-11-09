import React from 'react';
import './Footer.css';
import addressIcon from '../assets/icons/finance/address-svgrepo-com.svg';
import phoneIcon from '../assets/icons/finance/phone-svgrepo-com.svg';
import emailIcon from '../assets/icons/finance/email-svgrepo-com.svg';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SLZCreditCoop</h3>
            <p>Your trusted financial partner, committed to serving our community with integrity and excellence.</p>
            <div className="social-links">
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">Twitter</a>
              <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="/member-portal">Member Portal</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><a href="#services">Savings Accounts</a></li>
              <li><a href="#services">Home Loans</a></li>
              <li><a href="#services">Auto Loans</a></li>
              <li><a href="#services">Credit Cards</a></li>
              <li><a href="#services">Business Banking</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info">
              <p><img src={addressIcon} alt="Address" className="footer-icon" /> ShrinPe Parish of St. Therese of the Child Jesus and the Holy Face<br />Poblacion 1, Sta Teresita Batangas</p>
              <p><img src={phoneIcon} alt="Phone" className="footer-icon" /> 0927-375-6771</p>
              <p><img src={emailIcon} alt="Email" className="footer-icon" /> saintslouiezelie@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2025 SLZCreditCoop. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#security">Security</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
