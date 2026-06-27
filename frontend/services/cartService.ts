import { API_BASE_URL, defaultHeaders, API_TIMEOUT } from '../config/api';
import authService from './authService';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

class CartService {
  /**
   * Fetch user's cart
   */
  async getCart(): Promise<CartItem[]> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'GET',
        headers: defaultHeaders(token),
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      return data.items || data || [];
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  /**
   * Add or update item in cart
   */
  async updateCart(
    productId: string,
    action: 'add' | 'plus' | 'minus' | 'remove'
  ): Promise<CartItem[]> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({ productId, action }),
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Cart update failed');
      }

      const data = await response.json();
      return data.items || data || [];
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  }

  /**
   * Clear the cart
   */
  async clearCart(): Promise<void> {
    try {
      // This would require a backend endpoint
      // For now, just local storage handling
      const items: CartItem[] = [];
      // Could use local storage
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}

export default new CartService();
