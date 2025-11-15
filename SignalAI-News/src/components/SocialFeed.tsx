import React, { useState } from 'react';
import { Heart, Share2, MessageCircle, Camera, Video, MapPin, Hash, Shield, Award, Clock, Eye } from 'lucide-react';
import { useAuth, Post } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const SocialFeed: React.FC = () => {
  const { user, posts, createPost, likePost, sharePost } = useAuth();
  const { currentLanguage } = useLanguage();
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'story' as Post['type'],
    location: '',
    tags: [] as string[],
    isEncrypted: false
  });
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleCreatePost = () => {
    if (!newPost.content.trim()) return;

    createPost({
      content: newPost.content,
      type: newPost.type,
      location: newPost.location,
      tags: newPost.tags,
      isVerified: user?.isVerified || false,
      isEncrypted: newPost.isEncrypted
    });

    setNewPost({
      content: '',
      type: 'story',
      location: '',
      tags: [],
      isEncrypted: false
    });
    setShowCreatePost(false);
  };

  const postTypes = [
    { value: 'breaking', label: 'Breaking News', icon: '🚨', color: 'text-red-600' },
    { value: 'story', label: 'Story', icon: '📰', color: 'text-blue-600' },
    { value: 'opinion', label: 'Opinion', icon: '💭', color: 'text-purple-600' },
    { value: 'footage', label: 'Footage', icon: '📹', color: 'text-green-600' },
    { value: 'tip', label: 'News Tip', icon: '💡', color: 'text-orange-600' }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      {user && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <button
                onClick={() => setShowCreatePost(true)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-all"
              >
                What's happening in your area?
              </button>
            </div>
          </div>

          {showCreatePost && (
            <div className="space-y-4">
              {/* Post Type Selection */}
              <div className="flex flex-wrap gap-2">
                {postTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setNewPost(prev => ({ ...prev, type: type.value as Post['type'] }))}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      newPost.type === type.value
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your news, story, or footage..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={4}
              />

              {/* Location */}
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={newPost.location}
                  onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Add location"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Camera className="w-5 h-5" />
                    <span className="text-sm">Photo</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Video className="w-5 h-5" />
                    <span className="text-sm">Video</span>
                  </button>
                  <label className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors cursor-pointer">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm">Encrypted</span>
                    <input
                      type="checkbox"
                      checked={newPost.isEncrypted}
                      onChange={(e) => setNewPost(prev => ({ ...prev, isEncrypted: e.target.checked }))}
                      className="ml-2"
                    />
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.content.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Post Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start space-x-4">
                <img
                  src={post.user.avatar}
                  alt={post.user.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{post.user.fullName}</h3>
                    {post.user.isVerified && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                    {post.user.userType === 'journalist' && (
                      <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Award className="w-3 h-3 mr-1" />
                        Journalist
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                    <span>@{post.user.username}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(post.timestamp)}
                    </span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {post.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Post Type Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  postTypes.find(t => t.value === post.type)?.color || 'text-gray-600'
                } bg-gray-100`}>
                  {postTypes.find(t => t.value === post.type)?.icon} {postTypes.find(t => t.value === post.type)?.label}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4">
              <p className="text-gray-900 leading-relaxed">{post.content}</p>
              
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center text-red-600 text-sm">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Encrypted Badge */}
              {post.isEncrypted && (
                <div className="mt-3 inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3 mr-1" />
                  Encrypted Content
                </div>
              )}
            </div>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className="px-6 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt="Post content"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Post Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => likePost(post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>
                  
                  <button
                    onClick={() => sharePost(post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.shares}</span>
                  </button>
                </div>

                <div className="flex items-center text-gray-500 text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{Math.floor(Math.random() * 1000) + 100} views</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialFeed;