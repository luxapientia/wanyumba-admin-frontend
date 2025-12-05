import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LawyerProfile, ProfessionalProfilesFilters } from '../../api/index.js';
import { fetchLawyerProfiles, fetchLawyerProfileById, approveLawyerProfile, rejectLawyerProfile } from '../thunks/professionalProfilesThunks.js';

interface LawyerProfilesState {
  // Profiles data
  items: LawyerProfile[];
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
  selectedProfile: LawyerProfile | null;
}

const initialState: LawyerProfilesState = {
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

const lawyerProfilesSlice = createSlice({
  name: 'lawyerProfiles',
  initialState,
  reducers: {
    setLawyerProfiles: (state, action: PayloadAction<LawyerProfile[]>) => {
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
    setSelectedProfile: (state, action: PayloadAction<LawyerProfile | null>) => {
      state.selectedProfile = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        status: undefined,
        specialization: undefined,
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
    // Fetch lawyer profiles
    builder
      .addCase(fetchLawyerProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLawyerProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.profiles;
        state.total = action.payload.pagination.total;
        state.pages = action.payload.pagination.pages;
        state.page = action.payload.pagination.page;
        state.limit = action.payload.pagination.limit;
      })
      .addCase(fetchLawyerProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch lawyer profiles';
      });

    // Fetch single lawyer profile by ID
    builder
      .addCase(fetchLawyerProfileById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchLawyerProfileById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProfile = action.payload;
        state.detailError = null;
      })
      .addCase(fetchLawyerProfileById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.error.message || 'Failed to fetch lawyer profile';
        state.selectedProfile = null;
      });

    // Approve lawyer profile
    builder
      .addCase(approveLawyerProfile.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(approveLawyerProfile.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProfile = action.payload;
        state.detailError = null;
      })
      .addCase(approveLawyerProfile.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.error.message || 'Failed to approve lawyer profile';
      });

    // Reject lawyer profile
    builder
      .addCase(rejectLawyerProfile.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(rejectLawyerProfile.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProfile = action.payload;
        state.detailError = null;
      })
      .addCase(rejectLawyerProfile.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.error.message || 'Failed to reject lawyer profile';
      });
  },
});

export const {
  setLawyerProfiles,
  setPage,
  setLimit,
  setFilters,
  setSorting,
  setSearch,
  setSelectedProfile,
  clearFilters,
} = lawyerProfilesSlice.actions;

export default lawyerProfilesSlice.reducer;

