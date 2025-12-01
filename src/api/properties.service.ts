import { apiClient } from './axios.js';

export interface Property {
  id: string;
  title: string;
  description?: string;
  propertyType: string;
  listingType: 'sale' | 'rent';
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SOLD' | 'RENTED';
  price: number;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  landSize?: number;
  address: string;
  district?: string;
  region?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  features?: Record<string, any>;
  ownerId: string;
  ownerType: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  views?: number;
  favorites?: number;
  inquiries?: number;
  media?: Array<{ id: string; url: string; type: string; thumbnailUrl?: string; order: number }>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  rejectionReason?: string;
}

export interface PropertyFilters {
  status?: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SOLD' | 'RENTED';
  propertyType?: string;
  listingType?: string;
  district?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'price' | 'title' | 'views' | 'favorites' | 'inquiries';
  sortOrder?: 'asc' | 'desc';
}

export interface PropertiesResponse {
  success: boolean;
  message?: string;
  data: {
    properties: Property[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface ApprovePropertyDto {
  reason?: string;
  notes?: string;
}

export interface RejectPropertyDto {
  reason: string;
  notes?: string;
}

export interface FlagPropertyDto {
  priority?: 'urgent' | 'high' | 'normal' | 'low';
}

class PropertiesService {
  private readonly API_PREFIX = '/admin';

  /**
   * Get pending properties with pagination, sorting, filtering, and search
   */
  async getPendingProperties(filters?: PropertyFilters): Promise<PropertiesResponse> {
    const params: Record<string, any> = {
      page: filters?.page || 1,
      limit: filters?.limit || 20,
      sortBy: filters?.sortBy || 'createdAt',
      sortOrder: filters?.sortOrder || 'desc',
    };

    // Add optional filters
    if (filters?.propertyType) params.propertyType = filters.propertyType;
    if (filters?.listingType) params.listingType = filters.listingType;
    if (filters?.district) params.district = filters.district;
    if (filters?.region) params.region = filters.region;
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters?.minBedrooms !== undefined) params.minBedrooms = filters.minBedrooms;
    if (filters?.search) params.search = filters.search;

    const response = await apiClient.get<PropertiesResponse>(
      `${this.API_PREFIX}/properties/pending`,
      { params }
    );
    return response.data;
  }

  /**
   * Get all properties with pagination, sorting, filtering, and search
   */
  async getAllProperties(filters?: PropertyFilters): Promise<PropertiesResponse> {
    const params: Record<string, any> = {
      page: filters?.page || 1,
      limit: filters?.limit || 20,
      sortBy: filters?.sortBy || 'createdAt',
      sortOrder: filters?.sortOrder || 'desc',
    };

    // Add optional filters
    if (filters?.status) params.status = filters.status;
    if (filters?.propertyType) params.propertyType = filters.propertyType;
    if (filters?.listingType) params.listingType = filters.listingType;
    if (filters?.district) params.district = filters.district;
    if (filters?.region) params.region = filters.region;
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters?.minBedrooms !== undefined) params.minBedrooms = filters.minBedrooms;
    if (filters?.search) params.search = filters.search;

    const response = await apiClient.get<PropertiesResponse>(
      `${this.API_PREFIX}/properties/all`,
      { params }
    );
    return response.data;
  }

  /**
   * Approve a property
   */
  async approveProperty(id: string, data?: ApprovePropertyDto): Promise<{ success: boolean; message: string; data: Property }> {
    const response = await apiClient.post(
      `${this.API_PREFIX}/properties/${id}/approve`,
      data || {}
    );
    return response.data;
  }

  /**
   * Reject a property
   */
  async rejectProperty(id: string, data: RejectPropertyDto): Promise<{ success: boolean; message: string; data: Property }> {
    const response = await apiClient.post(
      `${this.API_PREFIX}/properties/${id}/reject`,
      data
    );
    return response.data;
  }

  /**
   * Flag a property for review
   */
  async flagProperty(id: string, data?: FlagPropertyDto): Promise<{ success: boolean; message: string; data: any }> {
    const response = await apiClient.post(
      `${this.API_PREFIX}/properties/${id}/flag`,
      data || {}
    );
    return response.data;
  }

  /**
   * Get moderation queue
   */
  async getModerationQueue(filters?: {
    status?: string;
    itemType?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get(
      `${this.API_PREFIX}/moderation/queue`,
      {
        params: filters,
      }
    );
    return response.data;
  }

  /**
   * Get admin logs
   */
  async getAdminLogs(filters?: {
    adminId?: string;
    action?: string;
    targetType?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get(
      `${this.API_PREFIX}/logs`,
      {
        params: filters,
      }
    );
    return response.data;
  }

  /**
   * Get a single property by ID
   * Note: This calls the inventory management service directly (bypassing admin service)
   */
  async getPropertyById(id: string): Promise<{ success: boolean; message?: string; data: Property }> {
    // Get the base URL and construct inventory service URL
    // Replace admin service port with inventory service port (3008)
    
    // Call inventory management service directly with credentials
    const response = await apiClient.get(
      `${this.API_PREFIX}/properties/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }),
        },
        withCredentials: true, // REQUIRED: Send cookies in cross-origin requests
      }
    );
    return response.data;
  }

  /**
   * Detect if a property is a potential scam using AI
   */
  async detectScam(id: string): Promise<{
    success: boolean;
    message?: string;
    data: {
      isScam: boolean;
      confidence: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      reasons: string[];
      riskFactors: Array<{
        factor: string;
        score: number;
        reasoning: string;
      }>;
      recommendation: 'approve' | 'review' | 'reject';
      timestamp: string;
      listingId?: string;
    };
  }> {
    const response = await apiClient.post(
      `${this.API_PREFIX}/properties/${id}/scam-detection`
    );
    return response.data;
  }
}

export default new PropertiesService();

