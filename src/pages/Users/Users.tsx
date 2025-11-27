import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  RefreshCw,
  ArrowUpDown,
  UserPlus,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { fetchUsers, updateUser } from '../../store/thunks/usersThunks.js';
import {
  setPage,
  setLimit,
  setFilters,
  setSorting,
  setSearch,
  clearFilters,
} from '../../store/slices/usersSlice.js';
import Button from '../../components/UI/Button.js';
import { Pagination } from '../../components/UI/index.js';
import { useToast } from '../../contexts/index.js';
import type { User } from '../../api/index.js';

export default function Users() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { 
    items: users, 
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
  } = useAppSelector((state) => state.users);

  const [searchInput, setSearchInput] = useState('');
  const [togglingUsers, setTogglingUsers] = useState<Set<string>>(new Set());

  // Sync search input with Redux search
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch users when filters, pagination, or sorting changes
  useEffect(() => {
    const fetchFilters = {
      ...filters,
      page,
      limit,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
      search: search || undefined,
    };

    dispatch(fetchUsers(fetchFilters));
  }, [dispatch, page, limit, sortBy, sortOrder, filters.role, filters.isActive, filters.isEmailVerified, search]);

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

  const handleToggleStatus = async (user: User) => {
    if (togglingUsers.has(user.id)) return; // Prevent double-click

    setTogglingUsers((prev) => new Set(prev).add(user.id));
    
    try {
      await dispatch(updateUser({
        userId: user.id,
        data: { isActive: !user.isActive },
      })).unwrap();
      
      toast?.success(
        'Status Updated',
        `User ${user.isActive ? 'deactivated' : 'activated'} successfully`
      );
      
      // Refresh the users list
      dispatch(fetchUsers({
        ...filters,
        page,
        limit,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
        search: search || undefined,
      }));
    } catch (error: any) {
      toast?.error(
        'Update Failed',
        error || 'Failed to update user status'
      );
    } finally {
      setTogglingUsers((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700 border-red-200',
      seller: 'bg-blue-100 text-blue-700 border-blue-200',
      buyer: 'bg-green-100 text-green-700 border-green-200',
      lawyer: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-purple-600" size={48} />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-600 mt-1">{total} users in the system</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                leftIcon={<RefreshCw size={18} />}
                variant="outline"
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Search Bar & Sort */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by email, name, phone..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            </div>
            <Button onClick={handleSearch} leftIcon={<Search size={18} />}>
              Search
            </Button>
          </div>

          {/* Filters Panel - Always Visible */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={filters.role || ''}
                  onChange={(e) => dispatch(setFilters({ role: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Roles</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                  <option value="lawyer">Lawyer</option>
                </select>
              </div>

              {/* Active Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'}
                  onChange={(e) => dispatch(setFilters({ isActive: e.target.value === '' ? undefined : e.target.value === 'true' }))}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Email Verified Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Verified</label>
                <select
                  value={filters.isEmailVerified === undefined ? '' : filters.isEmailVerified ? 'true' : 'false'}
                  onChange={(e) => dispatch(setFilters({ isEmailVerified: e.target.value === '' ? undefined : e.target.value === 'true' }))}
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

        {/* Users Table */}
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-colors"
                      onClick={() => handleSort('firstName')}
                  >
                    <div className="flex items-center gap-2">
                      User
                      <ArrowUpDown size={14} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-colors"
                      onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-2">
                      Email
                      <ArrowUpDown size={14} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-colors"
                      onClick={() => handleSort('isActive')}
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
                      Joined
                      <ArrowUpDown size={14} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <UserPlus size={48} className="text-gray-300" />
                        <p className="text-gray-500 font-medium">No users found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filters or search</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* User Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.firstName || user.email}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-2 ring-gray-200">
                                <span className="text-white font-semibold text-sm">
                                  {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {user.isEmailVerified && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <CheckCircle size={10} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.firstName || user.lastName
                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                : user.email.split('@')[0]}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail size={14} className="text-gray-400" />
                          {user.email}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.phone ? (
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Phone size={14} className="text-gray-400" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Roles */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span
                                key={role}
                                className={`px-2 py-1 text-xs font-semibold rounded-md border ${getRoleBadgeColor(role)}`}
                              >
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">No roles</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={togglingUsers.has(user.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                            user.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          } ${
                            togglingUsers.has(user.id)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer hover:scale-105'
                          }`}
                          title={`Click to ${user.isActive ? 'deactivate' : 'activate'} user`}
                        >
                          {togglingUsers.has(user.id) ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : user.isActive ? (
                            <CheckCircle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {togglingUsers.has(user.id) ? 'Updating...' : user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                          title="View user details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                page={page}
                limit={limit}
                total={total}
                pages={pages}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                limitOptions={[10, 20, 50, 100]}
                showPageInfo={true}
                showLimitSelector={true}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}


