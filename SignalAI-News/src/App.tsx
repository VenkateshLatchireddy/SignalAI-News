import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MyNewsPage from './pages/MyNewsPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import SocialPage from './pages/SocialPage';
import UserDashboard from './components/UserDashboard';
import FullArticle from './components/FullArticle';
import Chatbot from './components/Chatbot';
import VoiceReader from './components/VoiceReader';
import AddNewsModal from './components/AddNewsModal';
import { NewsProvider } from './context/NewsContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import MyPosts from './pages/MyPosts';

function App() {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showFullArticle, setShowFullArticle] = useState(false);

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <LanguageProvider> {/* Moved LanguageProvider above NewsProvider */}
          <NewsProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Header />

                <main className="pt-20">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <HomePage
                          onArticleClick={(article: any) => {
                            setSelectedArticle(article);
                            setShowFullArticle(true);
                          }}
                        />
                      }
                    />
                    <Route
                      path="/my-news"
                      element={
                        <MyNewsPage
                          onArticleClick={(article: any) => {
                            setSelectedArticle(article);
                            setShowFullArticle(true);
                          }}
                        />
                      }
                    />
                    <Route path="/social" element={<SocialPage />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route
                      path="/category/:categoryName"
                      element={
                        <CategoryPage
                          onArticleClick={(article: any) => {
                            setSelectedArticle(article);
                            setShowFullArticle(true);
                          }}
                        />
                      }
                    />
                    <Route
                      path="/news/:type"
                      element={
                        <SearchPage
                          onArticleClick={(article: any) => {
                            setSelectedArticle(article);
                            setShowFullArticle(true);
                          }}
                        />
                      }
                    />
                    <Route path="/subscription" element={<SubscriptionPage />} />
                    <Route path="/subscription/success" element={<SubscriptionSuccess />} />
                    <Route path="/my-posts" element={<MyPosts />} />
                  </Routes>
                </main>

                <Footer />

                {showFullArticle && selectedArticle && (
                  <FullArticle
                    article={selectedArticle}
                    onClose={() => setShowFullArticle(false)}
                  />
                )}

                <VoiceReader />
                <Chatbot />
                <AddNewsModal />
              </div>
            </Router>
          </NewsProvider>
        </LanguageProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;