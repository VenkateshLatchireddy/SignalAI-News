import React from 'react';
import { Clock, User, Tag, Crown, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  author: string;
  publishedAt: Date;
  readTime: number;
  source: string;
  isPremium: boolean;
  tags: string[];
}

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
  compact?: boolean;
  showFullDetails?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onClick, 
  compact = false, 
  showFullDetails = false 
}) => {
  const { translations } = useLanguage();

  const handleVoiceRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Enhanced voice reading with better text preparation
    const fullText = `${article.title}. ${article.summary}`;
    const event = new CustomEvent('startVoiceReading', {
      detail: { text: fullText, articleId: article.id }
    });
    window.dispatchEvent(event);
  };

  if (compact) {
    return (
      <div 
        onClick={onClick}
        className="group cursor-pointer bbc-card pb-4 last:border-b-0 bbc-transition p-4 mb-4"
      >
        <div className="flex space-x-4">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-20 h-20 object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {article.isPremium && (
                <div className="bbc-premium p-1">
                  <Crown className="w-3 h-3 text-orange-400" />
                </div>
              )}
              <span className="text-xs bbc-text font-medium bbc-accent">{article.source}</span>
            </div>
            <h3 className="font-semibold bbc-article-title group-hover:text-red-600 bbc-transition line-clamp-2 text-sm">
              {article.title}
            </h3>
            <div className="flex items-center text-xs bbc-article-meta mt-2 space-x-3">
              <span className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {article.author}
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {article.readTime}m read
              </span>
              <button
                onClick={handleVoiceRead}
                className="bbc-button flex items-center px-2 py-1 bbc-transition"
                title="Listen to article"
              >
                <Volume2 className="w-3 h-3 mr-1" />
                {translations.listen}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article 
      onClick={onClick}
      className="group bbc-card cursor-pointer overflow-hidden bbc-transition"
    >
      <div className="relative">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-48 object-cover group-hover:scale-105 bbc-transition"
        />
        {article.isPremium && (
          <div className="absolute top-4 left-4 bbc-premium text-orange-800 px-3 py-2 text-xs font-bold flex items-center">
            <Crown className="w-3 h-3 mr-1 text-orange-400" />
            Premium
          </div>
        )}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleVoiceRead}
            className="bbc-button bg-black/70 text-white p-3 bbc-transition hover:bg-black/90"
            title="Listen to article"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="bbc-category-badge">
            {article.source}
          </span>
          <span className="text-xs bbc-article-meta">
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
        </div>

        <h2 className="text-lg font-bold bbc-article-title mb-3 group-hover:text-red-600 bbc-transition line-clamp-2">
          {article.title}
        </h2>

        <p className="bbc-article-summary text-sm mb-4 line-clamp-3">
          {article.summary}
        </p>

        {showFullDetails && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1 mb-2">
              {article.tags.slice(0, 3).map(tag => (
                <span key={tag} className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 bbc-text border border-gray-200">
                  <Tag className="w-2 h-2 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs bbc-article-meta">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {article.author}
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {article.readTime} min read
            </span>
          </div>
          <button 
            className="bbc-button-primary px-3 py-1 text-white font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {translations.readMore}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;