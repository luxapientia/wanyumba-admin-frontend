import { apiClient } from './axios.js';

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  phone?: string | null;
  avatar?: string | null;
  roles: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  lastLoginAt?: string | null;
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

export interface UsersResponse {
  success: boolean;
  message?: string;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserDto {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
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

  /**
   * Get all users with pagination, filtering, search, and sorting
   */
  async getUsers(filters?: UserFilters): Promise<UsersResponse> {
    const params: Record<string, string | number | boolean | undefined> = {
      page: filters?.page || 1,
      limit: filters?.limit || 20,
      sortBy: filters?.sortBy || 'createdAt',
      sortOrder: filters?.sortOrder || 'desc',
    };

    if (filters?.role) params.role = filters.role;
    if (filters?.isActive !== undefined) params.isActive = filters.isActive;
    if (filters?.isEmailVerified !== undefined) params.isEmailVerified = filters.isEmailVerified;
    if (filters?.search) params.search = filters.search;

    const response = await apiClient.get<UsersResponse>(`${this.API_PREFIX}/users`, { params });
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`${this.API_PREFIX}/users/${userId}`);
    return response.data;
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserDto): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>(`${this.API_PREFIX}/users`, data);
    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserDto): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`${this.API_PREFIX}/users/${userId}`, data);
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string, reason?: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete(`${this.API_PREFIX}/users/${userId}`, {
      data: { reason },
    });
    return response.data;
  }

  /**
   * Update user roles (replace all roles)
   */
  async updateUserRoles(userId: string, roles: string[]): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`${this.API_PREFIX}/users/${userId}/roles`, { roles });
    return response.data;
  }

  /**
   * Add role to user
   */
  async addRoleToUser(userId: string, roleName: string): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>(`${this.API_PREFIX}/users/${userId}/roles`, { roleName });
    return response.data;
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string, roleName: string): Promise<UserResponse> {
    const response = await apiClient.delete<UserResponse>(`${this.API_PREFIX}/users/${userId}/roles/${roleName}`);
    return response.data;
  }

  /**
   * Get all available roles
   */
  async getRoles(): Promise<{ success: boolean; message?: string; data: { roles: Array<{ id: string; name: string; description?: string; permissions: string[] }> } }> {
    const response = await apiClient.get(`${this.API_PREFIX}/users/roles`);
    return response.data;
  }

  /**
   * Change user password (admin only)
   */
  async changeUserPassword(userId: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message?: string; data?: { user: User } }> {
    const response = await apiClient.put(`${this.API_PREFIX}/users/${userId}/password`, {
      newPassword,
      confirmPassword,
    });
    return response.data;
  }
}

export default new UserService();

