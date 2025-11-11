
import React, { useState, useEffect } from 'react';
import '../pages/Dashboard.css';
import { ReactComponent as BankIcon } from '../assets/icons/bank-svgrepo-com.svg';
import { ReactComponent as ClipboardIcon } from '../assets/icons/clipboard-text-svgrepo-com.svg';
import { ReactComponent as MoneyCheckIcon } from '../assets/icons/money-check-dollar-svgrepo-com.svg';
import { ReactComponent as UserIcon } from '../assets/icons/user-svgrepo-com.svg';

const ManagerDashboard = ({ setAuth }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [showReports, setShowReports] = useState(false);
    const [stats, setStats] = useState({
        monthlyRevenue: 0,
        totalMembers: 0,
        activeLoanApplications: 0,
        staffPerformance: 0
    });

    // Dummy member data from Members.js
    const members = [
        {
            id: 'MEM001',
            name: 'Juan Dela Cruz',
            email: 'juan.delacruz@email.com',
            phone: '+63 912 345 6789',
            memberSince: '2020-03-15',
            status: 'active',
            totalDeposits: 125000,
            loanBalance: 45000
        },
        {
            id: 'MEM002',
            name: 'Maria Santos',
            email: 'maria.santos@email.com',
            phone: '+63 917 765 4321',
            memberSince: '2019-11-22',
            status: 'active',
            totalDeposits: 89500,
            loanBalance: 0
        },
        {
            id: 'MEM003',
            name: 'Pedro Garcia',
            email: 'pedro.garcia@email.com',
            phone: '+63 922 111 2233',
            memberSince: '2021-07-08',
            status: 'inactive',
            totalDeposits: 15000,
            loanBalance: 25000
        },
        {
            id: 'MEM004',
            name: 'Ana Rodriguez',
            email: 'ana.rodriguez@email.com',
            phone: '+63 918 444 5566',
            memberSince: '2022-01-12',
            status: 'active',
            totalDeposits: 67800,
            loanBalance: 12000
        }
    ];

    // Calculate financial metrics
    const financialData = {
        totalDeposits: members.reduce((sum, m) => sum + m.totalDeposits, 0),
        totalLoans: members.reduce((sum, m) => sum + m.loanBalance, 0),
        activeMembers: members.filter(m => m.status === 'active').length,
        inactiveMembers: members.filter(m => m.status === 'inactive').length,
        avgDeposit: members.reduce((sum, m) => sum + m.totalDeposits, 0) / members.length,
        membersByYear: {}
    };

    // Group members by year
    members.forEach(member => {
        const year = new Date(member.memberSince).getFullYear();
        financialData.membersByYear[year] = (financialData.membersByYear[year] || 0) + 1;
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch("http://localhost:5000/auth/profile", {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "token": localStorage.token 
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUserInfo(userData);
                }
            } catch (err) {
                console.error("Error fetching user info:", err);
            }
        };

        fetchUserInfo();
    }, []);

    const handleGenerateReport = () => {
        setShowReports(!showReports);
    };

    const BarChart = ({ data, label }) => {
        const maxValue = Math.max(...Object.values(data));
        
        return (
            <div className="bar-chart">
                <h4 className="chart-title">{label}</h4>
                <div className="chart-container">
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key} className="bar-group">
                            <div className="bar-wrapper">
                                <div 
                                    className="bar" 
                                    style={{ 
                                        height: `${(value / maxValue) * 100}%`,
                                        background: 'linear-gradient(135deg, #7c3aed, #a78bfa)'
                                    }}
                                >
                                    <span className="bar-value">{value}</span>
                                </div>
                            </div>
                            <span className="bar-label">{key}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const FinancialReportSection = () => {
        const depositsData = {};
        const loansData = {};
        
        members.forEach(member => {
            depositsData[member.name.split(' ')[0]] = member.totalDeposits / 1000; // in thousands
            loansData[member.name.split(' ')[0]] = member.loanBalance / 1000; // in thousands
        });

        return (
            <div className="financial-reports-container">
                <div className="reports-header">
                    <div>
                        <h2>📊 Financial Reports & Analytics</h2>
                        <p className="reports-subtitle">Automated financial and member reports</p>
                    </div>
                    <button className="btn btn-secondary" onClick={handleGenerateReport}>
                        ✕ Close
                    </button>
                </div>

                <div className="report-summary-cards">
                    <div className="report-card blue">
                        <div className="report-icon"><MoneyCheckIcon style={{ width: 32, height: 32 }}/></div>
                        <div className="report-content">
                            <h4>Total Deposits</h4>
                            <span className="report-value">₱{financialData.totalDeposits.toLocaleString()}</span>
                            <p className="report-description">All member deposits</p>
                        </div>
                    </div>
                    <div className="report-card orange">
                        <div className="report-icon"><ClipboardIcon style={{ width: 32, height: 32 }}/></div>
                        <div className="report-content">
                            <h4>Total Loan Balance</h4>
                            <span className="report-value">₱{financialData.totalLoans.toLocaleString()}</span>
                            <p className="report-description">Outstanding loans</p>
                        </div>
                    </div>
                    <div className="report-card green">
                        <div className="report-icon"><UserIcon style={{ width: 32, height: 32 }}/></div>
                        <div className="report-content">
                            <h4>Active Members</h4>
                            <span className="report-value">{financialData.activeMembers}</span>
                            <p className="report-description">Currently active</p>
                        </div>
                    </div>
                    <div className="report-card purple">
                        <div className="report-icon"><BankIcon style={{ width: 32, height: 32 }}/></div>
                        <div className="report-content">
                            <h4>Average Deposit</h4>
                            <span className="report-value">₱{Math.round(financialData.avgDeposit).toLocaleString()}</span>
                            <p className="report-description">Per member</p>
                        </div>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="chart-card">
                        <BarChart data={depositsData} label="Member Deposits (in ₱1000s)" />
                        <div className="chart-footer">
                            <p>💡 Total deposits across all members</p>
                        </div>
                    </div>
                    <div className="chart-card">
                        <BarChart data={loansData} label="Member Loan Balances (in ₱1000s)" />
                        <div className="chart-footer">
                            <p>💡 Outstanding loan amounts per member</p>
                        </div>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="chart-card">
                        <BarChart data={financialData.membersByYear} label="Member Growth by Year" />
                        <div className="chart-footer">
                            <p>💡 New members registered each year</p>
                        </div>
                    </div>
                    <div className="chart-card">
                        <div className="member-status-chart">
                            <h4 className="chart-title">Member Status Distribution</h4>
                            <div className="status-bars">
                                <div className="status-bar-item">
                                    <div className="status-label">
                                        <span className="status-dot active"></span>
                                        <span>Active Members</span>
                                    </div>
                                    <div className="status-bar-container">
                                        <div 
                                            className="status-bar active-bar"
                                            style={{ width: `${(financialData.activeMembers / members.length) * 100}%` }}
                                        >
                                            <span className="status-count">{financialData.activeMembers}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="status-bar-item">
                                    <div className="status-label">
                                        <span className="status-dot inactive"></span>
                                        <span>Inactive Members</span>
                                    </div>
                                    <div className="status-bar-container">
                                        <div 
                                            className="status-bar inactive-bar"
                                            style={{ width: `${(financialData.inactiveMembers / members.length) * 100}%` }}
                                        >
                                            <span className="status-count">{financialData.inactiveMembers}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="chart-footer">
                            <p>💡 Active vs Inactive member ratio</p>
                        </div>
                    </div>
                </div>

                <div className="member-details-table">
                    <h3>📋 Detailed Member Financial Report</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Member ID</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Member Since</th>
                                <th>Total Deposits</th>
                                <th>Loan Balance</th>
                                <th>Net Position</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id}>
                                    <td><span className="member-id">{member.id}</span></td>
                                    <td>
                                        <div className="member-info">
                                            <div className="member-avatar small">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="member-name">{member.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${member.status}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td>{new Date(member.memberSince).toLocaleDateString()}</td>
                                    <td className="text-success font-weight-bold">
                                        ₱{member.totalDeposits.toLocaleString()}
                                    </td>
                                    <td className="text-warning font-weight-bold">
                                        ₱{member.loanBalance.toLocaleString()}
                                    </td>
                                    <td className={member.totalDeposits - member.loanBalance >= 0 ? 'text-success' : 'text-danger'}>
                                        <strong>₱{(member.totalDeposits - member.loanBalance).toLocaleString()}</strong>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="report-actions">
                    <button className="btn btn-primary">
                        <span>📄</span>
                        Export as PDF
                    </button>
                    <button className="btn btn-success">
                        <span>📊</span>
                        Export as Excel
                    </button>
                    <button className="btn btn-info">
                        <span>📧</span>
                        Email Report
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Manager Dashboard</h1>
                <p className="dashboard-subtitle">
                    Welcome, {userInfo?.name || 'Manager'}! Oversee operations and drive growth.
                </p>
                <button 
                    className="btn btn-primary generate-report-btn" 
                    onClick={handleGenerateReport}
                    style={{ marginTop: '1rem' }}
                >
                    <span>📊</span>
                    {showReports ? 'Hide Reports' : 'Generate Report'}
                </button>
            </div>

            {showReports && <FinancialReportSection />}

            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon"><BankIcon style={{ width: 32, height: 32 }}/></div>
                    <div className="stat-info">
                        <h3>Monthly Revenue</h3>
                        <span className="stat-number">₱{stats.monthlyRevenue.toLocaleString()}</span>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon"><UserIcon style={{ width: 32, height: 32 }}/></div>
                    <div className="stat-info">
                        <h3>Total Members</h3>
                        <span className="stat-number">{members.length}</span>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon"><ClipboardIcon style={{ width: 32, height: 32 }}/></div>
                    <div className="stat-info">
                        <h3>Loan Applications</h3>
                        <span className="stat-number">{stats.activeLoanApplications}</span>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon"><MoneyCheckIcon style={{ width: 32, height: 32 }}/></div>
                    <div className="stat-info">
                        <h3>Staff Performance</h3>
                        <span className="stat-number">{stats.staffPerformance}%</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <h2>Management Tools</h2>
                    <div className="action-buttons">
                        <button className="action-btn primary">
                            <span className="btn-icon">👥</span>
                            Staff Management
                        </button>
                        <button className="action-btn success">
                            <span className="btn-icon">📈</span>
                            Performance Reports
                        </button>
                        <button className="action-btn warning">
                            <span className="btn-icon">💰</span>
                            Loan Approvals
                        </button>
                        <button className="action-btn info">
                            <span className="btn-icon">📊</span>
                            Financial Analysis
                        </button>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Key Metrics</h2>
                    <div className="quick-actions">
                        <div className="quick-action-item">
                            <span className="action-icon">📊</span>
                            <div className="action-content">
                                <h4>Monthly Report</h4>
                                <p>View detailed analytics</p>
                            </div>
                        </div>
                        <div className="quick-action-item">
                            <span className="action-icon">💼</span>
                            <div className="action-content">
                                <h4>Portfolio Overview</h4>
                                <p>Loan portfolio status</p>
                            </div>
                        </div>
                        <div className="quick-action-item">
                            <span className="action-icon">🎯</span>
                            <div className="action-content">
                                <h4>Target Progress</h4>
                                <p>Track monthly goals</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Pending Approvals</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="activity-time">Priority</span>
                            <span className="activity-desc">Loan Application - ₱500,000 - Review Required</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">Medium</span>
                            <span className="activity-desc">Staff Leave Request - John Doe - 3 days</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">Low</span>
                            <span className="activity-desc">Equipment Purchase - Office Supplies</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
