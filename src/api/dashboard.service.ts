import scraperService from './scraper.service.js';
import userService from './user.service.js';
import propertiesService from './properties.service.js';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
  };
  properties: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
    draft: number;
    sold: number;
    rented: number;
  };
  scraper: {
    totalListings: number;
    sources: Record<string, number>;
    totalAgents: number;
  };
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
}

class DashboardService {
  /**
   * Get comprehensive dashboard statistics from all services
   */
  async getStatistics(): Promise<DashboardStats> {
    try {
      // Fetch statistics from all services in parallel
      const [usersStats, propertiesStats, scraperStats] = await Promise.all([
        this.getUsersStats(),
        this.getPropertiesStats(),
        this.getScraperStats(),
      ]);

      return {
        users: usersStats,
        properties: propertiesStats,
        scraper: scraperStats,
      };
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      // Return default values on error
      return {
        users: {
          total: 0,
          active: 0,
          inactive: 0,
          verified: 0,
          unverified: 0,
        },
        properties: {
          total: 0,
          active: 0,
          pending: 0,
          rejected: 0,
          draft: 0,
          sold: 0,
          rented: 0,
        },
        scraper: {
          totalListings: 0,
          sources: {},
          totalAgents: 0,
        },
      };
    }
  }

  /**
   * Get users statistics
   */
  private async getUsersStats(): Promise<DashboardStats['users']> {
    try {
      // Fetch users with minimal data to get counts
      const [allUsers, activeUsers, verifiedUsers] = await Promise.all([
        userService.getUsers({ page: 1, limit: 1 }),
        userService.getUsers({ page: 1, limit: 1, isActive: true }),
        userService.getUsers({ page: 1, limit: 1, isEmailVerified: true }),
      ]);

      return {
        total: allUsers.data.pagination.total,
        active: activeUsers.data.pagination.total,
        inactive: allUsers.data.pagination.total - activeUsers.data.pagination.total,
        verified: verifiedUsers.data.pagination.total,
        unverified: allUsers.data.pagination.total - verifiedUsers.data.pagination.total,
      };
    } catch (error) {
      console.error('Error fetching users stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        verified: 0,
        unverified: 0,
      };
    }
  }

  /**
   * Get properties statistics
   */
  private async getPropertiesStats(): Promise<DashboardStats['properties']> {
    try {
      // Fetch properties with different statuses to get counts
      const [allProperties, activeProperties, pendingProperties, rejectedProperties] = await Promise.all([
        propertiesService.getAllProperties({ page: 1, limit: 1 }),
        propertiesService.getAllProperties({ page: 1, limit: 1, status: 'ACTIVE' }),
        propertiesService.getPendingProperties({ page: 1, limit: 1 }),
        propertiesService.getAllProperties({ page: 1, limit: 1, status: 'REJECTED' }),
      ]);

      // Get draft, sold, and rented counts
      const [draftProperties, soldProperties, rentedProperties] = await Promise.all([
        propertiesService.getAllProperties({ page: 1, limit: 1, status: 'DRAFT' }).catch(() => ({ data: { pagination: { total: 0 } } })),
        propertiesService.getAllProperties({ page: 1, limit: 1, status: 'SOLD' }).catch(() => ({ data: { pagination: { total: 0 } } })),
        propertiesService.getAllProperties({ page: 1, limit: 1, status: 'RENTED' }).catch(() => ({ data: { pagination: { total: 0 } } })),
      ]);

      return {
        total: allProperties.data.pagination.total,
        active: activeProperties.data.pagination.total,
        pending: pendingProperties.data.pagination.total,
        rejected: rejectedProperties.data.pagination.total,
        draft: draftProperties.data.pagination.total,
        sold: soldProperties.data.pagination.total,
        rented: rentedProperties.data.pagination.total,
      };
    } catch (error) {
      console.error('Error fetching properties stats:', error);
      return {
        total: 0,
        active: 0,
        pending: 0,
        rejected: 0,
        draft: 0,
        sold: 0,
        rented: 0,
      };
    }
  }

  /**
   * Get scraper statistics
   */
  private async getScraperStats(): Promise<DashboardStats['scraper']> {
    try {
      const [listingsStats, agentsResponse] = await Promise.all([
        scraperService.getStatistics(),
        scraperService.getAgents({ page: 1, limit: 1 }).catch(() => ({ total: 0 })),
      ]);

      return {
        totalListings: listingsStats.total_listings || 0,
        sources: listingsStats.sources || {},
        totalAgents: agentsResponse.total || 0,
      };
    } catch (error) {
      console.error('Error fetching scraper stats:', error);
      return {
        totalListings: 0,
        sources: {},
        totalAgents: 0,
      };
    }
  }
}

export default new DashboardService();

