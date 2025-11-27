import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ScrapingStatus } from '../../api/scraper.service.js';

export interface SiteScrapingState {
  isActive: boolean;
  status: ScrapingStatus;
  lastUpdate: string | null; // ISO string instead of Date object
}

interface ScrapingState {
  [key: string]: SiteScrapingState; // Dynamic keys for any scraper
}

const initialStatus: ScrapingStatus = {
  type: null,
  target_site: null,
  current_page: 0,
  total_pages: null,
  pages_scraped: 0,
  listings_found: 0,
  listings_saved: 0,
  current_url: null,
  total_urls: 0,
  urls_scraped: 0,
  status: 'idle',
  auto_cycle_running: false,
  cycle_number: undefined,
  phase: undefined,
  wait_minutes: undefined,
};

const initialState: ScrapingState = {
  jiji: {
    isActive: false,
    status: { ...initialStatus, target_site: 'jiji' },
    lastUpdate: null,
  },
  kupatana: {
    isActive: false,
    status: { ...initialStatus, target_site: 'kupatana' },
    lastUpdate: null,
  },
  makazimapya: {
    isActive: false,
    status: { ...initialStatus, target_site: 'makazimapya' },
    lastUpdate: null,
  },
};

const scrapingSlice = createSlice({
  name: 'scraping',
  initialState,
  reducers: {
    updateStatus: (
      state,
      action: PayloadAction<{ site: string; status: Partial<ScrapingStatus> }>
    ) => {
      const { site, status } = action.payload;
      // Initialize site if it doesn't exist
      if (!state[site]) {
        state[site] = {
          isActive: false,
          status: { ...initialStatus, target_site: site },
          lastUpdate: null,
        };
      }
      state[site].status = { ...state[site].status, ...status };
      state[site].isActive = status.status === 'scraping' || status.status === 'running';
      state[site].lastUpdate = new Date().toISOString();
    },
    startScraping: (state, action: PayloadAction<{ site: string }>) => {
      const { site } = action.payload;
      // Initialize site if it doesn't exist
      if (!state[site]) {
        state[site] = {
          isActive: false,
          status: { ...initialStatus, target_site: site },
          lastUpdate: null,
        };
      }
      state[site].isActive = true;
      state[site].status.status = 'scraping';
    },
    stopScraping: (state, action: PayloadAction<{ site: string }>) => {
      const { site } = action.payload;
      if (state[site]) {
        state[site].status.status = 'stopped';
        state[site].isActive = false;
      }
    },
    completeScraping: (state, action: PayloadAction<{ site: string }>) => {
      const { site } = action.payload;
      if (state[site]) {
        state[site].isActive = false;
        state[site].status.status = 'completed';
      }
    },
    resetScraping: (state, action: PayloadAction<{ site: string }>) => {
      const { site } = action.payload;
      if (state[site]) {
        state[site].isActive = false;
        state[site].status = { ...initialStatus, target_site: site };
        state[site].lastUpdate = null;
      }
    },
    setFullStatus: (
      state,
      action: PayloadAction<Record<string, ScrapingStatus | null>>
    ) => {
      // Dynamically handle all scrapers
      Object.entries(action.payload).forEach(([site, status]) => {
        if (status) {
          // Initialize site if it doesn't exist
          if (!state[site]) {
            state[site] = {
              isActive: false,
              status: { ...initialStatus, target_site: site },
              lastUpdate: null,
            };
          }
          state[site].status = status;
          state[site].isActive = status.status === 'scraping' || status.status === 'running';
          state[site].lastUpdate = new Date().toISOString();
        }
      });
    },
  },
});

export const {
  updateStatus,
  startScraping,
  stopScraping,
  completeScraping,
  resetScraping,
  setFullStatus,
} = scrapingSlice.actions;

export default scrapingSlice.reducer;

