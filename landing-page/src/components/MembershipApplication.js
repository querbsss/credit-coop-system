import React, { useState } from 'react';
import './MembershipApplication.css';

const MembershipApplication = () => {
  const [formData, setFormData] = useState({
    // Basic membership information
    numberOfShares: '',
    amountSubscribe: '',
    date: '',
    membershipType: '',
    applicantsMembershipNumber: '',
    
    // Personal information
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    address: '',
    contactNumber: '',
    typeOfAddress: '',
    occupiedSince: '',
    emailAddress: '',
    dateOfBirth: '',
    placeOfBirth: '',
    religion: '',
    age: '',
    gender: '',
    civilStatus: '',
    highestEducationalAttainment: '',
    
    // Family information
    spouseFullName: '',
    fathersFullName: '',
    mothersMaidenName: '',
    numberOfDependents: '',
    
    // Professional information
    occupation: '',
    annualIncome: '',
    taxIdentificationNumber: '',
    identificationType: '',
    identificationNumber: '',
    employmentChoice: '', // sole trader or employed
    
    // If self employed
    businessType: '',
    businessAddress: '',
    
    // If employed
    employerTradeName: '',
    employerTinNumber: '',
    employerPhoneNumber: '',
    dateHiredFrom: '',
    dateHiredTo: '',
    employmentOccupation: '',
    employmentOccupationStatus: '',
    annualMonthlyIndicator: '',
    employmentIndustry: '',
    
    // Social and reference
    facebookAccount: '',
    referencePerson: '',
    referenceAddress: '',
    referenceContactNumber: '',
    
    // File upload
    profileImage: null,
    
    // Agreements
    agreeToTerms: false,
    agreeToPrivacy: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData to handle file upload
      const formDataToSubmit = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'profileImage' && formData[key]) {
          formDataToSubmit.append('profileImage', formData[key]);
        } else if (formData[key] !== null && formData[key] !== '') {
          formDataToSubmit.append(key, formData[key]);
        }
      });

      // Submit to backend API
      const response = await fetch('http://localhost:3004/api/membership-application', {
        method: 'POST',
        body: formDataToSubmit
      });

      const result = await response.json();

      if (result.success) {
        alert('Thank you for your membership application! We\'ll review it and contact you within 2-3 business days.');
        
        // Reset form
        setFormData({
          // Basic membership information
          numberOfShares: '',
          amountSubscribe: '',
          date: '',
          membershipType: '',
          applicantsMembershipNumber: '',
          
          // Personal information
          lastName: '',
          firstName: '',
          middleName: '',
          suffix: '',
          address: '',
          contactNumber: '',
          typeOfAddress: '',
          occupiedSince: '',
          emailAddress: '',
          dateOfBirth: '',
          placeOfBirth: '',
          religion: '',
          age: '',
          gender: '',
          civilStatus: '',
          highestEducationalAttainment: '',
          
          // Family information
          spouseFullName: '',
          fathersFullName: '',
          mothersMaidenName: '',
          numberOfDependents: '',
          
          // Professional information
          occupation: '',
          annualIncome: '',
          taxIdentificationNumber: '',
          identificationType: '',
          identificationNumber: '',
          employmentChoice: '',
          
          // If self employed
          businessType: '',
          businessAddress: '',
          
          // If employed
          employerTradeName: '',
          employerTinNumber: '',
          employerPhoneNumber: '',
          dateHiredFrom: '',
          dateHiredTo: '',
          employmentOccupation: '',
          employmentOccupationStatus: '',
          annualMonthlyIndicator: '',
          employmentIndustry: '',
          
          // Social and reference
          facebookAccount: '',
          referencePerson: '',
          referenceAddress: '',
          referenceContactNumber: '',
          
          // File upload
          profileImage: null,
          
          // Agreements
          agreeToTerms: false,
          agreeToPrivacy: false
        });
      } else {
        alert('Error submitting application: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting application. Please try again.');
    }
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
            <h3>Member Application</h3>
            
            {/* Basic Membership Information */}
            <div className="form-section">
              <h4>Membership Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Number of Shares *</label>
                  <input
                    type="number"
                    name="numberOfShares"
                    value={formData.numberOfShares}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount Subscribe *</label>
                  <input
                    type="number"
                    name="amountSubscribe"
                    value={formData.amountSubscribe}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Membership Type *</label>
                  <select
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Membership Type</option>
                    <option value="regular">Regular</option>
                    <option value="associate">Associate</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Applicant's Membership Number</label>
                  <input
                    type="text"
                    name="applicantsMembershipNumber"
                    value={formData.applicantsMembershipNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="form-section">
              <h4>Personal Information</h4>
              <div className="form-row">
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
                  <label>Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Suffix</label>
                  <input
                    type="text"
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleChange}
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
                  <label>Contact Number *</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type of Address *</label>
                  <select
                    name="typeOfAddress"
                    value={formData.typeOfAddress}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="house owner">House Owner</option>
                    <option value="lessee">Lessee</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Occupied Since (DD-MM-YYYY) *</label>
                  <input
                    type="date"
                    name="occupiedSince"
                    value={formData.occupiedSince}
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
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Place of Birth *</label>
                  <input
                    type="text"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Religion</label>
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Civil Status *</label>
                  <select
                    name="civilStatus"
                    value={formData.civilStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Highest Educational Attainment *</label>
                <select
                  name="highestEducationalAttainment"
                  value={formData.highestEducationalAttainment}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Education Level</option>
                  <option value="elementary">Elementary</option>
                  <option value="high school">High School</option>
                  <option value="college">College</option>
                  <option value="graduate">Graduate</option>
                  <option value="post-graduate">Post Graduate</option>
                </select>
              </div>
            </div>

            {/* Family Information */}
            <div className="form-section">
              <h4>Family Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Spouse Full Name</label>
                  <input
                    type="text"
                    name="spouseFullName"
                    value={formData.spouseFullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Father's Full Name</label>
                  <input
                    type="text"
                    name="fathersFullName"
                    value={formData.fathersFullName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Mother's Maiden Name</label>
                  <input
                    type="text"
                    name="mothersMaidenName"
                    value={formData.mothersMaidenName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Number of Dependents</label>
                  <input
                    type="number"
                    name="numberOfDependents"
                    value={formData.numberOfDependents}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="form-section">
              <h4>Professional Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Occupation *</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Annual Income *</label>
                  <input
                    type="number"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tax Identification Number</label>
                  <input
                    type="text"
                    name="taxIdentificationNumber"
                    value={formData.taxIdentificationNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Identification Type *</label>
                  <select
                    name="identificationType"
                    value={formData.identificationType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select ID Type</option>
                    <option value="drivers license">Driver's License</option>
                    <option value="passport">Passport</option>
                    <option value="national id">National ID</option>
                    <option value="voters id">Voter's ID</option>
                    <option value="tin id">TIN ID</option>
                    <option value="sss id">SSS ID</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Identification Number *</label>
                  <input
                    type="text"
                    name="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Employment Choice *</label>
                <select
                  name="employmentChoice"
                  value={formData.employmentChoice}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Employment Type</option>
                  <option value="sole trader">Sole Trader</option>
                  <option value="employed">Employed</option>
                </select>
              </div>

              {/* Self Employed Section */}
              {formData.employmentChoice === 'sole trader' && (
                <div className="conditional-section">
                  <h5>Self Employed Information</h5>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Business Type *</label>
                      <input
                        type="text"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Business Address *</label>
                      <input
                        type="text"
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Employed Section */}
              {formData.employmentChoice === 'employed' && (
                <div className="conditional-section">
                  <h5>Employment Information</h5>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Employer Trade Name *</label>
                      <input
                        type="text"
                        name="employerTradeName"
                        value={formData.employerTradeName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Employer TIN Number</label>
                      <input
                        type="text"
                        name="employerTinNumber"
                        value={formData.employerTinNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Employer Phone Number</label>
                      <input
                        type="tel"
                        name="employerPhoneNumber"
                        value={formData.employerPhoneNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date Hired From</label>
                      <input
                        type="date"
                        name="dateHiredFrom"
                        value={formData.dateHiredFrom}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date Hired To</label>
                      <input
                        type="date"
                        name="dateHiredTo"
                        value={formData.dateHiredTo}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Employment Occupation</label>
                      <input
                        type="text"
                        name="employmentOccupation"
                        value={formData.employmentOccupation}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Employment Occupation Status</label>
                      <select
                        name="employmentOccupationStatus"
                        value={formData.employmentOccupationStatus}
                        onChange={handleChange}
                      >
                        <option value="">Select Status</option>
                        <option value="permanent">Permanent</option>
                        <option value="contractual">Contractual</option>
                        <option value="probationary">Probationary</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Annual/Monthly Indicator</label>
                      <select
                        name="annualMonthlyIndicator"
                        value={formData.annualMonthlyIndicator}
                        onChange={handleChange}
                      >
                        <option value="">Select Indicator</option>
                        <option value="annual">Annual</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Employment Industry</label>
                      <input
                        type="text"
                        name="employmentIndustry"
                        value={formData.employmentIndustry}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Social and Reference Information */}
            <div className="form-section">
              <h4>Social and Reference Information</h4>
              <div className="form-group">
                <label>Facebook Account</label>
                <input
                  type="text"
                  name="facebookAccount"
                  value={formData.facebookAccount}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Reference Person *</label>
                  <input
                    type="text"
                    name="referencePerson"
                    value={formData.referencePerson}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Reference Address *</label>
                  <input
                    type="text"
                    name="referenceAddress"
                    value={formData.referenceAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Reference Contact Number *</label>
                  <input
                    type="tel"
                    name="referenceContactNumber"
                    value={formData.referenceContactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Profile Image Upload */}
            <div className="form-section">
              <h4>Profile Image</h4>
              <div className="form-group">
                <label>Upload Profile Image *</label>
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />
                <small>Please upload a clear photo of yourself (JPG, PNG, max 5MB)</small>
              </div>
            </div>

            {/* Agreements */}
            <div className="form-section">
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
