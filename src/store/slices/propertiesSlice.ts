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

interface PropertyListState {
  items: Property[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  loading: boolean;
  error: string | null;
  filters: PropertyFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  displayViewMode: 'grid' | 'list';
}

interface PropertiesState {
  // Separate storage for pending and all properties
  pending: PropertyListState;
  all: PropertyListState;
  
  // Selected property (shared)
  selectedProperty: Property | null;
}

const initialListState: PropertyListState = {
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
  displayViewMode: 'list',
};

const initialState: PropertiesState = {
  pending: { 
    ...initialListState, 
    filters: { ...initialListState.filters, status: 'PENDING' } 
  },
  all: { ...initialListState },
  selectedProperty: null,
};

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    // Pending properties actions
    setPendingProperties: (
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
      state.pending.items = action.payload.properties;
      state.pending.total = action.payload.pagination.total;
      state.pending.page = action.payload.pagination.page;
      state.pending.limit = action.payload.pagination.limit;
      state.pending.pages = action.payload.pagination.pages;
      state.pending.loading = false;
      state.pending.error = null;
    },
    setPendingLoading: (state, action: PayloadAction<boolean>) => {
      state.pending.loading = action.payload;
    },
    setPendingError: (state, action: PayloadAction<string | null>) => {
      state.pending.error = action.payload;
      state.pending.loading = false;
    },
    setPendingPage: (state, action: PayloadAction<number>) => {
      state.pending.page = action.payload;
      state.pending.filters.page = action.payload;
    },
    setPendingLimit: (state, action: PayloadAction<number>) => {
      state.pending.limit = action.payload;
      state.pending.filters.limit = action.payload;
      state.pending.page = 1;
      state.pending.filters.page = 1;
    },
    setPendingFilters: (
      state,
      action: PayloadAction<Partial<PropertyFilters>>
    ) => {
      state.pending.filters = { ...state.pending.filters, ...action.payload };
      state.pending.page = 1;
      state.pending.filters.page = 1;
    },
    clearPendingFilters: (state) => {
      const validSortBy = state.pending.sortBy === 'createdAt' || state.pending.sortBy === 'updatedAt' || 
        state.pending.sortBy === 'price' || state.pending.sortBy === 'title' || 
        state.pending.sortBy === 'views' || state.pending.sortBy === 'favorites' || 
        state.pending.sortBy === 'inquiries' ? state.pending.sortBy : 'createdAt';
      
      state.pending.filters = {
        ...initialListState.filters,
        status: 'PENDING', // Always keep PENDING status for pending list
        page: state.pending.page,
        limit: state.pending.limit,
        sortBy: validSortBy,
        sortOrder: state.pending.sortOrder,
        search: state.pending.search || undefined,
      };
      state.pending.search = '';
    },
    setPendingSorting: (
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>
    ) => {
      state.pending.sortBy = action.payload.sortBy;
      state.pending.sortOrder = action.payload.sortOrder;
      if (action.payload.sortBy === 'createdAt' || action.payload.sortBy === 'updatedAt' || 
          action.payload.sortBy === 'price' || action.payload.sortBy === 'title' || 
          action.payload.sortBy === 'views' || action.payload.sortBy === 'favorites' || 
          action.payload.sortBy === 'inquiries') {
        state.pending.filters.sortBy = action.payload.sortBy;
      }
      state.pending.filters.sortOrder = action.payload.sortOrder;
      state.pending.page = 1;
      state.pending.filters.page = 1;
    },
    setPendingSearch: (state, action: PayloadAction<string>) => {
      state.pending.search = action.payload;
      state.pending.filters.search = action.payload || undefined;
      state.pending.page = 1;
      state.pending.filters.page = 1;
    },
    setPendingDisplayViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.pending.displayViewMode = action.payload;
    },
    updatePendingProperty: (state, action: PayloadAction<Property>) => {
      const index = state.pending.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.pending.items[index] = action.payload;
      }
      if (
        state.selectedProperty &&
        state.selectedProperty.id === action.payload.id
      ) {
        state.selectedProperty = action.payload;
      }
    },
    removePendingProperty: (state, action: PayloadAction<string>) => {
      state.pending.items = state.pending.items.filter((item) => item.id !== action.payload);
      state.pending.total = Math.max(0, state.pending.total - 1);
      state.pending.pages = Math.ceil(state.pending.total / state.pending.limit);
      if (
        state.selectedProperty &&
        state.selectedProperty.id === action.payload
      ) {
        state.selectedProperty = null;
      }
    },

    // All properties actions
    setAllProperties: (
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
      state.all.items = action.payload.properties;
      state.all.total = action.payload.pagination.total;
      state.all.page = action.payload.pagination.page;
      state.all.limit = action.payload.pagination.limit;
      state.all.pages = action.payload.pagination.pages;
      state.all.loading = false;
      state.all.error = null;
    },
    setAllLoading: (state, action: PayloadAction<boolean>) => {
      state.all.loading = action.payload;
    },
    setAllError: (state, action: PayloadAction<string | null>) => {
      state.all.error = action.payload;
      state.all.loading = false;
    },
    setAllPage: (state, action: PayloadAction<number>) => {
      state.all.page = action.payload;
      state.all.filters.page = action.payload;
    },
    setAllLimit: (state, action: PayloadAction<number>) => {
      state.all.limit = action.payload;
      state.all.filters.limit = action.payload;
      state.all.page = 1;
      state.all.filters.page = 1;
    },
    setAllFilters: (
      state,
      action: PayloadAction<Partial<PropertyFilters>>
    ) => {
      state.all.filters = { ...state.all.filters, ...action.payload };
      state.all.page = 1;
      state.all.filters.page = 1;
    },
    clearAllFilters: (state) => {
      const validSortBy = state.all.sortBy === 'createdAt' || state.all.sortBy === 'updatedAt' || 
        state.all.sortBy === 'price' || state.all.sortBy === 'title' || 
        state.all.sortBy === 'views' || state.all.sortBy === 'favorites' || 
        state.all.sortBy === 'inquiries' ? state.all.sortBy : 'createdAt';
      
      state.all.filters = {
        ...initialListState.filters,
        page: state.all.page,
        limit: state.all.limit,
        sortBy: validSortBy,
        sortOrder: state.all.sortOrder,
        search: state.all.search || undefined,
      };
      state.all.search = '';
    },
    setAllSorting: (
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>
    ) => {
      state.all.sortBy = action.payload.sortBy;
      state.all.sortOrder = action.payload.sortOrder;
      if (action.payload.sortBy === 'createdAt' || action.payload.sortBy === 'updatedAt' || 
          action.payload.sortBy === 'price' || action.payload.sortBy === 'title' || 
          action.payload.sortBy === 'views' || action.payload.sortBy === 'favorites' || 
          action.payload.sortBy === 'inquiries') {
        state.all.filters.sortBy = action.payload.sortBy;
      }
      state.all.filters.sortOrder = action.payload.sortOrder;
      state.all.page = 1;
      state.all.filters.page = 1;
    },
    setAllSearch: (state, action: PayloadAction<string>) => {
      state.all.search = action.payload;
      state.all.filters.search = action.payload || undefined;
      state.all.page = 1;
      state.all.filters.page = 1;
    },
    setAllDisplayViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.all.displayViewMode = action.payload;
    },
    updateAllProperty: (state, action: PayloadAction<Property>) => {
      const index = state.all.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.all.items[index] = action.payload;
      }
      if (
        state.selectedProperty &&
        state.selectedProperty.id === action.payload.id
      ) {
        state.selectedProperty = action.payload;
      }
    },
    removeAllProperty: (state, action: PayloadAction<string>) => {
      state.all.items = state.all.items.filter((item) => item.id !== action.payload);
      state.all.total = Math.max(0, state.all.total - 1);
      state.all.pages = Math.ceil(state.all.total / state.all.limit);
      if (
        state.selectedProperty &&
        state.selectedProperty.id === action.payload
      ) {
        state.selectedProperty = null;
      }
    },

    // Shared actions
    setSelectedProperty: (
      state,
      action: PayloadAction<Property | null>
    ) => {
      state.selectedProperty = action.payload;
    },
    resetProperties: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch pending properties
    builder
      .addCase(fetchPendingProperties.pending, (state) => {
        state.pending.loading = true;
        state.pending.error = null;
      })
      .addCase(fetchPendingProperties.fulfilled, (state, action) => {
        state.pending.items = action.payload.properties;
        state.pending.total = action.payload.pagination.total;
        state.pending.page = action.payload.pagination.page;
        state.pending.limit = action.payload.pagination.limit;
        state.pending.pages = action.payload.pagination.pages;
        state.pending.loading = false;
        state.pending.error = null;
      })
      .addCase(fetchPendingProperties.rejected, (state, action) => {
        state.pending.loading = false;
        state.pending.error = action.payload as string || 'Failed to fetch pending properties';
      });

    // Fetch all properties
    builder
      .addCase(fetchAllProperties.pending, (state) => {
        state.all.loading = true;
        state.all.error = null;
      })
      .addCase(fetchAllProperties.fulfilled, (state, action) => {
        state.all.items = action.payload.properties;
        state.all.total = action.payload.pagination.total;
        state.all.page = action.payload.pagination.page;
        state.all.limit = action.payload.pagination.limit;
        state.all.pages = action.payload.pagination.pages;
        state.all.loading = false;
        state.all.error = null;
      })
      .addCase(fetchAllProperties.rejected, (state, action) => {
        state.all.loading = false;
        state.all.error = action.payload as string || 'Failed to fetch properties';
      });

    // Approve property - update in both lists
    builder
      .addCase(approveProperty.pending, (state) => {
        state.pending.loading = true;
        state.all.loading = true;
        state.pending.error = null;
        state.all.error = null;
      })
      .addCase(approveProperty.fulfilled, (state, action) => {
        // Remove from pending list
        state.pending.items = state.pending.items.filter(
          (item) => item.id !== action.payload.id
        );
        state.pending.total = Math.max(0, state.pending.total - 1);
        state.pending.pages = Math.ceil(state.pending.total / state.pending.limit);
        
        // Update in all list if present
        const allIndex = state.all.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (allIndex !== -1) {
          state.all.items[allIndex] = action.payload;
        }
        
        // Update selected property if it's the same
        if (
          state.selectedProperty &&
          state.selectedProperty.id === action.payload.id
        ) {
          state.selectedProperty = action.payload;
        }
        state.pending.loading = false;
        state.all.loading = false;
        state.pending.error = null;
        state.all.error = null;
      })
      .addCase(approveProperty.rejected, (state, action) => {
        state.pending.loading = false;
        state.all.loading = false;
        state.pending.error = action.payload as string || 'Failed to approve property';
        state.all.error = action.payload as string || 'Failed to approve property';
      });

    // Reject property - update in both lists
    builder
      .addCase(rejectProperty.pending, (state) => {
        state.pending.loading = true;
        state.all.loading = true;
        state.pending.error = null;
        state.all.error = null;
      })
      .addCase(rejectProperty.fulfilled, (state, action) => {
        // Update in pending list
        const pendingIndex = state.pending.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (pendingIndex !== -1) {
          state.pending.items[pendingIndex] = action.payload;
        }
        
        // Update in all list
        const allIndex = state.all.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (allIndex !== -1) {
          state.all.items[allIndex] = action.payload;
        }
        
        // Update selected property if it's the same
        if (
          state.selectedProperty &&
          state.selectedProperty.id === action.payload.id
        ) {
          state.selectedProperty = action.payload;
        }
        state.pending.loading = false;
        state.all.loading = false;
        state.pending.error = null;
        state.all.error = null;
      })
      .addCase(rejectProperty.rejected, (state, action) => {
        state.pending.loading = false;
        state.all.loading = false;
        state.pending.error = action.payload as string || 'Failed to reject property';
        state.all.error = action.payload as string || 'Failed to reject property';
      });

    // Flag property
    builder
      .addCase(flagProperty.pending, (state) => {
        state.all.loading = true;
        state.all.error = null;
      })
      .addCase(flagProperty.fulfilled, (state) => {
        state.all.loading = false;
        state.all.error = null;
      })
      .addCase(flagProperty.rejected, (state, action) => {
        state.all.loading = false;
        state.all.error = action.payload as string || 'Failed to flag property';
      });
  },
});

export const {
  // Pending
  setPendingProperties,
  setPendingLoading,
  setPendingError,
  setPendingPage,
  setPendingLimit,
  setPendingFilters,
  clearPendingFilters,
  setPendingSorting,
  setPendingSearch,
  setPendingDisplayViewMode,
  updatePendingProperty,
  removePendingProperty,
  // All
  setAllProperties,
  setAllLoading,
  setAllError,
  setAllPage,
  setAllLimit,
  setAllFilters,
  clearAllFilters,
  setAllSorting,
  setAllSearch,
  setAllDisplayViewMode,
  updateAllProperty,
  removeAllProperty,
  // Shared
  setSelectedProperty,
  resetProperties,
} = propertiesSlice.actions;

export default propertiesSlice.reducer;
