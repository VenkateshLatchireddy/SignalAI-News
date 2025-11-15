// src/components/AddNewsModal.tsx
import React, { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CATEGORY = 'breaking';
const CATEGORIES = [
  'breaking',
  'politics',
  'india',
  'world',
  'business',
  'technology',
  'sports',
  'entertainment',
  'health'
];

type FormState = {
  category: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  videoUrl: string;
  source: string;
  tags: string;
  status: 'draft' | 'published';
};

const AddNewsModal: React.FC = () => {
  const { addNewsArticle } = useNews();
  const { user } = useAuth();

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // form state
  const [formData, setFormData] = useState<FormState>({
    category: DEFAULT_CATEGORY,
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    source: '',
    tags: '',
    status: 'published'
  });

  // reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false);
      setErrors({});
      setFormData({
        category: DEFAULT_CATEGORY,
        title: '',
        summary: '',
        content: '',
        imageUrl: '',
        videoUrl: '',
        source: '',
        tags: '',
        status: 'published'
      });
      setIsSaving(false);
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.title.trim().length < 10) newErrors.title = 'Title must be at least 10 characters';
    if (formData.summary.trim().length < 20) newErrors.summary = 'Summary must be at least 20 characters';
    if (formData.content.trim().length < 50) newErrors.content = 'Content must be at least 50 characters';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'Image URL or upload is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(f => ({ ...f, imageUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (isSaving) return; // guard double-click
    if (!validate()) return;

    if (!user) {
      setErrors(prev => ({ ...prev, global: 'You must be signed in to publish.' }));
      return;
    }

    setIsSaving(true);
    setErrors({});

    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      content: formData.content,
      imageUrl: formData.imageUrl.trim(),
      videoUrl: formData.videoUrl.trim() || undefined,
      author: (user as any).fullName || (user as any).name || (user as any).username || 'User',
      authorId: (user as any).id || (user as any)._id,
      category: formData.category,
      source: formData.source.trim() || 'User Post',
      tags: tagsArray,
      status: formData.status
    };

    try {
      await addNewsArticle(payload as any);
      setShowSuccess(true);
      // show confirmation briefly then close
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 900);
    } catch (err) {
      console.error('Publish failed', err);
      setErrors(prev => ({ ...prev, global: 'Failed to publish. Please try again.' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Floating Add News Button */}
      <div className="fixed right-4 bottom-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Add News"
          title="Add News"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-semibold">Add News</span>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Publish News</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition" aria-label="Close">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {showSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                News published successfully!
              </div>
            )}

            {errors.global && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                {errors.global}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="Enter article title (min 10 characters)"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
                <textarea
                  placeholder="Enter article summary (min 20 characters)"
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.summary ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.summary && <p className="text-red-600 text-sm mt-1">{errors.summary}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Content *</label>
                <textarea
                  placeholder="Enter full article content (min 50 characters)"
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL or Upload *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.imageUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <label className="inline-flex items-center px-3 py-2 border rounded-lg bg-gray-50 cursor-pointer">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileUpload(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="preview" className="mt-2 max-h-40 rounded object-cover" />
                )}
                {errors.imageUrl && <p className="text-red-600 text-sm mt-1">{errors.imageUrl}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/video.mp4 or YouTube link"
                  value={formData.videoUrl}
                  onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source (Optional)</label>
                <input
                  type="text"
                  placeholder="Source of the news"
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma-separated, Optional)</label>
                <input
                  type="text"
                  placeholder="tag1, tag2, tag3"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="published">Publish</option>
                  <option value="draft">Save as Draft</option>
                </select>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                TODO: Future integration for AI-powered fake news detection
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 px-4 py-2 rounded ${isSaving ? 'opacity-60 cursor-not-allowed' : 'bg-red-600 text-white'}`}
              >
                {isSaving
                  ? (formData.status === 'draft' ? 'Saving draft...' : 'Publishing...')
                  : (formData.status === 'draft' ? 'Save as Draft' : 'Publish News')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddNewsModal;
