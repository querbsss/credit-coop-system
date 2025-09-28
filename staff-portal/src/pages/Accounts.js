import React from 'react';
import Icon from '../components/Icon';

const Accounts = () => {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Account Management</h1>
          <p>Manage savings, checking, and loan accounts</p>
        </div>
        <button className="btn btn-primary">
          <Icon name="savings" size={16} />
          Create Account
        </button>
      </div>
      
      <div className="card">
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}><Icon name="savings" size={64} color="var(--primary-blue)" /></div>
          <h3>Account Management</h3>
          <p>This section will contain account management features including:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '1rem' }}>
            <li>View all member accounts</li>
            <li>Create new savings/checking accounts</li>
            <li>Account balance management</li>
            <li>Account transactions history</li>
            <li>Account status management</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
