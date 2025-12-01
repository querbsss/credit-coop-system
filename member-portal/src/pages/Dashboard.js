import React, { useState, useEffect } from 'react';
import useLoanApprovalNotifications from '../hooks/useLoanApprovalNotifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import loanIcon from '../assets/icons/dashboard/loan-icon.svg';
import moneyBagIcon from '../assets/icons/dashboard/money-bag-svgrepo-com.svg';
import paymentIcon from '../assets/icons/dashboard/money-bag-svgrepo-com.svg';
import savingsIcon from '../assets/icons/dashboard/savings-svgrepo-com.svg';
import clipboardIcon from '../assets/icons/dashboard/clipboard-text-svgrepo-com.svg';
import clockIcon from '../assets/icons/dashboard/clock-ten-svgrepo-com.svg';
import './Dashboard.css';

const Dashboard = () => {
  const { user, fetchMembershipData } = useAuth();
  const navigate = useNavigate();

  // Determine if the member already has an active loan balance
  const hasActiveLoan = Number(user?.loan?.amount || 0) > 0;

  // Notification state for approved loan (only show when backend indicates approval)
  const [showLoanApproved, setShowLoanApproved] = useState(false);
  const [approvedPayload, setApprovedPayload] = useState(null);

  // subscribe to real-time loan approval notifications using Socket.IO
  useLoanApprovalNotifications(user?.memberNumber, async (payload) => {
    try {
      // keep the payload locally so the toast can show exact details immediately
      setApprovedPayload(payload || null);

      // refresh membership/dashboard data so `user` reflects the approved loan
      if (typeof fetchMembershipData === 'function') {
        try { await fetchMembershipData(); } catch (e) { /* ignore refresh errors */ }
      }
    } catch (e) {
      // ignore
    } finally {
      setShowLoanApproved(true);
    }
  });

  // Detect various possible server fields that indicate approval
  const loanApprovedFlag = !!(user && user.loan && (
    (typeof user.loan.status === 'string' && user.loan.status.toLowerCase() === 'approved') ||
    (typeof user.loan.application_status === 'string' && user.loan.application_status.toLowerCase() === 'approved') ||
    user.loan.is_approved === true ||
    user.loan.approved === true
  ));

  useEffect(() => {
    if (loanApprovedFlag) setShowLoanApproved(true);
  }, [loanApprovedFlag]);

  // Auto-dismiss toast after 7 seconds when shown
  useEffect(() => {
    if (!showLoanApproved) return;
    const timer = setTimeout(() => setShowLoanApproved(false), 7000);
    return () => clearTimeout(timer);
  }, [showLoanApproved]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const quickActions = [
    { icon: <img src={savingsIcon} alt="Savings" className="quick-action-svg-icon" />, label: 'Savings', color: 'info' },
    { icon: <img src={paymentIcon} alt="Payment" className="quick-action-svg-icon" />, label: 'Payment', color: 'warning', onClick: () => navigate('/payment') },
    { icon: <img src={clipboardIcon} alt="Payment Dues" className="quick-action-svg-icon" />, label: 'Payment Dues', color: 'danger', onClick: () => navigate('/payment-dues') },
    { icon: <img src={clockIcon} alt="History" className="quick-action-svg-icon" />, label: 'History', color: 'secondary', onClick: () => navigate('/history') }
  ];

  return (
    <div className="dashboard">
      <Header />

      {/* Toast: loan approved (fixed, top-right) */}
      {showLoanApproved && (
        <div className="toast notification success" role="status" aria-live="polite">
          <div className="notification-content">
            <strong>Loan approved</strong>
            <span className="notification-text"> Your loan application has been approved.</span>
            {((approvedPayload && approvedPayload.loan && approvedPayload.loan.amount) || user?.loan?.amount) ? (
              <span className="notification-amount"> Amount: {formatCurrency((approvedPayload && approvedPayload.loan && approvedPayload.loan.amount) || user.loan.amount)}</span>
            ) : null}
          </div>
          <button className="notification-close" aria-label="Dismiss" onClick={() => setShowLoanApproved(false)}>✕</button>
        </div>
      )}

      <main className="dashboard-main">
        <div className="container">

          {/* Account Overview */}
          <div className="accounts-section">
            <div className="grid grid-2">
              {/* Savings Account */}
              <div className="account-card card">
                <div className="account-header">
                  <div className="account-icon savings">
                    <img src={moneyBagIcon} alt="Savings" className="account-svg-icon" />
                  </div>
                  <div className="account-info">
                    <h3>Total Savings</h3>
                    <p className="account-number">{user?.accounts?.savings?.accountNumber}</p>
                  </div>
                  <div className="account-action">
                    <button className="btn-icon">➤</button>
                  </div>
                </div>
                <div className="account-balance">
                  <span className="balance-amount">0.00</span>
                  <span className="balance-label">Current balance</span>
                </div>
              </div>

            </div>
          </div>

          {/* Loan Section */}
          <div className="loan-section">
            <div className="loan-card card">
              <div className="loan-header">
                <div className="loan-icon">
                  <img src={loanIcon} alt="Loan" className="loan-svg-icon" />
                </div>
                <div className="loan-info">
                  <h3>Loan Balance</h3>
                  <p>
                    {user?.loan?.amount
                      ? `Loan Amount: ${formatCurrency(user.loan.amount)}`
                      : 'No active loan'}
                    <br />
                    {user?.loan?.duration_months
                      ? `Loan Term: ${user.loan.duration_months} months`
                      : ''}
                  </p>
                </div>
              </div>
              <div className="loan-balance">
                <span className="balance-amount">{formatCurrency(user?.loan?.amount || 0)}</span>
              </div>
              <div className="loan-action">
                {hasActiveLoan ? (
                  <div
                    className="tooltip-wrapper"
                    tabIndex={0}
                    aria-describedby="loan-tooltip"
                    role="group"
                  >
                    <button
                      className="btn btn-primary btn-lg"
                      disabled={true}
                      onClick={() => {}}
                    >
                      Active loan<br />
                      <span>{formatCurrency(user.loan.amount)}</span>
                    </button>
                    <span className="tooltip-text" role="tooltip" id="loan-tooltip">
                      You already have an active loan. You cannot apply again until it is cleared.
                    </span>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate('/loans')}
                  >
                    Need funds?<br />
                    <span>Apply for a loan now!</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <div className="quick-actions-card card">
              <h3> Quick Actions</h3>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <button key={index} className={`quick-action-btn ${action.color}`} onClick={action.onClick}>
                    <span className="action-icon">{action.icon}</span>
                    <span className="action-label">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
