import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

interface PremiumContentGuardProps {
  children: React.ReactNode;
  requiredTier?: 'premium' | 'pro';
  fallbackMessage?: string;
}

const PremiumContentGuard: React.FC<PremiumContentGuardProps> = ({
  children,
  requiredTier = 'premium',
  fallbackMessage
}) => {
  const { isPremium, isPro, subscriptionTier } = useSubscription();
  const { isAuthenticated } = useAuth();

  const hasAccess = requiredTier === 'premium' ? isPremium : isPro;

  if (hasAccess) {
    return <>{children}</>;
  }

  const defaultMessage = requiredTier === 'pro'
    ? 'This feature is available for Pro subscribers only'
    : 'This content is available for Premium subscribers only';

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white z-10 flex items-end justify-center pb-8">
        <div className="bg-white border-2 border-red-500 rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-orange-500 rounded-full p-4 mb-4">
            {requiredTier === 'pro' ? (
              <Crown className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {requiredTier === 'pro' ? 'Pro Feature' : 'Premium Content'}
          </h3>

          <p className="text-gray-600 mb-6">
            {fallbackMessage || defaultMessage}
          </p>

          <div className="space-y-3">
            {!isAuthenticated && (
              <p className="text-sm text-gray-500 mb-4">
                Please login to access subscription plans
              </p>
            )}

            <Link
              to="/subscription"
              className="block bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-xl font-semibold transition-all"
            >
              <span className="flex items-center justify-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Upgrade to {requiredTier === 'pro' ? 'Pro' : 'Premium'}
              </span>
            </Link>

            {subscriptionTier !== 'free' && subscriptionTier !== requiredTier && (
              <p className="text-xs text-gray-500">
                You have a {subscriptionTier} subscription. Upgrade to access this feature.
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Starting from ₹{requiredTier === 'pro' ? '499' : '199'}/month
            </p>
          </div>
        </div>
      </div>

      <div className="blur-sm pointer-events-none opacity-50 select-none">
        {children}
      </div>
    </div>
  );
};

export default PremiumContentGuard;
