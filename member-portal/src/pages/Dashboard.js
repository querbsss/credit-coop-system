import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

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
    { icon: '💰', label: 'Add Money', color: 'success' },
    { icon: '💳', label: 'Savings', color: 'info' },
    { icon: '💸', label: 'Pay Bills', color: 'warning' },
    { icon: '🕐', label: 'History', color: 'secondary' }
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
                  <div className="account-icon savings">💰</div>
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

              {/* Checking Account */}
              <div className="account-card card">
                <div className="account-header">
                  <div className="account-icon checking">💳</div>
                  <div className="account-info">
                    <h3>Checking</h3>
                    <p className="account-number">{user?.accounts?.checking?.accountNumber}</p>
                  </div>
                  <div className="account-action">
                    <button className="btn-icon">➤</button>
                  </div>
                </div>
                <div className="account-balance">
                  <span className="balance-amount">{formatCurrency(user?.accounts?.checking?.balance)}</span>
                  <span className="balance-label">Available balance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Section */}
          <div className="loan-section">
            <div className="loan-card card">
              <div className="loan-header">
                <div className="loan-icon">🏦</div>
                <div className="loan-info">
                  <h3>Loan Balance</h3>
                  <p>Auto Loan - Next payment due {formatDate(user?.loans?.[0]?.nextPayment)}</p>
                </div>
              </div>
              <div className="loan-balance">
                <span className="balance-amount">{formatCurrency(user?.loans?.[0]?.currentBalance)}</span>
                <span className="balance-label">Current balance</span>
              </div>
              <div className="loan-action">
                <button className="btn btn-primary btn-lg">
                  🏷️ Need funds?<br />
                  <span>Apply for a loan now!</span><br />
                  <small>Starting from ₱500,000</small>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <div className="quick-actions-card card">
              <h3>⚡ Quick Actions</h3>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <button key={index} className={`quick-action-btn ${action.color}`}>
                    <span className="action-icon">{action.icon}</span>
                    <span className="action-label">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity-section">
            <div className="activity-header">
              <h3>🕐 Recent Activity</h3>
              <a href="#all" className="view-all-link">View All</a>
            </div>
            
            <div className="activity-list">
              {user?.recentTransactions?.slice(0, 4).map((transaction) => (
                <div key={transaction.id} className="activity-item card">
                  <div className="activity-icon">
                    {transaction.type === 'credit' ? '💰' : 
                     transaction.type === 'transfer' ? '🔄' : '💸'}
                  </div>
                  <div className="activity-info">
                    <h4>{transaction.description}</h4>
                    <p>{formatDate(transaction.date)} • {transaction.account}</p>
                  </div>
                  <div className={`activity-amount ${transaction.type}`}>
                    {transaction.type === 'credit' ? '+' : ''}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </div>
                </div>
              ))}
            </div>

            <div className="add-transaction">
              <button className="btn btn-primary btn-lg">
                ➕ Add Transaction
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
