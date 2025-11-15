import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Award, Sparkles, ArrowRight } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { currentSubscription, subscriptionTier } = useSubscription();
  const { user } = useAuth();

  useEffect(() => {
    if (!currentSubscription) {
      navigate('/subscription');
    }
  }, [currentSubscription, navigate]);

  const getBenefits = () => {
    if (subscriptionTier === 'pro') {
      return [
        'All Premium features unlocked',
        'Advanced AI news analysis',
        'Personalized news digest',
        '1500 SignalAI Points credited',
        'Priority verification badge',
        'API access for developers'
      ];
    } else if (subscriptionTier === 'premium') {
      return [
        'Unlimited premium articles',
        'Unlimited AI voice reading',
        'Real-time breaking news alerts',
        '500 SignalAI Points credited',
        'Ad-free experience',
        'Exclusive journalist content'
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center bg-white rounded-full p-6 mb-6 shadow-lg">
                <CheckCircle className="w-16 h-16 text-green-600 animate-pulse" />
              </div>

              <h1 className="text-4xl font-bold mb-4">
                Welcome to {subscriptionTier === 'pro' ? 'Pro' : 'Premium'}!
              </h1>
              <p className="text-xl text-green-100">
                Your subscription has been activated successfully
              </p>
            </div>

            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          </div>

          <div className="p-8">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-6 border border-orange-200">
              <div className="flex items-center space-x-3 mb-3">
                <Award className="w-6 h-6 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Subscription Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Plan</p>
                  <p className="font-semibold text-gray-900 capitalize">{subscriptionTier}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-green-600">Active</p>
                </div>
                <div>
                  <p className="text-gray-600">Started</p>
                  <p className="font-semibold text-gray-900">
                    {currentSubscription?.startDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Renews</p>
                  <p className="font-semibold text-gray-900">
                    {currentSubscription?.endDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900 text-lg">Your New Benefits</h3>
              </div>
              <ul className="space-y-3">
                {getBenefits().map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Your payment has been processed securely through Razorpay. A confirmation email has been sent to <span className="font-semibold text-gray-900">{user?.email}</span>
              </p>
              <p className="text-xs text-gray-500">
                Order ID: {currentSubscription?.razorpayOrderId}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <span>Start Reading Premium Content</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 px-6 rounded-xl font-semibold transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Need help? Contact us at support@SignalAInews.com
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
