export { default as apiClient } from './axios.js';
export { default as propertiesService } from './properties.service.js';
export { default as userService } from './user.service.js';
export { default as scraperService } from './scraper.service.js';
export { default as dashboardService } from './dashboard.service.js';
export { default as professionalProfilesService } from './professional-profiles.service.js';
export type {
  Property,
  PropertyFilters,
  PropertiesResponse,
  ApprovePropertyDto,
  RejectPropertyDto,
  FlagPropertyDto,
} from './properties.service.js';
export type { 
  User, 
  UserResponse, 
  UsersResponse, 
  UserFilters, 
  CreateUserDto, 
  UpdateUserDto,
} from './user.service.js';
export type {
  // Scraping Types
  ApiResponse,
  ScrapeAllRequest,
  ScrapeSelectedRequest,
  StopScrapingRequest,
  AutoCycleRequest,
  ScrapingStatus,
  ScrapingStatusResponse,
  // Agent Types
  Agent,
  AgentsParams,
  AgentsResponse,
  // Listing Types
  Listing,
  ListingsParams,
  ListingsResponse,
  StatisticsResponse,
  // Health Types
  ScraperStatus,
  HealthResponse,
} from './scraper.service.js';
export type {
  DashboardStats,
  DashboardResponse,
} from './dashboard.service.js';
export type {
  LawyerProfile,
  ValuerProfile,
  LawyerProfilesResponse,
  ValuerProfilesResponse,
  ProfessionalProfilesFilters,
} from './professional-profiles.service.js';

