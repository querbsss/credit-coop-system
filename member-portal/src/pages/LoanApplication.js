import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import './LoanApplication.css';

const LoanApplication = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [applicationHistory, setApplicationHistory] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/jpg')) {
        setSubmitStatus({
          type: 'error',
          message: 'Please select a JPG or JPEG file only.'
        });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setSubmitStatus({
          type: 'error',
          message: 'File size must be less than 10MB.'
        });
        return;
      }

      setSelectedFile(file);
      setSubmitStatus(null);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setSubmitStatus({
        type: 'error',
        message: 'Please select a file to upload.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formData = new FormData();
      formData.append('jpg_file', selectedFile);
      formData.append('user_id', user.user_id);

      const response = await fetch('http://localhost:5001/api/loan-application/submit', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: `Loan application submitted successfully! Application ID: ${result.application_id}`
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Refresh application history
        fetchApplicationHistory();
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'Failed to submit loan application.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchApplicationHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/loan-application/list?user_id=${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setApplicationHistory(result.applications);
      }
    } catch (error) {
      console.error('Error fetching application history:', error);
    }
  };

  // Load application history on component mount
  React.useEffect(() => {
    fetchApplicationHistory();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Pending Review' },
      approved: { class: 'status-approved', text: 'Approved' },
      rejected: { class: 'status-rejected', text: 'Rejected' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
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

  return (
    <div className="loan-application">
      <Header />
      
      <main className="loan-application-main">
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <h1>🏦 Loan Application</h1>
            <p>Submit your loan application by uploading a JPG file of your application form</p>
          </div>

          <div className="loan-content">
            {/* File Upload Section */}
            <div className="upload-section">
              <div className="upload-card card">
                <h2>📄 Upload Application</h2>
                
                <div className="upload-area">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="file-input"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="upload-label">
                    {selectedFile ? (
                      <div className="file-selected">
                        <div className="file-icon">📄</div>
                        <div className="file-info">
                          <p className="file-name">{selectedFile.name}</p>
                          <p className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button 
                          className="btn-remove"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">📁</div>
                        <h3>Choose JPG File</h3>
                        <p>Click to select your loan application form</p>
                        <p className="upload-hint">Supports JPG/JPEG files up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* File Preview */}
                {previewUrl && (
                  <div className="file-preview">
                    <h3>Preview:</h3>
                    <img src={previewUrl} alt="File preview" className="preview-image" />
                  </div>
                )}

                {/* Submit Button */}
                <div className="submit-section">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isSubmitting}
                    className={`btn btn-primary btn-lg ${isSubmitting ? 'loading' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>

                {/* Status Message */}
                {submitStatus && (
                  <div className={`status-message ${submitStatus.type}`}>
                    {submitStatus.type === 'success' ? '✅' : '❌'} {submitStatus.message}
                  </div>
                )}
              </div>
            </div>

            {/* Application History */}
            <div className="history-section">
              <div className="history-card card">
                <h2>📋 Application History</h2>
                
                {applicationHistory.length === 0 ? (
                  <div className="no-applications">
                    <p>No applications submitted yet.</p>
                  </div>
                ) : (
                  <div className="applications-list">
                    {applicationHistory.map((application) => (
                      <div key={application.application_id} className="application-item">
                        <div className="application-info">
                          <div className="application-header">
                            <h3>Application #{application.application_id}</h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <div className="application-details">
                            <p><strong>Submitted:</strong> {formatDate(application.submitted_at)}</p>
                            <p><strong>File:</strong> {application.jpg_file_path.split('/').pop()}</p>
                          </div>
                        </div>
                        <div className="application-actions">
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => window.open(`http://localhost:5001/${application.jpg_file_path}`, '_blank')}
                          >
                            View File
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="instructions-section">
              <div className="instructions-card card">
                <h2>📝 Instructions</h2>
                <div className="instructions-list">
                  <div className="instruction-item">
                    <span className="instruction-number">1</span>
                    <p>Fill out the loan application form completely</p>
                  </div>
                  <div className="instruction-item">
                    <span className="instruction-number">2</span>
                    <p>Take a clear photo or scan the completed form</p>
                  </div>
                  <div className="instruction-item">
                    <span className="instruction-number">3</span>
                    <p>Save the image as a JPG or JPEG file</p>
                  </div>
                  <div className="instruction-item">
                    <span className="instruction-number">4</span>
                    <p>Upload the file using the form above</p>
                  </div>
                  <div className="instruction-item">
                    <span className="instruction-number">5</span>
                    <p>Submit your application for review</p>
                  </div>
                </div>
                
                <div className="requirements">
                  <h3>Requirements:</h3>
                  <ul>
                    <li>File format: JPG or JPEG only</li>
                    <li>Maximum file size: 10MB</li>
                    <li>Image must be clear and readable</li>
                    <li>All required fields must be filled</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoanApplication;
