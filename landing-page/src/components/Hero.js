import React from 'react';
import Icon from './Icon';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-background">
        <div className="hero-pattern"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-text">Trusted by 5,000+ Members</span>
            </div>
            
            <h1 className="hero-title">
              Building a better Philippines — 
              <span className="text-primary"> one family, one community at a time</span>
            </h1>
            
            <p className="hero-description">
              CreditCoop continues to pave the way for Philippine financial empowerment, 
              supporting economic growth and nation-building through personalized banking 
              services that put our members first.
            </p>
            
            <div className="hero-buttons">
              <a href="#membership" className="btn btn-primary btn-lg">
                <span>Become a Member</span>
                <Icon name="arrowRight" size={16} />
              </a>
              <a href="#services" className="btn btn-secondary btn-lg">
                Explore Services
              </a>
            </div>
            
            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon"><Icon name="shield" size={20} /></div>
                <span>PDIC Insured</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Icon name="zap" size={20} /></div>
                <span>Instant Processing</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Icon name="smartphone" size={20} /></div>
                <span>Digital Banking</span>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-cards">
              <div className="hero-card card-savings">
                <div className="card-header">
                  <div className="card-icon"><Icon name="savings" size={24} color="var(--primary-blue)" /></div>
                  <h4>Savings Account</h4>
                </div>
                <div className="card-amount">₱125,000.00</div>
                <div className="card-growth">+5.2% this month</div>
              </div>
              
              <div className="hero-card card-loan">
                <div className="card-header">
                  <div className="card-icon"><Icon name="home" size={24} color="var(--primary-blue)" /></div>
                  <h4>Home Loan</h4>
                </div>
                <div className="card-rate">3.5% APR</div>
                <div className="card-term">Up to 30 years</div>
              </div>
              
              <div className="hero-card card-investment">
                <div className="card-header">
                  <div className="card-icon"><Icon name="trendingUp" size={24} color="var(--primary-blue)" /></div>
                  <h4>Investment</h4>
                </div>
                <div className="card-amount">₱50,000.00</div>
                <div className="card-growth">+12.8% annually</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">₱2.5B+</div>
              <div className="stat-label">Total Assets</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Active Members</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">25+</div>
              <div className="stat-label">Years of Service</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
