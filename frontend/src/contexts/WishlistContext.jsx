import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/wishlistService';

const WishlistContext = createContext(null);

/**
 * WishlistProvider - Manages wishlist state for logged-in users only
 * Wishlist is available only for authenticated users
 */
export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLoggedIn = () => !!localStorage.getItem('token');

  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn()) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const response = await wishlistService.getWishlist();
      if (response.success && Array.isArray(response.data)) {
        const ids = new Set(response.data.map((p) => p?._id || p));
        setWishlistIds(ids);
      } else {
        setWishlistIds(new Set());
      }
    } catch (err) {
      setWishlistIds(new Set());
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchWishlist();
    } else {
      setWishlistIds(new Set());
    }
    const onAuthChange = () => {
      if (localStorage.getItem('token')) {
        fetchWishlist();
      } else {
        setWishlistIds(new Set());
      }
    };
    window.addEventListener('auth:changed', onAuthChange);
    return () => window.removeEventListener('auth:changed', onAuthChange);
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId) => wishlistIds.has(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      if (!isLoggedIn()) return { success: false, message: 'Login required' };
      const productId = typeof product === 'string' ? product : product?._id;
      if (!productId) return { success: false, message: 'Invalid product' };

      setLoading(true);
      setError(null);
      try {
        const inWishlist = wishlistIds.has(productId);
        if (inWishlist) {
          await wishlistService.removeFromWishlist(productId);
          setWishlistIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
          return { success: true, removed: true };
        } else {
          await wishlistService.addToWishlist(productId);
          setWishlistIds((prev) => new Set([...prev, productId]));
          return { success: true, added: true };
        }
      } catch (err) {
        setError(err.message);
        const msg = err.response?.data?.message || err.message || 'Failed to update wishlist';
        return { success: false, message: msg };
      } finally {
        setLoading(false);
      }
    },
    [wishlistIds]
  );

  const value = {
    wishlistIds: Array.from(wishlistIds),
    isInWishlist,
    toggleWishlist,
    fetchWishlist,
    loading,
    error,
    isLoggedIn,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
