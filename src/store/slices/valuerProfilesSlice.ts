import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ValuerProfile, ProfessionalProfilesFilters } from '../../api/index.js';
import { fetchValuerProfiles, fetchValuerProfileById, approveValuerProfile, rejectValuerProfile } from '../thunks/professionalProfilesThunks.js';

interface ValuerProfilesState {
  // Profiles data
  items: ValuerProfile[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Detail page state
  detailLoading: boolean;
  detailError: string | null;
  
  // Filters and sorting
  filters: ProfessionalProfilesFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  
  // Selected profile
  selectedProfile: ValuerProfile | null;
}

const initialState: ValuerProfilesState = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  pages: 0,
  loading: false,
  error: null,
  detailLoading: false,
  detailError: null,
  filters: {
    status: undefined,
    specialization: undefined,
    propertyType: undefined,
    valuationMethod: undefined,
    search: undefined,
    isVerified: undefined,
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
  selectedProfile: null,
};

const valuerProfilesSlice = createSlice({
  name: 'valuerProfiles',
  initialState,
  reducers: {
    setValuerProfiles: (state, action: PayloadAction<ValuerProfile[]>) => {
      state.items = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
      state.filters.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.filters.limit = action.payload;
      state.page = 1; // Reset to first page when limit changes
      state.filters.page = 1;
    },
    setFilters: (state, action: PayloadAction<Partial<ProfessionalProfilesFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to first page when filters change
      state.filters.page = 1;
    },
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.filters.search = action.payload || undefined;
      state.page = 1; // Reset to first page when search changes
      state.filters.page = 1;
    },
    setSelectedProfile: (state, action: PayloadAction<ValuerProfile | null>) => {
      state.selectedProfile = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        status: undefined,
        specialization: undefined,
        propertyType: undefined,
        valuationMethod: undefined,
        search: undefined,
        isVerified: undefined,
        page: 1,
        limit: state.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      state.search = '';
      state.sortBy = 'createdAt';
      state.sortOrder = 'desc';
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch valuer profiles
    builder
      .addCase(fetchValuerProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchValuerProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.profiles;
        state.total = action.payload.pagination.total;
        state.pages = action.payload.pagination.pages;
        state.page = action.payload.pagination.page;
        state.limit = action.payload.pagination.limit;
      })
      .addCase(fetchValuerProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch valuer profiles';
      });

    // Fetch single valuer profile by ID
    builder
      .addCase(fetchValuerProfileById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchValuerProfileById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProfile = action.payload;
        state.detailError = null;
      })
      .addCase(fetchValuerProfileById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.error.message || 'Failed to fetch valuer profile';
        state.selectedProfile = null;
      });

    // Approve valuer profile
    builder
      .addCase(approveValuerProfile.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(approveValuerProfile.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProfile = action.payload;
        state.detailError = null;
      })
      .addCase(approveValuerProfile.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.error.message || 'Failed to approve valuer profile';
      });

    // Reject valuer profile
    builder
      .addCase(rejectValuerProfile.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(rejectValuerProfile.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProfile = action.payload;
        state.detailError = null;
      })
      .addCase(rejectValuerProfile.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.error.message || 'Failed to reject valuer profile';
      });
  },
});

export const {
  setValuerProfiles,
  setPage,
  setLimit,
  setFilters,
  setSorting,
  setSearch,
  setSelectedProfile,
  clearFilters,
} = valuerProfilesSlice.actions;

export default valuerProfilesSlice.reducer;

