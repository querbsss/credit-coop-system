import React, { useState, useEffect } from 'react';
import '../pages/Dashboard.css';

const ManagerDashboard = ({ setAuth }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [stats, setStats] = useState({
        monthlyRevenue: 0,
        totalMembers: 0,
        activeLoanApplications: 0,
        staffPerformance: 0
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
                <h1>Manager Dashboard</h1>
                <p className="dashboard-subtitle">
                    Welcome, {userInfo?.name || 'Manager'}! Oversee operations and drive growth.
                </p>
            </div>

            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">💹</div>
                    <div className="stat-info">
                        <h3>Monthly Revenue</h3>
                        <span className="stat-number">₱{stats.monthlyRevenue.toLocaleString()}</span>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>Total Members</h3>
                        <span className="stat-number">{stats.totalMembers}</span>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                        <h3>Loan Applications</h3>
                        <span className="stat-number">{stats.activeLoanApplications}</span>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">⭐</div>
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
