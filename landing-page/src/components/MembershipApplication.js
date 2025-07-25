import React, { useState } from 'react';
import './MembershipApplication.css';

const MembershipApplication = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    occupation: '',
    employer: '',
    annualIncome: '',
    accountType: '',
    initialDeposit: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Membership application submitted:', formData);
    alert('Thank you for your membership application! We\'ll review it and contact you within 2-3 business days.');
    // Reset form or redirect
  };

  return (
    <section id="membership" className="membership-application">
      <div className="container">
        <div className="section-header">
          <h2>Become a Member Today</h2>
          <p>Join our cooperative family and enjoy exclusive benefits, competitive rates, and personalized service.</p>
        </div>

        <div className="membership-content">
          <div className="benefits-section">
            <h3>Membership Benefits</h3>
            <div className="benefits-grid">
              <div className="benefit-item">
                <span className="benefit-icon">💰</span>
                <h4>Higher Savings Rates</h4>
                <p>Earn more on your deposits with our competitive interest rates</p>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🏠</span>
                <h4>Lower Loan Rates</h4>
                <p>Get better rates on mortgages, auto loans, and personal loans</p>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🤝</span>
                <h4>Member Ownership</h4>
                <p>Be part of a cooperative where every member has a voice</p>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📱</span>
                <h4>Digital Banking</h4>
                <p>Access your accounts 24/7 with our mobile and online banking</p>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🎓</span>
                <h4>Financial Education</h4>
                <p>Free workshops and resources to improve your financial literacy</p>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🛡️</span>
                <h4>Deposit Insurance</h4>
                <p>Your deposits are protected up to ₱14M by PDIC insurance</p>
              </div>
            </div>
          </div>

          <form className="application-form" onSubmit={handleSubmit}>
            <h3>Membership Application</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Zip Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Employer</label>
                <input
                  type="text"
                  name="employer"
                  value={formData.employer}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Annual Income</label>
                <select
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                >
                  <option value="">Select Income Range</option>
                  <option value="under-1.4m">Under ₱1.4M</option>
                  <option value="1.4m-2.8m">₱1.4M - ₱2.8M</option>
                  <option value="2.8m-4.2m">₱2.8M - ₱4.2M</option>
                  <option value="4.2m-5.6m">₱4.2M - ₱5.6M</option>
                  <option value="over-5.6m">Over ₱5.6M</option>
                </select>
              </div>
              <div className="form-group">
                <label>Account Type *</label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Account Type</option>
                  <option value="regular-savings">Regular Savings</option>
                  <option value="checking">Checking Account</option>
                  <option value="both">Savings & Checking</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Initial Deposit Amount *</label>
              <select
                name="initialDeposit"
                value={formData.initialDeposit}
                onChange={handleChange}
                required
              >
                <option value="">Select Initial Deposit</option>
                <option value="1400">₱1,400 (Minimum)</option>
                <option value="5600">₱5,600</option>
                <option value="14000">₱14,000</option>
                <option value="28000">₱28,000</option>
                <option value="56000">₱56,000</option>
                <option value="other">Other Amount</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                />
                I agree to the Terms and Conditions and Membership Agreement *
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onChange={handleChange}
                  required
                />
                I agree to the Privacy Policy and consent to data processing *
              </label>
            </div>

            <button type="submit" className="btn btn-primary submit-btn">
              Submit Application
            </button>

            <p className="form-note">
              * Required fields. Your application will be reviewed within 2-3 business days.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default MembershipApplication;
