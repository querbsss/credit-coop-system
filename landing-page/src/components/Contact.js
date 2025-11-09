import React, { useState } from 'react';
import './Contact.css';
import addressIcon from '../assets/icons/finance/address-svgrepo-com.svg';
import phoneIcon from '../assets/icons/finance/phone-svgrepo-com.svg';
import emailIcon from '../assets/icons/finance/email-svgrepo-com.svg';
import clockIcon from '../assets/icons/finance/clock-ten-svgrepo-com.svg';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-header">
          <h2>Get in Touch</h2>
          <p>Ready to join our credit cooperative family? We're here to help you get started.</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <h3>Contact Information</h3>
            
            <div className="contact-item">
              <span className="icon">
                <img src={addressIcon} alt="Address" />
              </span>
              <div>
                <h4>Address</h4>
                <p>Shrine Parish of St. Therese of the Child Jesus and the Holy Face<br />Poblacion 1, Sta Teresita Batangas</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="icon">
                <img src={phoneIcon} alt="Phone" />
              </span>
              <div>
                <h4>Phone</h4>
                <p>0927-375-6771</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="icon">
                <img src={emailIcon} alt="Email" />
              </span>
              <div>
                <h4>Email</h4>
                <p>info@creditcoop.com</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="icon">
                <img src={clockIcon} alt="Business Hours" />
              </span>
              <div>
                <h4>Business Hours</h4>
                <p>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 9:00 AM - 2:00 PM<br />Sunday: Closed</p>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Your Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select a Subject</option>
                <option value="membership">Membership Inquiry</option>
                <option value="loans">Loan Information</option>
                <option value="accounts">Account Services</option>
                <option value="support">Customer Support</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <textarea
                name="message"
                placeholder="Your Message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
