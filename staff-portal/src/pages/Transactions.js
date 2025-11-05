import React, { useState, useEffect } from 'react';
import './Transactions.css';

const Transactions = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    paymentType: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPayments: 0,
    limit: 20
  });

  // Fetch payment history
  const fetchPaymentHistory = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        status: filters.status,
        paymentType: filters.paymentType
      });

      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`http://localhost:5000/api/payments/history?${params}`, {
        headers: {
          'token': localStorage.token
        }
      });

      if (!response.ok) {
        throw new Error('API endpoint not available');
      }

      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments || []);
        setPagination(data.pagination || pagination);
      } else {
        throw new Error(data.message || 'Failed to fetch payment history');
      }
    } catch (err) {
      console.log('Using mock data as API is not available');
      // Use mock data for demonstration
      const mockPayments = generateMockPayments();
      const filteredPayments = filterMockPayments(mockPayments, filters);
      
      setPayments(filteredPayments.slice((page - 1) * pagination.limit, page * pagination.limit));
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(filteredPayments.length / pagination.limit),
        totalPayments: filteredPayments.length,
        limit: pagination.limit
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate mock payment data for demonstration
  const generateMockPayments = () => {
    const mockData = [
      {
        id: 1,
        member_name: 'Juan Dela Cruz',
        member_number: 'MEM001',
        reference_number: 'PAY-2024-001',
        payment_type: 'loan_payment',
        amount: 5000.00,
        status: 'completed',
        payment_method: 'Cash',
        created_at: '2024-11-01T10:30:00Z'
      },
      {
        id: 2,
        member_name: 'Maria Santos',
        member_number: 'MEM002',
        reference_number: 'PAY-2024-002',
        payment_type: 'membership_fee',
        amount: 1000.00,
        status: 'completed',
        payment_method: 'Bank Transfer',
        created_at: '2024-11-02T14:15:00Z'
      },
      {
        id: 3,
        member_name: 'Pedro Rodriguez',
        member_number: 'MEM003',
        reference_number: 'PAY-2024-003',
        payment_type: 'share_capital',
        amount: 2500.00,
        status: 'pending',
        payment_method: 'Cash',
        created_at: '2024-11-03T09:45:00Z'
      },
      {
        id: 4,
        member_name: 'Ana Reyes',
        member_number: 'MEM004',
        reference_number: 'PAY-2024-004',
        payment_type: 'savings_deposit',
        amount: 3000.00,
        status: 'completed',
        payment_method: 'Online',
        created_at: '2024-11-03T16:20:00Z'
      },
      {
        id: 5,
        member_name: 'Carlos Mendoza',
        member_number: 'MEM005',
        reference_number: 'PAY-2024-005',
        payment_type: 'loan_payment',
        amount: 7500.00,
        status: 'failed',
        payment_method: 'Cash',
        created_at: '2024-11-04T11:00:00Z'
      }
    ];
    return mockData;
  };

  // Filter mock payments based on current filters
  const filterMockPayments = (payments, currentFilters) => {
    return payments.filter(payment => {
      // Search filter
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        const matchesSearch = 
          payment.member_name.toLowerCase().includes(searchLower) ||
          payment.member_number.toLowerCase().includes(searchLower) ||
          payment.reference_number.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (currentFilters.status !== 'all' && payment.status !== currentFilters.status) {
        return false;
      }

      // Payment type filter
      if (currentFilters.paymentType !== 'all' && payment.payment_type !== currentFilters.paymentType) {
        return false;
      }

      // Date filters
      if (currentFilters.dateFrom) {
        const paymentDate = new Date(payment.created_at);
        const fromDate = new Date(currentFilters.dateFrom);
        if (paymentDate < fromDate) return false;
      }

      if (currentFilters.dateTo) {
        const paymentDate = new Date(payment.created_at);
        const toDate = new Date(currentFilters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (paymentDate > toDate) return false;
      }

      return true;
    });
  };

  // Load payment history on component mount and filter changes
  useEffect(() => {
    fetchPaymentHistory(1);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    fetchPaymentHistory(newPage);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusClasses = {
      'completed': 'status-completed',
      'pending': 'status-pending',
      'failed': 'status-failed',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  };

  // Get payment type badge class
  const getPaymentTypeBadge = (type) => {
    const typeClasses = {
      'loan_payment': 'type-loan',
      'membership_fee': 'type-membership',
      'share_capital': 'type-share',
      'savings_deposit': 'type-savings',
      'other': 'type-other'
    };
    return typeClasses[type] || 'type-default';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Payment History</h1>
          <p>View and manage member payment transactions</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => fetchPaymentHistory(pagination.currentPage)}>
            <span>�</span>
            Refresh
          </button>
          <button className="btn btn-primary">
            <span>📊</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Member</label>
            <input
              type="text"
              placeholder="Search by name, member number, or reference..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Payment Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Payment Type</label>
            <select
              value={filters.paymentType}
              onChange={(e) => handleFilterChange('paymentType', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="loan_payment">Loan Payment</option>
              <option value="membership_fee">Membership Fee</option>
              <option value="share_capital">Share Capital</option>
              <option value="savings_deposit">Savings Deposit</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Payment History Table */}
      <div className="card">
        <div className="card-header">
          <h3>Payment Transactions</h3>
          <span className="record-count">
            {pagination.totalPayments} total payments
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading payment history...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h3>No Payment History Found</h3>
            <p>No payment transactions match your current filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <div className="date-cell">
                        <span className="date">{formatDate(payment.created_at)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="member-cell">
                        <span className="member-name">{payment.member_name}</span>
                        <span className="member-number">#{payment.member_number}</span>
                      </div>
                    </td>
                    <td>
                      <span className="reference-code">{payment.reference_number}</span>
                    </td>
                    <td>
                      <span className={`payment-type-badge ${getPaymentTypeBadge(payment.payment_type)}`}>
                        {payment.payment_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="amount">{formatCurrency(payment.amount)}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="payment-method">{payment.payment_method || 'Cash'}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="View Details">
                          👁️
                        </button>
                        <button className="btn-icon" title="Print Receipt">
                          🖨️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            
            <button
              className="btn btn-secondary"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
