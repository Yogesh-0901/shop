import { API_BASE_URL, defaultHeaders, API_TIMEOUT } from '../config/api';
import authService from './authService';
import { CartItem } from './cartService';

export interface Order {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryCarrier: string;
  deliveryAddress: string;
  paymentMethod: string;
  status: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

class OrderService {
  /**
   * Create a new order
   */
  async createOrder(
    deliveryCarrier: string,
    deliveryAddress: string,
    paymentMethod: string
  ): Promise<Order> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({
          deliveryCarrier,
          deliveryAddress,
          paymentMethod,
        }),
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const data = await response.json();
      return data.order || data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get user's orders
   */
  async getOrders(): Promise<Order[]> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'GET',
        headers: defaultHeaders(token),
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get a specific order
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'GET',
        headers: defaultHeaders(token),
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        throw new Error('Order not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }
}

export default new OrderService();
