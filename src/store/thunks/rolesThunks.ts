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
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch roles';
      if (error && typeof error === 'object') {
        const err = error as { response?: { data?: { message?: string; error?: { message?: string } } }; message?: string };
        errorMessage = err.response?.data?.message || err.response?.data?.error?.message || err.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

