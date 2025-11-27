import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchRoles } from '../thunks/rolesThunks.js';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

interface RolesState {
  items: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  items: [],
  loading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.items = action.payload;
    },
    clearRoles: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch roles';
      });
  },
});

export const { setRoles, clearRoles } = rolesSlice.actions;

export default rolesSlice.reducer;

