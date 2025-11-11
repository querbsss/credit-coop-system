import React from 'react';
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
  const { user } = useAuth();
  const navigate = useNavigate();

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
      
      <main className="dashboard-main">
        <div className="container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-card card">
              <div className="welcome-content">
                <div className="welcome-text">
                  <h1>Welcome back, {user?.firstName} {user?.lastName}</h1>
                  <span className="status-badge status-active">ACTIVE</span>
                </div>
                <div className="member-avatar">
                  <div className="avatar-circle-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                  <span className="balance-amount">{formatCurrency(user?.accounts?.savings?.balance)}</span>
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
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/loans')}>
                   Need funds?<br />
                  <span>Apply for a loan now!</span><br />
                </button>
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
