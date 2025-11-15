// src/pages/MyPosts.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNews } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';
import ArticleModal from '../components/ArticleModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Edit, Trash2 } from 'lucide-react';

const CATEGORIES = ['all','breaking','politics','india','world','business','technology','sports','entertainment','health'];

export default function MyPosts() {
  // use multiple helpers if available; NewsContext should provide fetchMyArticles, fetchByAuthor, deleteNewsArticle, lastUpdated
  const { fetchByAuthor, fetchMyArticles, deleteNewsArticle, lastUpdated } = useNews();
  const { user, isAuthenticated } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<'all'|'published'|'draft'>('all');
  const [editing, setEditing] = useState<any | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [toDelete, setToDelete] = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filterQ, setFilterQ] = useState('');

  // stable load function
  const load = useCallback(async () => {
    setLoading(true);
    let aborted = false;

    try {
      let arr: any[] = [];

      if (typeof fetchMyArticles === 'function') {
        const res: any = await fetchMyArticles();
        arr = Array.isArray(res) ? res : (res?.data ?? []);
      } else if (typeof fetchByAuthor === 'function') {
        const authorId = user?.id || (user as any)?._id;
        if (authorId) {
          arr = await fetchByAuthor(authorId);
        } else {
          arr = [];
        }
      } else {
        arr = [];
      }

      if (aborted) return;

      // dedupe by stable keys (id / _id / title+author)
      const deduped = (() => {
        const map = new Map<string, any>();
        (arr || []).forEach((a: any) => {
          const key =
            a.id ||
            a._id ||
            `${(a.title || '').trim().toLowerCase()}|${a.authorId || a.author || ''}`;
          if (!map.has(key)) map.set(key, a);
        });
        return Array.from(map.values());
      })();

      // sort newest first (use createdAt or publishedAt)
      deduped.sort((a, b) =>
        new Date(b.createdAt || b.publishedAt || 0).getTime() -
        new Date(a.createdAt || a.publishedAt || 0).getTime()
      );

      setItems(deduped);
    } catch (err) {
      console.error('Failed to load my articles', err);
      setItems([]);
    } finally {
      if (!aborted) setLoading(false);
    }

    // return abort handle (not used here but kept for symmetry)
    return () => { aborted = true; };
  }, [fetchByAuthor, fetchMyArticles, user]);

  // initial load when user/auth changes
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  // reload when the global news context signals an update
  useEffect(() => {
    if (!isAuthenticated) return;
    // Defensive: wait microtick so context state setters can flush (your notifyUpdate may already handle this)
    const t = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(t);
  }, [lastUpdated, isAuthenticated, load]);

  const grouped = useMemo(() => {
    return items.reduce((acc: Record<string, any[]>, a: any) => {
      const k = a.category || 'uncategorized';
      acc[k] ||= [];
      acc[k].push(a);
      return acc;
    }, {});
  }, [items]);

  const filtered = useMemo(() => {
    const list = activeCategory === 'all' ? items : grouped[activeCategory] || [];
    if (!filterQ.trim()) return list;
    const q = filterQ.toLowerCase();
    return list.filter((a:any) =>
      (a.title + ' ' + (a.summary || '') + ' ' + (a.tags || []).join(' '))
        .toLowerCase()
        .includes(q)
    );
  }, [activeCategory, items, grouped, filterQ]);

  // apply status filter after category/search filtering
  const statusFiltered = useMemo(() => {
    if (activeStatus === 'all') return filtered;
    if (activeStatus === 'draft') return filtered.filter(a => a.status === 'draft');
    // published includes items explicitly marked published or items without a status
    return filtered.filter(a => (a.status === 'published' || !a.status));
  }, [activeStatus, filtered]);

  const startEdit = (a: any) => { setEditing(a); setOpenModal(true); };
  const confirmDelete = (a: any) => { setToDelete(a); setConfirmOpen(true); };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      const id = toDelete.id || toDelete._id;
      if (!id) throw new Error('Invalid article id');

      if (typeof deleteNewsArticle === 'function') {
        await deleteNewsArticle(id);
      } else if (typeof (window as any).deleteArticle === 'function') {
        // last-resort backward compatibility
        await (window as any).deleteArticle(id);
      } else {
        console.warn('delete function not found in context');
      }

      // reload local list after deletion (immediate)
      await load();
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  if (!isAuthenticated) return <div className="p-6">Please sign in to view your posts.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">My Posts</h2>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search my posts..."
            value={filterQ}
            onChange={e => setFilterQ(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveStatus('all')}
              className={`px-3 py-1 rounded text-sm ${activeStatus === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setActiveStatus('published')}
              className={`px-3 py-1 rounded text-sm ${activeStatus === 'published' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
            >
              Published ({items.filter(i => i.status === 'published' || !i.status).length})
            </button>
            <button
              onClick={() => setActiveStatus('draft')}
              className={`px-3 py-1 rounded text-sm ${activeStatus === 'draft' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
            >
              Drafts ({items.filter(i => i.status === 'draft').length})
            </button>
          </div>
          <div className="text-sm text-gray-500">Showing: {activeStatus === 'all' ? 'All' : activeStatus === 'draft' ? 'Drafts' : 'Published'}</div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1 rounded text-sm ${activeCategory===c ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
              >
                {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)} {c !== 'all' && `(${(grouped[c]||[]).length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        {loading ? <div>Loading...</div> : (
          statusFiltered.length === 0 ? <div className="text-gray-500">No posts yet.</div> : (
            statusFiltered.map(a => (
              <article key={a.id || a._id} className="mb-4 p-4 border rounded flex gap-4">
                <img src={a.imageUrl} className="w-28 h-20 object-cover rounded" alt="" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">{a.title}</h3>
                      <p className="text-sm text-gray-600">{a.summary}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {a.category} • {new Date(a.createdAt || a.publishedAt || Date.now()).toLocaleString()} • {a.status || 'published'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => startEdit(a)} className="px-2 py-1 border rounded text-sm">
                        <Edit className="inline-block w-4 h-4 mr-1" />Edit
                      </button>
                      <button onClick={() => confirmDelete(a)} className="px-2 py-1 border rounded text-sm text-red-600">
                        <Trash2 className="inline-block w-4 h-4 mr-1" />Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )
        )}
      </div>

      <ArticleModal
        isOpen={openModal}
        onClose={async () => { setOpenModal(false); setEditing(null); await load(); }}
        initial={editing || undefined}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete post?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      >
        Are you sure you want to delete this post? This action cannot be undone.
      </ConfirmDialog>
    </div>
  );
}
