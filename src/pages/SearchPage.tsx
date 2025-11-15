import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Clock, TrendingUp } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import FeaturedArticle from '../components/FeaturedArticle';
import { useNews } from '../context/NewsContext';
import { useLanguage } from '../context/LanguageContext';

interface SearchPageProps {
  onArticleClick: (article: any) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onArticleClick }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { searchArticles, getArticlesByCategory, isLoading } = useNews();
  const { translations } = useLanguage();
  
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'relevance' | 'popular'>('relevance');

  useEffect(() => {
    if (query) {
      let results = searchArticles(query);
      
      // Add city-specific filtering if the query contains city names
      const cityKeywords = ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad'];
      const cityMatch = cityKeywords.find(city => query.toLowerCase().includes(city));
      
      if (cityMatch) {
        // Get additional local news articles
        const localArticles = getArticlesByCategory('india').filter(article =>
          article.title.toLowerCase().includes(cityMatch) ||
          article.summary.toLowerCase().includes(cityMatch)
        );
        results = [...results, ...localArticles];
      }

      // Remove duplicates and sort
      const uniqueResults = results.filter((article, index, self) =>
        index === self.findIndex(a => a.id === article.id)
      );

      // Apply sorting
      uniqueResults.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          case 'popular':
            return Math.random() - 0.5;
          case 'relevance':
          default:
            // Simple relevance score based on title match
            const aScore = a.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 1;
            const bScore = b.title.toLowerCase().includes(query.toLowerCase()) ? 2 : 1;
            return bScore - aScore;
        }
      });

      setFilteredArticles(uniqueResults.slice(0, 30));
    }
  }, [query, searchArticles, getArticlesByCategory, sortBy]);

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
      {/* Search Header */}
      <div className="bbc-section-header mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="bbc-section-title flex items-center">
            <Search className="w-8 h-8 mr-3" />
            Search Results
          </h1>
          <p className="bbc-text mt-2">Showing results for "{query}"</p>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center bbc-text space-x-4">
            <div className="bg-red-600 p-2">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm">{filteredArticles.length} articles found</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 bbc-text" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bbc-search px-4 py-2 text-sm"
            >
              <option value="relevance">Most Relevant</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Featured Result */}
      {filteredArticles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold bbc-heading mb-6">Featured Result</h2>
          <FeaturedArticle 
            article={filteredArticles[0]}
            onClick={() => onArticleClick(filteredArticles[0])}
            size="large"
          />
        </div>
      )}

      {/* Search Results */}
      {filteredArticles.length > 1 && (
        <div>
          <h2 className="text-2xl font-bold bbc-heading mb-6">All Results</h2>
          <div className="bbc-grid bbc-grid-articles gap-6">
            {filteredArticles.slice(1).map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => onArticleClick(article)}
                showFullDetails={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredArticles.length === 0 && query && (
        <div className="text-center py-12">
          <div className="bbc-card p-6 mx-auto mb-6 w-fit">
            <Search className="w-16 h-16 bbc-accent" />
          </div>
          <h2 className="text-2xl font-bold bbc-heading mb-4">No results found</h2>
          <p className="bbc-text mb-8">Try searching with different keywords or browse our categories</p>
          <div className="flex flex-wrap justify-center gap-4">
            {['India', 'World', 'Business', 'Technology', 'Sports'].map(category => (
              <button
                key={category}
                onClick={() => window.location.href = `/category/${category.toLowerCase()}`}
                className="bbc-button-primary text-white px-6 py-3 text-sm bbc-transition"
              >
                {category} News
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;