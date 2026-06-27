import { API_BASE_URL, defaultHeaders, API_TIMEOUT } from '../config/api';
import authService from './authService';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  section: string;
  image: string;
  stock: number;
  rating: number;
  reviews?: Review[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id?: string;
  user: string;
  stars: number;
  comment: string;
  userImage?: string;
  createdAt?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

class ProductService {
  /**
   * Fetch all products with optional filters
   */
  async getProducts(
    section?: string,
    category?: string,
    limit?: number,
    skip?: number
  ): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams();
      if (section) params.append('section', section);
      if (category) params.append('category', category);
      if (limit) params.append('limit', limit.toString());
      if (skip) params.append('skip', skip.toString());

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_BASE_URL}/api/products${queryString}`, {
        method: 'GET',
        headers: defaultHeaders(),
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      // Handle both paginated and non-paginated responses
      if (data.products) {
        return data;
      }
      
      // Fallback for legacy API that returns array directly
      return {
        products: Array.isArray(data) ? data : [],
        total: data.length || 0,
        page: 1,
        pages: 1,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Fetch a single product by ID
   */
  async getProductById(productId: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'GET',
        headers: defaultHeaders(),
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        throw new Error('Product not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Add a review to a product
   */
  async addReview(productId: string, review: Review): Promise<{ message: string; reviews: Review[] }> {
    try {
      const token = await authService.getToken();

      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/review`, {
        method: 'POST',
        headers: defaultHeaders(token || undefined),
        body: JSON.stringify(review),
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  /**
   * Create a new product (seller/admin only)
   */
  async createProduct(productData: FormData): Promise<Product> {
    try {
      const token = await authService.getToken();

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'x-auth-token': token || '',
          'Authorization': `Bearer ${token}`,
        },
        body: productData,
        timeout: API_TIMEOUT,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Search products by name
   */
  async searchProducts(query: string): Promise<Product[]> {
    try {
      // For now, fetch all and filter client-side
      // In production, implement server-side search
      const response = await this.getProducts();
      return response.products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}

export default new ProductService();
