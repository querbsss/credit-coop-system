
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { ReactComponent as UserIcon } from '../assets/icons/user-svgrepo-com.svg';
import { ReactComponent as MoneyCheckIcon } from '../assets/icons/money-check-dollar-svgrepo-com.svg';
import { ReactComponent as BankIcon } from '../assets/icons/bank-svgrepo-com.svg';
import { ReactComponent as ClipboardIcon } from '../assets/icons/clipboard-text-svgrepo-com.svg';

const Dashboard = ({ setAuth, userRole }) => {
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);
  const [totalMembersCount, setTotalMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Function to fetch total members count
  const fetchTotalMembers = async () => {
    try {
      console.log('Fetching total members count...');
      
      // Try the new member-count endpoint first
      const countResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/user-management/member-count`, {
        headers: {
          'token': localStorage.token
        }
      });

      console.log('Member count response status:', countResponse.status);
      
      if (countResponse.ok) {
        const countData = await countResponse.json();
        console.log('Member count API Response:', countData);
        setTotalMembersCount(countData.count || 0);
        return;
      }
      
      // Fallback to the members endpoint
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user-management/members?limit=1`, {
        headers: {
          'token': localStorage.token
        }
      });

      console.log('Members response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Members API Response:', data);
        setTotalMembersCount(data.pagination?.totalMembers || 0);
      } else {
        console.error('Failed to fetch total members count', response.status);
        console.log('Response details:', await response.text());
        
        // Try the test endpoint as fallback
        try {
          const testResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/user-management/test-db`, {
            headers: {
              'token': localStorage.token
            }
          });
          
          if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log('Test DB Response:', testData);
            setTotalMembersCount(testData.record_count || 0);
          } else {
            setTotalMembersCount(0);
          }
        } catch (testErr) {
          console.error('Test endpoint also failed:', testErr);
          setTotalMembersCount(0);
        }
      }
    } catch (err) {
      console.error('Error fetching total members:', err);
      setTotalMembersCount(0);
    }
  };

  // Function to fetch pending applications count
  const fetchPendingApplications = async () => {
    try {
      console.log('Fetching pending applications count...');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/membership-applications/count?status=pending`, {
        headers: {
          'token': localStorage.token
        }
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        setPendingApplicationsCount(data.count || 0);
      } else {
        console.error('Failed to fetch pending applications count', response.status);
        // Try to fetch all applications count if pending fails
        const fallbackResponse = await fetch('http://localhost:5000/api/membership-applications/count', {
          headers: {
            'token': localStorage.token
          }
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setPendingApplicationsCount(fallbackData.count || 0);
        } else {
          setPendingApplicationsCount(0); // Set to 0 instead of 23 to show real data
        }
      }
    } catch (err) {
      console.error('Error fetching pending applications:', err);
      // Set to 0 to indicate no data available
      setPendingApplicationsCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending applications count from the database
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPendingApplications(),
        fetchTotalMembers()
      ]);
      setLoading(false);
    };

    fetchData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPendingApplications();
      fetchTotalMembers();
    }, 30000);

    // Listen for custom events from membership applications
    const handleApplicationUpdate = () => {
      console.log('Membership application updated, refreshing dashboard...');
      fetchPendingApplications();
    };

    // Listen for member account updates
    const handleMemberUpdate = () => {
      console.log('Member account updated, refreshing dashboard...');
      fetchTotalMembers();
    };

    window.addEventListener('membershipApplicationUpdated', handleApplicationUpdate);
    window.addEventListener('memberAccountUpdated', handleMemberUpdate);

    // Cleanup interval and event listener on component unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('membershipApplicationUpdated', handleApplicationUpdate);
      window.removeEventListener('memberAccountUpdated', handleMemberUpdate);
    };
  }, []);
  // Get role-specific title and description
  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Administrator Dashboard',
          description: 'Manage members and system reports across the credit cooperative'
        };
      case 'manager':
        return {
          title: 'Manager Dashboard',
          description: 'Oversee operations and monitor performance across all departments'
        };
      case 'loan_officer':
        return {
          title: 'Loan Officer Dashboard',
          description: 'Process loan applications and manage member credit assessments'
        };
      case 'cashier':
        return {
          title: 'Cashier Dashboard',
          description: 'Process transactions and provide member account services'
        };
      case 'it_admin':
        return {
          title: 'IT Administrator Dashboard',
          description: 'Monitor system performance and manage technical infrastructure'
        };
      default:
        return {
          title: 'Dashboard Overview',
          description: 'Monitor key metrics and recent activities across the credit cooperative'
        };
    }
  };

  const roleInfo = getRoleInfo(userRole);
  
  // Mock data for dashboard metrics (with real pending applications count and total members)
  const metrics = [
    {
      title: 'Total Members',
      value: loading ? '...' : totalMembersCount.toString(),
      change: loading ? '...' : (totalMembersCount > 0 ? `${totalMembersCount} registered` : 'No members'),
      changeType: totalMembersCount > 1000 ? 'positive' : totalMembersCount > 0 ? 'neutral' : 'warning',
  icon: <UserIcon style={{ width: 40, height: 40, fill: 'none' }} />, // blue
      color: 'blue'
    },
    {
      title: 'Total Deposits',
      value: '₱45.2M',
      change: '+₱2.1M',
      changeType: 'positive',
  icon: <MoneyCheckIcon style={{ width: 40, height: 40, fill: 'none' }} />, // green
      color: 'green'
    },
    {
      title: 'Active Loans',
      value: '₱28.7M',
      change: '+₱890K',
      changeType: 'positive',
  icon: <BankIcon style={{ width: 40, height: 40, fill: 'none' }} />, // purple
      color: 'purple'
    },
    {
      title: 'Pending Applications',
      value: loading ? '...' : pendingApplicationsCount.toString(),
      change: loading ? '...' : (pendingApplicationsCount > 0 ? `${pendingApplicationsCount} pending` : 'No pending'),
      changeType: pendingApplicationsCount > 20 ? 'warning' : pendingApplicationsCount > 0 ? 'neutral' : 'positive',
  icon: <ClipboardIcon style={{ width: 40, height: 40, fill: 'none' }} />, // orange
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
    <div className="dashboard-page">
      <div className="page-header">
        <div className="page-title">
          <h1>{roleInfo.title}</h1>
          <p>{roleInfo.description}</p>
        </div>
        {/* Removed page-actions buttons as requested */}
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className={`metric-card card ${metric.color} ${metric.title === 'Pending Applications' || metric.title === 'Total Members' ? 'clickable' : ''}`}
            onClick={metric.title === 'Pending Applications' ? fetchPendingApplications : metric.title === 'Total Members' ? fetchTotalMembers : undefined}
            title={metric.title === 'Pending Applications' ? 'Click to refresh applications' : metric.title === 'Total Members' ? 'Click to refresh member count' : undefined}
          >
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
            <div className="metric-arrow">
              {metric.changeType === 'positive' ? '↗️' : metric.changeType === 'warning' ? '⚠️' : metric.changeType === 'neutral' ? '➡️' : '↘️'}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Recent Transactions Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <button className="btn btn-secondary btn-sm">
              <span>👁️</span>
              View All
            </button>
          </div>
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <div className="member-info">
                          <div className="member-avatar">
                            {transaction.member.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="member-name">{transaction.member}</div>
                            <div className="text-muted transaction-id">#{transaction.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge type-${transaction.type.toLowerCase().replace(' ', '-')}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="font-weight-bold">{transaction.amount}</td>
                      <td>
                        <span className={`status-badge status-${transaction.status}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="text-muted">{transaction.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pending Approvals Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Pending Approvals</h2>
            <button className="btn btn-warning btn-sm">
              <span>⏳</span>
              Review All
            </button>
          </div>
          <div className="card">
            <div className="approvals-container">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="approval-item">
                  <div className="approval-info">
                    <div className="approval-header">
                      <span className="approval-type">{approval.type}</span>
                      <span className={`priority-badge priority-${approval.priority}`}>
                        {approval.priority} priority
                      </span>
                    </div>
                    <div className="approval-details">
                      <div className="approval-member">
                        <div className="member-avatar small">
                          {approval.member.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>{approval.member}</span>
                      </div>
                      <div className="approval-amount">{approval.amount}</div>
                    </div>
                    <div className="approval-time">Submitted {approval.submitted}</div>
                  </div>
                  <div className="approval-actions">
                    <button className="btn btn-success btn-sm">
                      <span>✅</span>
                      Approve
                    </button>
                    <button className="btn btn-danger btn-sm">
                      <span>❌</span>
                      Reject
                    </button>
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
