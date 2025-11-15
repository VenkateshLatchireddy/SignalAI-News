const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

app.post('/api/order', async (req, res) => {
  try {
    const { planId, amount, currency, userId } = req.body;

    if (!planId || !amount || !currency || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: planId, amount, currency, userId'
      });
    }

    const options = {
      amount: amount * 100,
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId,
        userId,
        orderDate: new Date().toISOString()
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
});

app.post('/api/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: 'Missing payment verification parameters'
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        console.log('Payment verified successfully:', {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          userId,
          planId,
          amount: payment.amount / 100,
          status: payment.status
        });

        res.json({
          success: true,
          message: 'Payment verified successfully',
          subscriptionId: `sub_${Date.now()}`,
          payment: {
            id: payment.id,
            amount: payment.amount / 100,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            email: payment.email,
            contact: payment.contact
          }
        });
      } catch (fetchError) {
        console.error('Error fetching payment details:', fetchError);
        res.json({
          success: true,
          message: 'Payment verified successfully',
          subscriptionId: `sub_${Date.now()}`
        });
      }
    } else {
      res.status(400).json({
        error: 'Invalid signature',
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SignalAI News Payment Server',
    timestamp: new Date().toISOString(),
    razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET)
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 SignalAI News Payment Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💳 Razorpay configured: ${!!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET)}`);

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    console.warn('\n⚠️  WARNING: Razorpay credentials not configured!');
    console.warn('Please set RAZORPAY_KEY_ID and RAZORPAY_SECRET in .env file\n');
  }
});

module.exports = app;
