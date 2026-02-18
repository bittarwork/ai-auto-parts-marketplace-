import { useEffect, useRef } from 'react';
import { ClockIcon, MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

/**
 * Search Suggestions Dropdown
 * Shows autocomplete suggestions with highlighting
 */
export default function SearchSuggestions({ 
  suggestions = [],
  onSelect,
  onClose,
  highlightText = '',
  showRecent = false,
  recentSearches = []
}) {
  const containerRef = useRef(null);
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  // Highlight matching text
  const highlightMatch = (text, highlight) => {
    if (!highlight.trim()) {
      return text;
    }
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/40 text-gray-900 dark:text-white">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };
  
  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-lg shadow-soft-lg max-h-96 overflow-y-auto custom-scrollbar z-50 animate-slide-up"
    >
      {/* Recent Searches */}
      {showRecent && recentSearches.length > 0 && (
        <div className="p-3 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-2 mb-2">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Recent Searches
            </span>
          </div>
          <div className="space-y-1">
            {recentSearches.slice(0, 3).map((search, index) => (
              <button
                key={index}
                onClick={() => onSelect(search)}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-md transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-3">
          <div className="flex items-center space-x-2 mb-2">
            <SparklesIcon className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              AI Suggestions
            </span>
          </div>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSelect(suggestion)}
                className="w-full text-left px-3 py-2.5 text-sm text-gray-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors flex items-center space-x-2 group"
              >
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
                <span className="flex-1">
                  {highlightMatch(suggestion, highlightText)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* No Suggestions */}
      {suggestions.length === 0 && (!showRecent || recentSearches.length === 0) && (
        <div className="p-8 text-center">
          <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No suggestions found
          </p>
        </div>
      )}
      
      {/* Footer Hint */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border rounded-b-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-dark-bg-secondary border border-gray-300 dark:border-dark-border rounded text-xs font-mono">Enter</kbd> to search • <kbd className="px-1.5 py-0.5 bg-white dark:bg-dark-bg-secondary border border-gray-300 dark:border-dark-border rounded text-xs font-mono">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
