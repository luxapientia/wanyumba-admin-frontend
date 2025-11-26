import { createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../api/user.service.js';
import { setUser, setLoading, setError, clearUser } from '../slices/userSlice.js';

// Wanyumba frontend URL for redirecting unauthorized users
const WANYUMBA_FRONTEND_URL = import.meta.env.VITE_WANYUMBA_FRONTEND_URL || 'http://localhost:3000';
const LOGIN_PATH = '/auth/login';

/**
 * Redirect to wanyumba-frontend login page
 */
const redirectToLogin = () => {
  const loginUrl = `${WANYUMBA_FRONTEND_URL}${LOGIN_PATH}`;
  // Use window.location.href for full page redirect (clears React state)
  window.location.href = loginUrl;
};

/**
 * Check if response indicates unauthorized access
 */
const isUnauthorizedResponse = (response: any): boolean => {
  if (!response) return false;
  
  // Check for unauthorized error in response data
  if (response.error) {
    const error = response.error;
    if (error.type === 'UNAUTHORIZED' || 
        error.message?.toLowerCase().includes('unauthorized') ||
        error.message?.toLowerCase().includes('no token')) {
      return true;
    }
  }
  
  // Check if success is false and message indicates unauthorized
  if (response.success === false) {
    const message = response.message?.toLowerCase() || '';
    if (message.includes('unauthorized') || message.includes('no token')) {
      return true;
    }
  }
  
  return false;
};

/**
 * Fetch current user info
 */
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await userService.getCurrentUser();
      
      // Check if response indicates unauthorized access
      // (Note: HTTP 401 is handled by axios interceptor, but we check response data here)
      if (isUnauthorizedResponse(response)) {
        // Clear user state
        dispatch(clearUser());
        // Redirect to login
        redirectToLogin();
        // Return early to prevent further processing
        return;
      }
      
      if (response.success && response.data?.user) {
        dispatch(setUser(response.data.user));
        return response.data.user;
      } else {
        throw new Error(response.message || 'Failed to fetch user');
      }
    } catch (error: any) {
      // HTTP 401 errors are handled by axios interceptor (which redirects)
      // But we also check response data for unauthorized indicators
      if (error.response && error.response.status === 401) {
        // Axios interceptor will handle redirect, but clear state here
        dispatch(clearUser());
        return;
      }
      
      // Check if error response data indicates unauthorized
      if (isUnauthorizedResponse(error.response?.data)) {
        dispatch(clearUser());
        redirectToLogin();
        return;
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);

