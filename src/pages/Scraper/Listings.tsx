import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, RefreshCw, Home, Database } from 'lucide-react';
import { Table, Pagination, Badge, Button, AnimatedPage, StatCard, Input, Select } from '../../components/UI';
import type { Column } from '../../components/UI/Table';
import type { Listing } from '../../api/scraper.service';
import { useToast } from '../../contexts/ToastContext';
import { slideFromBottom, staggerContainer, fadeIn } from '../../utils/animations';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setPage, setPageSize, setFilters, clearFilters, setSorting } from '../../store/slices/listingsSlice';
import { fetchListings, fetchStatistics, fetchPropertyTypes } from '../../store/thunks/listingsThunks';

const Listings = () => {
  const navigate = useNavigate();
  const { success } = useToast();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { 
    items: listings, 
    total, 
    page: currentPage, 
    pageSize: itemsPerPage, 
    loading: isLoading, 
    filters, 
    sortBy, 
    sortOrder,
    propertyTypes
  } = useAppSelector((state) => state.listings);
  
  // Local state for UI
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    sources: Record<string, number>;
    loading: boolean;
  }>({
    total: 0,
    sources: {},
    loading: true,
  });
  
  // Calculate total pages
  const totalPages = Math.ceil(total / itemsPerPage);

  // Fetch statistics
  const loadStats = async () => {
    try {
      const result = await dispatch(fetchStatistics()).unwrap();
      setStats({
        total: result.total_listings,
        sources: result.sources || {},
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Fetch listings using Redux thunk
  const loadListings = async () => {
    try {
      await dispatch(fetchListings()).unwrap();
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadListings(), loadStats()]);
    setIsRefreshing(false);
    success('Success', 'Data refreshed successfully');
  };

  // Initial fetch
  useEffect(() => {
    loadStats();
    dispatch(fetchPropertyTypes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch listings when Redux state changes
  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, filters, sortBy, sortOrder]);

  // Handle sort
  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    dispatch(setSorting({ sortBy: key, sortOrder: direction }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    dispatch(setPageSize(newItemsPerPage));
  };

  // Handle filter changes
  const handleFilterChange = (filterKey: string, value: string) => {
    dispatch(setFilters({ [filterKey]: value }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Helper function to get badge color for a source
  const getSourceColor = (source: string): 'orange' | 'teal' | 'green' | 'blue' | 'primary' | 'info' => {
    const colors: ('orange' | 'teal' | 'green' | 'blue' | 'primary' | 'info')[] = ['orange', 'teal', 'green', 'blue', 'primary', 'info'];
    const sources = Object.keys(stats.sources).sort(); // Sort for consistency
    const index = sources.indexOf(source);
    return index >= 0 ? colors[index % colors.length] : 'blue';
  };

  // Table columns
  const columns: Column<Listing>[] = [
    {
      key: 'source',
      header: 'Source',
      width: 'w-24',
      sortable: true,
      render: (value) => {
        const strValue = String(value ?? '');
        return (
          <Badge variant={getSourceColor(strValue)}>
            {strValue}
          </Badge>
        );
      },
    },
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (value, row) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 truncate">{String(value ?? 'N/A')}</div>
          {row.addressText && (
            <div className="text-xs text-gray-500 truncate">{String(row.addressText ?? '')}</div>
          )}
        </div>
      ),
    },
    {
      key: 'propertyType',
      header: 'Type',
      width: 'w-32',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-700">{String(value ?? '-')}</span>
      ),
    },
    {
      key: 'listingType',
      header: 'Listing',
      width: 'w-24',
      sortable: true,
      render: (value) => {
        const strValue = String(value ?? '-');
        return (
          <Badge variant={strValue === 'rent' ? 'blue' : 'green'}>
            {strValue}
          </Badge>
        );
      },
    },
    {
      key: 'price',
      header: 'Price',
      width: 'w-32',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          {value && typeof value === 'number' ? (
            <>
              <span className="font-medium text-gray-900">
                {new Intl.NumberFormat().format(value)}
              </span>
              {row.priceCurrency && (
                <span className="text-gray-500 ml-1">{String(row.priceCurrency)}</span>
              )}
              {row.pricePeriod && String(row.pricePeriod) !== 'once' && (
                <span className="text-xs text-gray-400">/{String(row.pricePeriod)}</span>
              )}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'bedrooms',
      header: 'Beds',
      width: 'w-20',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-gray-700">
          {value ? `${value}bd` : '-'}
          {row.bathrooms && <span className="text-gray-400"> / {String(row.bathrooms)}ba</span>}
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      width: 'w-32',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="text-gray-900">{String(value ?? '-')}</div>
          {row.district && (
            <div className="text-xs text-gray-500">{String(row.district)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Added',
      width: 'w-32',
      sortable: true,
      render: (value) => {
        if (value && (typeof value === 'string' || typeof value === 'number' || value instanceof Date)) {
          return (
            <span className="text-sm text-gray-500">
              {new Date(value).toLocaleDateString()}
            </span>
          );
        }
        return <span className="text-sm text-gray-500">-</span>;
      },
    },
  ];

  const hasActiveFilters = 
    filters.search || 
    filters.source || 
    filters.propertyType || 
    filters.listingType ||
    filters.minPrice ||
    filters.maxPrice;

  const activeFiltersCount = [
    filters.search, 
    filters.source, 
    filters.propertyType, 
    filters.listingType,
    filters.minPrice,
    filters.maxPrice
  ].filter(Boolean).length;

  return (
    <AnimatedPage className="min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      {/* Header */}
      <motion.div
        variants={slideFromBottom}
        initial="initial"
        animate="animate"
        className="mb-6 lg:mb-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          {/* Title Section */}
          <div className="flex-1 min-w-[280px] max-w-full">
            <h1 className="text-[clamp(1.5rem,4vw,2.25rem)] font-extrabold text-gray-900 tracking-tight leading-tight">
              Property Listings
            </h1>
            <p className="mt-1.5 text-[clamp(0.875rem,2vw,1.125rem)] text-gray-600 leading-relaxed">
              Browse and manage <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> scraped properties
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center flex-shrink-0">
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              variant="secondary"
              leftIcon={<RefreshCw className={isRefreshing ? 'animate-spin' : ''} />}
            >
              Refresh
            </Button>
            <Button 
              onClick={() => navigate('/scraper/scrape')}
              leftIcon={<Home />}
            >
              Scrape More
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8"
      >
        <StatCard
          title="Total Listings"
          value={stats.loading ? '...' : stats.total.toLocaleString()}
          icon={Database}
          color="blue"
          loading={stats.loading}
        />
        {/* Dynamically render source cards */}
        {Object.entries(stats.sources).map(([source, count], index) => {
          // Color rotation for sources
          const colors: ('orange' | 'teal' | 'purple' | 'green' | 'blue' | 'pink')[] = ['orange', 'teal', 'purple', 'green', 'blue', 'pink'];
          const color = colors[index % colors.length];
          
          // Format source name
          const formattedName = source
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          return (
            <StatCard
              key={source}
              title={`${formattedName} Properties`}
              value={stats.loading ? '...' : count.toLocaleString()}
              icon={Home}
              color={color}
              loading={stats.loading}
            />
          );
        })}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="mb-4 sm:mb-6 space-y-3 sm:space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            icon={<Search />}
            iconPosition="left"
            fullWidth
            inputSize="lg"
          />
          <AnimatePresence>
            {filters.search && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200 shadow-xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b border-gray-300">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-600" />
                  Filter Options
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Refine your search results
                </p>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="self-start sm:self-auto"
                >
                  <X />
                  <span>Clear All Filters</span>
                </Button>
              )}
            </div>

            {/* Filters Grid */}
            <div className="space-y-5 sm:space-y-6">
              {/* Source & Type Filters */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  Category & Type
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Source Filter */}
                  <Select
                    label="Source"
                    value={filters.source}
                    onChange={(e) => handleFilterChange('source', e.target.value)}
                    options={[
                      { value: '', label: 'All Sources' },
                      ...Object.keys(stats.sources).map(source => {
                        const formattedName = source
                          .split(/[-_]/)
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ');
                        return { value: source, label: formattedName };
                      })
                    ]}
                    fullWidth
                  />

                  {/* Property Type Filter */}
                  <Select
                    label="Property Type"
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    options={[
                      { value: '', label: 'All Property Types' },
                      ...propertyTypes.map(type => ({ value: type, label: type }))
                    ]}
                    fullWidth
                  />

                  {/* Listing Type Filter */}
                  <Select
                    label="Listing Type"
                    value={filters.listingType}
                    onChange={(e) => handleFilterChange('listingType', e.target.value)}
                    options={[
                      { value: '', label: 'Rent & Sale' },
                      { value: 'rent', label: 'For Rent' },
                      { value: 'sale', label: 'For Sale' },
                    ]}
                    fullWidth
                  />
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  Price Range
                  {(filters.minPrice || filters.maxPrice) && (
                    <span className="text-xs font-normal text-gray-500 ml-auto">
                      {filters.minPrice && `From ${parseInt(filters.minPrice).toLocaleString()}`}
                      {filters.minPrice && filters.maxPrice && ' - '}
                      {filters.maxPrice && `To ${parseInt(filters.maxPrice).toLocaleString()}`}
                    </span>
                  )}
                </h4>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {/* Min Price Filter */}
                  <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Input
                      label="Minimum Price"
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      fullWidth
                    />
                    {filters.minPrice && (
                      <button
                        onClick={() => handleFilterChange('minPrice', '')}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Clear min price"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Max Price Filter */}
                  <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Input
                      label="Maximum Price"
                      type="number"
                      placeholder="Any"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      fullWidth
                    />
                    {filters.maxPrice && (
                      <button
                        onClick={() => handleFilterChange('maxPrice', '')}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Clear max price"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 pt-5 border-t border-gray-300"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">Active Filters:</span>
                  {filters.source && (
                    <Badge variant="blue" className="flex items-center gap-1">
                      <span>Source: {filters.source}</span>
                      <button
                        onClick={() => handleFilterChange('source', '')}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.propertyType && (
                    <Badge variant="teal" className="flex items-center gap-1">
                      <span>Type: {filters.propertyType}</span>
                      <button
                        onClick={() => handleFilterChange('propertyType', '')}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.listingType && (
                    <Badge variant="green" className="flex items-center gap-1">
                      <span>{filters.listingType === 'rent' ? 'For Rent' : 'For Sale'}</span>
                      <button
                        onClick={() => handleFilterChange('listingType', '')}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.minPrice && (
                    <Badge variant="orange" className="flex items-center gap-1">
                      <span>Min: {parseInt(filters.minPrice).toLocaleString()}</span>
                      <button
                        onClick={() => handleFilterChange('minPrice', '')}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.maxPrice && (
                    <Badge variant="orange" className="flex items-center gap-1">
                      <span>Max: {parseInt(filters.maxPrice).toLocaleString()}</span>
                      <button
                        onClick={() => handleFilterChange('maxPrice', '')}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Results Summary */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 sm:mb-4 flex flex-col xs:flex-row xs:items-center gap-2 xs:justify-between text-xs sm:text-sm"
        >
          <div className="text-gray-600 order-2 xs:order-1">
            Showing <span className="font-bold text-gray-900">{listings.length}</span> of{' '}
            <span className="font-bold text-gray-900">{total.toLocaleString()}</span> results
          </div>
          {hasActiveFilters && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100 order-1 xs:order-2 self-start xs:self-auto"
            >
              <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-4 sm:mb-6"
      >
        <Table<Record<string, unknown>>
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={listings as unknown as Array<Record<string, unknown>>}
          isLoading={isLoading}
          emptyMessage="No listings found. Try adjusting your filters or scrape some listings first."
          onSort={handleSort}
          sortKey={sortBy}
          sortDirection={sortOrder}
          onRowClick={(listing) => {
            // Navigate to detail page
            const listingData = listing as unknown as Listing;
            if (listingData.rawUrl) {
              navigate(`/scraper/listings/${encodeURIComponent(String(listingData.rawUrl))}`);
            }
          }}
        />
      </motion.div>

      {/* Pagination */}
      {!isLoading && listings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </motion.div>
      )}
    </AnimatedPage>
  );
};

export default Listings;

