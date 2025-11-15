# Quick Start - Subscription Module

Get the subscription system up and running in 5 minutes!

## Step 1: Get Razorpay Test Keys (2 minutes)

1. Go to https://razorpay.com and sign up/login
2. Navigate to **Settings** → **API Keys**
3. Click **Generate Test Keys**
4. Copy both `Key ID` and `Key Secret`

## Step 2: Configure Backend (1 minute)

```bash
cd server
cp .env.example .env
```

Edit `.env` and paste your keys:
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_SECRET=YOUR_SECRET_KEY_HERE
PORT=5000
```

Install dependencies:
```bash
npm install
```

## Step 3: Start Backend Server (30 seconds)

```bash
npm start
```

You should see:
```
🚀 SignalAI News Payment Server running on port 5000
📡 Health check: http://localhost:5000/api/health
💳 Razorpay configured: true
```

## Step 4: Start Frontend (30 seconds)

Open a new terminal:
```bash
cd ..
npm run dev
```

## Step 5: Test Subscription (1 minute)

1. Open browser: `http://localhost:5173`
2. Login with demo account:
   - Email: `john.doe@example.com`
   - Password: `password`
3. Click **Premium** button in header (between language selector and date)
4. Choose a plan (Premium or Pro)
5. Click **Subscribe to Premium**
6. Use test card:
   - Card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: Any future date
7. Click **Pay**
8. Success! You'll be redirected to success page

## Verify It Works

Check these:
- ✅ Success page appears
- ✅ Subscription status shows "Active"
- ✅ SignalAI Points credited to account
- ✅ Dashboard shows subscription details

## Common Issues

**"Payment system is loading"**
- Wait 5 seconds, Razorpay script needs to load

**"Failed to create order"**
- Check backend is running on port 5000
- Verify Razorpay keys in `.env`

**CORS Error**
- Backend should be on port 5000
- Frontend should be on port 5173

## Next Steps

- View subscription plans: `/subscription`
- Check dashboard: `/dashboard`
- Try yearly plans (17% savings!)
- Test Pro tier features

## Production Deployment

When ready for production:
1. Get Razorpay Live Mode keys
2. Complete KYC verification
3. Update `.env` with live keys
4. Enable HTTPS
5. Deploy backend to cloud server

---

Need help? Check `SUBSCRIPTION_SETUP.md` for detailed documentation.
