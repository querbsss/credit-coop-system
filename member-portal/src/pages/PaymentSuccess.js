import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // PayMongo API key should be stored in environment variables
  // Add REACT_APP_PAYMONGO_SECRET_KEY to your .env file

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent_id');
    const checkoutSessionId = searchParams.get('checkout_session_id');

    if (paymentIntentId) {
      fetchPaymentDetails(paymentIntentId);
    } else if (checkoutSessionId) {
      fetchCheckoutSessionDetails(checkoutSessionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchPaymentDetails = async (paymentIntentId) => {
    try {
      const response = await fetch(`https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_PAYMONGO_SECRET_KEY + ':')}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setPaymentDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckoutSessionDetails = async (checkoutSessionId) => {
    try {
      const response = await fetch(`https://api.paymongo.com/v1/checkout_sessions/${checkoutSessionId}`, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_PAYMONGO_SECRET_KEY + ':')}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.data.attributes.payment_intent_id) {
        await fetchPaymentDetails(data.data.attributes.payment_intent_id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching checkout session details:', error);
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleMakeAnotherPayment = () => {
    navigate('/payment', { replace: true });
  };

  if (loading) {
    return (
      <div className="payment-success-page">
        <Header />
        <main className="payment-success-main">
          <div className="container">
            <div className="loading-card">
              <div className="loading-spinner"></div>
              <h2>Processing your payment...</h2>
              <p>Please wait while we confirm your payment details.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="payment-success-page">
      <Header />
      <main className="payment-success-main">
        <div className="container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h1>Payment Successful!</h1>
            <p className="success-message">
              Your payment has been processed successfully. Thank you for your payment to the Credit Cooperative.
            </p>

            {paymentDetails && (
              <div className="payment-details">
                <h3>Payment Details</h3>
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value">₱{(paymentDetails.attributes.amount / 100).toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`value status-${paymentDetails.attributes.status}`}>
                    {paymentDetails.attributes.status.charAt(0).toUpperCase() + paymentDetails.attributes.status.slice(1)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Payment ID:</span>
                  <span className="value payment-id">{paymentDetails.id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Description:</span>
                  <span className="value">{paymentDetails.attributes.description}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">
                    {new Date().toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button onClick={handleGoToDashboard} className="btn btn-primary">
                Go to Dashboard
              </button>
              <button onClick={handleMakeAnotherPayment} className="btn btn-secondary">
                Make Another Payment
              </button>
            </div>

            <div className="receipt-note">
              <p>
                📧 A receipt has been sent to your email address. 
                Keep this for your records and contact us if you have any questions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
