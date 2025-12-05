import { createAsyncThunk } from '@reduxjs/toolkit';
import professionalProfilesService from '../../api/professional-profiles.service.js';
import type { ProfessionalProfilesFilters } from '../../api/index.js';

/**
 * Fetch lawyer profiles
 */
export const fetchLawyerProfiles = createAsyncThunk(
  'professionalProfiles/fetchLawyerProfiles',
  async (filters: ProfessionalProfilesFilters | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await professionalProfilesService.getLawyerProfiles(filters);
      if (response.success && response.data) {
        return {
          profiles: response.data.profiles,
          pagination: response.data.pagination,
        };
      }
      throw new Error(response.message || 'Failed to fetch lawyer profiles');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string; error?: { message?: string } }; message?: string } })?.response?.data?.message 
        || (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message 
        || (error as { message?: string })?.message 
        || 'Failed to fetch lawyer profiles';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch valuer profiles
 */
export const fetchValuerProfiles = createAsyncThunk(
  'professionalProfiles/fetchValuerProfiles',
  async (filters: ProfessionalProfilesFilters | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await professionalProfilesService.getValuerProfiles(filters);
      if (response.success && response.data) {
        return {
          profiles: response.data.profiles,
          pagination: response.data.pagination,
        };
      }
      throw new Error(response.message || 'Failed to fetch valuer profiles');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string; error?: { message?: string } }; message?: string } })?.response?.data?.message 
        || (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message 
        || (error as { message?: string })?.message 
        || 'Failed to fetch valuer profiles';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch a single lawyer profile by ID
 */
export const fetchLawyerProfileById = createAsyncThunk(
  'professionalProfiles/fetchLawyerProfileById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await professionalProfilesService.getLawyerProfileById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch lawyer profile');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string; error?: { message?: string } }; message?: string } })?.response?.data?.message 
        || (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message 
        || (error as { message?: string })?.message 
        || 'Failed to fetch lawyer profile';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch a single valuer profile by ID
 */
export const fetchValuerProfileById = createAsyncThunk(
  'professionalProfiles/fetchValuerProfileById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await professionalProfilesService.getValuerProfileById(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch valuer profile');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string; error?: { message?: string } }; message?: string } })?.response?.data?.message 
        || (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message 
        || (error as { message?: string })?.message 
        || 'Failed to fetch valuer profile';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Approve a lawyer profile
 */
export const approveLawyerProfile = createAsyncThunk(
  'professionalProfiles/approveLawyerProfile',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await professionalProfilesService.approveLawyerProfile(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to approve lawyer profile');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string; error?: { message?: string } }; message?: string } })?.response?.data?.message 
        || (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message 
        || (error as { message?: string })?.message 
        || 'Failed to approve lawyer profile';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Reject a lawyer profile
 */
export const rejectLawyerProfile = createAsyncThunk(
  'professionalProfiles/rejectLawyerProfile',
  async ({ id, rejectionReason, moderationNotes }: { id: string; rejectionReason: string; moderationNotes?: string }, { rejectWithValue }) => {
    try {
      const response = await professionalProfilesService.rejectLawyerProfile(id, rejectionReason, moderationNotes);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to reject lawyer profile');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string; error?: { message?: string } }; message?: string } })?.response?.data?.message 
        || (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message 
        || (error as { message?: string })?.message 
        || 'Failed to reject lawyer profile';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Approve a valuer profile
 */
export const approveValuerProfile = createAsyncThunk(
  'professionalProfiles/approveValuerProfile',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await professionalProfilesService.approveValuerProfile(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to approve valuer profile');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string; error?: { message?: string } }; message?: string } })?.response?.data?.message 
        || (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message 
        || (error as { message?: string })?.message 
        || 'Failed to approve valuer profile';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Reject a valuer profile
 */
export const rejectValuerProfile = createAsyncThunk(
  'professionalProfiles/rejectValuerProfile',
  async ({ id, rejectionReason, moderationNotes }: { id: string; rejectionReason: string; moderationNotes?: string }, { rejectWithValue }) => {
    try {
      const response = await professionalProfilesService.rejectValuerProfile(id, rejectionReason, moderationNotes);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to reject valuer profile');
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string; error?: { message?: string } }; message?: string } })?.response?.data?.message 
        || (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message 
        || (error as { message?: string })?.message 
        || 'Failed to reject valuer profile';
      return rejectWithValue(errorMessage);
    }
  }
);

