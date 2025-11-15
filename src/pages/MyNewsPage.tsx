import React, { useState, useEffect } from 'react';
import { Settings, Filter, Star, TrendingUp, AlertCircle } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import FeaturedArticle from '../components/FeaturedArticle';
import MyNewsModal from '../components/MyNewsModal';
import { useNews } from '../context/NewsContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface MyNewsPageProps {
  onArticleClick: (article: any) => void;
}

const MyNewsPage: React.FC<MyNewsPageProps> = ({ onArticleClick }) => {
  const { articles, isLoading } = useNews();
  const { translations } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const saved = localStorage.getItem(`myNewsCategories_${user.id}`);
      if (saved) {
        setSelectedCategories(JSON.parse(saved));
      }
    }
  }, [user, isAuthenticated]);

  const handleSavePreferences = (categories: string[]) => {
    if (user) {
      setSelectedCategories(categories);
      localStorage.setItem(`myNewsCategories_${user.id}`, JSON.stringify(categories));
    }
  };

  const filteredArticles = articles.filter(article =>
    selectedCategories.includes(article.category.toLowerCase())
  );

  const featuredArticles = filteredArticles.slice(0, 3);
  const remainingArticles = filteredArticles.slice(3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="bbc-text">{translations.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen bg-white">
      {/* Header Section */}
      <div className="bbc-section-header mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-red-600 p-3 rounded-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="bbc-section-title">My News</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Personalized news from your selected categories
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bbc-button px-4 py-3 hover:bg-gray-100 transition-all"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden md:inline">Edit Preferences</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Categories Display */}
      <div className="mb-8 bbc-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-red-600" />
            Your Categories ({selectedCategories.length})
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map(category => (
            <span
              key={category}
              className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 border border-red-200 rounded-full text-sm font-medium capitalize"
            >
              {category}
            </span>
          ))}
          {selectedCategories.length === 0 && (
            <p className="text-gray-500 text-sm">No categories selected</p>
          )}
        </div>
      </div>

      {/* No Articles Message */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <div className="bbc-card p-12 max-w-2xl mx-auto">
            <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold bbc-heading mb-4">
              No news in your selected categories yet
            </h2>
            <p className="text-gray-600 mb-8">
              {selectedCategories.length === 0
                ? 'Get started by selecting your favorite categories!'
                : 'Try adding more categories to see a wider range of news articles.'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bbc-button-primary text-white px-8 py-4 font-medium inline-flex items-center space-x-2"
            >
              <Settings className="w-5 h-5" />
              <span>
                {selectedCategories.length === 0 ? 'Select Categories' : 'Add More Categories'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-2xl font-bold bbc-heading">Featured for You</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredArticles.length > 0 && (
              <div className="lg:col-span-2">
                <FeaturedArticle
                  article={featuredArticles[0]}
                  onClick={() => onArticleClick(featuredArticles[0])}
                  size="large"
                />
              </div>
            )}
            <div className="space-y-6">
              {featuredArticles.slice(1, 3).map(article => (
                <FeaturedArticle
                  key={article.id}
                  article={article}
                  onClick={() => onArticleClick(article)}
                  size="small"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles Grid */}
      {remainingArticles.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold bbc-heading mb-6">Latest Updates</h2>
          <div className="bbc-grid bbc-grid-articles gap-6">
            {remainingArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => onArticleClick(article)}
                showFullDetails={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Stats Footer */}
      {filteredArticles.length > 0 && (
        <div className="bbc-card p-8 mt-12 grid grid-cols-2 md:grid-cols-3 gap-6 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="text-center">
            <div className="text-3xl font-bold bbc-heading text-red-600">{filteredArticles.length}</div>
            <div className="bbc-text text-sm">Articles for You</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bbc-heading text-red-600">{selectedCategories.length}</div>
            <div className="bbc-text text-sm">Selected Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bbc-heading text-red-600">
              <span className="bbc-live">LIVE</span>
            </div>
            <div className="bbc-text text-sm">Real-time Updates</div>
          </div>
        </div>
      )}

      {/* Modal */}
      <MyNewsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSavePreferences}
        initialCategories={selectedCategories}
        isFirstTime={false}
      />
    </div>
  );
};

export default MyNewsPage;
