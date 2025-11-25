import { createAsyncThunk } from '@reduxjs/toolkit';
import { propertiesService } from '../../api/index.js';
import type { PropertyFilters, ApprovePropertyDto, RejectPropertyDto, FlagPropertyDto } from '../../api/index.js';

/**
 * Fetch pending properties
 */
export const fetchPendingProperties = createAsyncThunk(
  'properties/fetchPending',
  async (filters?: PropertyFilters, { rejectWithValue }) => {
    try {
      const response = await propertiesService.getPendingProperties(filters);
      if (response.success && response.data) {
        return {
          properties: response.data.properties,
          pagination: response.data.pagination,
        };
      }
      throw new Error(response.message || 'Failed to fetch pending properties');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pending properties');
    }
  }
);

/**
 * Fetch all properties
 */
export const fetchAllProperties = createAsyncThunk(
  'properties/fetchAll',
  async (filters?: PropertyFilters, { rejectWithValue }) => {
    try {
      const response = await propertiesService.getAllProperties(filters);
      if (response.success && response.data) {
        return {
          properties: response.data.properties,
          pagination: response.data.pagination,
        };
      }
      throw new Error(response.message || 'Failed to fetch properties');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch properties');
    }
  }
);

/**
 * Approve a property
 */
export const approveProperty = createAsyncThunk(
  'properties/approve',
  async ({ id, data }: { id: string; data?: ApprovePropertyDto }, { rejectWithValue }) => {
    try {
      const response = await propertiesService.approveProperty(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to approve property');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve property');
    }
  }
);

/**
 * Reject a property
 */
export const rejectProperty = createAsyncThunk(
  'properties/reject',
  async ({ id, data }: { id: string; data: RejectPropertyDto }, { rejectWithValue }) => {
    try {
      const response = await propertiesService.rejectProperty(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to reject property');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject property');
    }
  }
);

/**
 * Flag a property for review
 */
export const flagProperty = createAsyncThunk(
  'properties/flag',
  async ({ id, data }: { id: string; data?: FlagPropertyDto }, { rejectWithValue }) => {
    try {
      const response = await propertiesService.flagProperty(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to flag property');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to flag property');
    }
  }
);

