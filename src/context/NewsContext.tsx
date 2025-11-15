import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { generateArticlesByCategory } from '../utils/newsGenerator';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext'; // <-- ensures we can set authorId on new user posts

// Article shape extended a bit to support UI features and user-created posts
export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  author: string;         // human-readable author name (generated articles supply this)
  authorId?: string;      // optional — present for user-created posts
  publishedAt: string;    // ISO string
  createdAt?: string;
  updatedAt?: string;
  category: string;
  source: string;
  readTime?: number;
  tags: string[];
  isPremium?: boolean;
  language: string;
  localizedContent?: Record<string, { title: string; summary: string; content: string }>;
  culturalContext?: string;
  regionalRelevance?: string[];
  status?: 'published' | 'draft'; // added for draft/publish support (default published for generated)
  views?: number;
}

interface NewsContextType {
  articles: Article[];
  lastUpdated: Date | null;
  isLoading: boolean;
  refreshNews: (language?: string) => Promise<void>;
  refreshPersonalizedNews: () => Promise<void>;
  getArticlesByCategory: (category: string) => Article[];
  searchArticles: (query: string) => Article[];
  getLocalizedArticles: (language: string) => Article[];
  translateArticle: (article: Article, targetLanguage: string) => Article;
  addNewsArticle: (newArticle: Partial<Article> & { status?: 'draft'|'published' }) => Promise<Article>;
  editNewsArticle: (id: string, updates: Partial<Article>) => Promise<Article>;
  deleteNewsArticle: (id: string) => Promise<void>;
  fetchByAuthor: (authorId: string) => Promise<Article[]>;
  fetchMyArticles: () => Promise<Article[]>;
  getArticle: (id: string) => Promise<Article | undefined>;
  list: (opts?: {
    category?: string;
    language?: string;
    sort?: string;
    status?: string;
    q?: string;
    authorId?: string;
    limit?: number;
    page?: number;
  }) => Promise<{ data: Article[]; total: number }>;
  personalizedArticles: Article[];
  getLatest: (limit?: number) => Article[];
  getTrending: (limit?: number) => Article[];
  refresh: () => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

// Local-storage key for user-created posts (frontend-only persistence)
const USER_POSTS_KEY = 'SignalAI_user_posts_v1';

function uid(prefix = 'a') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadUserPosts(): Article[] {
  try {
    const raw = localStorage.getItem(USER_POSTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Article[];
    return arr;
  } catch (e) {
    console.error('loadUserPosts error', e);
    return [];
  }
}

function saveUserPosts(items: Article[]) {
  try {
    localStorage.setItem(USER_POSTS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('saveUserPosts error', e);
  }
}

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [localizedArticles] = useState<Record<string, Article[]>>({});
  const [personalizedArticles, setPersonalizedArticles] = useState<Article[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  // small helper to consistently notify listeners when articles/userPosts change
  const notifyUpdate = () => {
    const now = new Date();
    setLastUpdated(now);
    // small console trace to help debug refresh problems during development
    console.debug('[NewsContext] notifyUpdate ->', now.toISOString());
    return now;
  };

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();

  const categories = ['breaking', 'politics', 'india', 'world', 'business', 'technology', 'sports', 'entertainment', 'health'];
  // supportedLanguages intentionally omitted (not used currently)

  // user-created posts are persisted separately
  const [userPosts, setUserPosts] = useState<Article[]>(() => loadUserPosts());

  // Merge generated articles + userPosts (userPosts appear on top chronologically)
  const mergeArticles = (generated: Article[], users: Article[]) => {
    // unique by id
    const map = new Map<string, Article>();
    // user posts first (so they show up immediately)
    for (const u of users) map.set(u.id, u);
    // then add generated articles if not already present
    for (const g of generated) {
      if (!map.has(g.id)) map.set(g.id, g);
    }
    // return array sorted by publishedAt/createdAt descending
    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const ta = Date.parse(a.publishedAt || a.createdAt || '') || 0;
      const tb = Date.parse(b.publishedAt || b.createdAt || '') || 0;
      return tb - ta;
    });
    return arr;
  };
// --- replace refreshNews in NewsContext.tsx with this ---
const refreshNews = async (_language: string = 'en') => {
  setIsLoading(true);

  // small immediate seed so UI shows articles quickly
  const fastCount = 8;        // number per category for immediate UI
  const backgroundCount = 92; // remaining per category to generate in background (so total ~=100)

  try {
    const immediateArticles: Article[] = [];
    const backgroundBuckets: Record<string, Article[]> = {};

    // synchronous fast generation (quick)
    for (const category of categories) {
      const fast = generateArticlesByCategory(category, fastCount, 'en').map(a => normalizeGeneratedArticle(a));
      immediateArticles.push(...fast);

      // prepare slot for background generation
      backgroundBuckets[category] = [];
    }

  // merge with user posts (user posts should still appear on top)
  const publishedUserPostsNow = userPosts.filter(p => p.status === 'published');
  const mergedNow = mergeArticles(immediateArticles, publishedUserPostsNow);
    setArticles(mergedNow);
    setLastUpdated(new Date());
    setIsLoading(false); // UI can render now

    // schedule background generation without blocking UI
    const doBackgroundWork = () => {
      console.info('Starting background article generation...');
      try {
        const bgAll: Article[] = [];
        for (const category of categories) {
          // generate the rest for each category
          const bg = generateArticlesByCategory(category, backgroundCount, 'en').map(a => normalizeGeneratedArticle(a));
          backgroundBuckets[category] = bg;
          bgAll.push(...bg);
        }
        // merge the background articles with current articles and user posts
        setArticles(prev => {
          // prev might already include user posts; ensure we don't duplicate user posts
          const generatedOnlyNow = [...prev].filter(p => !p.id.startsWith('u'));
          const publishedUserPostsBg = userPosts.filter(p => p.status === 'published');
          return mergeArticles([...generatedOnlyNow, ...bgAll], publishedUserPostsBg);
        });
        setLastUpdated(new Date());
        console.info('Background generation complete: added', bgAll.length, 'articles');
      } catch (bgErr) {
        console.error('Background generation failed', bgErr);
      }
    };

    // use requestIdleCallback in modern browsers so this runs when the main thread is idle
    if ((window as any).requestIdleCallback) {
      (window as any).requestIdleCallback(() => doBackgroundWork(), { timeout: 2000 });
    } else {
      // fallback - run after a small delay to let UI settle
      setTimeout(doBackgroundWork, 800);
    }
  } catch (error) {
    console.error('Error in refreshNews (fast startup):', error);
    setIsLoading(false);
  }
};


  const refreshPersonalizedNews = async () => {
    try {
      const personalizedContent: Article[] = [];
      const trendingCategories = ['breaking', 'politics', 'technology', 'business'];
      for (const category of trendingCategories) {
        const categoryArticles = generateArticlesByCategory(category, 25, 'en').map(a => normalizeGeneratedArticle(a));
        personalizedContent.push(...categoryArticles);
      }
      personalizedContent.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setPersonalizedArticles(personalizedContent.slice(0, 50));
      console.log('Personalized news refreshed: 50 articles');
    } catch (error) {
      console.error('Error refreshing personalized news:', error);
    }
  };

  // Normalizes generated articles to include required fields & types
  function normalizeGeneratedArticle(a: any): Article {
    return {
      id: a.id || uid('g'),
      title: a.title || a.headline || 'Untitled',
      summary: a.summary || a.excerpt || '',
      content: a.content || '',
      imageUrl: a.imageUrl || a.image || '',
      author: a.author || 'Agency',
      publishedAt: (a.publishedAt ? new Date(a.publishedAt).toISOString() : new Date().toISOString()),
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
      category: a.category || 'breaking',
      source: a.source || 'Wire',
      readTime: a.readTime || Math.max(1, Math.round((a.content || '').split(/\s+/).length / 200)),
      tags: a.tags || [],
      isPremium: !!a.isPremium,
      language: a.language || 'en',
      localizedContent: a.localizedContent,
      culturalContext: a.culturalContext,
      regionalRelevance: a.regionalRelevance || [],
      status: 'published',
      views: a.views || Math.floor(Math.random() * 1000)
    };
  }

  // Called once at mount (and periodically by intervals)
  useEffect(() => {
    // load user posts from storage
    const saved = loadUserPosts();
    setUserPosts(saved);

    // initial generation + merge
    (async () => {
      await refreshNews(currentLanguage || 'en');
      await refreshPersonalizedNews();
    })();

    const newsInterval = setInterval(() => refreshNews(currentLanguage || 'en'), 120000);
    const personalizedInterval = setInterval(() => refreshPersonalizedNews(), 600000);
    return () => {
      clearInterval(newsInterval);
      clearInterval(personalizedInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep articles merged if userPosts changes
  useEffect(() => {
    // regenerate merge quickly without regenerating all categories
    // find generated-only items from current 'articles' by filtering out userPosts ids
    const generatedOnly = articles.filter(a => !userPosts.some(u => u.id === a.id));
    // Only merge user posts that are published into the public articles list.
    const publishedUserPosts = userPosts.filter(p => p.status === 'published');
    const merged = mergeArticles(generatedOnly, publishedUserPosts);
    setArticles(merged);
    saveUserPosts(userPosts);
    setLastUpdated(new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPosts]);

  // PUBLIC API IMPLEMENTATIONS

// Replace addNewsArticle and editNewsArticle in your NewsContext with the following

// --- addNewsArticle ---
// --- addNewsArticle (REPLACE existing) ---
const addNewsArticle = async (newArticle: Partial<Article> & { status?: 'draft'|'published' }) => {
  const now = new Date().toISOString();
  const generatedId = newArticle.id || `u_${Math.random().toString(36).slice(2, 9)}`;

  const post: Article = {
    id: generatedId,
    title: (newArticle.title || 'Untitled').trim(),
    summary: newArticle.summary || '',
    content: newArticle.content || '',
    imageUrl: newArticle.imageUrl || '',
  author: newArticle.author || (user ? ((user as any).fullName || (user as any).username) : 'User'),
    authorId: newArticle.authorId || (user ? (user.id || (user as any)._id) : undefined),
    createdAt: now,
    updatedAt: now,
  publishedAt: newArticle.status === 'published' ? now : (newArticle.publishedAt || now),
    category: newArticle.category || 'breaking',
    source: newArticle.source || 'User Post',
    readTime: newArticle.readTime || Math.max(1, Math.round(((newArticle.content || '').split(/\s+/).length) / 200)),
    tags: newArticle.tags || [],
    isPremium: !!newArticle.isPremium,
    language: newArticle.language || currentLanguage || 'en',
    localizedContent: newArticle.localizedContent,
    culturalContext: newArticle.culturalContext,
    regionalRelevance: newArticle.regionalRelevance,
    status: newArticle.status || 'published',
    views: 0
  };

  // If already present in userPosts, route to edit to avoid duplicates
  const existsById = userPosts.find(p => p.id === post.id);
  if (existsById) {
    try {
      const edited = await editNewsArticle(post.id, post);
      return edited;
    } catch (e) {
      return existsById;
    }
  }

  // Heuristic dedupe: same title + author within 2 minutes
  const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
  const existsQuick = userPosts.find(p =>
    p.title === post.title &&
    (p.author === post.author || p.authorId === post.authorId) &&
    new Date(p.createdAt || 0).getTime() >= twoMinutesAgo
  );
  if (existsQuick) return existsQuick;

  // Persist user post
  setUserPosts(prev => {
    const next = [post, ...prev.filter(p => p.id !== post.id)];
    saveUserPosts(next);
    return next;
  });

  // Only merge published posts into the public articles list immediately.
  if (post.status === 'published') {
    setArticles(prev => {
      const filtered = prev.filter(a => a.id !== post.id);
      const merged = [post, ...filtered];
      // dedupe & sort
      const map = new Map<string, Article>();
      for (const a of merged) map.set(a.id, a);
      const arr = Array.from(map.values()).sort((a, b) => {
        const ta = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const tb = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return tb - ta;
      });
      return arr;
    });
  } else {
    // draft: do not expose in the public articles list
    // listeners may still want to know userPosts changed
    setTimeout(() => notifyUpdate(), 0);
  }

  // Defer notifyUpdate to next macrotask so listeners reliably see state change
  setTimeout(() => {
    notifyUpdate();
  }, 0);

  console.debug('[NewsContext] addNewsArticle ->', post.id, post.title);
  return post;
};


// --- editNewsArticle ---
// --- editNewsArticle (REPLACE existing) ---
const editNewsArticle = async (id: string, updates: Partial<Article>) => {
  if (!id) throw new Error('Invalid id');

  // We'll attempt to update userPosts first — if found, update and return.
  let updated: Article | undefined;

  // Update userPosts synchronously via setter
  setUserPosts(prev => {
    const found = prev.find(p => p.id === id);
    if (!found) return prev;
    const merged = { ...found, ...updates, updatedAt: new Date().toISOString() };
    if ((updates as any).status === 'published' && !merged.publishedAt) merged.publishedAt = new Date().toISOString();
    updated = merged;
    const next = prev.map(p => (p.id === id ? merged : p));
    saveUserPosts(next);
    return next;
  });

  // If we updated a userPost, make sure articles list reflects it
  if (updated) {
    if (updated.status === 'published') {
      // ensure published drafts move into articles (or update existing)
      setArticles(prev => {
        const filtered = prev.filter(a => a.id !== id);
        const merged = [updated, ...filtered];
        const map = new Map<string, Article>();
        (merged as Article[]).filter(Boolean).forEach(it => map.set(it.id, it));
        const arr = Array.from(map.values()).sort((a,b) => {
          const ta = Date.parse(a.publishedAt || a.createdAt || '') || 0;
          const tb = Date.parse(b.publishedAt || b.createdAt || '') || 0;
          return tb - ta;
        });
        return arr;
      });
    } else {
      // still a draft: ensure it is not present in the public articles
      setArticles(prev => prev.filter(a => a.id !== id));
    }

    setTimeout(() => notifyUpdate(), 0);
    console.debug('[NewsContext] editNewsArticle (userPost) ->', id);
    return updated;
  }

  // Not a user post — try updating in articles (generated content) and return updated copy
  setArticles(prev => {
    let foundUpdated: Article | undefined;
    const next = prev.map(a => {
      if (a.id !== id) return a;
      const merged = { ...a, ...updates, updatedAt: new Date().toISOString() };
      if ((updates as any).status === 'published' && !merged.publishedAt) merged.publishedAt = new Date().toISOString();
      foundUpdated = merged;
      return merged;
    });
    // if foundUpdated we want to keep reference out of setter
    if (foundUpdated) {
      updated = foundUpdated;
    }
    return next;
  });

  if (!updated) {
    // Not found anywhere — optionally insert as user post if it appears authored by current user
    // fallback: throw so callers know edit failed
    throw new Error('Article not found to edit');
  }

  // ensure merged list reflects updated item (dedupe/sort)
  setArticles(prev => {
    const next = prev.map(a => a.id === id ? { ...a, ...updated } : a);
    // dedupe & sort
    const map = new Map<string, Article>();
    for (const it of next) map.set(it.id, it);
    const arr = Array.from(map.values()).sort((a,b) => {
      const ta = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const tb = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return tb - ta;
    });
    return arr;
  });

  setTimeout(() => notifyUpdate(), 0);
  console.debug('[NewsContext] editNewsArticle ->', id);
  return updated!;
};



const deleteNewsArticle = async (id: string) => {
  if (!id) throw new Error('deleteNewsArticle: missing id');

  setUserPosts(prev => {
    const next = prev.filter(p => p.id !== id);
    saveUserPosts(next);
    return next;
  });

  setArticles(prev => prev.filter(a => a.id !== id));

  // ensure listeners are notified after state update
  setTimeout(() => notifyUpdate(), 0);

  console.debug('[NewsContext] deleteNewsArticle ->', id);
  return Promise.resolve();
};


const fetchByAuthor = async (authorId: string) => {
  if (!authorId) return [];

  // combine userPosts + generated articles that match the authorId
  const fromUser = userPosts.filter(p => p.authorId === authorId || p.author === authorId);
  const fromGenerated = articles.filter(a => a.authorId === authorId);

  // merge and sort by newest (prefer createdAt then publishedAt)
  const merged = [...fromUser, ...fromGenerated];

  merged.sort((a, b) => {
    const ta = Date.parse(a.createdAt || a.publishedAt || '') || 0;
    const tb = Date.parse(b.createdAt || b.publishedAt || '') || 0;
    return tb - ta;
  });

  return merged;
};


  const fetchMyArticles = async () => {
    if (!user) return [];
    return fetchByAuthor((user as any).id || (user as any)._id || '');
  };

  const getArticle = async (id: string) => {
    return articles.find(a => a.id === id);
  };

  const list = async (opts?: {
    category?: string;
    language?: string;
    sort?: string;
    status?: string;
    q?: string;
    authorId?: string;
    limit?: number;
    page?: number;
  }) => {
    let out = [...articles];

    if (opts?.authorId) {
      out = out.filter(a => (a.authorId === opts.authorId || a.author === opts.authorId));
    }
    if (opts?.status) {
      out = out.filter(a => a.status === opts.status);
    }
    if (opts?.category) {
      out = out.filter(a => a.category === opts.category);
    }
    if (opts?.language) {
      out = out.filter(a => a.language === opts.language);
    }
    if (opts?.q) {
      const q = opts.q.toLowerCase();
      out = out.filter(a => ((a.title + ' ' + a.summary + ' ' + a.content + ' ' + (a.tags || []).join(' ')).toLowerCase().includes(q)));
    }

    // simple sorting
    if (opts?.sort === '-publishedAt') {
      out.sort((x, y) => ((Date.parse(y.publishedAt || y.createdAt || '') || 0) - (Date.parse(x.publishedAt || x.createdAt || '') || 0)));
    } else if (opts?.sort === '-createdAt') {
      out.sort((x, y) => ((Date.parse(y.createdAt || y.publishedAt || '') || 0) - (Date.parse(x.createdAt || x.publishedAt || '') || 0)));
    } else if (opts?.sort === 'views') {
      out.sort((x, y) => (y.views || 0) - (x.views || 0));
    } else {
      out.sort((x, y) => ((Date.parse(y.publishedAt || y.createdAt || '') || 0) - (Date.parse(x.publishedAt || x.createdAt || '') || 0)));
    }

    // pagination
    const page = Math.max(1, opts?.page || 1);
    const limit = Math.max(1, opts?.limit || 100);
    const start = (page - 1) * limit;
    const data = out.slice(start, start + limit);
    return { data, total: out.length };
  };

  const getLocalizedArticles = (language: string) => {
    if (language === 'en') {
      return articles;
    }
    return localizedArticles[language] || articles;
  };

  const translateArticle = (article: Article, targetLanguage: string) => {
    if (targetLanguage === 'en') return article;
    const localizedVersions = localizedArticles[targetLanguage] || [];
    const matchingArticle = localizedVersions.find(a =>
      a.category === article.category &&
      Math.abs((Date.parse(a.publishedAt || '') || 0) - (Date.parse(article.publishedAt || '') || 0)) < 3600000
    );
    return matchingArticle || article;
  };

  const searchArticles = (query: string) => {
    const searchTerm = (query || '').toLowerCase();
    const results = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm) ||
      (article.tags || []).some(tag => tag.toLowerCase().includes(searchTerm)) ||
      article.author.toLowerCase().includes(searchTerm) ||
      article.source.toLowerCase().includes(searchTerm)
    );
    return results.slice(0, 50);
  };

  // ...existing code...
  const getTrending = (limit = 5) => {
    // simple trending: sort by views + recency bonus
    const scored = articles.map(a => {
      const timeFactor = ((Date.parse(a.publishedAt || a.createdAt || '') || 0) / (1000 * 60 * 60 * 24)); // days
      const score = (a.views || 0) + (1000 / (1 + timeFactor));
      return { a, score };
    });
    scored.sort((x, y) => y.score - x.score);
    return scored.slice(0, limit).map(s => s.a);
  };

  const refresh = () => {
    // small helper to re-run merge without regenerating everything
    const publishedUserPosts = userPosts.filter(p => p.status === 'published');
    setArticles(prev => mergeArticles(prev.filter(p => !p.id.startsWith('u')), publishedUserPosts));
    setLastUpdated(new Date());
  };

  // Ensure getArticlesByCategory is defined
  const getLatest = (limit = 10) => {
    return articles.filter(a => a.status === 'published').slice(0, limit);
  };
  const getArticlesByCategory = (category: string) => {
    if (!category || category === 'home' || category === 'breaking') {
      const breakingArticles = articles.filter(a => a.category === 'breaking').slice(0, 10);
      const otherArticles = articles.filter(a => a.category !== 'breaking').slice(0, 25);
      return [...breakingArticles, ...otherArticles];
    }
    return articles.filter(a => a.category.toLowerCase() === category.toLowerCase()).slice(0, 100);
  };

  const value = useMemo<NewsContextType>(() => ({
    articles,
    lastUpdated,
    isLoading,
    refreshNews,
    refreshPersonalizedNews,
    getArticlesByCategory,
    searchArticles,
    getLocalizedArticles,
    translateArticle,
    addNewsArticle,
    editNewsArticle,
    deleteNewsArticle,
    fetchByAuthor,
    fetchMyArticles,
    getArticle,
    list,
    personalizedArticles,
    getLatest,
    getTrending,
    refresh
  }), [articles, lastUpdated, isLoading, personalizedArticles, userPosts]);

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
}

export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
