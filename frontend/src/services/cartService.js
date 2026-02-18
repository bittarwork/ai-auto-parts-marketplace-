import api from './api';

const CART_SESSION_KEY = 'cart_session_id';

/** Get or create cart session ID for guests (30 days) */
export function getCartSessionId() {
  let id = localStorage.getItem(CART_SESSION_KEY);
  if (!id) {
    id = 'cart_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem(CART_SESSION_KEY, id);
  }
  return id;
}

/** Add session header to config */
function withSession(config = {}) {
  const token = localStorage.getItem('token');
  if (token) return config;
  const sessionId = getCartSessionId();
  return {
    ...config,
    headers: {
      ...config.headers,
      'X-Cart-Session': sessionId
    }
  };
}

class CartService {
  async getCart() {
    return api.get('/cart', withSession());
  }

  async getCartCount() {
    return api.get('/cart/count', withSession());
  }

  async addToCart(productId, quantity = 1) {
    const sessionId = getCartSessionId();
    return api.post('/cart/items', { productId, quantity, sessionId }, withSession());
  }

  async updateCartItem(productId, quantity) {
    return api.put(`/cart/items/${productId}`, { quantity }, withSession());
  }

  async removeFromCart(productId) {
    return api.delete(`/cart/items/${productId}`, withSession());
  }

  async clearCart() {
    return api.delete('/cart', withSession());
  }

  async validateCart() {
    return api.post('/cart/validate');
  }

  getCartSessionId() {
    return getCartSessionId();
  }
}

export default new CartService();
