const express = require('express');
const router = express.Router();
const authorization = require('../middleware/authorization');

// PayMongo API endpoint
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || 'sk_test_8kAzk7uz9eFZCXzMRAM7jVpH';

// Create payment intent
router.post('/create-payment-intent', authorization, async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Convert to centavos (PayMongo uses centavos)
    const amountInCentavos = Math.round(parseFloat(amount) * 100);

    // Create payment intent with PayMongo
    const paymentIntentData = {
      data: {
        type: 'payment_intent',
        attributes: {
          amount: amountInCentavos,
          payment_method_allowed: ['gcash', 'grab_pay', 'paymaya'],
          payment_method_options: {
            card: {
              request_three_d_secure: 'automatic'
            }
          },
          currency: 'PHP',
          description: description || 'Credit Cooperative Loan Payment',
          statement_descriptor: 'CreditCoop',
          metadata: {
            user_id: req.user,
            payment_type: 'loan_payment'
          }
        }
      }
    };

    const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`
      },
      body: JSON.stringify(paymentIntentData)
    });

    const paymentIntent = await response.json();

    if (!response.ok) {
      console.error('PayMongo payment intent error:', paymentIntent);
      return res.status(400).json({
        success: false,
        message: 'Payment initialization failed',
        error: paymentIntent
      });
    }

    // Create checkout session
    const checkoutData = {
      data: {
        type: 'checkout_session',
        attributes: {
          payment_intent_id: paymentIntent.data.id,
          success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success`,
          cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment`,
          line_items: [
            {
              name: description || 'Credit Cooperative Loan Payment',
              amount: amountInCentavos,
              currency: 'PHP',
              quantity: 1
            }
          ],
          payment_method_types: ['gcash', 'paymaya', 'grab_pay']
        }
      }
    };

    const checkoutResponse = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`
      },
      body: JSON.stringify(checkoutData)
    });

    const checkoutSession = await checkoutResponse.json();

    if (!checkoutResponse.ok) {
      console.error('PayMongo checkout session error:', checkoutSession);
      return res.status(400).json({
        success: false,
        message: 'Checkout session creation failed',
        error: checkoutSession
      });
    }

    res.json({
      success: true,
      payment_intent_id: paymentIntent.data.id,
      checkout_url: checkoutSession.data.attributes.checkout_url
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
