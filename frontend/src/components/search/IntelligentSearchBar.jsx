import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  MicrophoneIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import aiSearchService from '../../services/aiSearchService';
import SearchSuggestions from './SearchSuggestions';
import useSearchHistory from '../../hooks/useSearchHistory';
import clsx from 'clsx';

/**
 * ★★★ INTELLIGENT SEARCH BAR ★★★
 * Main search component with NLP, voice search, autocomplete, and search history
 */
export default function IntelligentSearchBar({ 
  onSearch,
  autoFocus = false,
  placeholder,
  variant = 'default' // 'default' | 'hero'
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { history, addSearch, clearHistory } = useSearchHistory();
  
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSearch(transcript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  const fetchSuggestions = async () => {
    try {
      const response = await aiSearchService.getSearchSuggestions(query, 'en');
      if (response.success) {
        setSuggestions(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };
  
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    setShowSuggestions(false);
    addSearch(searchQuery.trim());
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleVoiceSearch = () => {
    if (!recognition) {
      alert(t('search:voiceSearchNotSupported'));
      return;
    }
    
    if (isListening) {
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.start();
    }
  };
  
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Show recent searches when input is focused but empty
  const shouldShowRecent = showSuggestions && query.length < 2 && history.length > 0;
  const shouldShowDropdown = showSuggestions && (suggestions.length > 0 || shouldShowRecent);
  
  const baseClasses = "relative w-full";
  const heroClasses = variant === 'hero' ? 'max-w-3xl mx-auto' : '';
  
  return (
    <div className={clsx(baseClasses, heroClasses)}>
      <div className="relative">
        <div className={clsx(
          "relative flex items-center",
          variant === 'hero' ? 'shadow-soft-lg' : 'shadow-soft'
        )}>
          <div className="absolute left-4 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="absolute left-11 pointer-events-none">
            <SparklesIcon className="w-4 h-4 text-primary-500 animate-pulse" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t('search:intelligentPlaceholder')}
            className={clsx(
              "w-full border border-gray-300 dark:border-dark-border rounded-lg",
              "bg-white dark:bg-dark-bg-secondary",
              "text-gray-900 dark:text-white",
              "placeholder-gray-400 dark:placeholder-gray-500",
              "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-all duration-200",
              variant === 'hero' ? 'pl-20 pr-32 py-4 text-lg' : 'pl-20 pr-28 py-3'
            )}
          />
          
          <div className="absolute right-2 flex items-center space-x-1">
            {query && (
              <button
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                aria-label="Clear search"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
            
            {recognition && (
              <button
                onClick={handleVoiceSearch}
                className={clsx(
                  "p-2 rounded-lg transition-all",
                  isListening
                    ? "bg-error-500 text-white animate-pulse"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                )}
                aria-label={isListening ? "Stop listening" : "Voice search"}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={() => handleSearch()}
              disabled={!query.trim()}
              className={clsx(
                "px-4 py-2 bg-primary-600 text-white rounded-lg",
                "hover:bg-primary-700 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variant === 'hero' && 'px-6 py-2.5'
              )}
            >
              Search
            </button>
          </div>
        </div>
        
        {variant === 'hero' && !query && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
            {t('search:aiHint')}
          </p>
        )}
        
        {isListening && (
          <div className="absolute top-full left-0 right-0 mt-2 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 rounded-lg">
              <div className="flex space-x-1">
                <span className="w-1 h-4 bg-error-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-4 bg-error-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-4 bg-error-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-sm font-medium">Listening...</span>
            </div>
          </div>
        )}
        
        {shouldShowDropdown && (
          <SearchSuggestions
            suggestions={suggestions}
            onSelect={handleSuggestionClick}
            onClose={() => setShowSuggestions(false)}
            highlightText={query}
            showRecent={shouldShowRecent}
            recentSearches={history}
            onClearHistory={clearHistory}
          />
        )}
      </div>
    </div>
  );
}
