import { createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../api/user.service.js';
import { setUser, setLoading, setError } from '../slices/userSlice.js';

/**
 * Fetch current user info
 */
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await userService.getCurrentUser();
      
      if (response.success && response.data?.user) {
        dispatch(setUser(response.data.user));
        return response.data.user;
      } else {
        throw new Error(response.message || 'Failed to fetch user');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);

