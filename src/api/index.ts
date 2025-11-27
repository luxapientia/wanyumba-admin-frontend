export { default as apiClient } from './axios.js';
export { default as propertiesService } from './properties.service.js';
export { default as userService } from './user.service.js';
export { default as scraperService } from './scraper.service.js';
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
  Role,
  RolesResponse,
  ChangePasswordDto,
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

