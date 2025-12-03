import { useEffect } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext.js';
import { useAppDispatch } from '../hooks.js';
import { updateStatus, setFullStatus } from '../slices/scrapingSlice.js';
import type { ScrapingStatus } from '../../api/scraper.service.js';

/**
 * Hook to sync WebSocket messages with Redux store
 * Automatically updates Redux state when scraping status messages are received
 */
export const useWebSocketSync = () => {
  const { lastMessage, subscribe } = useWebSocket();
  const dispatch = useAppDispatch();

  // Subscribe to scraping status channel
  useEffect(() => {
    subscribe('scraping_status');
  }, [subscribe]);

  // Listen for messages and update Redux store
  useEffect(() => {
    if (!lastMessage) return;

    // Handle scraping status updates
    if (lastMessage.type === 'scraping_status') {
      const { target_site, data } = lastMessage;
      
      if (target_site && data) {
        const site = String(target_site).toLowerCase();
        dispatch(updateStatus({ site, status: data as ScrapingStatus }));
      }
    }

    // Handle full status updates (e.g., when reconnecting)
    if (lastMessage.type === 'full_status') {
      const statusData = lastMessage as Record<string, ScrapingStatus | null>;
      dispatch(setFullStatus(statusData));
    }
  }, [lastMessage, dispatch]);

  return { lastMessage };
};

