import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  RefreshCw,
  ArrowUpDown,
  Briefcase,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { fetchLawyerProfiles } from '../../store/thunks/professionalProfilesThunks.js';
import {
  setPage,
  setLimit,
  setFilters,
  setSorting,
  setSearch,
  clearFilters,
} from '../../store/slices/lawyerProfilesSlice.js';
import Button from '../../components/UI/Button.js';
import { Pagination } from '../../components/UI/index.js';
import type { LawyerProfile } from '../../api/index.js';

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
    PENDING_REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Review' },
    PUBLISHED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Published' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
    SUSPENDED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Suspended' },
  };
  const config = statusConfig[status] || statusConfig.DRAFT;
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default function Lawyers() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { 
    items: profiles, 
    total, 
    page, 
    limit, 
    pages, 
    loading, 
    error, 
    filters, 
    sortBy, 
    sortOrder, 
    search,
  } = useAppSelector((state) => state.lawyerProfiles);

  const [searchInput, setSearchInput] = useState('');

  // Sync search input with Redux search
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch profiles when filters, pagination, or sorting changes
  useEffect(() => {
    const fetchFilters = {
      ...filters,
      page,
      limit,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
      search: search || undefined,
    };

    dispatch(fetchLawyerProfiles(fetchFilters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, limit, sortBy, sortOrder, filters.status, filters.specialization, filters.isVerified, search]);

  const handleSearch = () => {
    dispatch(setSearch(searchInput));
  };

  const handleRefresh = () => {
    dispatch(clearFilters());
    setSearchInput('');
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(setLimit(newLimit));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchInput('');
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(setSorting({ sortBy: field, sortOrder: newOrder }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-purple-600" />
              Lawyer Profiles
            </h1>
            <p className="text-gray-600 mt-2">Manage and review lawyer professional profiles</p>
          </div>
          <Button onClick={handleRefresh} leftIcon={<RefreshCw size={18} />} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-600">Total Profiles</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {profiles.filter(p => p.status === 'PUBLISHED').length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {profiles.filter(p => p.status === 'PENDING_REVIEW').length}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {profiles.filter(p => p.isVerified).length}
            </div>
            <div className="text-sm text-gray-600">Verified</div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6 mb-6"
      >
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name, firm, email, specialization..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            />
          </div>
          <Button onClick={handleSearch} leftIcon={<Search size={18} />}>
            Search
          </Button>
        </div>

        {/* Filters Panel */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => dispatch(setFilters({ status: e.target.value || undefined }))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="PUBLISHED">Published</option>
                <option value="REJECTED">Rejected</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Specialization Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
              <input
                type="text"
                placeholder="e.g., Corporate Law"
                value={filters.specialization || ''}
                onChange={(e) => dispatch(setFilters({ specialization: e.target.value || undefined }))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Verified Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
              <select
                value={filters.isVerified === undefined ? '' : filters.isVerified ? 'true' : 'false'}
                onChange={(e) => dispatch(setFilters({ isVerified: e.target.value === '' ? undefined : e.target.value === 'true' }))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleClearFilters} variant="ghost" size="sm">
              Clear Filters
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Profiles Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden"
      >
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-purple-50/30 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Lawyer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Firm/Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Specializations
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-colors"
                    onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    <ArrowUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-colors"
                    onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Created
                    <ArrowUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw size={20} className="animate-spin text-purple-600" />
                      <p className="text-gray-500">Loading profiles...</p>
                    </div>
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Briefcase size={48} className="text-gray-300" />
                      <p className="text-gray-500 font-medium">No lawyer profiles found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your filters or search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                profiles.map((profile: LawyerProfile) => (
                  <motion.tr
                    key={profile.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Lawyer Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {profile.professionalPhoto ? (
                            <img
                              src={profile.professionalPhoto}
                              alt={profile.professionalTitle || 'Lawyer'}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-2 ring-gray-200">
                              <span className="text-white font-semibold text-sm">
                                {(profile.user?.firstName?.[0] || profile.user?.email?.[0] || 'L').toUpperCase()}
                              </span>
                            </div>
                          )}
                          {profile.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <CheckCircle size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {profile.user?.firstName || profile.user?.lastName
                              ? `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim()
                              : profile.user?.email?.split('@')[0] || 'Unknown'}
                          </div>
                          {profile.professionalTitle && (
                            <div className="text-xs text-gray-500">{profile.professionalTitle}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Firm/Title */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {profile.firmName || '-'}
                      </div>
                      {profile.yearsOfExperience && (
                        <div className="text-xs text-gray-500">
                          {profile.yearsOfExperience} years experience
                        </div>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {profile.businessEmail && (
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Mail size={12} className="text-gray-400" />
                            <span className="truncate max-w-[150px]">{profile.businessEmail}</span>
                          </div>
                        )}
                        {profile.businessPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Phone size={12} className="text-gray-400" />
                            {profile.businessPhone}
                          </div>
                        )}
                        {!profile.businessEmail && !profile.businessPhone && (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Specializations */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {profile.specializations && profile.specializations.length > 0 ? (
                          profile.specializations.slice(0, 2).map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-semibold rounded-md bg-purple-100 text-purple-700 border border-purple-200"
                            >
                              {spec}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                        {profile.specializations && profile.specializations.length > 2 && (
                          <span className="text-xs text-gray-500">+{profile.specializations.length - 2}</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(profile.status)}
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        {formatDate(profile.createdAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        onClick={() => navigate(`/professional-profiles/lawyers/${profile.id}`)}
                        size="sm"
                        variant="ghost"
                        leftIcon={<Eye size={14} />}
                      >
                        View
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && profiles.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={page}
              totalPages={pages}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
