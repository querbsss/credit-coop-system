import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import gcashIcon from '../assets/icons/payment/gcash-svgrepo-com.svg';
import grabIcon from '../assets/icons/payment/grab-logo-svgrepo-com.svg';
import creditCardIcon from '../assets/icons/payment/credit-card-alt-1-svgrepo-com.svg';
import './Payment.css';

const Payment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  // Constants
  const PAYMONGO_SECRET_KEY = process.env.REACT_APP_PAYMONGO_SECRET_KEY || 'sk_test_dummy_key_replace_with_actual_key';

  // Load user's payment amount
  useEffect(() => {
    if (user && user.loan && user.loan.monthly_payment) {
      const monthlyPaymentNum = Number(user.loan.monthly_payment);
      setAmount(monthlyPaymentNum.toFixed(2));
    }
  }, [user]);

  // Create checkout session with PayMongo
  const createCheckoutSession = async (paymentIntentId, amountInCents) => {
    try {
      const checkoutData = {
        data: {
          type: 'checkout_session',
          attributes: {
            payment_intent_id: paymentIntentId,
            success_url: `${window.location.origin}/payment-success`,
            cancel_url: `${window.location.origin}/payment`,
            line_items: [
              {
                name: description || 'Credit Cooperative Payment',
                amount: amountInCents,
                currency: 'PHP',
                quantity: 1
              }
            ],
            payment_method_types: [paymentMethod],
            description: description || 'Payment to Credit Cooperative'
          }
        }
      };

      const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
        },
        body: JSON.stringify(checkoutData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.detail || 'Failed to create checkout session');
      }

      // Show success message and redirect to checkout
      setSubmitStatus({ type: 'success', message: 'Payment session created! Redirecting...' });
      setCheckoutUrl(data.data.attributes.checkout_url);
      
      // Redirect to PayMongo checkout page after a short delay
      setTimeout(() => {
        window.location.href = data.data.attributes.checkout_url;
      }, 1500);

    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'Checkout creation failed.' });
      throw error;
    }
  };

  // Create PayMongo Payment Intent
  const createPaymentIntent = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid amount.' });
      return;
    }

    setIsProcessing(true);
    setSubmitStatus(null);
    try {
      // Convert amount to cents (PayMongo expects amounts in centavos)
      const amountInCents = Math.round(parseFloat(amount) * 100);

      const paymentIntentData = {
        data: {
          type: 'payment_intent',
          attributes: {
            amount: amountInCents,
            currency: 'PHP',
            description: description || 'Credit Cooperative Payment',
            payment_method_allowed: [paymentMethod],
            capture_type: 'automatic',
            statement_descriptor: 'Credit Coop Payment'
          }
        }
      };

      const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(PAYMONGO_SECRET_KEY + ':')}`
        },
        body: JSON.stringify(paymentIntentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.detail || 'Failed to create payment intent');
      }

      // Create Checkout Session
      await createCheckoutSession(data.data.id, amountInCents);
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'Payment creation failed.' });
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="payment-page">
      <Header />
      <main className="payment-main">
        <div className="container">
          <div className="page-header">
            <h1> Make a Payment</h1>
            <p>Secure payment processing powered by PayMongo</p>
          </div>

          <div className="grid grid-1">
            <div className="card">
              <h2>Payment Details</h2>
              
              <div className="form-group">
                <label htmlFor="amount">Amount (PHP)</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  readOnly
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="payment-method">Payment Method</label>
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-select"
                >
                  <option value="gcash">GCash</option>
                  <option value="grab_pay">GrabPay</option>
                  <option value="paymaya">Maya</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>

              <div className="payment-method-info">
                {paymentMethod === 'gcash' && (
                  <div className="method-info">
                    <div className="method-icon">
                      <img src={gcashIcon} alt="GCash" className="payment-method-svg-icon" />
                    </div>
                    <div>
                      <h4>GCash</h4>
                      <p>Pay securely using your GCash wallet</p>
                    </div>
                  </div>
                )}
                {paymentMethod === 'grab_pay' && (
                  <div className="method-info">
                    <div className="method-icon">
                      <img src={grabIcon} alt="GrabPay" className="payment-method-svg-icon" />
                    </div>
                    <div>
                      <h4>GrabPay</h4>
                      <p>Pay using your GrabPay wallet</p>
                    </div>
                  </div>
                )}
                {paymentMethod === 'paymaya' && (
                  <div className="method-info">
                    <div className="method-icon">💰</div>
                    <div>
                      <h4>Maya</h4>
                      <p>Pay using your Maya wallet</p>
                    </div>
                  </div>
                )}
                {paymentMethod === 'card' && (
                  <div className="method-info">
                    <div className="method-icon">
                      <img src={creditCardIcon} alt="Credit/Debit Card" className="payment-method-svg-icon" />
                    </div>
                    <div>
                      <h4>Credit/Debit Card</h4>
                      <p>Pay using Visa, Mastercard, or JCB</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="submit-section">
                <button
                  onClick={createPaymentIntent}
                  disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
                  className={`btn btn-primary btn-lg ${isProcessing ? 'loading' : ''}`}
                >
                  {isProcessing ? 'Processing...' : `Pay ₱${amount || '0.00'}`}
                </button>
              </div>

              {submitStatus && (
                <div className={`status-message ${submitStatus.type}`}>
                  {submitStatus.type === 'error' ? '❌' : submitStatus.type === 'success' ? '✅' : '⏳'} {submitStatus.message}
                </div>
              )}

              <div className="payment-security">
                <div className="security-badges">
                  <span className="security-badge">🔒 SSL Secured</span>
                  <span className="security-badge">🛡️ PayMongo Protected</span>
                  <span className="security-badge">✅ PCI Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
