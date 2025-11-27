import { createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../api/user.service.js';
import type { Role } from '../slices/rolesSlice.js';

/**
 * Fetch all available roles
 */
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getRoles();
      if (response.success && response.data) {
        return response.data.roles as Role[];
      }
      throw new Error(response.message || 'Failed to fetch roles');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Failed to fetch roles';
      return rejectWithValue(errorMessage);
    }
  }
);

