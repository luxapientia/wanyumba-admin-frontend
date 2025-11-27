import { useEffect } from 'react';
import { useWebSocketSync } from '../store/hooks/useWebSocketSync.js';
import { useAppDispatch } from '../store/hooks.js';
import { setFullStatus } from '../store/slices/scrapingSlice.js';
import { scraperService } from '../api/index.js';

/**
 * Component to sync Redux store with WebSocket and fetch initial status
 * This component doesn't render anything, it just sets up the sync
 */
export const ReduxSync = () => {
  const dispatch = useAppDispatch();
  
  // Setup WebSocket sync
  useWebSocketSync();

  // Fetch initial scraping status on mount
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const status = await scraperService.getStatus();
        // Convert status to the format expected by setFullStatus
        dispatch(setFullStatus(status));
      } catch (error) {
        console.error('Failed to fetch initial scraping status:', error);
      }
    };

    fetchInitialStatus();
  }, [dispatch]);

  return null;
};

