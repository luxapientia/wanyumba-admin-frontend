import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Listing } from '../../api/scraper.service.js';

interface ListingsState {
  items: Listing[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  filters: {
    source: string;
    listingType: string;
    propertyType: string;
    search: string;
    minPrice: string;
    maxPrice: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  propertyTypes: string[];
  propertyTypesLoading: boolean;
}

const initialState: ListingsState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 25,
  loading: false,
  error: null,
  filters: {
    source: '',
    listingType: '',
    propertyType: '',
    search: '',
    minPrice: '',
    maxPrice: '',
  },
  sortBy: 'scrapeTimestamp',
  sortOrder: 'desc',
  propertyTypes: [],
  propertyTypesLoading: false,
};

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setListings: (state, action: PayloadAction<{ items: Listing[]; total: number }>) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Reset to first page when changing page size
    },
    setFilters: (state, action: PayloadAction<Partial<ListingsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      state.page = 1; // Reset to first page when sorting changes
    },
    setPropertyTypes: (state, action: PayloadAction<string[]>) => {
      state.propertyTypes = action.payload;
      state.propertyTypesLoading = false;
    },
    setPropertyTypesLoading: (state, action: PayloadAction<boolean>) => {
      state.propertyTypesLoading = action.payload;
    },
    resetListings: () => initialState,
  },
});

export const {
  setListings,
  setLoading,
  setError,
  setPage,
  setPageSize,
  setFilters,
  clearFilters,
  setSorting,
  setPropertyTypes,
  setPropertyTypesLoading,
  resetListings,
} = listingsSlice.actions;

export default listingsSlice.reducer;

