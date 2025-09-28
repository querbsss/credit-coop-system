import React, { useState, useEffect } from 'react';
import '../pages/Dashboard.css';

const AdminDashboard = ({ setAuth }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalAccounts: 0,
        totalLoans: 0,
        totalTransactions: 0
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
                <h1>Administrator Dashboard</h1>
                <p className="dashboard-subtitle">
                    Welcome back, {userInfo?.name || 'Administrator'}! Manage members and system reports.
                </p>
            </div>

            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>Total Members</h3>
                        <span className="stat-number">{stats.totalMembers}</span>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>Generated Reports</h3>
                        <span className="stat-number">{stats.totalAccounts}</span>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">�</div>
                    <div className="stat-info">
                        <h3>New Members</h3>
                        <span className="stat-number">{stats.totalLoans}</span>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">�</div>
                    <div className="stat-info">
                        <h3>Active Memberships</h3>
                        <span className="stat-number">{stats.totalTransactions}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <h2>Member Management</h2>
                    <div className="action-buttons">
                        <button className="action-btn primary">
                            <span className="btn-icon">👤</span>
                            Add New Member
                        </button>
                        <button className="action-btn secondary">
                            <span className="btn-icon">👥</span>
                            View All Members
                        </button>
                        <button className="action-btn warning">
                            <span className="btn-icon">✏️</span>
                            Update Member Info
                        </button>
                        <button className="action-btn info">
                            <span className="btn-icon">�</span>
                            Search Members
                        </button>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Reports & Analytics</h2>
                    <div className="quick-actions">
                        <div className="quick-action-item">
                            <span className="action-icon">📋</span>
                            <div className="action-content">
                                <h4>Member Report</h4>
                                <p>Generate membership statistics</p>
                            </div>
                        </div>
                        <div className="quick-action-item">
                            <span className="action-icon">�</span>
                            <div className="action-content">
                                <h4>Activity Report</h4>
                                <p>Member activity analysis</p>
                            </div>
                        </div>
                        <div className="quick-action-item">
                            <span className="action-icon">�</span>
                            <div className="action-content">
                                <h4>Growth Report</h4>
                                <p>Membership growth trends</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Recent Member Activities</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="activity-time">2 hours ago</span>
                            <span className="activity-desc">New member registration - John Doe</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">4 hours ago</span>
                            <span className="activity-desc">Member profile updated - Jane Smith</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">1 day ago</span>
                            <span className="activity-desc">Monthly membership report generated</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
