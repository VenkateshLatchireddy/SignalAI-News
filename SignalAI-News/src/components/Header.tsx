import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Clock, Radio, Zap, Users, Tv, User, LogOut, MessageSquare, Crown, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNews } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import MyNewsModal from './MyNewsModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMyNewsModal, setShowMyNewsModal] = useState(false);
  const [hasMyNewsPreferences, setHasMyNewsPreferences] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const { currentLanguage, setLanguage, languages, translations } = useLanguage();
  const { lastUpdated, articles, refreshNews } = useNews();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    { name: 'Home', path: '/', key: 'home' },
    { name: 'India', path: '/category/india', key: 'india' },
    { name: 'World', path: '/category/world', key: 'world' },
    { name: 'Business', path: '/category/business', key: 'business' },
    { name: 'Technology', path: '/category/technology', key: 'technology' },
    { name: 'Sports', path: '/category/sports', key: 'sports' },
    { name: 'Entertainment', path: '/category/entertainment', key: 'entertainment' },
    { name: 'Health', path: '/category/health', key: 'health' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/news/search?q=${encodeURIComponent(searchQuery)}&lang=${currentLanguage}&t=${Date.now()}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

    if (diff < 60) return `Updated ${diff}s ago`;
    if (diff < 120) return `Updated 1m ago`;
    if (diff < 3600) return `Updated ${Math.floor(diff / 60)}m ago`;
    return `Updated ${Math.floor(diff / 3600)}h ago`;
  };

  const isActivePath = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/social' && location.pathname === '/social') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      const saved = localStorage.getItem(`myNewsCategories_${user.id}`);
      const hasSeenModal = localStorage.getItem(`myNewsModalSeen_${user.id}`);

      if (saved) {
        setHasMyNewsPreferences(true);
      } else {
        setHasMyNewsPreferences(false);
        if (!hasSeenModal) {
          setIsFirstTimeUser(true);
          setTimeout(() => {
            setShowMyNewsModal(true);
          }, 1000);
        }
      }
    } else {
      setHasMyNewsPreferences(false);
    }
  }, [user, isAuthenticated]);

  const handleMyNewsSave = (categories: string[]) => {
    if (user) {
      localStorage.setItem(`myNewsCategories_${user.id}`, JSON.stringify(categories));
      localStorage.setItem(`myNewsModalSeen_${user.id}`, 'true');
      setHasMyNewsPreferences(true);
      setIsFirstTimeUser(false);
      navigate('/my-news');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bbc-header z-40">
        {/* Top News Bar */}
        <div className="bbc-breaking text-white py-1.5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between gap-3 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="bbc-live inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>LIVE</span>
                </div>

                <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{formatLastUpdated()}</span>
                </div>

                <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-[11px]">
                  <Users className="w-3 h-3" />
                  <span>{articles.length}+ Articles</span>
                </div>
              </div>

              {isAuthenticated && user && (
                <div className="hidden md:inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-xs">
                  <User className="w-3 h-3" />
                  <span>{user.SignalAIPoints} pts</span>
                </div>
              )}

              {/* Right side: Refresh, Language, Premium */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => refreshNews()}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                  title="Refresh news"
                >
                  <Zap className="w-3 h-3" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <select
                  value={currentLanguage}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="inline-flex items-center px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors text-white cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.35rem center',
                    backgroundSize: '1.25em 1.25em',
                    paddingRight: '1.75rem'
                  }}
                >
                  {languages && languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-gray-800 text-white">
                      {lang.nativeName || lang.code.toUpperCase()}
                    </option>
                  ))}
                </select>

                <Link
                  to="/subscription"
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-600 hover:bg-orange-700 rounded text-xs font-medium transition-colors text-white"
                  title="Go Premium"
                >
                  <Crown className="w-3 h-3" />
                  <span className="hidden sm:inline font-bold">Premium</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation - compact & fits viewport (no horizontal slider) */}
        <div className="bbc-nav bg-white w-full border-b">
          <div className="w-full px-6">
            <div className="flex items-center justify-between h-14">
              {/* Left: Logo */}
              <div className="flex items-center flex-shrink-0 mr-4">
                <Link to="/" className="flex items-center space-x-2 group">
                  <div className="relative">
                    <div className="bg-red-600 p-2 rounded">
                      <Tv className="w-6 h-6 text-white group-hover:text-red-200 transition-colors" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-red-600 animate-pulse rounded-full"></div>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold bbc-heading text-black group-hover:text-red-600 transition-colors leading-4">
                      SignalAI
                    </h1>
                    <p className="text-[10px] bbc-text font-medium -mt-0.5 uppercase tracking-wider bbc-accent">NEWS</p>
                  </div>
                </Link>
              </div>

              {/* Center nav: keep single line, reduce gaps and padding so it fits */}
              <nav className="hidden lg:flex flex-1 justify-center items-center gap-1 px-2 flex-nowrap">
                {categories.slice(0, 1).map(category => (
                  <Link
                    key={category.key}
                    to={category.path}
                    className={`bbc-nav-item px-2.5 py-1 text-xs font-medium transition-all duration-150 whitespace-nowrap ${isActivePath(category.path) ? 'active' : ''}`}
                  >
                    {translations[category.key] || category.name}
                  </Link>
                ))}

                {hasMyNewsPreferences && isAuthenticated && (
                  <Link
                    to="/my-news"
                    className={`bbc-nav-item px-2.5 py-1 text-xs font-medium transition-all duration-150 flex items-center space-x-1 whitespace-nowrap ${location.pathname === '/my-news' ? 'active' : ''}`}
                  >
                    <span>My News</span>
                  </Link>
                )}

                {isAuthenticated && (
                  <Link to="/my-posts" className={`bbc-nav-item px-2.5 py-1 text-xs font-medium transition-all duration-150 flex items-center space-x-1 whitespace-nowrap ${location.pathname === '/my-posts' ? 'active' : ''}`}>
                    My Posts
                  </Link>
                )}


                {categories.slice(1).map(category => (
                  <Link
                    key={category.key}
                    to={category.path}
                    className={`bbc-nav-item px-2.5 py-1 text-xs font-medium transition-all duration-150 whitespace-nowrap ${isActivePath(category.path) ? 'active' : ''}`}
                  >
                    {translations[category.key] || category.name}
                  </Link>
                ))}
              </nav>

              {/* Right: controls (search compact, Profile button, mobile menu) */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Search: small so it won't push nav */}
                <form onSubmit={handleSearch} className="hidden md:flex items-center">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={translations.searchPlaceholder}
                      className="bbc-search pl-8 pr-3 py-1.5 w-36 max-w-[9rem] min-w-0 transition-all truncate bg-gray-50 border border-gray-200 rounded text-xs"
                      aria-label="Search news"
                    />
                  </div>
                </form>

                {/* Profile button (replaces avatar) */}
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="bbc-nav-item px-2.5 py-1 text-xs font-medium transition-all duration-150 rounded bg-red-600 text-white hover:bg-gray-100 hover:text-red-600"
                      aria-label="Open profile menu"
                    >
                      Profile
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-50 text-sm">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
                          <p className="text-xs text-gray-600">@{user.username}</p>
                          <p className="text-[11px] text-red-600 mt-1">{user.SignalAIPoints} SignalAI Points</p>
                        </div>

                        <Link
                          to="/dashboard"
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>

                        <button
                          onClick={() => { setShowUserMenu(false); navigate('/social'); }}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Social Feed
                        </button>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bbc-button-primary text-white px-3 py-1.5 font-medium text-xs"
                  >
                    Sign In
                  </button>
                )}

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 text-black transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden bbc-nav border-t border-gray-200 shadow-sm">
              <div className="px-3 py-3">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={translations.searchPlaceholder}
                      className="bbc-search w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm"
                    />
                  </div>
                </form>

                {/* Mobile Navigation */}
                <nav className="space-y-1">
                  {categories.map(category => (
                    <Link
                      key={category.key}
                      to={category.path}
                      className={`bbc-nav-item block px-3 py-2 text-sm font-medium transition-colors ${isActivePath(category.path) ? 'active' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translations[category.key] || category.name}
                    </Link>
                  ))}

                  {hasMyNewsPreferences && isAuthenticated && (
                    <Link
                      to="/my-news"
                      className="bbc-nav-item block px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Star className="w-4 h-4" />
                      <span>My News</span>
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <MyNewsModal
        isOpen={showMyNewsModal}
        onClose={() => {
          setShowMyNewsModal(false);
          if (isFirstTimeUser && user) {
            localStorage.setItem(`myNewsModalSeen_${user.id}`, 'true');
          }
        }}
        onSave={handleMyNewsSave}
        initialCategories={[]}
        isFirstTime={isFirstTimeUser}
      />
    </>
  );
};

export default Header;
