import { createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../api/user.service.js';
import type { UserFilters, CreateUserDto, UpdateUserDto } from '../../api/index.js';

/**
 * Fetch users
 */
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (filters: UserFilters | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await userService.getUsers(filters);
      if (response.success && response.data) {
        return {
          users: response.data.users,
          pagination: response.data.pagination,
        };
      }
      throw new Error(response.message || 'Failed to fetch users');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Failed to fetch users';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Create a new user
 */
export const createUser = createAsyncThunk(
  'users/create',
  async (data: CreateUserDto, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(data);
      if (response.success && response.data) {
        return response.data.user;
      }
      throw new Error(response.message || 'Failed to create user');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Failed to create user';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update user
 */
export const updateUser = createAsyncThunk(
  'users/update',
  async ({ userId, data }: { userId: string; data: UpdateUserDto }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(userId, data);
      if (response.success && response.data) {
        return response.data.user;
      }
      throw new Error(response.message || 'Failed to update user');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Failed to update user';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Delete user
 */
export const deleteUser = createAsyncThunk(
  'users/delete',
  async ({ userId, reason }: { userId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await userService.deleteUser(userId, reason);
      if (response.success) {
        return userId;
      }
      throw new Error(response.message || 'Failed to delete user');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Failed to delete user';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update user roles
 */
export const updateUserRoles = createAsyncThunk(
  'users/updateRoles',
  async ({ userId, roles }: { userId: string; roles: string[] }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUserRoles(userId, roles);
      if (response.success && response.data) {
        return response.data.user;
      }
      throw new Error(response.message || 'Failed to update user roles');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Failed to update user roles';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Add role to user
 */
export const addRoleToUser = createAsyncThunk(
  'users/addRole',
  async ({ userId, roleName }: { userId: string; roleName: string }, { rejectWithValue }) => {
    try {
      const response = await userService.addRoleToUser(userId, roleName);
      if (response.success && response.data) {
        return response.data.user;
      }
      throw new Error(response.message || 'Failed to add role to user');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Failed to add role to user';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Remove role from user
 */
export const removeRoleFromUser = createAsyncThunk(
  'users/removeRole',
  async ({ userId, roleName }: { userId: string; roleName: string }, { rejectWithValue }) => {
    try {
      const response = await userService.removeRoleFromUser(userId, roleName);
      if (response.success && response.data) {
        return response.data.user;
      }
      throw new Error(response.message || 'Failed to remove role from user');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Failed to remove role from user';
      return rejectWithValue(errorMessage);
    }
  }
);

