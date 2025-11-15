# Subscription Module - Usage Examples

This guide shows how to use the subscription system in your components.

## Basic Usage

### 1. Check Subscription Status

```tsx
import { useSubscription } from '../context/SubscriptionContext';

function MyComponent() {
  const {
    subscriptionTier,  // 'free' | 'premium' | 'pro'
    isSubscribed,      // boolean
    isPremium,         // boolean (premium or pro)
    isPro              // boolean (pro only)
  } = useSubscription();

  return (
    <div>
      <p>Current Plan: {subscriptionTier}</p>
      {isPremium && <p>You have premium access!</p>}
    </div>
  );
}
```

### 2. Guard Premium Content

```tsx
import PremiumContentGuard from '../components/PremiumContentGuard';

function ArticlePage() {
  return (
    <div>
      <h1>Article Title</h1>

      {/* Free content - visible to all */}
      <p>This is the free preview...</p>

      {/* Premium content - only for subscribers */}
      <PremiumContentGuard>
        <p>This is premium content that requires subscription...</p>
      </PremiumContentGuard>
    </div>
  );
}
```

### 3. Pro-Only Features

```tsx
import PremiumContentGuard from '../components/PremiumContentGuard';

function AIAnalysisFeature() {
  return (
    <PremiumContentGuard
      requiredTier="pro"
      fallbackMessage="AI Analysis is a Pro-exclusive feature"
    >
      <div>
        <h2>AI-Powered News Analysis</h2>
        {/* Pro-only content */}
      </div>
    </PremiumContentGuard>
  );
}
```

### 4. Conditional UI Elements

```tsx
import { useSubscription } from '../context/SubscriptionContext';
import { Crown } from 'lucide-react';

function ArticleCard({ article }) {
  const { isPremium } = useSubscription();

  return (
    <div>
      {article.isPremium && !isPremium && (
        <div className="premium-badge">
          <Crown className="w-4 h-4" />
          Premium
        </div>
      )}

      <h3>{article.title}</h3>

      {article.isPremium && !isPremium ? (
        <button onClick={() => navigate('/subscription')}>
          Unlock Premium
        </button>
      ) : (
        <button onClick={() => readArticle(article)}>
          Read Article
        </button>
      )}
    </div>
  );
}
```

### 5. Feature Limitations

```tsx
import { useSubscription } from '../context/SubscriptionContext';

function VoiceReader() {
  const { subscriptionTier } = useSubscription();

  const getVoiceLimit = () => {
    switch (subscriptionTier) {
      case 'free': return 5;
      case 'premium': return Infinity;
      case 'pro': return Infinity;
      default: return 0;
    }
  };

  const canUseVoice = usageCount < getVoiceLimit();

  return (
    <div>
      {canUseVoice ? (
        <button onClick={startVoiceReading}>Listen</button>
      ) : (
        <Link to="/subscription">
          Upgrade for unlimited voice reading
        </Link>
      )}
    </div>
  );
}
```

### 6. Subscribe Programmatically

```tsx
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

function UpgradeButton() {
  const { subscribe } = useSubscription();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    try {
      await subscribe('premium_monthly');
      navigate('/subscription/success');
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Failed to subscribe. Please try again.');
    }
  };

  return (
    <button onClick={handleUpgrade}>
      Upgrade to Premium
    </button>
  );
}
```

### 7. Display Plan Details

```tsx
import { useSubscription } from '../context/SubscriptionContext';

function SubscriptionStatus() {
  const { currentSubscription, subscriptionTier } = useSubscription();

  if (!currentSubscription) {
    return <p>No active subscription</p>;
  }

  return (
    <div>
      <h3>Your Subscription</h3>
      <p>Plan: {subscriptionTier}</p>
      <p>Status: {currentSubscription.status}</p>
      <p>Started: {currentSubscription.startDate.toLocaleDateString()}</p>
      <p>Renews: {currentSubscription.endDate.toLocaleDateString()}</p>
    </div>
  );
}
```

### 8. Subscription Badges

```tsx
import { useSubscription } from '../context/SubscriptionContext';
import { Crown, Star } from 'lucide-react';

function UserBadge() {
  const { subscriptionTier, isSubscribed } = useSubscription();

  if (!isSubscribed) return null;

  return (
    <div className={`badge ${subscriptionTier}`}>
      {subscriptionTier === 'pro' && <Crown className="w-4 h-4" />}
      {subscriptionTier === 'premium' && <Star className="w-4 h-4" />}
      <span>{subscriptionTier.toUpperCase()}</span>
    </div>
  );
}
```

### 9. Cancel Subscription

```tsx
import { useSubscription } from '../context/SubscriptionContext';

function CancelSubscriptionButton() {
  const { cancelSubscription, currentSubscription } = useSubscription();

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await cancelSubscription();
        alert('Subscription cancelled successfully');
      } catch (error) {
        alert('Failed to cancel subscription');
      }
    }
  };

  if (!currentSubscription || currentSubscription.status !== 'active') {
    return null;
  }

  return (
    <button onClick={handleCancel} className="text-red-600">
      Cancel Subscription
    </button>
  );
}
```

### 10. Multiple Tier Checks

```tsx
import { useSubscription } from '../context/SubscriptionContext';

function FeatureList() {
  const { isPremium, isPro } = useSubscription();

  return (
    <div>
      {/* Available to all */}
      <Feature name="Basic News" available={true} />

      {/* Premium and Pro */}
      <Feature name="Ad-Free Reading" available={isPremium} />
      <Feature name="Voice Reading" available={isPremium} />

      {/* Pro only */}
      <Feature name="AI Analysis" available={isPro} />
      <Feature name="API Access" available={isPro} />
    </div>
  );
}

function Feature({ name, available }) {
  return (
    <div className={available ? 'text-green-600' : 'text-gray-400'}>
      {available ? '✓' : '✗'} {name}
    </div>
  );
}
```

## Integration with Existing Features

### Voice Reader Integration

```tsx
// In VoiceReader.tsx
import { useSubscription } from '../context/SubscriptionContext';

const VoiceReader = () => {
  const { isPremium, subscriptionTier } = useSubscription();
  const [usageCount, setUsageCount] = useState(0);

  const canUseVoice = () => {
    if (isPremium) return true;
    if (subscriptionTier === 'free' && usageCount < 5) return true;
    return false;
  };

  const handleVoiceRead = () => {
    if (!canUseVoice()) {
      alert('Upgrade to Premium for unlimited voice reading!');
      navigate('/subscription');
      return;
    }

    // Start voice reading
    setUsageCount(prev => prev + 1);
  };
};
```

### Article Access Control

```tsx
// In ArticleCard.tsx
import { useSubscription } from '../context/SubscriptionContext';

const ArticleCard = ({ article }) => {
  const { isPremium } = useSubscription();

  const handleClick = () => {
    if (article.isPremium && !isPremium) {
      navigate('/subscription');
      return;
    }
    openArticle(article);
  };

  return (
    <div onClick={handleClick}>
      {article.isPremium && !isPremium && (
        <div className="premium-overlay">
          <Crown /> Premium Article
        </div>
      )}
      {/* Rest of card */}
    </div>
  );
};
```

## Best Practices

### 1. Always Check Authentication
```tsx
const { isAuthenticated } = useAuth();
const { isPremium } = useSubscription();

if (!isAuthenticated) {
  // Show login prompt
}

if (!isPremium) {
  // Show upgrade prompt
}
```

### 2. Graceful Degradation
```tsx
// Don't break the UI for free users
<div>
  <h1>Article Title</h1>
  <p>Free preview content...</p>

  {isPremium ? (
    <div>Full article content</div>
  ) : (
    <Link to="/subscription">Read more with Premium</Link>
  )}
</div>
```

### 3. Clear Upgrade Paths
```tsx
// Always provide clear upgrade options
<div>
  <p>This feature requires Premium</p>
  <Link to="/subscription">
    Upgrade Now - Only ₹199/month
  </Link>
</div>
```

### 4. Verify on Backend
```tsx
// Frontend checks are for UI only
// Always verify subscription status on backend for sensitive operations
const response = await fetch('/api/premium-feature', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Subscription-Tier': subscriptionTier
  }
});
```

---

## Need More Help?

- Check `SUBSCRIPTION_SETUP.md` for setup instructions
- See `QUICKSTART_SUBSCRIPTION.md` for quick start guide
- Visit `/subscription` page to see the full implementation
