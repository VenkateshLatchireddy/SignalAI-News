import React, { useState } from 'react';
import { User, Settings, BookOpen, Calendar, Award, TrendingUp, MessageSquare, Shield, Camera, Video, FileText, DollarSign, Users, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const UserDashboard: React.FC = () => {
  const { user, updateProfile, appointments, books, addSignalAIPoints } = useAuth();
  const { currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    specializations: user?.specializations || []
  });

  if (!user) return null;

  const handleSaveProfile = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'books', label: 'Books & Content', icon: BookOpen },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">SignalAI Points</p>
              <p className="text-2xl font-bold">{user.SignalAIPoints.toLocaleString()}</p>
            </div>
            <Award className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Published Stories</p>
              <p className="text-2xl font-bold text-gray-900">{user.publishedStories}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Followers</p>
              <p className="text-2xl font-bold text-gray-900">{user.followers.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rating</p>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
            <div className="bg-green-100 p-2 rounded-full">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Earned 50 SignalAI Points</p>
              <p className="text-sm text-gray-600">Your story about local flooding was published</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-full">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">New appointment request</p>
              <p className="text-sm text-gray-600">John Doe wants to schedule a consultation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="flex items-start space-x-6 mb-6">
        <img
          src={user.avatar}
          alt={user.fullName}
          className="w-24 h-24 rounded-full object-cover"
        />
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Full Name"
              />
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Bio"
              />
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Location"
              />
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-gray-700 mt-2">{user.bio}</p>
              <p className="text-gray-600 mt-1">{user.location}</p>
              
              {user.specializations && user.specializations.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Specializations:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.specializations.map(spec => (
                      <span key={spec} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Type Badge */}
      <div className="flex items-center space-x-4">
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          user.userType === 'journalist' 
            ? 'bg-red-100 text-red-800' 
            : user.userType === 'news_channel'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {user.userType === 'journalist' ? '📰 Professional Journalist' : 
           user.userType === 'news_channel' ? '📺 News Organization' : 
           '📱 Citizen Reporter'}
        </div>
        
        {user.isVerified && (
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Verified Account
          </div>
        )}
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Appointments & Sessions</h3>
      
      {user.userType === 'journalist' && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Offer Your Services</h4>
          <p className="text-blue-700 text-sm mb-3">Set up consultation sessions, interviews, or collaboration meetings.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Service Offering
          </button>
        </div>
      )}

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No appointments scheduled</p>
        ) : (
          appointments.map(appointment => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                  <p className="text-gray-600 text-sm">{appointment.description}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {appointment.scheduledDate.toLocaleDateString()} at {appointment.scheduledDate.toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                  <p className="text-gray-600 text-sm mt-1">₹{appointment.price}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderBooks = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Books & Content</h3>
        {user.userType === 'journalist' && (
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Publish New Book
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => (
          <div key={book.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">{book.title}</h4>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{book.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-red-600">₹{book.price}</span>
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 mr-1" />
                  <span className="text-sm">{book.rating}</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-2">{book.downloads} downloads</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-8 mb-8">
        <div className="flex items-center space-x-6">
          <img
            src={user.avatar}
            alt={user.fullName}
            className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
          />
          <div>
            <h1 className="text-3xl font-bold">{user.fullName}</h1>
            <p className="text-red-100">@{user.username}</p>
            <p className="text-red-200 mt-2">{user.bio}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'books' && renderBooks()}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Earnings & Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">₹12,450</p>
                <p className="text-green-700">Total Earnings</p>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <Award className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{user.SignalAIPoints}</p>
                <p className="text-red-700">SignalAI Points</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">₹2,100</p>
                <p className="text-blue-700">This Month</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Privacy & Security</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span className="text-gray-700">Enable encrypted messaging</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span className="text-gray-700">Allow appointment bookings</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-gray-700">Public profile visibility</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span className="text-gray-700">New appointment requests</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span className="text-gray-700">Story publication updates</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-gray-700">Marketing emails</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;