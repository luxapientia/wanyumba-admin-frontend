import { apiClient } from './axios.js';

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  roles: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
  };
}

class UserService {
  private readonly API_PREFIX = '/admin';

  /**
   * Get current authenticated user info
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await apiClient.get(`${this.API_PREFIX}/user/me`);
    return response.data;
  }
}

export default new UserService();

