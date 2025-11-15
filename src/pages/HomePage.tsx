import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp, Users, Globe2, AlertCircle } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import FeaturedArticle from '../components/FeaturedArticle';
import { useNews } from '../context/NewsContext';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  onArticleClick: (article: any) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onArticleClick }) => {
  const { articles, isLoading, lastUpdated, getLocalizedArticles } = useNews();
  const { translations, currentLanguage, getCulturalContext } = useLanguage();
  
  // Get articles in current language
  const localizedArticles = getLocalizedArticles(currentLanguage);
  const displayArticles = localizedArticles.length > 0 ? localizedArticles : articles;

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

  const breakingNews = displayArticles.filter(article => 
    article.category === 'breaking' || 
    new Date(article.publishedAt).getTime() > Date.now() - 3600000
  ).slice(0, 5);

  const featuredArticles = displayArticles.slice(0, 3);
  const indiaNews = displayArticles.filter(article => article.category === 'india').slice(0, 6);
  const worldNews = displayArticles.filter(article => article.category === 'world').slice(0, 4);
  const businessNews = displayArticles.filter(article => article.category === 'business').slice(0, 4);
  const sportsNews = displayArticles.filter(article => article.category === 'sports').slice(0, 4);
  
  // Get cultural context for current language
  const culturalContext = getCulturalContext(currentLanguage);

const [currentIndex, setCurrentIndex] = React.useState(0);
const [isPaused, setIsPaused] = React.useState(false);

const slidesRowRef = React.useRef<HTMLDivElement | null>(null);
const touchStartX = React.useRef<number | null>(null);
const touchDeltaX = React.useRef<number>(0);

function handleTouchStart(e: React.TouchEvent) {
  touchStartX.current = e.touches[0].clientX;
  touchDeltaX.current = 0;
}

function handleTouchMove(e: React.TouchEvent) {
  if (touchStartX.current == null) return;
  const currentX = e.touches[0].clientX;
  touchDeltaX.current = currentX - touchStartX.current;
  // optional: translate row slightly for live swipe feedback
  if (slidesRowRef.current) {
    slidesRowRef.current.style.transition = "none";
    slidesRowRef.current.style.transform = `translateX(calc(-${currentIndex * 100}% + ${touchDeltaX.current}px))`;
  }
}

function handleTouchEnd() {
  if (slidesRowRef.current) {
    slidesRowRef.current.style.transition = "";
    slidesRowRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
  }
  if (!touchStartX.current) return;
  const delta = touchDeltaX.current;
  const threshold = 60; // px to consider as swipe
  if (delta > threshold) {
    // swipe right -> previous
    setCurrentIndex((prev) => (prev === 0 ? breakingNews.length - 1 : prev - 1));
  } else if (delta < -threshold) {
    // swipe left -> next
    setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
  }
  touchStartX.current = null;
  touchDeltaX.current = 0;
}


React.useEffect(() => {
  if (breakingNews.length === 0) return;
  if (isPaused) return;

  const id = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
  }, 4500);

  return () => clearInterval(id);
}, [breakingNews, isPaused]);



  return (
    <div className={`max-w-7xl mx-auto px-4 py-6 space-y-8 min-h-screen bg-white script-${culturalContext.script.toLowerCase()}`} dir={culturalContext.direction}>
      {/* Breaking News Banner */}
      {breakingNews.length > 0 && (
        <div className="breaking-news-container mb-8 relative overflow-hidden">
          {/* Animated Background */}
          <div className="breaking-news-bg"></div>
          
          {/* Header Section */}
          {/* Header Section */}
<div
  className="breaking-news-header"
  style={{
    borderBottom: 'none',
    boxShadow: 'none',
    marginBottom: '0',
    paddingBottom: '0',
  }}
>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="breaking-badge">
                  <div className="breaking-pulse"></div>
                  <AlertCircle className="w-6 h-6" />
                  <span className="breaking-text">BREAKING NEWS</span>
                </div>
                <div className="live-indicator">
                  <div className="live-dot"></div>
                  <span>LIVE</span>
                </div>
              </div>
              <div className="breaking-time">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

{/* 🔥 Robust Responsive Breaking News Carousel */}
{breakingNews.length > 0 && (
  <div
    className="relative w-full overflow-hidden rounded-lg shadow-md bg-white mt-2"
    // pause on hover
    onMouseEnter={() => setIsPaused(true)}
    onMouseLeave={() => setIsPaused(false)}
  >
    {/* Slides row */}
    <div
      className="flex transition-transform duration-700 ease-in-out"
      style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      ref={slidesRowRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {breakingNews.map((article) => (
        <div
          key={article.id}
          onClick={() => onArticleClick(article)}
          className="flex-shrink-0 flex flex-col bg-white cursor-pointer"
          style={{ flex: "0 0 100%" }} // each slide takes full width
        >
          {/* Image (responsive) */}
          <div className="w-full overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-auto object-cover block"
              style={{
                maxHeight: 260,       // cap large screens
                width: "100%",
              }}
              loading="lazy"
            />
          </div>

          {/* Text area grows with content (no clipping) */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6">
            <h2 className="text-base sm:text-lg md:text-2xl font-semibold text-gray-900 mb-2 leading-snug">
              {article.title}
            </h2>

            <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed break-words">
              {article.summary}
            </p>

            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(article.publishedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="font-medium truncate">{article.source}</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Dots */}
    <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2 z-20">
      {breakingNews.map((_, i) => (
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex(i);
          }}
          className={`rounded-full transition-all duration-300 focus:outline-none ${
            i === currentIndex ? "bg-red-600 w-8 h-2" : "bg-gray-300 w-3 h-2"
          }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>

    {/* Arrows */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? breakingNews.length - 1 : prev - 1));
      }}
      className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-white/80 hover:bg-white/95 text-black p-2 rounded-full shadow-sm z-20"
      aria-label="Previous slide"
    >
      ‹
    </button>

    <button
      onClick={(e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
      }}
      className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-white/80 hover:bg-white/95 text-black p-2 rounded-full shadow-sm z-20"
      aria-label="Next slide"
    >
      ›
    </button>
  </div>
)}


          {/* Breaking News Ticker */}
          <div className="breaking-ticker">
            <div className="breaking-ticker-content">
              {breakingNews.slice(0, 5).map((article, index) => (
                <span key={article.id} className="breaking-ticker-item">
                  {article.title}
                  {index < 4 && <span className="breaking-ticker-separator">•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Stories */}
      <section>
        <div className="bbc-section-header">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="bbc-section-title flex items-center">
              <Globe2 className="w-6 h-6 mr-3" />
              {translations.featuredStories}
            </h2>
          </div>
        </div>
        
        {featuredArticles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <FeaturedArticle 
                article={featuredArticles[0]}
                onClick={() => onArticleClick(featuredArticles[0])}
                size="large"
              />
            </div>
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
        )}
      </section>

      {/* News Sections Grid */}
      <div className="bbc-grid bbc-grid-main gap-8">
        {/* India News */}
        <section className="bbc-card overflow-hidden">
          <div className="border-b border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold bbc-heading">{translations.india}</h3>
              <Link 
                to="/category/india"
                className="bbc-button-primary px-4 py-2 text-white font-medium text-sm"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {indiaNews.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => onArticleClick(article)}
                compact={true}
              />
            ))}
          </div>
        </section>

        {/* World News */}
        <section className="bbc-card overflow-hidden">
          <div className="border-b border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold bbc-heading">{translations.world}</h3>
              <Link 
                to="/category/world"
                className="bbc-button-primary px-4 py-2 text-white font-medium text-sm"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {worldNews.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => onArticleClick(article)}
                compact={true}
              />
            ))}
          </div>
        </section>

        {/* Business News */}
        <section className="bbc-card overflow-hidden">
          <div className="border-b border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold bbc-heading">{translations.business}</h3>
              <Link 
                to="/category/business"
                className="bbc-button-primary px-4 py-2 text-white font-medium text-sm"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {businessNews.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => onArticleClick(article)}
                compact={true}
              />
            ))}
          </div>
        </section>

        {/* Sports News */}
        <section className="bbc-card overflow-hidden">
          <div className="border-b border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold bbc-heading">{translations.sports}</h3>
              <Link 
                to="/category/sports"
                className="bbc-button-primary px-4 py-2 text-white font-medium text-sm"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {sportsNews.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => onArticleClick(article)}
                compact={true}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Stats Footer */}
      <div className="bbc-card p-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50">
        <div className="text-center">
          <div className="text-3xl font-bold bbc-heading bbc-accent">{displayArticles.length}</div>
          <div className="bbc-text text-sm">Total Articles</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold bbc-heading bbc-accent">8</div>
          <div className="bbc-text text-sm">Categories</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold bbc-heading bbc-accent">10</div>
          <div className="bbc-text text-sm">Languages</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold bbc-heading bbc-accent">
            <span className="bbc-live">LIVE</span>
          </div>
          <div className="bbc-text text-sm">Real-time Updates</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;