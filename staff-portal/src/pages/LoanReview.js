import React, { useState, useEffect } from 'react';
import './LoanReview.css';

const LoanReview = () => {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        status: 'all',
        priority: 'all',
        search: ''
    });
    const [reviewForm, setReviewForm] = useState({
        action: '',
        notes: '',
        loan_amount: '',
        interest_rate: '',
        loan_term_months: '',
        loan_purpose: '',
        credit_score: '',
        monthly_income: '',
        employment_status: '',
        collateral_description: '',
        priority_level: 'medium'
    });
    const [showReviewModal, setShowReviewModal] = useState(false);
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
                const app = data.application || {};
                // Prefill review form with existing values when available
                setReviewForm((prev) => ({
                    action: '',
                    notes: '',
                    loan_amount: app.loan_amount != null ? String(app.loan_amount) : '',
                    interest_rate: app.interest_rate != null ? String(app.interest_rate) : '',
                    loan_term_months: app.loan_term_months != null ? String(app.loan_term_months) : '',
                    loan_purpose: app.loan_purpose || '',
                    credit_score: app.credit_score != null ? String(app.credit_score) : '',
                    monthly_income: app.monthly_income != null ? String(app.monthly_income) : '',
                    employment_status: app.employment_status || '',
                    collateral_description: app.collateral_description || '',
                    priority_level: app.priority_level || 'medium'
                }));
            }
        } catch (error) {
            console.error('Error fetching application details:', error);
        }
    };

    const toNullableNumber = (value) => {
        if (value === undefined || value === null || value === '') return null;
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    };

    const toNullableInteger = (value) => {
        if (value === undefined || value === null || value === '') return null;
        const num = parseInt(value, 10);
        return Number.isFinite(num) ? num : null;
    };

    const handleReview = async () => {
        try {
            const userInfoRaw = localStorage.getItem('userInfo');
            const reviewerId = userInfoRaw ? (JSON.parse(userInfoRaw).id || null) : null;
            if (!reviewerId) {
                alert('Your session user ID is missing. Please log in again.');
                return;
            }

            // Basic client-side validation for approving to manager
            if (reviewForm.action === 'approve_for_manager') {
                if (!reviewForm.loan_amount || !reviewForm.interest_rate || !reviewForm.loan_term_months || !reviewForm.loan_purpose) {
                    alert('Please fill in loan amount, interest rate, loan term, and purpose.');
                    return;
                }
            }

            const payload = {
                action: reviewForm.action,
                notes: reviewForm.notes,
                reviewer_id: reviewerId,
                loan_amount: toNullableNumber(reviewForm.loan_amount),
                interest_rate: toNullableNumber(reviewForm.interest_rate),
                loan_term_months: toNullableInteger(reviewForm.loan_term_months),
                loan_purpose: reviewForm.loan_purpose || null,
                credit_score: toNullableInteger(reviewForm.credit_score),
                monthly_income: toNullableNumber(reviewForm.monthly_income),
                employment_status: reviewForm.employment_status || null,
                collateral_description: reviewForm.collateral_description || null,
                priority_level: reviewForm.priority_level
            };

            const response = await fetch(`http://localhost:5000/api/loan-review/applications/${selectedApplication.application.application_id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                alert(data.message);
                setShowReviewModal(false);
                fetchApplications();
                setReviewForm({
                    action: '',
                    notes: '',
                    loan_amount: '',
                    interest_rate: '',
                    loan_term_months: '',
                    loan_purpose: '',
                    credit_score: '',
                    monthly_income: '',
                    employment_status: '',
                    collateral_description: '',
                    priority_level: 'medium'
                });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error reviewing application:', error);
            alert('Error reviewing application');
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
            <div className="loan-review-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading loan applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="loan-review-container">
            {/* Header */}
            <div className="page-header">
                <h1>🏦 Loan Review Dashboard</h1>
                <p>Review and process member loan applications</p>
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
                        <h3>Under Review</h3>
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
                        <option value="under_review">Under Review</option>
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
                                            <div>Purpose: {app.loan_purpose || 'Not specified'}</div>
                                            <div>Term: {app.loan_term_months || 'N/A'} months</div>
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
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => {
                                                    fetchApplicationDetails(app.application_id);
                                                    setShowReviewModal(true);
                                                }}
                                            >
                                                Review
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedApplication && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Review Application #{selectedApplication.application.application_id}</h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowReviewModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="application-details">
                                <div className="detail-section">
                                    <h3>Applicant Information</h3>
                                    <p><strong>Name:</strong> {selectedApplication.application.applicant_name}</p>
                                    <p><strong>Email:</strong> {selectedApplication.application.applicant_email}</p>
                                </div>
                                
                                <div className="detail-section">
                                    <h3>Loan Information</h3>
                                    <div className="form-group">
                                        <label>Loan Amount (PHP)</label>
                                        <input
                                            type="number"
                                    step="0.01"
                                            value={reviewForm.loan_amount}
                                            onChange={(e) => setReviewForm({...reviewForm, loan_amount: e.target.value})}
                                            placeholder="Enter loan amount"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Interest Rate (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={reviewForm.interest_rate}
                                            onChange={(e) => setReviewForm({...reviewForm, interest_rate: e.target.value})}
                                            placeholder="Enter interest rate"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Loan Term (months)</label>
                                        <input
                                            type="number"
                                            value={reviewForm.loan_term_months}
                                            onChange={(e) => setReviewForm({...reviewForm, loan_term_months: e.target.value})}
                                            placeholder="Enter loan term"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Loan Purpose</label>
                                        <input
                                            type="text"
                                            value={reviewForm.loan_purpose}
                                            onChange={(e) => setReviewForm({...reviewForm, loan_purpose: e.target.value})}
                                            placeholder="Enter loan purpose"
                                        />
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h3>Credit Assessment</h3>
                                    <div className="form-group">
                                        <label>Credit Score</label>
                                        <input
                                            type="number"
                                            value={reviewForm.credit_score}
                                            onChange={(e) => setReviewForm({...reviewForm, credit_score: e.target.value})}
                                            placeholder="Enter credit score"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Monthly Income (PHP)</label>
                                        <input
                                            type="number"
                                            value={reviewForm.monthly_income}
                                            onChange={(e) => setReviewForm({...reviewForm, monthly_income: e.target.value})}
                                            placeholder="Enter monthly income"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Employment Status</label>
                                        <input
                                            type="text"
                                            value={reviewForm.employment_status}
                                            onChange={(e) => setReviewForm({...reviewForm, employment_status: e.target.value})}
                                            placeholder="Enter employment status"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Collateral Description</label>
                                        <textarea
                                            value={reviewForm.collateral_description}
                                            onChange={(e) => setReviewForm({...reviewForm, collateral_description: e.target.value})}
                                            placeholder="Describe collateral provided"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                                
                                <div className="detail-section">
                                    <h3>Review Decision</h3>
                                    <div className="form-group">
                                        <label>Priority Level</label>
                                        <select
                                            value={reviewForm.priority_level}
                                            onChange={(e) => setReviewForm({...reviewForm, priority_level: e.target.value})}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Action</label>
                                        <select
                                            value={reviewForm.action}
                                            onChange={(e) => setReviewForm({...reviewForm, action: e.target.value})}
                                        >
                                            <option value="">Select action</option>
                                            <option value="approve_for_manager">Approve for Manager Review</option>
                                            <option value="return_to_member">Return to Member</option>
                                            <option value="reject">Reject Application</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Review Notes</label>
                                        <textarea
                                            value={reviewForm.notes}
                                            onChange={(e) => setReviewForm({...reviewForm, notes: e.target.value})}
                                            placeholder="Enter your review notes..."
                                            rows="4"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowReviewModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleReview}
                                disabled={!reviewForm.action}
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanReview;
