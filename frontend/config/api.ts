// API Configuration
// Update this URL based on your environment
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.35:5000';

// API Timeout in milliseconds
export const API_TIMEOUT = 30000;

// Create headers with auth token
export const defaultHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-auth-token'] = token;
  }

  return headers;
};

// Standard API response interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
