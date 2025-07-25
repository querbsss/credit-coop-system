import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  // Mock data for dashboard metrics
  const metrics = [
    {
      title: 'Total Members',
      value: '2,547',
      change: '+127',
      changeType: 'positive',
      icon: '👥',
      color: 'blue'
    },
    {
      title: 'Total Deposits',
      value: '₱45.2M',
      change: '+₱2.1M',
      changeType: 'positive',
      icon: '💰',
      color: 'green'
    },
    {
      title: 'Active Loans',
      value: '₱28.7M',
      change: '+₱890K',
      changeType: 'positive',
      icon: '🏦',
      color: 'purple'
    },
    {
      title: 'Pending Applications',
      value: '23',
      change: '-5',
      changeType: 'negative',
      icon: '📋',
      color: 'orange'
    }
  ];

  const recentTransactions = [
    {
      id: 'TXN001',
      member: 'Juan Dela Cruz',
      type: 'Deposit',
      amount: '₱15,000',
      account: 'SAV-001234',
      time: '2 minutes ago',
      status: 'completed'
    },
    {
      id: 'TXN002',
      member: 'Maria Santos',
      type: 'Withdrawal',
      amount: '₱8,500',
      account: 'CHK-005678',
      time: '15 minutes ago',
      status: 'completed'
    },
    {
      id: 'TXN003',
      member: 'Pedro Garcia',
      type: 'Loan Payment',
      amount: '₱25,000',
      account: 'LOAN-009876',
      time: '1 hour ago',
      status: 'pending'
    },
    {
      id: 'TXN004',
      member: 'Ana Rodriguez',
      type: 'Transfer',
      amount: '₱12,000',
      account: 'SAV-003456',
      time: '2 hours ago',
      status: 'completed'
    }
  ];

  const pendingApprovals = [
    {
      id: 'APP001',
      type: 'Loan Application',
      member: 'Roberto Lim',
      amount: '₱500,000',
      submitted: '3 days ago',
      priority: 'high'
    },
    {
      id: 'APP002',
      type: 'Account Opening',
      member: 'Carmen Reyes',
      amount: '₱25,000',
      submitted: '1 day ago',
      priority: 'medium'
    },
    {
      id: 'APP003',
      type: 'Credit Limit Increase',
      member: 'Miguel Torres',
      amount: '₱200,000',
      submitted: '2 days ago',
      priority: 'low'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Monitor key metrics and recent activities</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className={`metric-card card ${metric.color}`}>
            <div className="metric-icon">
              {metric.icon}
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{metric.value}</h3>
              <p className="metric-title">{metric.title}</p>
              <span className={`metric-change ${metric.changeType}`}>
                {metric.change} this month
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Recent Transactions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <button className="btn btn-secondary btn-sm">View All</button>
          </div>
          <div className="card">
            <div className="transactions-list">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-main">
                      <span className="transaction-member">{transaction.member}</span>
                      <span className="transaction-id">#{transaction.id}</span>
                    </div>
                    <div className="transaction-details">
                      <span className="transaction-type">{transaction.type}</span>
                      <span className="transaction-account">{transaction.account}</span>
                    </div>
                  </div>
                  <div className="transaction-right">
                    <div className="transaction-amount">{transaction.amount}</div>
                    <div className="transaction-meta">
                      <span className="transaction-time">{transaction.time}</span>
                      <span className={`status-badge status-${transaction.status}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Pending Approvals</h2>
            <button className="btn btn-warning btn-sm">Review All</button>
          </div>
          <div className="card">
            <div className="approvals-list">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="approval-item">
                  <div className="approval-info">
                    <div className="approval-main">
                      <span className="approval-type">{approval.type}</span>
                      <span className={`priority-badge priority-${approval.priority}`}>
                        {approval.priority}
                      </span>
                    </div>
                    <div className="approval-details">
                      <span className="approval-member">{approval.member}</span>
                      <span className="approval-amount">{approval.amount}</span>
                    </div>
                    <div className="approval-time">Submitted {approval.submitted}</div>
                  </div>
                  <div className="approval-actions">
                    <button className="btn btn-success btn-sm">Approve</button>
                    <button className="btn btn-danger btn-sm">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
