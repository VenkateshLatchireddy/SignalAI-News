import React from 'react';
import { MessageSquare, Users, TrendingUp, Shield, Globe, Award } from 'lucide-react';
import SocialFeed from '../components/SocialFeed';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const SocialPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <MessageSquare className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Raise Your Voice</h1>
            </div>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
              Global journalism network where reporters, citizens, and news organizations 
              share stories, exchange information, and collaborate without fear.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">10M+</div>
                <div className="text-red-200 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">50K+</div>
                <div className="text-red-200 text-sm">Journalists</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">1M+</div>
                <div className="text-red-200 text-sm">Stories Shared</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">190+</div>
                <div className="text-red-200 text-sm">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Secure Platform</div>
                <div className="text-sm text-gray-600">Encrypted messaging</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Global Network</div>
                <div className="text-sm text-gray-600">Worldwide reach</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">SignalAI Points</div>
                <div className="text-sm text-gray-600">Earn rewards</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Collaboration</div>
                <div className="text-sm text-gray-600">Connect & share</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* User Stats */}
              {isAuthenticated && user && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="text-center">
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                    <p className="text-gray-600 text-sm">@{user.username}</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-red-600">{user.SignalAIPoints}</div>
                        <div className="text-xs text-gray-600">Points</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{user.publishedStories}</div>
                        <div className="text-xs text-gray-600">Stories</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trending Topics */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {['#BreakingNews', '#ClimateChange', '#Elections2025', '#TechNews', '#GlobalHealth'].map(tag => (
                    <div key={tag} className="flex items-center justify-between">
                      <span className="text-red-600 font-medium">{tag}</span>
                      <span className="text-gray-500 text-sm">{Math.floor(Math.random() * 1000)}K</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Guidelines */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Community Guidelines</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Verify information before sharing</li>
                  <li>• Respect privacy and safety</li>
                  <li>• Use encryption for sensitive content</li>
                  <li>• Credit original sources</li>
                  <li>• Report misinformation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Social Feed */}
          <div className="lg:col-span-3">
            <SocialFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPage;