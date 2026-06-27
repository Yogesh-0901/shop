import { API_BASE_URL, defaultHeaders, API_TIMEOUT } from '../config/api';
import authService from './authService';
import { Product } from './productService';

class WishlistService {
  /**
   * Get user's wishlist
   */
  async getWishlist(): Promise<Product[]> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'GET',
        headers: defaultHeaders(token),
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string): Promise<void> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({ productId, action: 'add' }),
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string): Promise<void> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({ productId, action: 'remove' }),
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  /**
   * Toggle wishlist status
   */
  async toggleWishlist(productId: string, isAdded: boolean): Promise<void> {
    if (isAdded) {
      await this.removeFromWishlist(productId);
    } else {
      await this.addToWishlist(productId);
    }
  }
}

export default new WishlistService();
