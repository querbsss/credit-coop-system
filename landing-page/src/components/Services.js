import React from 'react';
import './Services.css';

const Services = () => {
  const services = [
    {
      icon: '💰',
      title: 'Savings Accounts',
      description: 'Earn competitive interest rates on your savings with flexible access to your funds.',
      features: ['High interest rates', 'No monthly fees', 'Online banking']
    },
    {
      icon: '🏠',
      title: 'Home Loans',
      description: 'Make your dream of homeownership a reality with our competitive mortgage rates.',
      features: ['Low interest rates', 'Flexible terms', 'Fast approval']
    },
    {
      icon: '🚗',
      title: 'Auto Loans',
      description: 'Get behind the wheel of your next vehicle with our affordable auto financing.',
      features: ['New & used cars', 'Quick processing', 'Great rates']
    },
    {
      icon: '💳',
      title: 'Credit Cards',
      description: 'Enjoy the convenience and rewards of our member-exclusive credit card options.',
      features: ['Cashback rewards', 'Low APR', 'No annual fee']
    },
    {
      icon: '🎓',
      title: 'Education Loans',
      description: 'Invest in your future with our student loan programs and education financing.',
      features: ['Low interest rates', 'Flexible repayment', 'No prepayment penalty']
    },
    {
      icon: '💼',
      title: 'Business Banking',
      description: 'Support your business growth with our comprehensive commercial banking services.',
      features: ['Business checking', 'Commercial loans', 'Merchant services']
    }
  ];

  return (
    <section id="services" className="services">
      <div className="container">
        <div className="section-header">
          <h2>Our Services</h2>
          <p>Comprehensive financial solutions designed with your success in mind</p>
        </div>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul>
                {service.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
              <a href="#contact" className="service-link">Learn More</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
