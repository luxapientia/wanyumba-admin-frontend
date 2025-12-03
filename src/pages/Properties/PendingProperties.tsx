import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  RefreshCw,
  SlidersHorizontal,
  Building2,
  Grid3x3,
  List,
  ArrowUpDown,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import type { RootState } from '../../store/index.js';
import { fetchPendingProperties } from '../../store/thunks/propertiesThunks.js';
import {
  setPendingProperties,
  setPendingLoading,
  setPendingPage,
  setPendingLimit,
  setPendingFilters,
  setPendingSorting,
  setPendingSearch,
  setPendingDisplayViewMode,
  updatePendingProperty,
  clearPendingFilters,
} from '../../store/slices/propertiesSlice.js';
import { approveProperty, rejectProperty } from '../../store/thunks/propertiesThunks.js';
import Button from '../../components/UI/Button.js';
import { ConfirmationModal, Pagination } from '../../components/UI/index.js';
import PropertyCard from '../../components/Properties/PropertyCard.js';
import { useToast } from '../../contexts/index.js';
import type { Property, PropertyFilters } from '../../api/properties.service.js';

export default function PendingProperties() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { 
    items, 
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
    displayViewMode,
  } = useAppSelector((state: RootState) => state.properties.pending);

  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  
  // Rejection modal state
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [propertyToReject, setPropertyToReject] = useState<Property | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Clear old properties when component mounts
  useEffect(() => {
    dispatch(setPendingProperties({ properties: [], pagination: { total: 0, page: 1, limit: 20, pages: 0 } }));
    dispatch(setPendingLoading(true));
  }, [dispatch]);

  // Sync search input with Redux search
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch properties when filters, pagination, or sorting changes
  useEffect(() => {
    const fetchFilters: PropertyFilters = {
      ...filters,
      page,
      limit,
      sortBy: sortBy as PropertyFilters['sortBy'],
      sortOrder,
      search: search || undefined,
    };

    dispatch(fetchPendingProperties(fetchFilters));
  }, [dispatch, page, limit, sortBy, sortOrder, filters, search]);

  const handleApprove = async (property: Property) => {
    setActionLoading(property.id);
    try {
      const result = await dispatch(approveProperty({ id: property.id })).unwrap();
      dispatch(updatePendingProperty(result));
      toast?.success('Property Approved', 'Property has been approved and is now active.');
      setActionLoading(null);
      
      // Refetch properties after approval
      const fetchFilters: PropertyFilters = {
        ...filters,
        page,
        limit,
        sortBy: sortBy as PropertyFilters['sortBy'],
        sortOrder,
        search: search || undefined,
      };
      
      dispatch(fetchPendingProperties(fetchFilters));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve property';
      toast?.error('Approval Failed', errorMessage);
      setActionLoading(null);
    }
  };

  const handleReject = (property: Property) => {
    setPropertyToReject(property);
    setRejectionReason('');
    setRejectionModalOpen(true);
  };

  const confirmRejection = async () => {
    if (!propertyToReject) return;
    
    if (!rejectionReason || !rejectionReason.trim()) {
      toast?.warning('Rejection Reason Required', 'Please provide a reason for rejecting this property.');
      return;
    }

    setActionLoading(propertyToReject.id);
    try {
      const result = await dispatch(rejectProperty({ id: propertyToReject.id, data: { reason: rejectionReason } })).unwrap();
      dispatch(updatePendingProperty(result));
      toast?.success('Property Rejected', 'Property has been rejected and the owner will be notified.');
      setRejectionModalOpen(false);
      setPropertyToReject(null);
      setRejectionReason('');
      setActionLoading(null);
      
      // Refetch properties after rejection
      const fetchFilters: PropertyFilters = {
        ...filters,
        page,
        limit,
        sortBy: sortBy as PropertyFilters['sortBy'],
        sortOrder,
        search: search || undefined,
      };
      
      dispatch(fetchPendingProperties(fetchFilters));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject property';
      toast?.error('Rejection Failed', errorMessage);
      setActionLoading(null);
    }
  };

  const handleViewDetails = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPendingPage(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(setPendingLimit(newLimit));
  };

  const handleSearch = () => {
    dispatch(setPendingSearch(searchInput));
  };

  const handleClearFilters = () => {
    dispatch(clearPendingFilters());
    setSearchInput('');
  };

  const handleRefresh = () => {
    const fetchFilters: PropertyFilters = {
      ...filters,
      page,
      limit,
      sortBy: sortBy as PropertyFilters['sortBy'],
      sortOrder,
      search: search || undefined,
    };

    dispatch(fetchPendingProperties(fetchFilters));
  };

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
                Pending Approval
              </h1>
              <p className="text-gray-600 mt-1">{total} properties awaiting approval</p>
            </div>
            <Button
              onClick={handleRefresh}
              leftIcon={<RefreshCw size={18} />}
              variant="outline"
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Search, Filter & Sort Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6"
        >
          {/* Search Bar & Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by title, address, or description..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            </div>
            <Button onClick={handleSearch} leftIcon={<Search size={18} />}>
              Search
            </Button>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={`${sortBy}_${sortOrder}`}
                onChange={(e) => {
                  const [sortField, order] = e.target.value.split('_');
                  if (sortField && order) {
                    dispatch(setPendingSorting({ sortBy: sortField as string, sortOrder: order as 'asc' | 'desc' }));
                  }
                }}
                className="appearance-none pl-10 pr-8 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white font-medium text-sm cursor-pointer hover:border-purple-400"
              >
                <option value="createdAt_desc">Date Created (Newest)</option>
                <option value="createdAt_asc">Date Created (Oldest)</option>
                <option value="price_asc">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
                <option value="updatedAt_desc">Last Updated (Newest)</option>
                <option value="updatedAt_asc">Last Updated (Oldest)</option>
              </select>
              <ArrowUpDown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal size={18} />}
              variant="outline"
            >
              Filters
            </Button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
            >
              {/* Property Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                <input
                  type="text"
                  placeholder="e.g., House, Apartment"
                  value={filters.propertyType || ''}
                  onChange={(e) => {
                    dispatch(setPendingFilters({ propertyType: e.target.value || undefined }));
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Listing Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Listing Type</label>
                <select
                  value={filters.listingType || ''}
                  onChange={(e) => {
                    dispatch(setPendingFilters({ listingType: e.target.value || undefined }));
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Types</option>
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button onClick={handleClearFilters} variant="outline" className="w-full">
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}

          {/* Price Range Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price</label>
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice || ''}
                  onChange={(e) => {
                    dispatch(setPendingFilters({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined }));
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price</label>
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => {
                    dispatch(setPendingFilters({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined }));
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </motion.div>
          )}

          {/* Active Filters Display */}
          {(search || filters.propertyType || filters.listingType || filters.minPrice || filters.maxPrice) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
              {search && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                  Search: "{search}"
                </span>
              )}
              {filters.propertyType && (
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium capitalize">
                  Type: {filters.propertyType}
                </span>
              )}
              {filters.listingType && (
                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium capitalize">
                  Listing: {filters.listingType}
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                  Price: {filters.minPrice ? `${filters.minPrice}` : '0'} - {filters.maxPrice || '∞'}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Properties List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
            />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-red-200/50 p-6 text-center"
          >
            <p className="font-semibold text-red-700 mb-2">Error loading properties</p>
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Building2 size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600">No properties match your current filters.</p>
          </motion.div>
        ) : (
          <>
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{items.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{total}</span> properties
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => dispatch(setPendingDisplayViewMode('grid'))}
                  variant={displayViewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  className={displayViewMode === 'grid' ? '' : 'bg-gray-100 hover:bg-gray-200'}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <Grid3x3 size={18} />
                </Button>
                <Button
                  onClick={() => dispatch(setPendingDisplayViewMode('list'))}
                  variant={displayViewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  className={displayViewMode === 'list' ? '' : 'bg-gray-100 hover:bg-gray-200'}
                  aria-label="List view"
                  title="List view"
                >
                  <List size={18} />
                </Button>
              </div>
            </div>

            {/* Properties Grid/List */}
            <div
              className={
                displayViewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'grid grid-cols-1 gap-5'
              }
            >
              {items.map((property: Property, index: number) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                  viewMode="pending"
                  displayFormat={displayViewMode}
                  actionLoading={actionLoading}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <Pagination
            page={page}
            limit={limit}
            total={total}
            pages={pages}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>

      {/* Rejection Modal */}
      <ConfirmationModal
        isOpen={rejectionModalOpen}
        onClose={() => {
          setRejectionModalOpen(false);
          setPropertyToReject(null);
          setRejectionReason('');
        }}
        onConfirm={confirmRejection}
        title="Reject Property"
        message={
          propertyToReject
            ? `Are you sure you want to reject "${propertyToReject.title}"? The owner will be notified.`
            : 'Reject Property'
        }
        confirmText="Reject Property"
        cancelText="Cancel"
        variant="danger"
        loading={actionLoading === propertyToReject?.id}
      >
        <div className="mt-4">
          <label htmlFor="rejectionReason" className="block text-sm font-semibold text-gray-900 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a detailed reason for rejecting this property..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
            rows={4}
            required
            autoFocus
          />
          <p className="mt-2 text-xs text-gray-500">
            This reason will be visible to the property owner.
          </p>
        </div>
      </ConfirmationModal>
    </div>
  );
}
