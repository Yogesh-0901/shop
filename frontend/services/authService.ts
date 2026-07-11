import { API_BASE_URL, defaultHeaders, API_TIMEOUT } from '../config/api';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  _id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'seller' | 'admin';
  phone?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  message: string;
}

export interface SignupResponse {
  token: string;
  user: AuthUser;
  message: string;
}

class AuthService {
  private tokenKey = 'ecommerce_token';
  private userKey = 'ecommerce_user';

  /**
   * Store token securely
   */
  async storeToken(token: string): Promise<void> {
    try {
      // Try secure storage first
      try {
        await SecureStore.setItemAsync(this.tokenKey, token);
      } catch (e) {
        // Fallback to async storage if secure storage is not available
        await AsyncStorage.setItem(this.tokenKey, token);
      }
    } catch (error) {
      console.error('Error storing token:', error);
      throw error;
    }
  }

  /**
   * Retrieve token from storage
   */
  async getToken(): Promise<string | null> {
    try {
      // Try secure storage first
      try {
        const token = await SecureStore.getItemAsync(this.tokenKey);
        if (token) return token;
      } catch (e) {
        // Fallback to async storage
      }
      
      return await AsyncStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Store user info
   */
  async storeUser(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
      throw error;
    }
  }

  /**
   * Retrieve user info
   */
  async getUser(): Promise<AuthUser | null> {
    try {
      const user = await AsyncStorage.getItem(this.userKey);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
  }

  /**
   * Sign up a new user
   */
  async signup(fullName: string, email: string, password: string): Promise<SignupResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: defaultHeaders(),
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data: SignupResponse = await response.json();
      
      // Store token and user
      await this.storeToken(data.token);
      await this.storeUser(data.user);

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * Log in a user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: defaultHeaders(),
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data: LoginResponse = await response.json();

      // Store token and user
      await this.storeToken(data.token);
      await this.storeUser(data.user);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Verify if token is still valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'GET',
        headers: defaultHeaders(token),
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string, newPassword: string, confirmPassword: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: defaultHeaders(),
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Password reset failed');
      }

      const data = await response.json();
      return data.message || 'Password reset successful';
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      // Remove token
      try {
        await SecureStore.deleteItemAsync(this.tokenKey);
      } catch (e) {
        // Fallback
      }
      await AsyncStorage.removeItem(this.tokenKey);
      await AsyncStorage.removeItem(this.userKey);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export default new AuthService();
