import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, SortAsc, Grid3X3, List, Clock } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import { useNews } from '../context/NewsContext';
import { useLanguage } from '../context/LanguageContext';

interface CategoryPageProps {
  onArticleClick: (article: any) => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ onArticleClick }) => {
  const { categoryName } = useParams();
  const { getArticlesByCategory, isLoading } = useNews();
  const { translations, currentLanguage } = useLanguage();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'free' | 'premium'>('all');
  const [displayCount, setDisplayCount] = useState(20);

  const categoryArticles = getArticlesByCategory(categoryName || 'home');

  const filteredAndSortedArticles = React.useMemo(() => {
    let filtered = categoryArticles;

    // Apply filters
    if (filterBy === 'free') {
      filtered = filtered.filter(article => !article.isPremium);
    } else if (filterBy === 'premium') {
      filtered = filtered.filter(article => article.isPremium);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'popular':
          return Math.random() - 0.5; // Simulate popularity
        case 'trending':
          return b.readTime - a.readTime;
        default:
          return 0;
      }
    });

    return filtered.slice(0, displayCount);
  }, [categoryArticles, filterBy, sortBy, displayCount]);

  const categoryDisplayName = translations[categoryName || 'home'] || categoryName || 'Home';

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
      {/* Category Header */}
      <div className="bbc-section-header mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="bbc-section-title">{categoryDisplayName}</h1>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center bbc-text space-x-6">
          <div className="flex items-center">
            <div className="bg-red-600 p-2 mr-2">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm">Live Updates</span>
          </div>
          <div className="bbc-live text-xs">LIVE</div>
          <span className="text-sm">{filteredAndSortedArticles.length} articles available</span>
        </div>
      </div>

      {/* Controls */}
      <div className="bbc-card p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 bbc-text" />
              <select 
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="bbc-search px-4 py-2 text-sm"
              >
                <option value="all">All Articles</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <SortAsc className="w-4 h-4 bbc-text" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bbc-search px-4 py-2 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`bbc-button p-3 bbc-transition ${viewMode === 'grid' ? 'bbc-button-primary text-white' : ''}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`bbc-button p-3 bbc-transition ${viewMode === 'list' ? 'bbc-button-primary text-white' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Articles Grid/List */}
      <div className={`${viewMode === 'grid' 
        ? 'bbc-grid bbc-grid-articles gap-6' 
        : 'space-y-6'
      }`}>
        {filteredAndSortedArticles.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => onArticleClick(article)}
            compact={viewMode === 'list'}
            showFullDetails={true}
          />
        ))}
      </div>

      {/* Load More */}
      {categoryArticles.length > displayCount && (
        <div className="text-center mt-8">
          <button
            onClick={() => setDisplayCount(prev => prev + 20)}
            className="bbc-button-primary text-white px-8 py-4 font-medium bbc-transition"
          >
            Load More Articles
          </button>
        </div>
      )}

      {filteredAndSortedArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="bbc-text text-xl">{translations.noArticles}</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;