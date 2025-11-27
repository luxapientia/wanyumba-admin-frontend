import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, UserFilters } from '../../api/user.service.js';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserRoles,
} from '../thunks/usersThunks.js';

interface UsersState {
  // Users data
  items: User[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Filters and sorting
  filters: UserFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  
  // Selected user
  selectedUser: User | null;
}

const initialState: UsersState = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  pages: 0,
  loading: false,
  error: null,
  filters: {
    role: undefined,
    isActive: undefined,
    isEmailVerified: undefined,
    search: undefined,
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
  selectedUser: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
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
    setFilters: (state, action: PayloadAction<Partial<UserFilters>>) => {
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
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        role: undefined,
        isActive: undefined,
        isEmailVerified: undefined,
        search: undefined,
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
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.users;
        state.total = action.payload.pagination.total;
        state.pages = action.payload.pagination.pages;
        state.page = action.payload.pagination.page;
        state.limit = action.payload.pagination.limit;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        // Add new user to the list
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create user';
      });

    // Update user
    builder
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.items.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      });

    // Delete user
    builder
      .addCase(deleteUser.fulfilled, (state, action) => {
        const deletedUserId = action.payload; // deleteUser returns userId (string)
        state.items = state.items.filter((user) => user.id !== deletedUserId);
        state.total -= 1;
        if (state.selectedUser?.id === deletedUserId) {
          state.selectedUser = null;
        }
      });

    // Update user roles
    builder
      .addCase(updateUserRoles.fulfilled, (state, action) => {
        const index = state.items.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      });
  },
});

export const {
  setUsers,
  setPage,
  setLimit,
  setFilters,
  setSorting,
  setSearch,
  setSelectedUser,
  clearFilters,
} = usersSlice.actions;

export default usersSlice.reducer;

