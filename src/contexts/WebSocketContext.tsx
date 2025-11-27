import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface WebSocketContextType {
  status: WebSocketStatus;
  connectionId: string | null;
  sendMessage: (message: WebSocketMessage) => void;
  subscribe: (channel: string) => void;
  lastMessage: WebSocketMessage | null;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  onMessage?: (message: WebSocketMessage) => void;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url,
  autoConnect = true,
  reconnectInterval = 3000,
  onMessage,
}) => {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);

  // Get WebSocket URL from environment or use default
  const getWebSocketUrl = useCallback(() => {
    if (url) return url;
    
    const apiUrl = import.meta.env.VITE_SCRAPER_API_URL?.replace('/api/v1', '') || 'http://localhost:8002';
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    return `${wsUrl}/api/v1/ws/ws${connectionId ? `?connection_id=${connectionId}` : ''}`;
  }, [url, connectionId]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setStatus('connecting');
    const wsUrl = getWebSocketUrl();
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus('connected');
        shouldReconnectRef.current = true;
        
        // Start ping interval to keep connection alive
        pingIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'ping',
              timestamp: Date.now(),
            }));
          }
        }, 30000); // Ping every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle connection message
          if (message.type === 'connection' && message.connection_id) {
            setConnectionId(message.connection_id);
            // Store connection ID in localStorage for reconnection
            localStorage.setItem('ws_connection_id', message.connection_id);
          }
          
          // Handle pong
          if (message.type === 'pong') {
            // Connection is alive
            return;
          }
          
          setLastMessage(message);
          
          // Call custom onMessage handler if provided
          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setStatus('disconnected');
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Attempt to reconnect if should reconnect
        if (shouldReconnectRef.current && autoConnect) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setStatus('error');
    }
  }, [getWebSocketUrl, autoConnect, reconnectInterval, onMessage]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  const subscribe = useCallback((channel: string) => {
    sendMessage({
      type: 'subscribe',
      channel,
    });
  }, [sendMessage]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      shouldReconnectRef.current = true;
      connect();
    }, 1000);
  }, [disconnect, connect]);

  // Initialize connection
  useEffect(() => {
    // Get stored connection ID for reconnection
    const storedConnectionId = localStorage.getItem('ws_connection_id');
    if (storedConnectionId) {
      setConnectionId(storedConnectionId);
    }

    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount

  const value: WebSocketContextType = {
    status,
    connectionId,
    sendMessage,
    subscribe,
    lastMessage,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

