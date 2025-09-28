import React from 'react';
import Icon from './Icon';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h2>About CreditCoop</h2>
            <p>
              Founded in 1998, CreditCoop has been serving our community with integrity, 
              transparency, and a commitment to financial empowerment. As a member-owned 
              financial cooperative, we're not just your bank – we're your financial partner.
            </p>
            
            <div className="mission-vision">
              <div className="mission">
                <h4>🎯 Our Mission</h4>
                <p>
                  To provide exceptional financial services while fostering economic growth 
                  and financial literacy in our community. We exist to help our members 
                  achieve their financial goals through cooperative principles and personalized service.
                </p>
              </div>
              
              <div className="vision">
                <h4>🌟 Our Vision</h4>
                <p>
                  To be the leading community-focused financial cooperative, empowering 
                  members to build strong financial futures while strengthening our 
                  local economy through cooperative ownership and shared prosperity.
                </p>
              </div>
            </div>
            
            <div className="values">
              <h3>Our Core Values</h3>
              <div className="value">
                <h4><Icon name="users" size={20} color="var(--primary-blue)" /> Community First</h4>
                <p>We're committed to strengthening our local community through responsible financial services and member support.</p>
              </div>
              <div className="value">
                <h4><Icon name="zap" size={20} color="var(--primary-blue)" /> Financial Education</h4>
                <p>We believe in empowering our members with knowledge to make informed financial decisions for life.</p>
              </div>
              <div className="value">
                <h4><Icon name="shield" size={20} color="var(--primary-blue)" /> Security & Trust</h4>
                <p>Your financial security is our top priority, with state-of-the-art protection measures and transparency.</p>
              </div>
            </div>
          </div>
          
          <div className="about-image">
            <div className="image-placeholder">
              <div className="placeholder-content">
                <h3>Member-Owned</h3>
                <p>Democratic Control</p>
                <p>Shared Prosperity</p>
                <p>Community Focus</p>
                <p>Financial Growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
