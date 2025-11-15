import React from 'react';
import { X, Clock, User, Tag, Share2, Crown, Volume2, Play, Pause } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FullArticleProps {
  article: any;
  onClose: () => void;
}

const FullArticle: React.FC<FullArticleProps> = ({ article, onClose }) => {
  const { translations } = useLanguage();
  const [isReading, setIsReading] = React.useState(false);

  const handleVoiceRead = () => {
    if (isReading) {
      // Stop current reading
      const event = new CustomEvent('stopVoiceReading');
      window.dispatchEvent(event);
      setIsReading(false);
    } else {
      // Enhanced full article reading with better text preparation
      const fullText = `${article.title}. ${article.summary}. ${article.content.replace(/\n\n/g, '. ')}`;
      const event = new CustomEvent('startVoiceReading', {
        detail: { 
          text: fullText, 
          articleId: article.id,
          isFullArticle: true
        }
      });
      window.dispatchEvent(event);
      setIsReading(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  React.useEffect(() => {
    const handleVoiceEnd = () => setIsReading(false);
    const handleVoiceStop = () => setIsReading(false);
    window.addEventListener('voiceReadingEnded', handleVoiceEnd);
    window.addEventListener('stopVoiceReading', handleVoiceStop);
    return () => {
      window.removeEventListener('voiceReadingEnded', handleVoiceEnd);
      window.removeEventListener('stopVoiceReading', handleVoiceStop);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 pt-8">
        <div className="bbc-card shadow-2xl max-w-4xl w-full max-h-full overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {article.isPremium && (
                <div className="bbc-premium text-orange-800 px-4 py-2 text-sm font-bold flex items-center">
                  <Crown className="w-4 h-4 mr-1 text-orange-400" />
                  Premium
                </div>
              )}
              <span className="bbc-category-badge">{article.source}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleVoiceRead}
                className={`bbc-button flex items-center space-x-2 px-6 py-3 bbc-transition ${
                  isReading 
                    ? 'bg-red-600 text-white' 
                    : 'bbc-button-primary text-white'
                }`}
              >
                {isReading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isReading ? 'Stop' : translations.listen}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="bbc-button flex items-center space-x-2 px-6 py-3 bbc-transition"
              >
                <Share2 className="w-4 h-4" />
                <span>{translations.share}</span>
              </button>
              
              <button
                onClick={onClose}
                className="bbc-button p-3 bbc-transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Article Content */}
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-bold bbc-heading mb-6 leading-tight">
                  {article.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm bbc-article-meta mb-6">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span className="font-medium">{article.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{new Date(article.publishedAt).toLocaleDateString()} • {article.readTime} min read</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                  {article.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center px-4 py-2 text-sm bg-gray-100 bbc-text border border-gray-200">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover mb-8"
              />

              <div className="prose prose-lg max-w-none">
                <p className="text-xl bbc-text font-medium mb-8 leading-relaxed">
                  {article.summary}
                </p>
                
                <div className="bbc-text leading-relaxed space-y-6">
                  {article.content.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index} className="text-lg leading-8">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullArticle;