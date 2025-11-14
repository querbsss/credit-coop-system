import React, { useState, useEffect } from 'react';
import { ReactComponent as HourglassIcon } from '../assets/icons/hourglass-svgrepo-com.svg';
import { ReactComponent as MagnifierIcon } from '../assets/icons/magnifying-glass-svgrepo-com.svg';
import { ReactComponent as CheckCircleIcon } from '../assets/icons/check-circle-svgrepo-com.svg';
import { ReactComponent as CrossIcon } from '../assets/icons/cross-svgrepo-com.svg';
import { ReactComponent as ReportsIcon } from '../assets/icons/reports-svgrepo-com.svg';
import { ReactComponent as ClipboardIcon } from '../assets/icons/clipboard-text-svgrepo-com.svg';
import { ReactComponent as CheckCircleIcon2 } from '../assets/icons/check-circle-svgrepo-com.svg';
// Removed duplicate import of MagnifierIcon
import { ReactComponent as UserIcon } from '../assets/icons/user-svgrepo-com.svg';
import { ReactComponent as BankIcon } from '../assets/icons/bank-svgrepo-com.svg';
// All icon imports above are valid ReactComponent imports. Ensure usage is <HourglassIcon />, <MagnifyingGlassIcon />, <CheckCircleIcon />, <CrossIcon /> only.
import '../pages/Dashboard.css';

const LoanOfficerDashboard = ({ setAuth }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [stats, setStats] = useState({
        pendingApplications: 0,
        approvedLoans: 0,
        loanVolume: 0, 
        defaultRate: 0
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
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
                <h1>Loan Officer Dashboard</h1>
                <p className="dashboard-subtitle">
                    Welcome, {userInfo?.name || 'Loan Officer'}! Manage loan applications and member credit.
                </p>
            </div>

            <div className="stats-grid">
                    <div className="stat-card warning">
                        <div className="stat-icon"><HourglassIcon style={{ width: 36, height: 36 }} /></div>
                        <div className="stat-info">
                            <h3>Pending Applications</h3>
                            <span className="stat-number">{stats.pendingApplications}</span>
                        </div>
                    </div>

                    <div className="stat-card success">
                        <div className="stat-icon"><MagnifierIcon style={{ width: 36, height: 36 }} /></div>
                        <div className="stat-info">
                            <h3>Approved This Month</h3>
                            <span className="stat-number">{stats.approvedLoans}</span>
                        </div>
                    </div>

                    <div className="stat-card primary">
                        <div className="stat-icon"><CheckCircleIcon style={{ width: 36, height: 36 }} /></div>
                        <div className="stat-info">
                            <h3>Loan Volume</h3>
                            <span className="stat-number">₱{stats.loanVolume.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="stat-card info">
                        <div className="stat-icon"><CrossIcon style={{ width: 36, height: 36 }} /></div>
                        <div className="stat-info">
                            <h3>Default Rate</h3>
                            <span className="stat-number">{stats.defaultRate}%</span>
                        </div>
                    </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <h2>Loan Management</h2>
                    <div className="action-buttons">
                        <button className="action-btn warning">
                            <span className="btn-icon"><ClipboardIcon style={{ width: 20, height: 20 }} /></span>
                            Review Applications
                        </button>
                        <button className="action-btn success">
                            <span className="btn-icon"><CheckCircleIcon2 style={{ width: 20, height: 20 }} /></span>
                            Approve Loans
                        </button>
                        <button className="action-btn primary">
                            <span className="btn-icon"><MagnifierIcon style={{ width: 20, height: 20 }} /></span>
                            Credit Assessment
                        </button>
                        <button className="action-btn info">
                            <span className="btn-icon"><ReportsIcon style={{ width: 20, height: 20 }} /></span>
                            Loan Portfolio
                        </button>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        <div className="quick-action-item">
                            <span className="action-icon"><BankIcon style={{ width: 20, height: 20 }} /></span>
                            <div className="action-content">
                                <h4>New Application</h4>
                                <p>Process new loan request</p>
                            </div>
                        </div>
                        <div className="quick-action-item">
                            <span className="action-icon"><MagnifierIcon style={{ width: 20, height: 20 }} /></span>
                            <div className="action-content">
                                <h4>Member Credit Check</h4>
                                <p>Verify member creditworthiness</p>
                            </div>
                        </div>
                        <div className="quick-action-item">
                            <span className="action-icon"><UserIcon style={{ width: 20, height: 20 }} /></span>
                            <div className="action-content">
                                <h4>Follow-up Calls</h4>
                                <p>Contact pending applicants</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Priority Applications</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="activity-time">High</span>
                            <span className="activity-desc">Personal Loan - ₱200,000 - Maria Santos</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">Medium</span>
                            <span className="activity-desc">Business Loan - ₱500,000 - Juan dela Cruz</span>
                        </div>
                        <div className="activity-item">
                            <span className="activity-time">Low</span>
                            <span className="activity-desc">Emergency Loan - ₱50,000 - Ana Garcia</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanOfficerDashboard;
