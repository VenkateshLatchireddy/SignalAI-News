# 🎖️ SignalAI News - Subscription Module

Complete Razorpay-powered subscription system with React frontend and Node.js backend.

## ⚡ Quick Start (5 Minutes)

### 1. Get Razorpay Keys
- Sign up at [razorpay.com](https://razorpay.com)
- Get test keys from Settings → API Keys

### 2. Configure Backend
```bash
cd server
cp .env.example .env
# Edit .env and add your Razorpay keys
npm install
```

### 3. Run Everything
```bash
# From project root
npm install
npm run dev:full
```

That's it! Open `http://localhost:5173` and test the subscription flow.

---

## 📦 What's Included

### Frontend Components
- ✅ `SubscriptionContext` - Global subscription state
- ✅ `SubscriptionPage` - Plans & checkout
- ✅ `SubscriptionSuccess` - Success confirmation
- ✅ `PlanCard` - Reusable plan component
- ✅ `PremiumContentGuard` - Content protection
- ✅ Header integration with Premium button

### Backend
- ✅ Express server with Razorpay integration
- ✅ Order creation endpoint
- ✅ Payment verification endpoint
- ✅ Secure signature validation

### Documentation
- 📖 `QUICKSTART_SUBSCRIPTION.md` - 5-minute setup
- 📖 `SUBSCRIPTION_SETUP.md` - Complete guide
- 📖 `USAGE_EXAMPLES.md` - Code examples
- 📖 `VISUAL_GUIDE.md` - UI/UX overview
- 📖 `SUBSCRIPTION_SUMMARY.md` - Implementation details

---

## 🎯 Features

### Subscription Tiers

| Feature | Free | Premium | Pro |
|---------|------|---------|-----|
| Price | ₹0 | ₹199/mo | ₹499/mo |
| Basic Articles | ✓ | ✓ | ✓ |
| Premium Articles | ✗ | ✓ | ✓ |
| Voice Reading | Limited | Unlimited | Unlimited |
| Ad-Free | ✗ | ✓ | ✓ |
| AI Analysis | ✗ | ✗ | ✓ |
| API Access | ✗ | ✗ | ✓ |
| SignalAI Points | 100/mo | 500/mo | 1500/mo |

### Payment Features
- ✅ Secure Razorpay integration
- ✅ Multiple payment methods (Cards, UPI, Net Banking, Wallets)
- ✅ Monthly and yearly billing
- ✅ Automatic renewals
- ✅ Cancel anytime

---

## 🚀 Running the Application

### Option 1: Run Both Together (Recommended)
```bash
npm run dev:full
```

This starts:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:5000`

### Option 2: Run Separately
**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 🧪 Testing

### Test Card Numbers
| Card | Result |
|------|--------|
| 4111 1111 1111 1111 | Success |
| 4000 0000 0000 0002 | Failure |

**CVV:** Any 3 digits
**Expiry:** Any future date

### Test Flow
1. Login: `Venkatesh@example.com` / `password`
2. Click "Premium" button in header
3. Select a plan
4. Use test card above
5. Complete payment
6. Verify success page

---

## 📁 File Structure

```
project/
├── src/
│   ├── context/
│   │   └── SubscriptionContext.tsx
│   ├── pages/
│   │   ├── SubscriptionPage.tsx
│   │   └── SubscriptionSuccess.tsx
│   ├── components/
│   │   ├── PlanCard.tsx
│   │   ├── PremiumContentGuard.tsx
│   │   └── Header.tsx (updated)
│   └── App.tsx (updated)
│
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env (create from .env.example)
│
└── Documentation/
    ├── QUICKSTART_SUBSCRIPTION.md
    ├── SUBSCRIPTION_SETUP.md
    ├── USAGE_EXAMPLES.md
    ├── VISUAL_GUIDE.md
    └── SUBSCRIPTION_SUMMARY.md
```

---

## 🎨 UI Integration

The **Premium** button is located in the header between the language selector and date/time:

```
[Language ▼] [🎖️ Premium] [Points] [Date & Time]
```

- Gradient background (orange to red)
- Crown icon
- Always visible
- BBC-style design

---

## 💻 Code Examples

### Check Subscription Status
```tsx
import { useSubscription } from '../context/SubscriptionContext';

function MyComponent() {
  const { isPremium, subscriptionTier } = useSubscription();

  return (
    <div>
      {isPremium ? (
        <PremiumContent />
      ) : (
        <Link to="/subscription">Upgrade to Premium</Link>
      )}
    </div>
  );
}
```

### Guard Premium Content
```tsx
import PremiumContentGuard from '../components/PremiumContentGuard';

function Article() {
  return (
    <div>
      <p>Free preview...</p>
      <PremiumContentGuard>
        <p>Premium content here...</p>
      </PremiumContentGuard>
    </div>
  );
}
```

More examples in `USAGE_EXAMPLES.md`

---

## 🔐 Security

- ✅ Backend signature verification
- ✅ Secure secret key handling
- ✅ CORS protection
- ✅ HTTPS ready
- ✅ No sensitive data in frontend

---

## 🌐 API Endpoints

### POST `/api/order`
Create Razorpay order for payment

### POST `/api/verify`
Verify payment signature

### GET `/api/health`
Health check endpoint

See `SUBSCRIPTION_SETUP.md` for detailed API documentation.

---

## 🚢 Production Deployment

### Backend
1. Deploy to cloud (Heroku, AWS, etc.)
2. Set environment variables
3. Enable HTTPS
4. Use live Razorpay keys

### Frontend
1. Update API endpoint
2. Deploy to Vercel/Netlify
3. Enable HTTPS
4. Test payment flow

See `SUBSCRIPTION_SETUP.md` for complete production checklist.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `QUICKSTART_SUBSCRIPTION.md` | Get started in 5 minutes |
| `SUBSCRIPTION_SETUP.md` | Complete setup guide |
| `USAGE_EXAMPLES.md` | Code examples |
| `VISUAL_GUIDE.md` | UI/UX reference |
| `SUBSCRIPTION_SUMMARY.md` | Implementation details |

---

## 🐛 Troubleshooting

**"Payment system is loading"**
- Wait for Razorpay script to load

**"Failed to create order"**
- Check backend is running
- Verify Razorpay keys in `.env`

**CORS errors**
- Ensure backend on port 5000
- Ensure frontend on port 5173

More troubleshooting in `SUBSCRIPTION_SETUP.md`

---

## 🎓 Learning Resources

- [Razorpay Docs](https://razorpay.com/docs/)
- [Checkout Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)

---

## 📞 Support

- Email: support@SignalAI.com
- GitHub: https://github.com/SignalAI/news
- Docs: https://docs.SignalAI.com

---

## 📄 License

Copyright © 2025 SignalAI Studio. All rights reserved.

---

## ✅ Checklist

Before going live:

- [ ] Get Razorpay account
- [ ] Configure test keys
- [ ] Test payment flow
- [ ] Complete KYC with Razorpay
- [ ] Switch to live keys
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test in production
- [ ] Set up monitoring
- [ ] Configure webhooks
- [ ] Add email notifications

---

**Built with ❤️ by SignalAI Studio**
