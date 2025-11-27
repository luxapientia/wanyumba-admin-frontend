import { createAsyncThunk } from '@reduxjs/toolkit';
import { scraperService } from '../../api/index.js';
import { setListings, setLoading, setError, setPropertyTypes, setPropertyTypesLoading } from '../slices/listingsSlice.js';
import type { RootState } from '../index.js';

/**
 * Fetch listings from the backend with current filters, sorting, and pagination
 */
export const fetchListings = createAsyncThunk(
  'listings/fetch',
  async (_, { dispatch, getState }) => {
    dispatch(setLoading(true));
    try {
      const state = getState() as RootState;
      const { page, pageSize, filters, sortBy, sortOrder } = state.listings;

      const response = await scraperService.getListings({
        page,
        limit: pageSize,
        source: filters.source || undefined,
        listingType: (filters.listingType as 'rent' | 'sale' | '') || undefined,
        propertyType: filters.propertyType || undefined,
        search: filters.search || undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        sortBy,
        sortOrder,
      });

      dispatch(setListings({
        items: response.listings,
        total: response.total,
      }));

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch listings';
      dispatch(setError(message));
      throw error;
    }
  }
);

/**
 * Fetch statistics
 */
export const fetchStatistics = createAsyncThunk(
  'listings/fetchStatistics',
  async () => {
    const response = await scraperService.getStatistics();
    return response;
  }
);

/**
 * Fetch property types
 */
export const fetchPropertyTypes = createAsyncThunk(
  'listings/fetchPropertyTypes',
  async (_, { dispatch }) => {
    dispatch(setPropertyTypesLoading(true));
    try {
      const propertyTypes = await scraperService.getPropertyTypes();
      dispatch(setPropertyTypes(propertyTypes));
      return propertyTypes;
    } catch (error) {
      dispatch(setPropertyTypesLoading(false));
      throw error;
    }
  }
);

