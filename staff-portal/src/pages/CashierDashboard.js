import React, { useState, useEffect } from 'react';
import '../pages/Dashboard.css';

const CashierDashboard = ({ setAuth }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [stats, setStats] = useState({
        todayTransactions: 0,
        todayAmount: 0,
        pendingTransactions: 0,
        activeMembers: 0
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

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Cashier Dashboard</h1>
                <p className="dashboard-subtitle">
                    Welcome, {userInfo?.name || 'Cashier'}! Ready to serve our members.
                </p>
            </div>

            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">💳</div>
                    <div className="stat-info">
                        <h3>Today's Transactions</h3>
                        <span className="stat-number">{stats.todayTransactions}</span>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>Amount Processed</h3>
                        <span className="stat-number">₱{stats.todayAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <h3>Pending Transactions</h3>
                        <span className="stat-number">{stats.pendingTransactions}</span>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>Active Members</h3>
                        <span className="stat-number">{stats.activeMembers}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <h2>Transaction Services</h2>
                    <div className="action-buttons">
                        <button className="action-btn primary">
                            <span className="btn-icon">💰</span>
                            Process Deposit
                        </button>
                        <button className="action-btn warning">
                            <span className="btn-icon">🏧</span>
                            Process Withdrawal
                        </button>
                        <button className="action-btn success">
                            <span className="btn-icon">🔄</span>
                            Transfer Funds
                        </button>
                        <button className="action-btn info">
                            <span className="btn-icon">📋</span>
                            Account Inquiry
                        </button>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        <div className="quick-action-item">
                            <span className="action-icon">🔍</span>
                            <div className="action-content">
                                <h4>Member Lookup</h4>
                                <p>Search member accounts</p>
                            </div>
                        </div>
                        <div className="quick-action-item">
                            <span className="action-icon">📊</span>
                            <div className="action-content">
                                <h4>Balance Inquiry</h4>
                                <p>Check account balance</p>
                            </div>
                        </div>
                        <div className="quick-action-item">
                            <span className="action-icon">📝</span>
                            <div className="action-content">
                                <h4>Transaction Log</h4>
                                <p>View recent transactions</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Recent Transactions</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="activity-time">10:30 AM</span>
                            <span className="activity-desc">Deposit - ₱5,000.00 - Member #1234</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">10:15 AM</span>
                            <span className="activity-desc">Withdrawal - ₱2,500.00 - Member #5678</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">10:00 AM</span>
                            <span className="activity-desc">Transfer - ₱1,000.00 - Member #9012</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboard;
