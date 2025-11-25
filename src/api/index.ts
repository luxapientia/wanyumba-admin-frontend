export { default as apiClient } from './axios.js';
export { default as propertiesService } from './properties.service.js';
export { default as userService } from './user.service.js';
export type {
  Property,
  PropertyFilters,
  PropertiesResponse,
  ApprovePropertyDto,
  RejectPropertyDto,
  FlagPropertyDto,
} from './properties.service.js';
export type { User, UserResponse } from './user.service.js';

