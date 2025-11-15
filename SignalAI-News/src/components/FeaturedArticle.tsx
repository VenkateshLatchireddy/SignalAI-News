import React from 'react';
import { Clock, User, Crown, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FeaturedArticleProps {
  article: any;
  onClick: () => void;
  size: 'large' | 'small';
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article, onClick, size }) => {
  const { translations } = useLanguage();

  const handleVoiceRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const event = new CustomEvent('startVoiceReading', {
      detail: { text: article.title + '. ' + article.summary, articleId: article.id }
    });
    window.dispatchEvent(event);
  };

  if (size === 'small') {
    return (
      <article 
        onClick={onClick}
        className="group cursor-pointer bbc-card bbc-transition overflow-hidden"
      >
        <div className="relative">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-32 object-cover group-hover:scale-105 bbc-transition"
          />
          {article.isPremium && (
            <div className="absolute top-2 right-2 bbc-premium p-1">
              <Crown className="w-4 h-4 text-orange-400" />
            </div>
          )}
          <button
            onClick={handleVoiceRead}
            className="absolute bottom-2 right-2 bbc-button bg-black/70 text-white p-2 bbc-transition hover:bg-black/90"
          >
            <Volume2 className="w-3 h-3" />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold bbc-article-title group-hover:text-red-600 bbc-transition line-clamp-2 text-sm">
            {article.title}
          </h3>
          <div className="flex items-center text-xs bbc-article-meta mt-2">
            <Clock className="w-3 h-3 mr-1" />
            <span>{article.readTime}m</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      onClick={onClick}
      className="group cursor-pointer bbc-featured bbc-transition overflow-hidden"
    >
      <div className="relative">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-64 object-cover group-hover:scale-105 bbc-transition"
        />
        {article.isPremium && (
          <div className="absolute top-4 left-4 bbc-premium text-orange-800 px-4 py-2 text-xs font-bold flex items-center">
            <Crown className="w-3 h-3 mr-1 text-orange-400" />
            Premium
          </div>
        )}
        <button
          onClick={handleVoiceRead}
          className="absolute bottom-4 right-4 bbc-button bg-black/70 text-white p-4 bbc-transition hover:bg-black/90"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="bbc-category-badge">
            {article.source}
          </span>
          <span className="text-sm bbc-article-meta">
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
        </div>

        <h2 className="text-xl font-bold bbc-article-title mb-4 group-hover:text-red-600 bbc-transition">
          {article.title}
        </h2>

        <p className="bbc-article-summary mb-4 line-clamp-3">
          {article.summary}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm bbc-article-meta space-x-4">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {article.author}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {article.readTime} min read
            </span>
          </div>
          <button 
            className="bbc-button-primary px-4 py-2 text-white font-medium text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {translations.readFull}
          </button>
        </div>
      </div>
    </article>
  );
};

export default FeaturedArticle;