import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// removed toastify
import Header from '../components/Header';
import './Payment.css';

const Payment = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      setSubmitStatus({ type: 'error', message: 'Please upload an image file.' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSubmitStatus({ type: 'error', message: 'Image must be under 10MB.' });
      return;
    }

    setSelectedFile(file);
    setSubmitStatus(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setSubmitStatus({ type: 'error', message: 'Please select an image to upload.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formData = new FormData();
      formData.append('reference_image', selectedFile);

      const res = await fetch('http://localhost:5001/api/payment/reference-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      // Show toast notice before leaving page
      setSubmitStatus({ type: 'pending', message: 'Waiting for confirmation' });
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Navigate away shortly after showing the notice
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      setSubmitStatus({ type: 'error', message: err.message || 'Upload failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-page">
      <Header />
      <main className="payment-main">
        <div className="container">
          <div className="page-header">
            <h1>💳 Make a Payment</h1>
            <p>Scan the QR code to pay, then upload a photo of the reference number.</p>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h2>Scan to Pay</h2>
              <div className="qr-wrapper">
                <img src="/qr-code.png" alt="Payment QR" className="qr-image" />
                <p className="qr-help">Open your Gcash app and scan the QR code above.</p>
              </div>
            </div>

            <div className="card">
              <h2>Upload Reference Photo</h2>
              <div className="upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file-input"
                  id="payment-ref-upload"
                />
                <label htmlFor="payment-ref-upload" className="upload-label">
                  {selectedFile ? (
                    <div className="file-selected">
                      <div className="file-icon">📷</div>
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
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">⬆️</div>
                      <h3>Choose Image</h3>
                      <p>Upload a clear photo showing the payment reference number</p>
                      <p className="upload-hint">JPEG/PNG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>

              {previewUrl && (
                <div className="file-preview">
                  <h3>Preview:</h3>
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                </div>
              )}

              <div className="submit-section">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedFile || isSubmitting}
                  className={`btn btn-primary btn-lg ${isSubmitting ? 'loading' : ''}`}
                >
                  {isSubmitting ? 'Uploading...' : 'Submit Reference Photo'}
                </button>
              </div>

              {submitStatus && (
                <div className={`status-message ${submitStatus.type}`}>
                  {submitStatus.type === 'error' ? '❌' : submitStatus.type === 'success' ? '✅' : '⏳'} {submitStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;


