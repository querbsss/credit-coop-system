import React from 'react';

const Reports = () => {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Financial Reports</h1>
          <p>Generate and view financial reports and analytics</p>
        </div>
        <button className="btn btn-primary">
          <span>📈</span>
          Generate Report
        </button>
      </div>
      
      <div className="card">
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📈</div>
          <h3>Financial Reports</h3>
          <p>This section will contain reporting features including:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '1rem' }}>
            <li>Monthly financial statements</li>
            <li>Member growth reports</li>
            <li>Loan portfolio analysis</li>
            <li>Deposit trends and analytics</li>
            <li>Profitability reports</li>
            <li>Regulatory compliance reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;
