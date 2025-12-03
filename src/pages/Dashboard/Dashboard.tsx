import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Database, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle, 
  ArrowUpRight,
  Zap,
  FileText,
  Home,
  Bot,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Button from '../../components/UI/Button.js';
import { StatCard } from '../../components/UI/index.js';
import { dashboardService } from '../../api/index.js';
import type { DashboardStats } from '../../api/index.js';
import { useToast } from '../../contexts/index.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await dashboardService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showError('Error', 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    fetchStats(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Failed to load dashboard data</p>
          <Button onClick={handleRefresh} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Calculate totals for display
  const totalUsers = stats.users.total;
  const totalProperties = stats.properties.total;
  const totalScrapedListings = stats.scraper.totalListings;
  const pendingApprovals = stats.properties.pending;

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-2"
              >
                Dashboard Overview
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 text-sm sm:text-base"
              >
                Monitor and manage your platform in real-time
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="flex items-center gap-3"
            >
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="secondary"
                leftIcon={<RefreshCw className={refreshing ? 'animate-spin' : ''} />}
              >
                Refresh
              </Button>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                </motion.div>
                <span className="text-sm font-semibold text-indigo-900">System Operational</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          {/* Total Users */}
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Users"
              value={formatNumber(totalUsers)}
              icon={Users}
              color="blue"
              loading={loading}
            />
          </motion.div>

          {/* Total Properties */}
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Properties"
              value={formatNumber(totalProperties)}
              icon={Database}
              color="green"
              loading={loading}
            />
          </motion.div>

          {/* Pending Approvals */}
          <motion.div variants={itemVariants}>
            <StatCard
              title="Pending Approvals"
              value={formatNumber(pendingApprovals)}
              icon={AlertCircle}
              color="orange"
              loading={loading}
            />
          </motion.div>

          {/* Scraped Listings */}
          <motion.div variants={itemVariants}>
            <StatCard
              title="Scraped Listings"
              value={formatNumber(totalScrapedListings)}
              icon={TrendingUp}
              color="purple"
              loading={loading}
            />
          </motion.div>
        </motion.div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Users Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Users</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Active Users</span>
                <span className="text-lg font-bold text-blue-600">{formatNumber(stats.users.active)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Inactive Users</span>
                <span className="text-lg font-bold text-gray-600">{formatNumber(stats.users.inactive)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Verified</span>
                <span className="text-lg font-bold text-green-600">{formatNumber(stats.users.verified)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Unverified</span>
                <span className="text-lg font-bold text-amber-600">{formatNumber(stats.users.unverified)}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              fullWidth
              className="mt-4"
              onClick={() => navigate('/users')}
            >
              <div className="flex items-center gap-2 w-full">
                <span>View All Users</span>
                <ArrowUpRight size={16} className="ml-auto" />
              </div>
            </Button>
          </motion.div>

          {/* Properties Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Home className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Properties</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Active</span>
                <span className="text-lg font-bold text-green-600">{formatNumber(stats.properties.active)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Pending</span>
                <span className="text-lg font-bold text-amber-600">{formatNumber(stats.properties.pending)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Rejected</span>
                <span className="text-lg font-bold text-red-600">{formatNumber(stats.properties.rejected)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Draft</span>
                <span className="text-lg font-bold text-gray-600">{formatNumber(stats.properties.draft)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Sold/Rented</span>
                <span className="text-lg font-bold text-purple-600">
                  {formatNumber(stats.properties.sold + stats.properties.rented)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/properties/pending')}
              >
                <div className="flex items-center gap-2 w-full">
                  <span>Pending</span>
                  <ArrowUpRight size={16} className="ml-auto" />
                </div>
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/properties/all')}
              >
                <div className="flex items-center gap-2 w-full">
                  <span>All Properties</span>
                  <ArrowUpRight size={16} className="ml-auto" />
                </div>
              </Button>
            </div>
          </motion.div>

          {/* Scraper Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Scraper</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total Listings</span>
                <span className="text-lg font-bold text-purple-600">{formatNumber(stats.scraper.totalListings)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total Agents</span>
                <span className="text-lg font-bold text-blue-600">{formatNumber(stats.scraper.totalAgents)}</span>
              </div>
              {/* Source breakdown */}
              {Object.keys(stats.scraper.sources).length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">By Source</p>
                  <div className="space-y-2">
                    {Object.entries(stats.scraper.sources).map(([source, count], index) => {
                      const colorMap: Record<number, string> = {
                        0: 'text-orange-600',
                        1: 'text-teal-600',
                        2: 'text-green-600',
                        3: 'text-blue-600',
                        4: 'text-purple-600',
                      };
                      const colorClass = colorMap[index % 5] || 'text-gray-600';
                      const formattedName = source
                        .split(/[-_]/)
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                      
                      return (
                        <div key={source} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-xs font-medium text-gray-600">{formattedName}</span>
                          <span className={`text-sm font-bold ${colorClass}`}>{formatNumber(count)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/scraper/scrape')}
              >
                <div className="flex items-center gap-2 w-full">
                  <span>Scrape Control</span>
                  <ArrowUpRight size={16} className="ml-auto" />
                </div>
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/scraper/listings')}
              >
                <div className="flex items-center gap-2 w-full">
                  <span>Listings</span>
                  <ArrowUpRight size={16} className="ml-auto" />
                </div>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="ghost"
              fullWidth
              className="text-left px-4 py-4 bg-indigo-50 hover:bg-indigo-100 justify-start group"
              onClick={() => navigate('/users')}
            >
              <div className="flex items-center gap-3 w-full">
                <Users className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-indigo-900 mb-0.5">Manage Users</p>
                  <p className="text-xs text-indigo-600">View and edit user accounts</p>
                </div>
                <ArrowUpRight size={16} className="text-indigo-600 flex-shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </Button>

            <Button
              variant="ghost"
              fullWidth
              className="text-left px-4 py-4 bg-purple-50 hover:bg-purple-100 justify-start group"
              onClick={() => navigate('/properties/pending')}
            >
              <div className="flex items-center gap-3 w-full">
                <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-purple-900 mb-0.5">Review Properties</p>
                  <p className="text-xs text-purple-600">Approve or reject listings</p>
                </div>
                <ArrowUpRight size={16} className="text-purple-600 flex-shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </Button>

            <Button
              variant="ghost"
              fullWidth
              className="text-left px-4 py-4 bg-green-50 hover:bg-green-100 justify-start group"
              onClick={() => navigate('/scraper/scrape')}
            >
              <div className="flex items-center gap-3 w-full">
                <Bot className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-green-900 mb-0.5">Scrape Control</p>
                  <p className="text-xs text-green-600">Manage scraping operations</p>
                </div>
                <ArrowUpRight size={16} className="text-green-600 flex-shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </Button>

            <Button
              variant="ghost"
              fullWidth
              className="text-left px-4 py-4 bg-blue-50 hover:bg-blue-100 justify-start group"
              onClick={() => navigate('/scraper/listings')}
            >
              <div className="flex items-center gap-3 w-full">
                <Database className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-blue-900 mb-0.5">View Listings</p>
                  <p className="text-xs text-blue-600">Browse scraped properties</p>
                </div>
                <ArrowUpRight size={16} className="text-blue-600 flex-shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
