import React, { useState, useEffect } from 'react';
import { useUserRole } from '../hooks/useUserRole';
import './MembershipApplications.css';

const MembershipApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [membershipNumber, setMembershipNumber] = useState('');
  const { userRole, loading: roleLoading } = useUserRole();

  // Helper function to generate suggested membership number
  const generateSuggestedMembershipNumber = () => {
    const currentYear = new Date().getFullYear();
    const applicationId = selectedApplication?.application_id;
    return `MEM-${currentYear}-${String(applicationId).padStart(3, '0')}`;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        await fetchApplications();
        console.log('Applications fetched successfully');
      } catch (error) {
        console.error('Error in fetch cycle:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling every 5 seconds
    const pollingInterval = setInterval(fetchData, 5000);

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
    };
  }, []); // Empty dependency array means this runs once on mount

  const fetchApplications = async () => {
    // If it's the first load, we'll show the full loading screen
    // For subsequent refreshes, we'll just show a subtle indicator
    const isInitialLoad = loading;
    if (!isInitialLoad) setRefreshing(true);

    try {
      const response = await fetch('http://localhost:5000/api/membership-applications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token') // Add authentication token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const result = await response.json();
      
      if (result.success) {
        setApplications(result.applications || []);
      } else {
        console.error('API Error:', result.message || 'Unknown error');
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status, reviewNotes = '', membershipNum = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/membership-applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.token
        },
        body: JSON.stringify({ status, reviewNotes, membershipNumber: membershipNum }),
      });

      const result = await response.json();
      
      if (result.success) {
        fetchApplications(); // Refresh the list
        setShowModal(false);
        setSelectedApplication(null);
        setMembershipNumber(''); // Reset membership number
        
        // Trigger dashboard refresh by dispatching a custom event
        window.dispatchEvent(new CustomEvent('membershipApplicationUpdated'));
      } else {
        console.error('Failed to update application status:', result.message);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setMembershipNumber(application.applicants_membership_number || ''); // Pre-fill if already exists
    setShowModal(true);
  };

  const handleUseSuggestedNumber = () => {
    setMembershipNumber(generateSuggestedMembershipNumber());
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      under_review: 'status-review',
      forwarded_to_manager: 'status-forwarded',
      forwarded_to_it_admin: 'status-forwarded-it',
      approved: 'status-approved',
      rejected: 'status-rejected'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status.replace('_', ' ').toUpperCase()}</span>;
  };

  if (loading) {
    return <div className="loading">Loading membership applications...</div>;
  }

  return (
    <div className="membership-applications-container">
      <div className="header">
        <div className="header-title">
          <h2>Membership Applications</h2>
          {refreshing && (
            <span className="refresh-indicator" style={{ 
              marginLeft: '10px',
              fontSize: '14px',
              color: '#666',
              display: 'inline-block'
            }}>
              ↻ Refreshing...
            </span>
          )}
        </div>
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="forwarded_to_manager">Forwarded to Manager</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="applications-table">
        <table>
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Membership Type</th>
              <th>Amount Subscribe</th>
              <th>Membership Number</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr key={app.application_id}>
                <td>{app.application_id}</td>
                <td>{`${app.first_name} ${app.middle_name || ''} ${app.last_name}`}</td>
                <td>{app.email_address}</td>
                <td>{app.membership_type}</td>
                <td>₱{Number(app.amount_subscribe).toLocaleString()}</td>
                <td>
                  {app.applicants_membership_number ? (
                    <span className="membership-number">{app.applicants_membership_number}</span>
                  ) : (
                    <span className="no-membership-number" style={{ color: '#999', fontStyle: 'italic' }}>Not assigned</span>
                  )}
                </td>
                <td>{getStatusBadge(app.status)}</td>
                <td>{new Date(app.created_at).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {app.status === 'pending' && (
                      <button
                        className="btn btn-warning"
                        onClick={() => updateApplicationStatus(app.application_id, 'under_review', 'Application under review')}
                      >
                        Review Application
                      </button>
                    )}
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleViewApplication(app)}
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

      {/* Modal for viewing application details */}
      {showModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Membership Application Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="application-details">
                {/* Basic Information */}
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-grid">
                    <div><strong>Application ID:</strong> {selectedApplication.application_id}</div>
                    <div><strong>Membership Type:</strong> {selectedApplication.membership_type}</div>
                    <div><strong>Number of Shares:</strong> {selectedApplication.number_of_shares}</div>
                    <div><strong>Amount Subscribe:</strong> ₱{Number(selectedApplication.amount_subscribe).toLocaleString()}</div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="detail-section">
                  <h4>Personal Information</h4>
                  <div className="detail-grid">
                    <div><strong>Full Name:</strong> {`${selectedApplication.first_name} ${selectedApplication.middle_name || ''} ${selectedApplication.last_name} ${selectedApplication.suffix || ''}`}</div>
                    <div><strong>Email:</strong> {selectedApplication.email_address}</div>
                    <div><strong>Contact:</strong> {selectedApplication.contact_number}</div>
                    <div><strong>Address:</strong> {selectedApplication.address}</div>
                    <div><strong>Date of Birth:</strong> {selectedApplication.date_of_birth ? new Date(selectedApplication.date_of_birth).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Age:</strong> {selectedApplication.age}</div>
                    <div><strong>Gender:</strong> {selectedApplication.gender}</div>
                    <div><strong>Civil Status:</strong> {selectedApplication.civil_status}</div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="detail-section">
                  <h4>Professional Information</h4>
                  <div className="detail-grid">
                    <div><strong>Occupation:</strong> {selectedApplication.occupation}</div>
                    <div><strong>Annual Income:</strong> ₱{Number(selectedApplication.annual_income || 0).toLocaleString()}</div>
                    <div><strong>Employment Type:</strong> {selectedApplication.employment_choice}</div>
                    {selectedApplication.employment_choice === 'employed' && (
                      <>
                        <div><strong>Employer:</strong> {selectedApplication.employer_trade_name}</div>
                        <div><strong>Employment Industry:</strong> {selectedApplication.employment_industry}</div>
                      </>
                    )}
                    {selectedApplication.employment_choice === 'sole trader' && (
                      <>
                        <div><strong>Business Type:</strong> {selectedApplication.business_type}</div>
                        <div><strong>Business Address:</strong> {selectedApplication.business_address}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Reference Information */}
                <div className="detail-section">
                  <h4>Reference Information</h4>
                  <div className="detail-grid">
                    <div><strong>Reference Person:</strong> {selectedApplication.reference_person}</div>
                    <div><strong>Reference Address:</strong> {selectedApplication.reference_address}</div>
                    <div><strong>Reference Contact:</strong> {selectedApplication.reference_contact_number}</div>
                  </div>
                </div>

                {/* Profile Image */}
                {selectedApplication.profile_image_path && (
                  <div className="detail-section">
                    <h4>Profile Image</h4>
                    <img 
                      src={`http://localhost:3002/uploads/${selectedApplication.profile_image_path}`}
                      alt="Profile"
                      className="profile-image"
                    />
                  </div>
                )}

                {/* Current Status */}
                <div className="detail-section">
                  <h4>Application Status</h4>
                  <div className="status-info">
                    <div><strong>Status:</strong> {getStatusBadge(selectedApplication.status)}</div>
                    <div><strong>Submitted:</strong> {new Date(selectedApplication.created_at).toLocaleString()}</div>
                    {selectedApplication.reviewed_at && (
                      <div><strong>Reviewed:</strong> {new Date(selectedApplication.reviewed_at).toLocaleString()}</div>
                    )}
                    {selectedApplication.review_notes && (
                      <div><strong>Review Notes:</strong> {selectedApplication.review_notes}</div>
                    )}
                    {selectedApplication.applicants_membership_number && (
                      <div><strong>Membership Number:</strong> {selectedApplication.applicants_membership_number}</div>
                    )}
                  </div>
                </div>

                {/* Admin Membership Number Assignment */}
                {userRole === 'admin' && (selectedApplication.status === 'pending' || selectedApplication.status === 'under_review') && (
                  <div className="detail-section">
                    <h4>Assign Membership Number</h4>
                    <div className="membership-number-input">
                      <label htmlFor="membershipNumber"><strong>Membership Number:</strong></label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          id="membershipNumber"
                          value={membershipNumber}
                          onChange={(e) => setMembershipNumber(e.target.value)}
                          placeholder="Enter membership number (e.g., MEM-2024-001)"
                          className="form-control"
                          style={{ 
                            flex: 1,
                            padding: '8px 12px', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleUseSuggestedNumber}
                          className="btn btn-secondary"
                          style={{ 
                            fontSize: '12px',
                            padding: '8px 12px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Use Suggested
                        </button>
                      </div>
                      <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                        Suggested: {generateSuggestedMembershipNumber()} | This number will be assigned to the applicant upon approval
                      </small>
                      {!membershipNumber.trim() && (
                        <small style={{ color: '#dc3545', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                          ⚠️ Membership number is required before forwarding to manager
                        </small>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <div className="action-buttons">
                {userRole === 'admin' && (
                  <>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        if (!membershipNumber.trim()) {
                          alert('Please enter a membership number before forwarding to manager.\n\nClick "Use Suggested" for a recommended format, or enter your own.');
                          return;
                        }
                        if (membershipNumber.trim().length < 3) {
                          alert('Membership number should be at least 3 characters long.');
                          return;
                        }
                        updateApplicationStatus(
                          selectedApplication.application_id, 
                          'forwarded_to_manager', 
                          `Application reviewed and forwarded to manager for approval. Assigned membership number: ${membershipNumber}`,
                          membershipNumber
                        );
                      }}
                      disabled={selectedApplication.status === 'forwarded_to_manager' || selectedApplication.status === 'approved' || selectedApplication.status === 'rejected'}
                      style={{
                        backgroundColor: !membershipNumber.trim() ? '#ccc' : '',
                        borderColor: !membershipNumber.trim() ? '#ccc' : ''
                      }}
                    >
                      Forward to Manager
                    </button>
                    <button 
                      className="btn btn-warning"
                      onClick={() => updateApplicationStatus(selectedApplication.application_id, 'under_review', 'Application under review by admin')}
                      disabled={selectedApplication.status === 'approved' || selectedApplication.status === 'rejected'}
                    >
                      Mark Under Review
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          updateApplicationStatus(selectedApplication.application_id, 'rejected', `Rejected by admin: ${reason}`);
                        }
                      }}
                      disabled={selectedApplication.status === 'approved' || selectedApplication.status === 'rejected'}
                    >
                      Reject Application
                    </button>
                  </>
                )}
                
                {userRole === 'manager' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => updateApplicationStatus(selectedApplication.application_id, 'approved', 'Application approved by manager')}
                      disabled={selectedApplication.status === 'approved' || selectedApplication.status === 'rejected'}
                    >
                      Approve Application
                    </button>
                    <button 
                      className="btn btn-warning"
                      onClick={() => updateApplicationStatus(selectedApplication.application_id, 'under_review', 'Application returned to admin for review')}
                      disabled={selectedApplication.status === 'approved' || selectedApplication.status === 'rejected'}
                    >
                      Return for Review
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) {
                          updateApplicationStatus(selectedApplication.application_id, 'rejected', `Rejected by manager: ${reason}`);
                        }
                      }}
                      disabled={selectedApplication.status === 'approved' || selectedApplication.status === 'rejected'}
                    >
                      Reject Application
                    </button>
                  </>
                )}
                
                {userRole === 'it_admin' && (
                  <p className="no-actions">IT Admin can view applications but actions are managed through the system.</p>
                )}
                
                {(userRole !== 'admin' && userRole !== 'manager' && userRole !== 'it_admin') && (
                  <p className="no-actions">You don't have permission to modify applications.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipApplications;