import { API_BASE_URL, defaultHeaders, API_TIMEOUT } from '../config/api';
import authService from './authService';

class UserService {
  async updateProfile(fullName: string, phone: string) {
    try {
      const token = await authService.getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: defaultHeaders(token),
        body: JSON.stringify({ fullName, phone }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const token = await authService.getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: defaultHeaders(token),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
}

export default new UserService();
