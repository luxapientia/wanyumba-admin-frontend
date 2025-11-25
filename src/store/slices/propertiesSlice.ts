import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Property,
  PropertyFilters,
} from '../../api/properties.service.js';
import {
  fetchPendingProperties,
  fetchAllProperties,
  approveProperty,
  rejectProperty,
  flagProperty,
} from '../thunks/propertiesThunks.js';

interface PropertiesState {
  // Properties data
  items: Property[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Filters and sorting
  filters: PropertyFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  
  // Selected property
  selectedProperty: Property | null;
  
  // View mode: 'pending' | 'all'
  viewMode: 'pending' | 'all';
  
  // UI state
  displayViewMode: 'grid' | 'list';
}

const initialState: PropertiesState = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  pages: 0,
  loading: false,
  error: null,
  filters: {
    status: undefined,
    propertyType: undefined,
    listingType: undefined,
    district: undefined,
    region: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minBedrooms: undefined,
    search: undefined,
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
  selectedProperty: null,
  viewMode: 'pending',
  displayViewMode: 'list',
};

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setProperties: (
      state,
      action: PayloadAction<{
        properties: Property[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        };
      }>
    ) => {
      state.items = action.payload.properties;
      state.total = action.payload.pagination.total;
      state.page = action.payload.pagination.page;
      state.limit = action.payload.pagination.limit;
      state.pages = action.payload.pagination.pages;
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
      state.filters.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.filters.limit = action.payload;
      state.page = 1; // Reset to first page when changing limit
      state.filters.page = 1;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<PropertyFilters>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to first page when filters change
      state.filters.page = 1;
    },
    clearFilters: (state) => {
      const validSortBy = state.sortBy === 'createdAt' || state.sortBy === 'updatedAt' || 
        state.sortBy === 'price' || state.sortBy === 'title' || 
        state.sortBy === 'views' || state.sortBy === 'favorites' || 
        state.sortBy === 'inquiries' ? state.sortBy : 'createdAt';
      
      state.filters = {
        ...initialState.filters,
        page: state.page,
        limit: state.limit,
        sortBy: validSortBy,
        sortOrder: state.sortOrder,
        search: state.search || undefined,
      };
      // Preserve viewMode when clearing filters
      if (state.viewMode === 'pending') {
        state.filters.status = 'PENDING';
      }
      state.search = '';
    },
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      if (action.payload.sortBy === 'createdAt' || action.payload.sortBy === 'updatedAt' || 
          action.payload.sortBy === 'price' || action.payload.sortBy === 'title' || 
          action.payload.sortBy === 'views' || action.payload.sortBy === 'favorites' || 
          action.payload.sortBy === 'inquiries') {
        state.filters.sortBy = action.payload.sortBy;
      }
      state.filters.sortOrder = action.payload.sortOrder;
      state.page = 1; // Reset to first page when sorting changes
      state.filters.page = 1;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.filters.search = action.payload || undefined;
      state.page = 1; // Reset to first page when search changes
      state.filters.page = 1;
    },
    updateProperty: (state, action: PayloadAction<Property>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      // Also update if it's the selected property
      if (
        state.selectedProperty &&
        state.selectedProperty.id === action.payload.id
      ) {
        state.selectedProperty = action.payload;
      }
    },
    removeProperty: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
      state.pages = Math.ceil(state.total / state.limit);
      // Clear selected property if it was deleted
      if (
        state.selectedProperty &&
        state.selectedProperty.id === action.payload
      ) {
        state.selectedProperty = null;
      }
    },
    setSelectedProperty: (
      state,
      action: PayloadAction<Property | null>
    ) => {
      state.selectedProperty = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'pending' | 'all'>) => {
      state.viewMode = action.payload;
      // Update status filter based on view mode
      if (action.payload === 'pending') {
        state.filters.status = 'PENDING';
      } else {
        // For 'all' view, remove status filter to show all
        state.filters.status = undefined;
      }
      state.page = 1; // Reset to first page when changing view mode
      state.filters.page = 1;
    },
    setDisplayViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.displayViewMode = action.payload;
    },
    resetProperties: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch pending properties
    builder
      .addCase(fetchPendingProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingProperties.fulfilled, (state, action) => {
        state.items = action.payload.properties;
        state.total = action.payload.pagination.total;
        state.page = action.payload.pagination.page;
        state.limit = action.payload.pagination.limit;
        state.pages = action.payload.pagination.pages;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchPendingProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch pending properties';
      });

    // Fetch all properties
    builder
      .addCase(fetchAllProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProperties.fulfilled, (state, action) => {
        state.items = action.payload.properties;
        state.total = action.payload.pagination.total;
        state.page = action.payload.pagination.page;
        state.limit = action.payload.pagination.limit;
        state.pages = action.payload.pagination.pages;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch properties';
      });

    // Approve property
    builder
      .addCase(approveProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveProperty.fulfilled, (state, action) => {
        // Update the property in the list
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update selected property if it's the same
        if (
          state.selectedProperty &&
          state.selectedProperty.id === action.payload.id
        ) {
          state.selectedProperty = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(approveProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to approve property';
      });

    // Reject property
    builder
      .addCase(rejectProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectProperty.fulfilled, (state, action) => {
        // Update the property in the list
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        // Update selected property if it's the same
        if (
          state.selectedProperty &&
          state.selectedProperty.id === action.payload.id
        ) {
          state.selectedProperty = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(rejectProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to reject property';
      });

    // Flag property
    builder
      .addCase(flagProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(flagProperty.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(flagProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to flag property';
      });
  },
});

export const {
  setProperties,
  setLoading,
  setError,
  setPage,
  setLimit,
  setFilters,
  clearFilters,
  setSorting,
  setSearch,
  updateProperty,
  removeProperty,
  setSelectedProperty,
  setViewMode,
  setDisplayViewMode,
  resetProperties,
} = propertiesSlice.actions;

export default propertiesSlice.reducer;

