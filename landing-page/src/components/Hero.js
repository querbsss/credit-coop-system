import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <div className="container">
          <div className="hero-text">
            <h1>Your Financial Partner for Life</h1>
            <p>Join our credit cooperative and enjoy better rates, personalized service, and a community that cares about your financial success.</p>
            <div className="hero-buttons">
              <a href="#services" className="btn btn-primary">Explore Services</a>
              <a href="#membership" className="btn btn-secondary">Become a Member</a>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <h3>₱2.5B+</h3>
              <p>Total Assets</p>
            </div>
            <div className="stat">
              <h3>5,000+</h3>
              <p>Happy Members</p>
            </div>
            <div className="stat">
              <h3>25+</h3>
              <p>Years of Service</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
