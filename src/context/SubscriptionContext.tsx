import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type SubscriptionTier = 'free' | 'premium' | 'pro';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  savings?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  tier: SubscriptionTier;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'cancelled' | 'expired';
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

interface SubscriptionContextType {
  currentSubscription: Subscription | null;
  subscriptionTier: SubscriptionTier;
  isSubscribed: boolean;
  isPremium: boolean;
  isPro: boolean;
  plans: SubscriptionPlan[];
  subscribe: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  checkSubscriptionStatus: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    currency: 'INR',
    interval: 'month',
    features: [
      'Access to basic news articles',
      'Limited voice reading',
      'Standard news updates',
      '100 SignalAI Points/month',
      'Community access'
    ]
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    tier: 'premium',
    price: 199,
    currency: 'INR',
    interval: 'month',
    popular: true,
    features: [
      'Unlimited premium articles',
      'Unlimited AI voice reading',
      'Real-time breaking news alerts',
      'Ad-free experience',
      '500 SignalAI Points/month',
      'Priority customer support',
      'Exclusive journalist content',
      'Download articles offline'
    ]
  },
  {
    id: 'premium_yearly',
    name: 'Premium Annual',
    tier: 'premium',
    price: 1999,
    currency: 'INR',
    interval: 'year',
    savings: 'Save 17%',
    features: [
      'All Premium features',
      'Save ₹390 per year',
      '6000 SignalAI Points/year',
      'Early access to new features',
      'Exclusive webinars with journalists',
      'Premium badge on profile'
    ]
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    tier: 'pro',
    price: 499,
    currency: 'INR',
    interval: 'month',
    features: [
      'All Premium features',
      'Advanced AI news analysis',
      'Personalized news digest',
      'Multi-device sync',
      '1500 SignalAI Points/month',
      'Book journalist appointments (50% off)',
      'Access to exclusive events',
      'API access for developers',
      'White-label content publishing',
      'Priority verification badge'
    ]
  },
  {
    id: 'pro_yearly',
    name: 'Pro Annual',
    tier: 'pro',
    price: 4999,
    currency: 'INR',
    interval: 'year',
    savings: 'Save 17%',
    features: [
      'All Pro features',
      'Save ₹990 per year',
      '18000 SignalAI Points/year',
      'Lifetime premium badge',
      'Exclusive founder events',
      'Direct line to editorial team'
    ]
  }
];

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setCurrentSubscription(null);
    }
  }, [user]);

  const loadSubscription = () => {
    const saved = localStorage.getItem(`subscription_${user?.id}`);
    if (saved) {
      const subscription = JSON.parse(saved);
      subscription.startDate = new Date(subscription.startDate);
      subscription.endDate = new Date(subscription.endDate);

      if (new Date() > subscription.endDate) {
        subscription.status = 'expired';
      }

      setCurrentSubscription(subscription);
    }
  };

  const subscriptionTier: SubscriptionTier = currentSubscription?.tier || 'free';
  const isSubscribed = currentSubscription?.status === 'active';
  const isPremium = isSubscribed && (subscriptionTier === 'premium' || subscriptionTier === 'pro');
  const isPro = isSubscribed && subscriptionTier === 'pro';

  const subscribe = async (planId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to subscribe');
    }

    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan');
    }

    return new Promise((resolve, reject) => {
      createRazorpayOrder(plan)
        .then(orderData => {
          openRazorpayCheckout(orderData, plan, resolve, reject);
        })
        .catch(reject);
    });
  };

  const createRazorpayOrder = async (plan: SubscriptionPlan) => {
    try {
      const response = await fetch('http://localhost:5000/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price,
          currency: plan.currency,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  };

  const openRazorpayCheckout = (
    orderData: any,
    plan: SubscriptionPlan,
    resolve: () => void,
    reject: (error: Error) => void
  ) => {
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'SignalAI News',
      description: `${plan.name} Subscription`,
      image: '/News.png',
      order_id: orderData.order_id,
      handler: async (response: any) => {
        try {
          await verifyPayment(response, plan);
          resolve();
        } catch (error) {
          reject(error as Error);
        }
      },
      prefill: {
        name: user?.fullName,
        email: user?.email,
      },
      theme: {
        color: '#bb1919'
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled'));
        }
      }
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (paymentResponse: any, plan: SubscriptionPlan) => {
    try {
      const response = await fetch('http://localhost:5000/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          userId: user?.id,
          planId: plan.id
        })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();

      const startDate = new Date();
      const endDate = new Date();
      if (plan.interval === 'month') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const subscription: Subscription = {
        id: data.subscriptionId || Date.now().toString(),
        userId: user!.id,
        planId: plan.id,
        tier: plan.tier,
        startDate,
        endDate,
        status: 'active',
        paymentMethod: 'razorpay',
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id
      };

      localStorage.setItem(`subscription_${user?.id}`, JSON.stringify(subscription));
      setCurrentSubscription(subscription);

      const bonusPoints = plan.tier === 'pro'
        ? (plan.interval === 'month' ? 1500 : 18000)
        : (plan.interval === 'month' ? 500 : 6000);

      if (updateProfile && user) {
        updateProfile({
          SignalAIPoints: (user.SignalAIPoints || 0) + bonusPoints
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  };

  const cancelSubscription = async (): Promise<void> => {
    if (!currentSubscription) return;

    const cancelled = { ...currentSubscription, status: 'cancelled' as const };
    localStorage.setItem(`subscription_${user?.id}`, JSON.stringify(cancelled));
    setCurrentSubscription(cancelled);
  };

  const checkSubscriptionStatus = () => {
    if (currentSubscription && currentSubscription.status === 'active') {
      if (new Date() > currentSubscription.endDate) {
        const expired = { ...currentSubscription, status: 'expired' as const };
        localStorage.setItem(`subscription_${user?.id}`, JSON.stringify(expired));
        setCurrentSubscription(expired);
      }
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        currentSubscription,
        subscriptionTier,
        isSubscribed,
        isPremium,
        isPro,
        plans: subscriptionPlans,
        subscribe,
        cancelSubscription,
        checkSubscriptionStatus
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
