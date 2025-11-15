# SignalAI News - Subscription Module Setup Guide

This guide will help you set up the Razorpay-powered subscription system for SignalAI News.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Razorpay Configuration](#razorpay-configuration)
6. [Running the Application](#running-the-application)
7. [Testing Payments](#testing-payments)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The subscription module consists of:
- **Frontend**: React + TypeScript with Razorpay checkout integration
- **Backend**: Node.js + Express server for secure payment processing
- **Payment Gateway**: Razorpay for handling payments
- **Plans**: Free, Premium, and Pro tiers with monthly/yearly billing

### Features
- Secure Razorpay payment integration
- Multiple subscription tiers (Free, Premium, Pro)
- Monthly and yearly billing options
- Automatic SignalAI Points rewards
- Subscription management dashboard
- Payment verification and security

---

## Prerequisites

Before starting, ensure you have:
- Node.js 16+ and npm installed
- A Razorpay account (sign up at https://razorpay.com)
- Git (optional)

---

## Backend Setup

### 1. Navigate to Server Directory
```bash
cd server
```

### 2. Install Dependencies
```bash
npm install
```

This installs:
- `express`: Web server framework
- `cors`: Enable cross-origin requests
- `body-parser`: Parse request bodies
- `razorpay`: Official Razorpay SDK
- `dotenv`: Environment variable management
- `crypto`: For signature verification

### 3. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your Razorpay credentials:
```env
# Test Mode (for development)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_SECRET=your_secret_key_here

PORT=5000
```

**Important Security Notes:**
- NEVER commit `.env` to version control
- Use test keys during development
- Keep your secret key confidential
- Switch to live keys only in production

### 4. Get Razorpay API Keys

1. Sign in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **API Keys**
3. Generate Test Mode keys
4. Copy the `Key ID` and `Key Secret`
5. Paste them into your `.env` file

---

## Frontend Setup

### 1. Return to Project Root
```bash
cd ..
```

### 2. Install Dependencies (if not already done)
```bash
npm install
```

The subscription module uses existing dependencies plus dynamic Razorpay script loading.

---

## Razorpay Configuration

### Test Mode vs Live Mode

**Test Mode (Development):**
- Use keys starting with `rzp_test_`
- No real money is charged
- Use test card numbers for testing

**Live Mode (Production):**
- Use keys starting with `rzp_live_`
- Real payments are processed
- Complete KYC verification required

### Test Card Numbers

Use these cards in Test Mode:

| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4111 1111 1111 1111 | Any 3 digits | Any future date | Success |
| 4000 0000 0000 0002 | Any 3 digits | Any future date | Failure |

---

## Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```

Server will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Option 2: Run with Concurrently (Recommended)

First, install concurrently in the root:
```bash
npm install --save-dev concurrently
```

Add to root `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "server": "cd server && npm start",
    "dev:full": "concurrently \"npm run dev\" \"npm run server\"",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

Then run both:
```bash
npm run dev:full
```

---

## Testing Payments

### 1. Access Subscription Page

Navigate to: `http://localhost:5173/subscription`

### 2. Login (if not already logged in)

Use demo credentials:
- Email: `john.doe@example.com`
- Password: `password`

### 3. Select a Plan

Choose Premium or Pro (monthly or yearly)

### 4. Complete Payment

When Razorpay checkout opens:
- Enter test card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date
- Click "Pay ₹199" (or selected amount)

### 5. Verify Success

After payment:
- You'll be redirected to success page
- Subscription status will update
- SignalAI Points will be credited
- Check dashboard for active subscription

---

## API Endpoints

### POST /api/order
Creates a Razorpay order for payment.

**Request:**
```json
{
  "planId": "premium_monthly",
  "amount": 199,
  "currency": "INR",
  "userId": "user123"
}
```

**Response:**
```json
{
  "order_id": "order_xxxxx",
  "amount": 19900,
  "currency": "INR",
  "key_id": "rzp_test_xxxxx"
}
```

### POST /api/verify
Verifies payment signature after successful payment.

**Request:**
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx",
  "userId": "user123",
  "planId": "premium_monthly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "subscriptionId": "sub_xxxxx",
  "payment": {
    "id": "pay_xxxxx",
    "amount": 199,
    "currency": "INR",
    "status": "captured"
  }
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "SignalAI News Payment Server",
  "timestamp": "2025-01-06T12:00:00.000Z",
  "razorpayConfigured": true
}
```

---

## Subscription Plans

### Free Plan
- ₹0/month
- Basic news access
- Limited voice reading
- 100 SignalAI Points/month
- Community access

### Premium Plan
- ₹199/month or ₹1,999/year (Save 17%)
- Unlimited premium articles
- Unlimited AI voice reading
- Real-time breaking news alerts
- Ad-free experience
- 500 SignalAI Points/month
- Priority customer support
- Exclusive journalist content
- Download articles offline

### Pro Plan
- ₹499/month or ₹4,999/year (Save 17%)
- All Premium features
- Advanced AI news analysis
- Personalized news digest
- Multi-device sync
- 1500 SignalAI Points/month
- Book journalist appointments (50% off)
- Access to exclusive events
- API access for developers
- White-label content publishing
- Priority verification badge

---

## Troubleshooting

### Issue: "Payment system is loading"
**Solution:** Wait a few seconds for Razorpay script to load, then try again.

### Issue: "Failed to create order"
**Possible causes:**
1. Backend server not running
2. Incorrect Razorpay credentials
3. Network/CORS issues

**Solutions:**
- Check backend is running on port 5000
- Verify `.env` has correct credentials
- Check browser console for errors

### Issue: "Payment verification failed"
**Possible causes:**
1. Incorrect secret key
2. Signature mismatch
3. Network timeout

**Solutions:**
- Verify `RAZORPAY_SECRET` in `.env`
- Check backend logs for detailed error
- Retry the payment

### Issue: CORS errors
**Solution:** Ensure backend has CORS enabled:
```javascript
app.use(cors());
```

### Issue: Subscription not updating
**Possible causes:**
1. LocalStorage not persisting
2. Context not updating
3. Browser privacy settings

**Solutions:**
- Check browser console for errors
- Clear localStorage and retry
- Disable browser privacy extensions temporarily

---

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` to version control
- Use different keys for dev/production
- Rotate keys periodically

### 2. Payment Verification
- Always verify signatures on backend
- Never trust client-side payment data
- Log all payment attempts

### 3. HTTPS in Production
- Use HTTPS for all payment pages
- Enable SSL/TLS on backend
- Use secure cookies

### 4. Error Handling
- Don't expose sensitive errors to users
- Log detailed errors securely
- Implement retry logic

### 5. Rate Limiting
- Implement rate limiting on payment endpoints
- Prevent abuse and fraudulent attempts

---

## Production Deployment Checklist

- [ ] Switch to Razorpay Live Mode keys
- [ ] Complete KYC verification with Razorpay
- [ ] Enable HTTPS on frontend and backend
- [ ] Set up proper database for subscriptions
- [ ] Implement webhook handlers
- [ ] Add email notifications
- [ ] Set up monitoring and alerts
- [ ] Implement proper error logging
- [ ] Add rate limiting
- [ ] Test all payment flows
- [ ] Prepare refund/cancellation policies
- [ ] Update terms and conditions

---

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Checkout Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)

---

## Support

For issues or questions:
- Email: support@SignalAInews.com
- Documentation: https://docs.SignalAInews.com
- GitHub: https://github.com/SignalAI/news

---

## License

Copyright © 2025 SignalAI Studio. All rights reserved.
