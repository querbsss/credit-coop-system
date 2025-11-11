
import React, { useEffect, useState } from 'react';
import { ReactComponent as HourglassIcon } from '../assets/icons/hourglass-svgrepo-com.svg';
import { ReactComponent as MagnifyingGlassIcon } from '../assets/icons/magnifying-glass-svgrepo-com.svg';
import { ReactComponent as CheckCircleIcon } from '../assets/icons/check-circle-svgrepo-com.svg';
import { ReactComponent as CrossIcon } from '../assets/icons/cross-svgrepo-com.svg';
import axios from 'axios';
import './Dashboard.css';
import '../status-badge.css';

const CreditInvestigatorDashboard = () => {
  const [loanApplications, setLoanApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [statistics, setStatistics] = useState({});
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    const userInfoRaw = localStorage.getItem('userInfo');
    if (userInfoRaw) {
      try {
        const userInfo = JSON.parse(userInfoRaw);
        setUserRole(userInfo.role || '');
      } catch {
        setUserRole('');
      }
    }
  }, []);

  useEffect(() => {
    if (userRole === 'credit_investigator') {
      axios.get(`${process.env.REACT_APP_API_URL}/api/loan-review/applications?reviewer_role=credit_investigator`)
        .then(res => {
          if (res.data.success) {
            setLoanApplications(res.data.applications);
          } else {
            setLoanApplications([]);
          }
        })
        .catch(() => setLoanApplications([]));
      axios.get(`${process.env.REACT_APP_API_URL}/api/loan-review/statistics`)
        .then(res => {
          if (res.data.success) {
            setStatistics(res.data.statistics);
          }
        });
    }
  }, [userRole]);

  const handleReview = async (application) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/loan-review/applications/${application.application_id}`);
      if (res.data.success) {
        setSelectedApplication(res.data.application);
      } else {
        setSelectedApplication(application);
      }
    } catch {
      setSelectedApplication(application);
    }
  };

  const handleSendToManager = async (applicationId) => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/loan-review/applications/${applicationId}/review`, {
        action: 'approve_for_manager',
        notes: 'Reviewed by credit investigator',
        reviewer_id: 'credit_investigator',
      });
      setSelectedApplication(null);
      axios.get(`${process.env.REACT_APP_API_URL}/api/loan-review/applications?reviewer_role=credit_investigator`)
        .then(res => {
          if (res.data.success) {
            setLoanApplications(res.data.applications);
          } else {
            setLoanApplications([]);
          }
        })
        .catch(() => setLoanApplications([]));
    } catch (err) {}
    setLoading(false);
  };

  const filteredApplications = loanApplications.filter(app => {
    const matchesStatus = filter.status === 'all' || app.review_status === filter.status;
    const matchesPriority = filter.priority === 'all' || app.priority_level === filter.priority;
    const matchesSearch = (app.applicant_name || '').toLowerCase().includes(filter.search.toLowerCase()) ||
      app.application_id.toString().includes(filter.search);
    return matchesStatus && matchesPriority && matchesSearch;
  });

  if (userRole !== 'credit_investigator') {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>You do not have permission to view this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container credit-investigator-dashboard">
      <div className="page-header">
        <h1> Credit Investigator Dashboard</h1>
        <p>Review loan applications and send to manager for approval</p>
      </div>
      <div className="stats-grid">
          <div className="stat-card pending">
            <div className="stat-icon"><HourglassIcon /></div>
            <div className="stat-content">
              <h3>Pending Review</h3>
              <span className="stat-number">{statistics.pending_review || 0}</span>
            </div>
          </div>
          <div className="stat-card under-review">
            <div className="stat-icon"><MagnifyingGlassIcon /></div>
            <div className="stat-content">
              <h3>Awaiting Approval</h3>
              <span className="stat-number">{statistics.under_review || 0}</span>
            </div>
          </div>
          <div className="stat-card approved">
            <div className="stat-icon"><CheckCircleIcon /></div>
            <div className="stat-content">
              <h3>Approved</h3>
              <span className="stat-number">{statistics.approved || 0}</span>
            </div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-icon"><CrossIcon /></div>
            <div className="stat-content">
              <h3>Rejected</h3>
              <span className="stat-number">{statistics.rejected || 0}</span>
            </div>
          </div>
      </div>
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search applications..."
            value={filter.search}
            onChange={e => setFilter({ ...filter, search: e.target.value })}
            className="search-input"
          />
          <select
            value={filter.status}
            onChange={e => setFilter({ ...filter, status: e.target.value })}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending_review">Pending Review</option>
            <option value="under_review">Awaiting Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="returned">Returned</option>
          </select>
          <select
            value={filter.priority}
            onChange={e => setFilter({ ...filter, priority: e.target.value })}
            className="filter-select"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <div className="applications-section">
        <div className="table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Applicant Name</th>
                <th>Member Number</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr><td colSpan={6}>No loan applications to review.</td></tr>
              ) : (
                filteredApplications.map(app => (
                  <tr key={app.application_id}>
                    <td>{app.application_id}</td>
                    <td>{app.applicant_name || `${app.first_name} ${app.middle_name} ${app.last_name}`}</td>
                    <td>{app.member_number}</td>
                    <td>
                      <span className={`status-badge ${app.review_status === 'active' ? 'status-active' : ''}`}> 
                        {app.review_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(app.submitted_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handleReview(app)}>
                        {app.review_status === 'approved' ? 'View Review' : 'Review'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Review Application #{selectedApplication.application_id}</h2>
              <button className="close-btn" onClick={() => setSelectedApplication(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Application Details */}
              <div className="detail-section">
                <h3>Application Details</h3>
                <div className="info-grid">
                  <div className="info-item"><label>Application ID:</label> <span>{selectedApplication.application_id}</span></div>
                  <div className="info-item"><label>Member Number:</label> <span>{selectedApplication.member_number}</span></div>
                  <div className="info-item"><label>Status:</label> <span>{selectedApplication.status}</span></div>
                  <div className="info-item"><label>Submitted At:</label> <span>{selectedApplication.submitted_at ? new Date(selectedApplication.submitted_at).toLocaleString() : 'N/A'}</span></div>
                  <div className="info-item"><label>Reviewed At:</label> <span>{selectedApplication.reviewed_at ? new Date(selectedApplication.reviewed_at).toLocaleString() : 'N/A'}</span></div>
                  <div className="info-item"><label>Reviewed By:</label> <span>{selectedApplication.reviewed_by || 'N/A'}</span></div>
                </div>
              </div>
              {/* Applicant Information */}
              <div className="detail-section">
                <h3>Applicant Information</h3>
                <div className="info-grid">
                  <div className="info-item"><label>Name:</label> <span>{selectedApplication.applicant_name || `${selectedApplication.first_name} ${selectedApplication.middle_name} ${selectedApplication.last_name}`}</span></div>
                  <div className="info-item"><label>Gender:</label> <span>{selectedApplication.gender}</span></div>
                  <div className="info-item"><label>Civil Status:</label> <span>{selectedApplication.civil_status}</span></div>
                  <div className="info-item"><label>Birth Date:</label> <span>{selectedApplication.birth_date ? new Date(selectedApplication.birth_date).toLocaleString() : 'N/A'}</span></div>
                  <div className="info-item"><label>Landline:</label> <span>{selectedApplication.landline}</span></div>
                  <div className="info-item"><label>Mobile Number:</label> <span>{selectedApplication.mobile_number}</span></div>
                  <div className="info-item"><label>Email Address:</label> <span>{selectedApplication.email_address}</span></div>
                  <div className="info-item"><label>Facebook Account:</label> <span>{selectedApplication.facebook_account ? (<a href={`https://facebook.com/${selectedApplication.facebook_account}`} target="_blank" rel="noopener noreferrer">{selectedApplication.facebook_account}</a>) : 'N/A'}</span></div>
                </div>
              </div>
              {/* Address Information */}
              <div className="detail-section">
                <h3>Address Information</h3>
                <div className="info-grid">
                  <div className="info-item"><label>Current Address:</label> <span>{selectedApplication.current_address}</span></div>
                  <div className="info-item"><label>Years of Stay (Current):</label> <span>{selectedApplication.years_of_stay_current}</span></div>
                  <div className="info-item"><label>Permanent Address:</label> <span>{selectedApplication.permanent_address}</span></div>
                  <div className="info-item"><label>Years of Stay (Permanent):</label> <span>{selectedApplication.years_of_stay_permanent}</span></div>
                  <div className="info-item"><label>Home Ownership:</label> <span>{selectedApplication.home_ownership}</span></div>
                </div>
              </div>
              {/* Family Information */}
              <div className="detail-section">
                <h3>Family Information</h3>
                <div className="info-grid">
                  <div className="info-item"><label>Spouse Name:</label> <span>{selectedApplication.spouse_name}</span></div>
                  <div className="info-item"><label>Number of Children:</label> <span>{selectedApplication.number_of_children}</span></div>
                </div>
              </div>
              {/* Employment Information */}
              <div className="detail-section">
                <h3>Employment Information</h3>
                <div className="info-grid">
                  <div className="info-item"><label>Date Hired:</label> <span>{selectedApplication.date_hired ? new Date(selectedApplication.date_hired).toLocaleString() : 'N/A'}</span></div>
                  <div className="info-item"><label>Company/Business:</label> <span>{selectedApplication.company_business}</span></div>
                  <div className="info-item"><label>Contract Period:</label> <span>{selectedApplication.contract_period}</span></div>
                  <div className="info-item"><label>Designation/Position:</label> <span>{selectedApplication.designation_position}</span></div>
                  <div className="info-item"><label>Years in Company:</label> <span>{selectedApplication.years_in_company}</span></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedApplication.review_status !== 'approved' && (
                <button className="btn btn-primary" onClick={() => handleSendToManager(selectedApplication.application_id)} disabled={loading}>
                  {loading ? 'Sending...' : 'Send to Manager for Approval'}
                </button>
              )}
              {/* Loan Officer can input loan amount if approved by manager */}
              {selectedApplication.review_status === 'approved' && (
                <div style={{width: '100%', marginTop: '1rem'}}>
                  <h4>Set Loan Amount & Calculate Deductions</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Loan Amount:</label>
                      <input type="number" min="0" step="0.01" style={{width: '120px'}} value={selectedApplication.loan_amount || ''}
                        onChange={e => setSelectedApplication({...selectedApplication, loan_amount: e.target.value})} />
                    </div>
                    <div className="info-item">
                      <label>Loan Duration:</label>
                      <span>
                        {selectedApplication.loan_type === 'quick' ? '6 months' : selectedApplication.loan_type === 'regular' ? '12 months' : 'N/A'}
                      </span>
                    </div>
                  </div>
                  {/* Deductions Calculation Section */}
                  {selectedApplication.loan_amount && (
                    (() => {
                      const amount = parseFloat(selectedApplication.loan_amount) || 0;
                      const months = selectedApplication.loan_type === 'quick' ? 6 : 12;
                      const serviceFee = amount * 0.03;
                      const shareCapital = amount * 0.03;
                      const insurance = (amount * months) / 1000;
                      // Monthly Payment Calculation
                      const annualInterestRate = 0.12; // Example: 12% annual
                      const monthlyInterestRate = annualInterestRate / 12;
                      const n = months;
                      const P = amount;
                      const r = monthlyInterestRate;
                      const monthlyPayment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                      // Net proceeds
                      const netProceeds = amount - serviceFee - shareCapital - insurance;
                      return (
                        <div className="deductions-section" style={{marginTop: '1rem'}}>
                          <h5>Deductions</h5>
                          <div>Service Fee (3%): ₱{serviceFee.toFixed(2)}</div>
                          <div>Share Capital (3%): ₱{shareCapital.toFixed(2)}</div>
                          <div>Insurance: ₱{insurance.toFixed(2)}</div>
                          <div>Net Proceeds: <b>₱{netProceeds.toFixed(2)}</b></div>
                          <h5 style={{marginTop: '1rem'}}>Monthly Payment</h5>
                          <div>Monthly Payment: <b>₱{monthlyPayment.toFixed(2)}</b></div>
                        </div>
                      );
                    })()
                  )}
                  <button className="btn btn-primary" style={{marginTop: '1rem'}} onClick={() => {
                    // Save loan amount logic here (API call)
                    const amount = parseFloat(selectedApplication.loan_amount) || 0;
                    const months = selectedApplication.loan_type === 'quick' ? 6 : 12;
                    const serviceFee = amount * 0.03;
                    const shareCapital = amount * 0.03;
                    const insurance = (amount * months) / 1000;
                    const netProceeds = amount - serviceFee - shareCapital - insurance;
                    const annualInterestRate = 0.12;
                    const monthlyInterestRate = annualInterestRate / 12;
                    const n = months;
                    const P = amount;
                    const r = monthlyInterestRate;
                    const monthlyPayment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                    axios.post(`${process.env.REACT_APP_API_URL}/api/loan-review/applications/${selectedApplication.application_id}/set-loan-amount`, {
                      loan_amount: netProceeds,
                      loan_duration: months,
                      monthly_payment: monthlyPayment
                    }).then(() => {
                      alert('Loan amount and deductions saved!');
                      setSelectedApplication(null);
                    }).catch(() => {
                      alert('Error saving loan amount');
                    });
                  }}>
                    Save Loan Amount
                  </button>
                </div>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedApplication(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditInvestigatorDashboard;
