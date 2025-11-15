import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Star, Shield, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';
import PlanCard from '../components/PlanCard';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SubscriptionPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { plans, subscriptionTier, subscribe, currentSubscription } = useSubscription();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  // ✅ Changed: track which plan is processing, not global boolean
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      alert('Please login to subscribe');
      return;
    }

    if (!isScriptLoaded) {
      alert('Payment system is loading. Please try again in a moment.');
      return;
    }

    setProcessingPlanId(planId); // ✅ only the clicked plan
    setError('');

    try {
      await subscribe(planId);
      navigate('/subscription/success');
    } catch (err: any) {
      setError(err.message || 'Subscription failed. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setProcessingPlanId(null); // ✅ reset only after finishing
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <Crown className="w-5 h-5 mr-2" />
              <span className="font-semibold text-sm">PREMIUM SUBSCRIPTIONS</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Unlock Premium News Experience
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto mb-8">
              Get unlimited access to premium content, AI voice reading, and exclusive features
            </p>

            {currentSubscription && currentSubscription.status === 'active' && (
              <div className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  You have an active {subscriptionTier} subscription
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentTier={subscriptionTier}
              onSubscribe={handleSubscribe}
              // ✅ Pass only true for the plan being processed
              isProcessing={processingPlanId === plan.id}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Choose SignalAI Premium?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-6 inline-block mb-4">
                <Zap className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant breaking news alerts and live updates from 1000+ sources
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 inline-block mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl mb-2">AI Voice Reading</h3>
              <p className="text-gray-600">
                Listen to articles with natural-sounding AI voices in 10 Indian languages
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 inline-block mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Ad-Free Experience</h3>
              <p className="text-gray-600">
                Enjoy distraction-free reading with zero advertisements
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <details className="bg-white/10 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">Can I cancel anytime?</summary>
              <p className="mt-2 text-gray-300">
                Yes, you can cancel your subscription anytime from your dashboard. You'll retain access until the end of your billing period.
              </p>
            </details>

            <details className="bg-white/10 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">What payment methods do you accept?</summary>
              <p className="mt-2 text-gray-300">
                We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay.
              </p>
            </details>

            <details className="bg-white/10 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">Can I upgrade or downgrade my plan?</summary>
              <p className="mt-2 text-gray-300">
                Yes, you can change your plan anytime. When upgrading, you'll be charged the prorated difference. When downgrading, changes take effect at the next billing cycle.
              </p>
            </details>

            <details className="bg-white/10 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">Is my payment information secure?</summary>
              <p className="mt-2 text-gray-300">
                Absolutely. We use Razorpay, a PCI-DSS compliant payment gateway. We never store your card details on our servers.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
