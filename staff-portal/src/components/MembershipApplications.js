import React, { useState, useEffect } from 'react';
import './MembershipApplications.css';

const MembershipApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:3004/api/membership-applications');
      const result = await response.json();
      
      if (result.success) {
        setApplications(result.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status, reviewNotes = '') => {
    try {
      const response = await fetch(`http://localhost:3004/api/membership-applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reviewNotes }),
      });

      const result = await response.json();
      
      if (result.success) {
        fetchApplications(); // Refresh the list
        setShowModal(false);
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      under_review: 'status-review'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status.replace('_', ' ').toUpperCase()}</span>;
  };

  if (loading) {
    return <div className="loading">Loading membership applications...</div>;
  }

  return (
    <div className="membership-applications-container">
      <div className="header">
        <h2>Membership Applications</h2>
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
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
                <td>{getStatusBadge(app.status)}</td>
                <td>{new Date(app.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleViewApplication(app)}
                  >
                    View Details
                  </button>
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
                      src={`http://localhost:3004/uploads/${selectedApplication.profile_image_path}`}
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
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="action-buttons">
                <button 
                  className="btn btn-success"
                  onClick={() => updateApplicationStatus(selectedApplication.application_id, 'approved', 'Application approved by staff')}
                >
                  Approve
                </button>
                <button 
                  className="btn btn-warning"
                  onClick={() => updateApplicationStatus(selectedApplication.application_id, 'under_review', 'Application under review')}
                >
                  Under Review
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    const reason = prompt('Please provide a reason for rejection:');
                    if (reason) {
                      updateApplicationStatus(selectedApplication.application_id, 'rejected', reason);
                    }
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipApplications;