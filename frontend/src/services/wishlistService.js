import api from './api';

class WishlistService {
  async getWishlist() {
    return api.get('/wishlist');
  }

  async addToWishlist(productId) {
    return api.post(`/wishlist/${productId}`);
  }

  async removeFromWishlist(productId) {
    return api.delete(`/wishlist/${productId}`);
  }

  async checkWishlist(productId) {
    return api.get(`/wishlist/check/${productId}`);
  }
}

export default new WishlistService();
