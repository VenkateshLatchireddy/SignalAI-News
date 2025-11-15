// src/components/ArticleModal.tsx
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';

// optional rich editor; require safely (won't break if not installed)
declare const require: any;
let ReactQuill: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ReactQuill = require('react-quill');
} catch (_) {
  ReactQuill = null;
}

const CATEGORIES = ['breaking','politics','india','world','business','technology','sports','entertainment','health'];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initial?: Partial<any>;
};

export default function ArticleModal({ isOpen, onClose, initial }: Props) {
  const news = useNews();
  const { user } = useAuth();

  // support multiple naming conventions from NewsContext
  const createFn = (news as any).addNewsArticle || (news as any).createArticle || (() => Promise.reject(new Error('create not implemented')));
  const editFn = (news as any).editNewsArticle || (news as any).editArticle || (() => Promise.reject(new Error('edit not implemented')));

  const isEdit = Boolean(initial && (initial.id || initial._id));

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const makeInitialForm = (src?: Partial<any>) => ({
    id: src?.id || src?._id || '',
    category: src?.category || 'breaking',
    title: src?.title || '',
    summary: src?.summary || '',
    content: src?.content || '',
    imageUrl: src?.imageUrl || '',
    videoUrl: src?.videoUrl || '',
    tags: Array.isArray(src?.tags) ? (src?.tags || []).join(', ') : (src?.tags || '') ,
    status: (src?.status as ('draft'|'published')) || 'published',
  });

  const [form, setForm] = useState(makeInitialForm(initial));

  useEffect(() => {
    if (isOpen) {
      setForm(makeInitialForm(initial));
      setErrors({});
      setShowSuccess(false);
      setSaving(false);
    } else {
      // when closing, clear saving state and errors
      setSaving(false);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initial]);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.title || form.title.trim().length < 10) e.title = 'Title must be at least 10 characters';
    if (!form.summary || form.summary.trim().length < 20) e.summary = 'Summary must be at least 20 characters';
    // If using rich text, you might strip HTML tags for a length check; here we validate raw length.
    if (!form.content || form.content.trim().length < 50) e.content = 'Content must be at least 50 characters';
    if (!form.imageUrl || !String(form.imageUrl).trim()) e.imageUrl = 'Image required (URL or upload)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, imageUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (saving) return;
    if (!validate()) return;

    if (!user) {
      setErrors(prev => ({ ...prev, global: 'Sign in required' }));
      return;
    }

    setSaving(true);
    setErrors({});

    const tagsArray = (typeof form.tags === 'string')
      ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
      : form.tags || [];

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      content: form.content,
      imageUrl: form.imageUrl,
      videoUrl: form.videoUrl || undefined,
      category: form.category,
      tags: tagsArray,
      status: form.status,
      authorId: (user as any).id || (user as any)._id,
      author: (user as any).fullName || (user as any).name || (user as any).username || 'User',
      language: (user as any).language || 'en'
    };

    try {
      if (isEdit && (form.id || initial?.id || initial?._id)) {
        const id = form.id || initial?.id || initial?._id;
        await editFn(id, payload);
      } else {
        await createFn(payload);
      }

      setShowSuccess(true);

      // Wait a short moment so the user sees success then close and let parent refresh
      setTimeout(() => {
        setShowSuccess(false);
        setSaving(false);
        // call onClose AFTER the context has updated (editFn/createFn awaited above)
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Save failed', err);
      const msg = (err && (err.message || (err.error && err.error.message))) || 'Save failed';
      setErrors(prev => ({ ...prev, global: msg }));
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold">{isEdit ? 'Edit Post' : 'Create Post'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X /></button>
        </div>

        {showSuccess && <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-green-700">Saved</div>}
        {errors.global && <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">{errors.global}</div>}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium">Category</label>
            <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border rounded">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Title *</label>
            <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className={`w-full px-3 py-2 border rounded ${errors.title ? 'border-red-500' : ''}`} />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-xs font-medium">Summary *</label>
            <textarea value={form.summary} onChange={(e) => setForm({...form, summary: e.target.value})} rows={2} className={`w-full px-3 py-2 border rounded ${errors.summary ? 'border-red-500' : ''}`} />
            {errors.summary && <p className="text-red-600 text-sm mt-1">{errors.summary}</p>}
          </div>

          <div>
            <label className="text-xs font-medium">Content *</label>
            {ReactQuill ? (
              // @ts-ignore
              <ReactQuill value={form.content} onChange={(val: string) => setForm({...form, content: val})} />
            ) : (
              <textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows={6} className={`w-full px-3 py-2 border rounded ${errors.content ? 'border-red-500' : ''}`} />
            )}
            {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content}</p>}
          </div>

          <div>
            <label className="text-xs font-medium">Image URL or upload *</label>
            <div className="flex gap-2">
              <input value={form.imageUrl} onChange={(e) => setForm({...form, imageUrl: e.target.value})} className="flex-1 px-3 py-2 border rounded" />
              <label className="inline-block px-3 py-2 border rounded cursor-pointer bg-gray-50">
                Upload
                <input type="file" accept="image/*" onChange={e => handleFileUpload(e.target.files?.[0])} className="hidden" />
              </label>
            </div>
            {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-2 max-h-36 rounded object-cover" />}
            {errors.imageUrl && <p className="text-red-600 text-sm mt-1">{errors.imageUrl}</p>}
          </div>

          <div>
            <label className="text-xs font-medium">Video URL (optional)</label>
            <input value={form.videoUrl} onChange={(e) => setForm({...form, videoUrl: e.target.value})} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="text-xs font-medium">Tags (comma separated)</label>
            <input value={form.tags as string} onChange={(e) => setForm({...form, tags: e.target.value})} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium">Status</label>
              <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value as any})} className="px-2 py-1 border rounded text-sm">
                <option value="published">Publish</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="text-xs text-gray-500">Author: {(user as any)?.fullName || (user as any)?.username || 'You'}</div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className={`flex-1 px-4 py-2 rounded ${saving ? 'opacity-60 cursor-not-allowed bg-gray-400' : 'bg-red-600 text-white'}`}>
            {saving
              ? (form.status === 'draft' ? 'Saving...' : 'Publishing...')
              : (isEdit
                  ? (form.status === 'draft' ? 'Save changes' : 'Publish News')
                  : (form.status === 'draft' ? 'Save as Draft' : 'Publish'))}
          </button>
        </div>
      </div>
    </div>
  );
}
