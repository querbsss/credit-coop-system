import React, { useState, useEffect } from 'react';
import './LoanApproval.css';

const LoanApproval = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        status: 'under_review',
        priority: 'all',
        search: ''
    });
    const [approvalForm, setApprovalForm] = useState({
        action: '',
        notes: ''
    });
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [statistics, setStatistics] = useState({});

    useEffect(() => {
        fetchApplications();
        fetchStatistics();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/loan-review/applications', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setApplications(data.applications);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/loan-review/statistics', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStatistics(data.statistics);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const fetchApplicationDetails = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/loan-review/applications/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setSelectedApplication(data);
            }
        } catch (error) {
            console.error('Error fetching application details:', error);
        }
    };

    const handleApproval = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/loan-review/applications/${selectedApplication.application.application_id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...approvalForm,
                    manager_id: JSON.parse(localStorage.getItem('userInfo') || '{}').id
                })
            });

            const data = await response.json();
            if (data.success) {
                alert(data.message);
                setShowApprovalModal(false);
                fetchApplications();
                setApprovalForm({
                    action: '',
                    notes: ''
                });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error approving application:', error);
            alert('Error processing approval');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending_review': return 'status-pending';
            case 'under_review': return 'status-warning';
            case 'approved': return 'status-success';
            case 'rejected': return 'status-danger';
            case 'returned': return 'status-info';
            default: return 'status-pending';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'priority-urgent';
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            case 'low': return 'priority-low';
            default: return 'priority-medium';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredApplications = applications.filter(app => {
        const matchesStatus = filter.status === 'all' || app.review_status === filter.status;
        const matchesPriority = filter.priority === 'all' || app.priority_level === filter.priority;
        const matchesSearch = app.applicant_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
                            app.application_id.toString().includes(filter.search);
        
        return matchesStatus && matchesPriority && matchesSearch;
    });

    if (loading) {
        return (
            <div className="loan-approval-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading loan applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="loan-approval-container">
            {/* Header */}
            <div className="page-header">
                <h1>👔 Loan Approval Dashboard</h1>
                <p>Review and approve loan applications recommended by loan officers</p>
            </div>

            {/* Statistics */}
            <div className="stats-grid">
                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <h3>Pending Review</h3>
                        <span className="stat-number">{statistics.pending_review || 0}</span>
                    </div>
                </div>
                <div className="stat-card under-review">
                    <div className="stat-icon">🔍</div>
                    <div className="stat-content">
                        <h3>Awaiting Approval</h3>
                        <span className="stat-number">{statistics.under_review || 0}</span>
                    </div>
                </div>
                <div className="stat-card approved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>Approved</h3>
                        <span className="stat-number">{statistics.approved || 0}</span>
                    </div>
                </div>
                <div className="stat-card rejected">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <h3>Rejected</h3>
                        <span className="stat-number">{statistics.rejected || 0}</span>
                    </div>
                </div>
                <div className="stat-card urgent">
                    <div className="stat-icon">🚨</div>
                    <div className="stat-content">
                        <h3>Urgent</h3>
                        <span className="stat-number">{statistics.urgent_priority || 0}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Search applications..."
                        value={filter.search}
                        onChange={(e) => setFilter({...filter, search: e.target.value})}
                        className="search-input"
                    />
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({...filter, status: e.target.value})}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="pending_review">Pending Review</option>
                        <option value="under_review">Awaiting Approval</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="returned">Returned</option>
                    </select>
                    <select
                        value={filter.priority}
                        onChange={(e) => setFilter({...filter, priority: e.target.value})}
                        className="filter-select"
                    >
                        <option value="all">All Priority</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Applications Table */}
            <div className="applications-section">
                <div className="table-container">
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th>Application ID</th>
                                <th>Applicant</th>
                                <th>Loan Details</th>
                                <th>Loan Officer</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((app) => (
                                <tr key={app.application_id}>
                                    <td>
                                        <div className="app-id">
                                            <strong>#{app.application_id}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="applicant-info">
                                            <div className="applicant-name">{app.applicant_name}</div>
                                            <div className="applicant-email">{app.applicant_email}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="loan-details">
                                            <div>Amount: {formatCurrency(app.loan_amount)}</div>
                                            <div>Rate: {app.interest_rate}%</div>
                                            <div>Term: {app.loan_term_months} months</div>
                                            <div>Purpose: {app.loan_purpose || 'Not specified'}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="officer-info">
                                            <div className="officer-name">{app.loan_officer_name || 'Unassigned'}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusColor(app.review_status)}`}>
                                            {app.review_status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`priority-badge ${getPriorityColor(app.priority_level)}`}>
                                            {app.priority_level}
                                        </span>
                                    </td>
                                    <td>{formatDate(app.submitted_at)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {app.review_status === 'under_review' && (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => {
                                                        fetchApplicationDetails(app.application_id);
                                                        setShowApprovalModal(true);
                                                    }}
                                                >
                                                    Review & Approve
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => {
                                                    fetchApplicationDetails(app.application_id);
                                                    setShowApprovalModal(true);
                                                }}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Approval Modal */}
            {showApprovalModal && selectedApplication && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Review Application #{selectedApplication.application.application_id}</h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowApprovalModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="application-details">
                                {/* Applicant Information */}
                                <div className="detail-section">
                                    <h3>Applicant Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Name:</label>
                                            <span>{selectedApplication.application.applicant_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Email:</label>
                                            <span>{selectedApplication.application.applicant_email}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Loan Information */}
                                <div className="detail-section">
                                    <h3>Loan Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Amount:</label>
                                            <span>{formatCurrency(selectedApplication.application.loan_amount)}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Interest Rate:</label>
                                            <span>{selectedApplication.application.interest_rate}%</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Term:</label>
                                            <span>{selectedApplication.application.loan_term_months} months</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Purpose:</label>
                                            <span>{selectedApplication.application.loan_purpose || 'Not specified'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Credit Assessment */}
                                <div className="detail-section">
                                    <h3>Credit Assessment</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Credit Score:</label>
                                            <span className={`credit-score ${selectedApplication.application.credit_score >= 700 ? 'good' : selectedApplication.application.credit_score >= 600 ? 'fair' : 'poor'}`}>
                                                {selectedApplication.application.credit_score || 'Not provided'}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <label>Monthly Income:</label>
                                            <span>{formatCurrency(selectedApplication.application.monthly_income)}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Employment:</label>
                                            <span>{selectedApplication.application.employment_status || 'Not specified'}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Collateral:</label>
                                            <span>{selectedApplication.application.collateral_description || 'Not specified'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Loan Officer Review */}
                                <div className="detail-section">
                                    <h3>Loan Officer Review</h3>
                                    <div className="info-item">
                                        <label>Reviewed by:</label>
                                        <span>{selectedApplication.application.loan_officer_name || 'Not assigned'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Review Notes:</label>
                                        <div className="notes-content">
                                            {selectedApplication.application.loan_officer_notes || 'No notes provided'}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Review History */}
                                {selectedApplication.reviewHistory && selectedApplication.reviewHistory.length > 0 && (
                                    <div className="detail-section">
                                        <h3>Review History</h3>
                                        <div className="history-list">
                                            {selectedApplication.reviewHistory.map((history, index) => (
                                                <div key={index} className="history-item">
                                                    <div className="history-header">
                                                        <span className="history-action">{history.action_taken.replace('_', ' ')}</span>
                                                        <span className="history-date">{formatDate(history.created_at)}</span>
                                                    </div>
                                                    <div className="history-reviewer">
                                                        By: {history.reviewer_name} ({history.reviewer_role})
                                                    </div>
                                                    {history.notes && (
                                                        <div className="history-notes">{history.notes}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Manager Decision */}
                                {selectedApplication.application.review_status === 'under_review' && (
                                    <div className="detail-section">
                                        <h3>Manager Decision</h3>
                                        <div className="form-group">
                                            <label>Decision</label>
                                            <select
                                                value={approvalForm.action}
                                                onChange={(e) => setApprovalForm({...approvalForm, action: e.target.value})}
                                            >
                                                <option value="">Select decision</option>
                                                <option value="approve">Approve Loan</option>
                                                <option value="reject">Reject Application</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Manager Notes</label>
                                            <textarea
                                                value={approvalForm.notes}
                                                onChange={(e) => setApprovalForm({...approvalForm, notes: e.target.value})}
                                                placeholder="Enter your decision notes..."
                                                rows="4"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowApprovalModal(false)}
                            >
                                Close
                            </button>
                            {selectedApplication.application.review_status === 'under_review' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleApproval}
                                    disabled={!approvalForm.action}
                                >
                                    Submit Decision
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanApproval;
