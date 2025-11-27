import { createAsyncThunk } from '@reduxjs/toolkit';
import { scraperService } from '../../api/index.js';
import type { RootState } from '../index.js';
import { setAgents, setLoading, setError, removeAgent } from '../slices/agentsSlice.js';

export const fetchAgents = createAsyncThunk(
  'agents/fetchAgents',
  async (_, { getState, dispatch }) => {
    dispatch(setLoading(true));
    try {
      const state = getState() as RootState;
      const { page, pageSize, filters, sortBy, sortOrder } = state.agents;

      const response = await scraperService.getAgents({
        page,
        limit: pageSize,
        search: filters.search || undefined,
        sortBy,
        sortOrder,
      });

      dispatch(
        setAgents({
          agents: response.agents,
          total: response.total,
        })
      );

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch agents';
      dispatch(setError(message));
      throw error;
    }
  }
);

export const deleteAgentById = createAsyncThunk(
  'agents/deleteAgent',
  async (agentId: number, { dispatch }) => {
    try {
      await scraperService.deleteAgent(agentId);
      dispatch(removeAgent(agentId));
      return agentId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete agent';
      dispatch(setError(message));
      throw error;
    }
  }
);

