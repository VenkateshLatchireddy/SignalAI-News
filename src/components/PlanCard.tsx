import React from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { SubscriptionPlan } from '../context/SubscriptionContext';

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentTier: string;
  onSubscribe: (planId: string) => void;
  isProcessing: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, currentTier, onSubscribe, isProcessing }) => {
  const isCurrentPlan = currentTier === plan.tier;
  const isFree = plan.tier === 'free';
  const isPremium = plan.tier === 'premium';
  const isPro = plan.tier === 'pro';

  const getIcon = () => {
    if (isPro) return <Crown className="w-6 h-6" />;
    if (isPremium) return <Star className="w-6 h-6" />;
    return <Zap className="w-6 h-6" />;
  };

  const getGradient = () => {
    if (isPro) return 'from-purple-600 to-purple-700';
    if (isPremium) return 'from-red-600 to-red-700';
    return 'from-gray-600 to-gray-700';
  };

  const getBorderColor = () => {
    if (plan.popular) return 'border-red-500 border-2';
    return 'border-gray-200';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${getBorderColor()} relative`}>
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-1 rounded-bl-lg text-xs font-bold">
          MOST POPULAR
        </div>
      )}

      {plan.savings && (
        <div className="absolute top-0 left-0 bg-green-600 text-white px-3 py-1 rounded-br-lg text-xs font-bold">
          {plan.savings}
        </div>
      )}

      <div className={`bg-gradient-to-r ${getGradient()} text-white p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-sm opacity-90 capitalize">{plan.interval}ly Billing</p>
            </div>
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-5xl font-bold">₹{plan.price}</span>
          {!isFree && (
            <span className="text-lg opacity-90">/{plan.interval}</span>
          )}
        </div>

        {plan.interval === 'year' && !isFree && (
          <p className="text-sm mt-2 opacity-90">
            ≈ ₹{Math.round(plan.price / 12)}/month
          </p>
        )}
      </div>

      <div className="p-6">
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onSubscribe(plan.id)}
          disabled={isCurrentPlan || isProcessing || isFree}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all ${
            isCurrentPlan
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isFree
              ? 'bg-gray-100 text-gray-600 cursor-default'
              : isPro
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg'
              : isPremium
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {isCurrentPlan ? 'Current Plan' : isFree ? 'Always Free' : isProcessing ? 'Processing...' : `Subscribe to ${plan.name}`}
        </button>

        {isCurrentPlan && !isFree && (
          <p className="text-center text-xs text-gray-500 mt-2">
            Active subscription
          </p>
        )}
      </div>
    </div>
  );
};

export default PlanCard;
