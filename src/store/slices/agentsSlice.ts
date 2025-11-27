import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Agent } from '../../api/scraper.service.js';

interface AgentsState {
  items: Agent[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const initialState: AgentsState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 25,
  loading: false,
  error: null,
  filters: {
    search: '',
  },
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<{ agents: Agent[]; total: number }>) => {
      state.items = action.payload.agents;
      state.total = action.payload.total;
      state.loading = false;
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Reset to first page when changing page size
    },
    setFilters: (state, action: PayloadAction<Partial<AgentsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to first page when filtering
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    removeAgent: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(agent => agent.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
  },
});

export const {
  setAgents,
  setPage,
  setPageSize,
  setFilters,
  clearFilters,
  setSorting,
  setLoading,
  setError,
  removeAgent,
} = agentsSlice.actions;

export default agentsSlice.reducer;

