import React, { useState, useEffect } from 'react';
import { X, Check, Settings, Sparkles } from 'lucide-react';

interface MyNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categories: string[]) => void;
  initialCategories?: string[];
  isFirstTime?: boolean;
}

const MyNewsModal: React.FC<MyNewsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCategories = [],
  isFirstTime = false
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);

  const categories = [
    { id: 'india', name: 'India', icon: '🇮🇳', description: 'National news and updates' },
    { id: 'world', name: 'World', icon: '🌍', description: 'International affairs' },
    { id: 'business', name: 'Business', icon: '💼', description: 'Markets and economy' },
    { id: 'technology', name: 'Technology', icon: '💻', description: 'Tech news and innovation' },
    { id: 'sports', name: 'Sports', icon: '⚽', description: 'Sports updates and scores' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', description: 'Movies, music, and culture' },
    { id: 'health', name: 'Health', icon: '🏥', description: 'Health and wellness' },
    { id: 'breaking', name: 'Breaking News', icon: '🚨', description: 'Latest breaking stories' }
  ];

  useEffect(() => {
    setSelectedCategories(initialCategories);
  }, [initialCategories]);

  if (!isOpen) return null;

  const handleToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(cat => cat.id));
    }
  };

  const handleSave = () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category to continue');
      return;
    }
    onSave(selectedCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isFirstTime ? 'Welcome! Personalize Your News' : 'Edit Your Preferences'}
                </h2>
                <p className="text-red-100 text-sm mt-1">
                  {isFirstTime
                    ? 'Select categories to see news that matters to you'
                    : 'Update your news preferences anytime'}
                </p>
              </div>
            </div>
            {!isFirstTime && (
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isFirstTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900 text-sm">
                <strong>Tip:</strong> Select at least 3 categories for a personalized experience. You can always change these later!
              </p>
            </div>
          )}

          {/* Select All Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-900 font-medium">
                {selectedCategories.length} of {categories.length} categories selected
              </p>
              <p className="text-gray-500 text-sm">Choose what you want to see in My News</p>
            </div>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 border-2 border-gray-300 hover:border-red-600 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg font-medium text-sm transition-all"
            >
              {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(category => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => handleToggle(category.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-red-300 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{category.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        {isSelected && (
                          <div className="bg-red-600 text-white p-1 rounded-full">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedCategories.length === 0 && 'Please select at least one category'}
              {selectedCategories.length === 1 && 'Consider adding more categories for better coverage'}
              {selectedCategories.length >= 2 && selectedCategories.length < 4 && 'Good selection! You can add more if you like'}
              {selectedCategories.length >= 4 && 'Great! You have a well-rounded news feed'}
            </p>
            <div className="flex items-center space-x-3">
              {!isFirstTime && (
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={selectedCategories.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
              >
                {isFirstTime ? 'Get Started' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MyNewsModal;
