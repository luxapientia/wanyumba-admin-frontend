import { apiClient } from './axios.js';

export interface LawyerProfile {
  id: string;
  userId: string;
  professionalTitle?: string;
  firmName?: string;
  bio?: string;
  shortBio?: string;
  yearsOfExperience?: number;
  professionalPhoto?: string;
  idCardOrPassport?: string;
  gallery?: string[];
  languages?: string[];
  education?: unknown;
  certifications?: unknown;
  licenseNumber?: string;
  licenseIssuer?: string;
  licenseExpiryDate?: string;
  professionalMemberships?: unknown;
  awards?: unknown;
  publications?: unknown;
  services?: unknown;
  specializations?: string[];
  practiceAreas?: unknown;
  serviceAreas?: string[];
  consultationTypes?: string[];
  responseTime?: string;
  availability?: string;
  officeName?: string;
  officeAddress?: string;
  officeLatitude?: number;
  officeLongitude?: number;
  businessPhone?: string;
  businessPhoneAlt?: string;
  businessEmail?: string;
  businessEmailAlt?: string;
  website?: string;
  workingHours?: unknown;
  timezone?: string;
  emergencyContact?: unknown;
  socialMedia?: unknown;
  onlineReviews?: unknown;
  pricing?: unknown;
  paymentMethods?: string[];
  acceptsInsurance?: boolean;
  freeConsultation?: boolean;
  consultationFee?: number;
  currency?: string;
  caseStudies?: unknown;
  notableCases?: unknown;
  successRate?: number;
  casesHandled?: number;
  testimonials?: unknown;
  averageRating?: number;
  totalReviews?: number;
  isSoloPractitioner?: boolean;
  firmSize?: number;
  teamMembers?: unknown;
  isVerified?: boolean;
  verifiedAt?: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED';
  publishedAt?: string;
  unpublishedAt?: string;
  rejectionReason?: string;
  moderationNotes?: string;
  views?: number;
  inquiries?: number;
  profileCompleteness?: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export interface ValuerProfile {
  id: string;
  userId: string;
  professionalTitle?: string;
  companyName?: string;
  bio?: string;
  shortBio?: string;
  yearsOfExperience?: number;
  professionalPhoto?: string;
  idCardOrPassport?: string;
  gallery?: string[];
  languages?: string[];
  education?: unknown;
  certifications?: unknown;
  licenseNumber?: string;
  licenseIssuer?: string;
  licenseExpiryDate?: string;
  professionalMemberships?: unknown;
  awards?: unknown;
  publications?: unknown;
  services?: unknown;
  specializations?: string[];
  propertyTypes?: string[];
  valuationMethods?: string[];
  serviceAreas?: string[];
  consultationTypes?: string[];
  responseTime?: string;
  availability?: string;
  officeName?: string;
  officeAddress?: string;
  officeLatitude?: number;
  officeLongitude?: number;
  businessPhone?: string;
  businessPhoneAlt?: string;
  businessEmail?: string;
  businessEmailAlt?: string;
  website?: string;
  workingHours?: unknown;
  timezone?: string;
  emergencyContact?: unknown;
  socialMedia?: unknown;
  onlineReviews?: unknown;
  pricing?: unknown;
  paymentMethods?: string[];
  acceptsInsurance?: boolean;
  freeConsultation?: boolean;
  consultationFee?: number;
  currency?: string;
  valuationReports?: unknown;
  portfolio?: unknown;
  marketAnalysis?: unknown;
  propertiesValuated?: number;
  averageAccuracy?: number;
  averageTurnaroundTime?: string;
  successRate?: number;
  testimonials?: unknown;
  averageRating?: number;
  totalReviews?: number;
  companySize?: number;
  teamMembers?: unknown;
  isVerified?: boolean;
  verifiedAt?: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED';
  publishedAt?: string;
  unpublishedAt?: string;
  rejectionReason?: string;
  moderationNotes?: string;
  views?: number;
  inquiries?: number;
  profileCompleteness?: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export interface LawyerProfilesResponse {
  success: boolean;
  message?: string;
  data: {
    profiles: LawyerProfile[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ValuerProfilesResponse {
  success: boolean;
  message?: string;
  data: {
    profiles: ValuerProfile[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ProfessionalProfilesFilters {
  status?: string;
  specialization?: string;
  propertyType?: string;
  valuationMethod?: string;
  search?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class ProfessionalProfilesService {
  private readonly API_PREFIX = '/admin/professional-profiles';

  /**
   * Get all lawyer profiles with pagination, filtering, sorting, and search
   */
  async getLawyerProfiles(filters?: ProfessionalProfilesFilters): Promise<LawyerProfilesResponse> {
    const params: Record<string, any> = {
      page: filters?.page || 1,
      limit: filters?.limit || 20,
      sortBy: filters?.sortBy || 'createdAt',
      sortOrder: filters?.sortOrder || 'desc',
    };

    if (filters?.status) params.status = filters.status;
    if (filters?.specialization) params.specialization = filters.specialization;
    if (filters?.search) params.search = filters.search;
    if (filters?.isVerified !== undefined) params.isVerified = filters.isVerified;

    const response = await apiClient.get<LawyerProfilesResponse>(`${this.API_PREFIX}/lawyer`, { params });
    return response.data;
  }

  /**
   * Get all valuer profiles with pagination, filtering, sorting, and search
   */
  async getValuerProfiles(filters?: ProfessionalProfilesFilters): Promise<ValuerProfilesResponse> {
    const params: Record<string, any> = {
      page: filters?.page || 1,
      limit: filters?.limit || 20,
      sortBy: filters?.sortBy || 'createdAt',
      sortOrder: filters?.sortOrder || 'desc',
    };

    if (filters?.status) params.status = filters.status;
    if (filters?.specialization) params.specialization = filters.specialization;
    if (filters?.propertyType) params.propertyType = filters.propertyType;
    if (filters?.valuationMethod) params.valuationMethod = filters.valuationMethod;
    if (filters?.search) params.search = filters.search;
    if (filters?.isVerified !== undefined) params.isVerified = filters.isVerified;

    const response = await apiClient.get<ValuerProfilesResponse>(`${this.API_PREFIX}/valuer`, { params });
    return response.data;
  }

  /**
   * Get a single lawyer profile by ID
   */
  async getLawyerProfileById(id: string): Promise<{ success: boolean; message?: string; data: LawyerProfile }> {
    const response = await apiClient.get<{ success: boolean; message?: string; data: LawyerProfile }>(
      `${this.API_PREFIX}/lawyer/${id}`
    );
    return response.data;
  }

  /**
   * Get a single valuer profile by ID
   */
  async getValuerProfileById(id: string): Promise<{ success: boolean; message?: string; data: ValuerProfile }> {
    const response = await apiClient.get<{ success: boolean; message?: string; data: ValuerProfile }>(
      `${this.API_PREFIX}/valuer/${id}`
    );
    return response.data;
  }

  /**
   * Approve a lawyer profile
   */
  async approveLawyerProfile(id: string): Promise<{ success: boolean; message?: string; data: LawyerProfile }> {
    const response = await apiClient.post<{ success: boolean; message?: string; data: LawyerProfile }>(
      `${this.API_PREFIX}/lawyer/${id}/approve`
    );
    return response.data;
  }

  /**
   * Reject a lawyer profile
   */
  async rejectLawyerProfile(
    id: string,
    rejectionReason: string,
    moderationNotes?: string
  ): Promise<{ success: boolean; message?: string; data: LawyerProfile }> {
    const response = await apiClient.post<{ success: boolean; message?: string; data: LawyerProfile }>(
      `${this.API_PREFIX}/lawyer/${id}/reject`,
      { rejectionReason, moderationNotes }
    );
    return response.data;
  }

  /**
   * Approve a valuer profile
   */
  async approveValuerProfile(id: string): Promise<{ success: boolean; message?: string; data: ValuerProfile }> {
    const response = await apiClient.post<{ success: boolean; message?: string; data: ValuerProfile }>(
      `${this.API_PREFIX}/valuer/${id}/approve`
    );
    return response.data;
  }

  /**
   * Reject a valuer profile
   */
  async rejectValuerProfile(
    id: string,
    rejectionReason: string,
    moderationNotes?: string
  ): Promise<{ success: boolean; message?: string; data: ValuerProfile }> {
    const response = await apiClient.post<{ success: boolean; message?: string; data: ValuerProfile }>(
      `${this.API_PREFIX}/valuer/${id}/reject`,
      { rejectionReason, moderationNotes }
    );
    return response.data;
  }
}

export default new ProfessionalProfilesService();

