import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import cartService from '../services/cartService';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  const refreshCartCount = useCallback(async () => {
    try {
      const response = await cartService.getCartCount();
      if (response.success) {
        setCartCount(response.data?.count ?? 0);
      }
    } catch (error) {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    setCartLoading(true);
    setCartError(null);
    try {
      const response = await cartService.addToCart(productId, quantity);
      if (response.success) {
        await refreshCartCount();
        toast.success('Added to cart');
        return { success: true, message: 'Added to cart' };
      }
      const msg = response.message || 'Failed to add';
      toast.error(msg);
      return { success: false, message: msg };
    } catch (error) {
      const msg = error.message || error.response?.data?.message || 'Failed to add to cart';
      setCartError(msg);
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setCartLoading(false);
    }
  }, [refreshCartCount]);

  const value = {
    cartCount,
    cartLoading,
    cartError,
    addToCart,
    refreshCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
