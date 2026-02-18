import { useState, useCallback } from 'react';

const STORAGE_KEY = 'ai_search_history';
const MAX_ITEMS = 10;

/**
 * useSearchHistory Hook
 * Manages recent search history in localStorage (max 10 items).
 * Provides add, remove, and clear operations.
 */
export default function useSearchHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const persist = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage quota exceeded - silently fail
    }
  };

  const addSearch = useCallback((query) => {
    if (!query || !query.trim()) return;
    const trimmed = query.trim();

    setHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_ITEMS);
      persist(updated);
      return updated;
    });
  }, []);

  const removeSearch = useCallback((query) => {
    setHistory(prev => {
      const updated = prev.filter(item => item !== query);
      persist(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // silent
    }
  }, []);

  return { history, addSearch, removeSearch, clearHistory };
}
