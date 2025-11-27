import axios from 'axios';

// Scraper API base URL - different from admin microservice
const SCRAPER_API_BASE_URL = import.meta.env.VITE_SCRAPER_API_URL || 'http://localhost:8002/api/v1';

// Create axios instance for scraper API
const scraperApiClient = axios.create({
  baseURL: SCRAPER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds for long-running scrapes
  withCredentials: true, // Send cookies for authentication
});

// Request interceptor
scraperApiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
scraperApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      const WANYUMBA_FRONTEND_URL = import.meta.env.VITE_WANYUMBA_FRONTEND_URL || 'http://localhost:3000';
      window.location.href = `${WANYUMBA_FRONTEND_URL}/auth/login`;
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// TYPES
// ============================================================================

// Scraping Types
export interface ApiResponse<T = any> {
  status: string;
  message: string;
  target_site?: string;
  count?: number;
  data?: T;
  urls_count?: number;
  success_count?: number;
}

export interface ScrapeAllRequest {
  target_site: string;
  max_pages?: number | null;
  save_to_db?: boolean;
}

export interface ScrapeSelectedRequest {
  urls: string[];
  target_site: string;
  save_to_db?: boolean;
}

export interface StopScrapingRequest {
  target_site: string;
}

export interface AutoCycleRequest {
  target_site: string;
  max_pages?: number | null;
  cycle_delay_minutes?: number;
  headless?: boolean;
}

export interface ScrapingStatus {
  type: 'listings' | 'details' | 'auto_cycle' | null;
  target_site: string | null;
  current_page: number;
  total_pages: number | null;
  pages_scraped: number;
  listings_found: number;
  listings_saved: number;
  current_url: string | null;
  total_urls: number;
  urls_scraped: number;
  status: 'idle' | 'scraping' | 'completed' | 'error' | 'stopped' | 'running' | 'waiting';
  auto_cycle_running?: boolean;
  cycle_number?: number;
  phase?: 'basic_listings' | 'details' | 'waiting';
  wait_minutes?: number;
}

export interface ScrapingStatusResponse {
  [scraperId: string]: ScrapingStatus | null;
}

// Agent Types
export interface Agent {
  id: number;
  name: string | null;
  phone: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AgentsResponse {
  agents: Agent[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Listing Types
export interface Listing {
  rawUrl: string;
  source: string; // Dynamic source - can be any scraper
  sourceListingId?: string;
  scrapeTimestamp?: string;
  title: string;
  description?: string;
  propertyType?: string;
  listingType?: 'rent' | 'sale';
  status?: 'active' | 'inactive' | 'unknown';
  price?: number;
  priceCurrency?: string;
  pricePeriod?: string;
  country?: string;
  region?: string;
  city?: string;
  district?: string;
  addressText?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  livingAreaSqm?: number;
  landAreaSqm?: number;
  images?: string[];
  agentName?: string;
  agentPhone?: string;
  agentWhatsapp?: string;
  agentEmail?: string;
  agentWebsite?: string;
  agentProfileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListingsParams {
  page?: number;
  limit?: number;
  source?: string; // Dynamic source - can be any scraper or 'all'
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  propertyType?: string;
  listingType?: 'rent' | 'sale';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  city?: string;
  region?: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatisticsResponse {
  total_listings: number;
  sources: Record<string, number>; // Dynamic per-source counts
  last_updated: string;
}

// Health Types
export interface ScraperStatus {
  jiji: string;
  kupatana: string;
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  docs: string;
  health: string;
  scrapers: ScraperStatus;
}

// ============================================================================
// SCRAPER SERVICE
// ============================================================================

class ScraperService {
  // ============================================================================
  // SCRAPING OPERATIONS
  // ============================================================================

  /**
   * Scrape all listings from a site (basic info: url, title, price)
   * This runs in the background by default
   */
  async scrapeAllListings(data: ScrapeAllRequest): Promise<ApiResponse> {
    const response = await scraperApiClient.post<ApiResponse>('/scraping/scrape-listings', data);
    return response.data;
  }

  /**
   * Scrape detailed information for specific URLs
   * This extracts full property details including images, contact info, etc.
   */
  async scrapeDetailed(data: ScrapeSelectedRequest): Promise<ApiResponse> {
    const response = await scraperApiClient.post<ApiResponse>('/scraping/scrape-detailed', data);
    return response.data;
  }

  /**
   * Scrape all listings with full details
   * This is a two-step process:
   * 1. Scrape all listing URLs (basic info)
   * 2. Scrape detailed data for each URL
   *
   * Warning: This can take a very long time!
   */
  async scrapeAllDetailed(data: ScrapeAllRequest): Promise<ApiResponse> {
    const response = await scraperApiClient.post<ApiResponse>('/scraping/scrape-all-detailed', data);
    return response.data;
  }

  /**
   * Scrape detailed data for all existing listings in the database
   * This will fetch all URLs from the database and scrape their details
   */
  async scrapeAllDetails(data: ScrapeAllRequest): Promise<ApiResponse> {
    const response = await scraperApiClient.post<ApiResponse>('/scraping/scrape-all-details', data);
    return response.data;
  }

  /**
   * Stop the current scraping operation for a specific site
   * The scraper will stop gracefully after completing the current page
   * This also stops auto cycle if it's running
   */
  async stopScraping(data: StopScrapingRequest): Promise<ApiResponse> {
    const response = await scraperApiClient.post<ApiResponse>('/scraping/stop-scraping', data);
    return response.data;
  }

  /**
   * Start automatic scraping cycle
   * The cycle will continuously:
   * 1. Scrape basic listings
   * 2. Scrape details for listings without agent info
   * 3. Wait for specified delay
   * 4. Repeat
   */
  async startAutoCycle(data: AutoCycleRequest): Promise<ApiResponse> {
    const response = await scraperApiClient.post<ApiResponse>('/scraping/start-auto-cycle', data);
    return response.data;
  }

  /**
   * Get the current scraping status for all scrapers
   * Returns the status of all available scrapers
   * Includes auto cycle status
   */
  async getStatus(): Promise<ScrapingStatusResponse> {
    const response = await scraperApiClient.get<ScrapingStatusResponse>('/scraping/status');
    return response.data;
  }

  // ============================================================================
  // AGENT OPERATIONS
  // ============================================================================

  /**
   * Get agents with pagination, filtering, and sorting
   */
  async getAgents(params: AgentsParams = {}): Promise<AgentsResponse> {
    const response = await scraperApiClient.get<AgentsResponse>('/agents', { params });
    return response.data;
  }

  /**
   * Get a single agent by ID
   */
  async getAgentById(id: number): Promise<Agent> {
    const response = await scraperApiClient.get<Agent>(`/agents/${id}`);
    return response.data;
  }

  /**
   * Delete an agent
   */
  async deleteAgent(id: number): Promise<void> {
    await scraperApiClient.delete(`/agents/${id}`);
  }

  /**
   * Get listings for a specific agent
   */
  async getAgentListings(agentId: number, params: AgentsParams = {}): Promise<any> {
    const response = await scraperApiClient.get(`/agents/${agentId}/listings`, { params });
    return response.data;
  }

  // ============================================================================
  // LISTING OPERATIONS
  // ============================================================================

  /**
   * Get listings with pagination, filtering, and sorting
   */
  async getListings(params: ListingsParams = {}): Promise<ListingsResponse> {
    const response = await scraperApiClient.get<ListingsResponse>('/listings', { params });
    return response.data;
  }

  /**
   * Get a single listing by URL
   */
  async getListing(url: string): Promise<Listing> {
    const response = await scraperApiClient.get<Listing>(`/listings/${encodeURIComponent(url)}`);
    return response.data;
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<StatisticsResponse> {
    const response = await scraperApiClient.get<StatisticsResponse>('/listings/statistics');
    return response.data;
  }

  /**
   * Search listings
   */
  async searchListings(query: string, limit: number = 50): Promise<Listing[]> {
    const response = await scraperApiClient.get<Listing[]>('/listings/search', {
      params: { q: query, limit },
    });
    return response.data;
  }

  /**
   * Delete a listing
   */
  async deleteListing(url: string): Promise<void> {
    await scraperApiClient.delete(`/listings/${encodeURIComponent(url)}`);
  }

  /**
   * Get all unique property types
   */
  async getPropertyTypes(): Promise<string[]> {
    const response = await scraperApiClient.get<string[]>('/listings/property-types');
    return response.data;
  }

  // ============================================================================
  // HEALTH OPERATIONS
  // ============================================================================

  /**
   * Check if the API is healthy
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await scraperApiClient.get('/health');
    return response.data;
  }

  /**
   * Get scraper status
   * Returns the status of Jiji and Kupatana scrapers
   */
  async getScraperStatus(): Promise<ScraperStatus> {
    const baseURL = import.meta.env.VITE_SCRAPER_API_URL?.replace('/api/v1', '') || 'http://localhost:8002';
    const response = await axios.get<HealthResponse>('/', {
      baseURL,
      withCredentials: true,
    });
    return response.data.scrapers;
  }

  /**
   * Get full system info
   */
  async getSystemInfo(): Promise<HealthResponse> {
    const baseURL = import.meta.env.VITE_SCRAPER_API_URL?.replace('/api/v1', '') || 'http://localhost:8002';
    const response = await axios.get<HealthResponse>('/', {
      baseURL,
      withCredentials: true,
    });
    return response.data;
  }

  /**
   * Test connection to backend
   * Returns true if backend is reachable
   */
  async testConnection(): Promise<boolean> {
    try {
      await scraperApiClient.get('/health', { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}

export default new ScraperService();

