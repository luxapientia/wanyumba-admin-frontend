import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  TrendingUp,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { scraperService } from '../../api';
import type { Agent } from '../../api/scraper.service';
import { AnimatedPage, Table, Pagination, Badge, Button } from '../../components/UI';
import type { Column } from '../../components/UI/Table';
import { useToast } from '../../contexts/ToastContext';

interface AgentListing {
  id: number;
  title: string;
  price: number;
  propertyType: string;
  city: string;
  district: string;
  bedrooms: number;
  bathrooms: number;
  listingType: string;
  rawUrl: string;
}

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [listings, setListings] = useState<AgentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (id) {
      fetchAgent();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchListings();
    }
  }, [id, page, pageSize, sortBy, sortOrder]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const data = await scraperService.getAgentById(Number(id));
      setAgent(data);
    } catch (error) {
      console.error('Error fetching agent:', error);
      showError('Error', 'Failed to fetch agent details');
      navigate('/scraper/agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      setListingsLoading(true);
      const response = await scraperService.getAgentListings(Number(id), {
        page,
        limit: pageSize,
        sortBy,
        sortOrder,
      });
      setListings(response.listings || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error fetching listings:', error);
      showError('Error', 'Failed to fetch agent listings');
    } finally {
      setListingsLoading(false);
    }
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: Column<AgentListing>[] = [
    {
      key: 'title',
      header: 'Property',
      sortable: true,
      render: (_value: any, listing: AgentListing) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 line-clamp-1">{listing.title}</span>
          <span className="text-xs text-gray-500">
            {listing.propertyType || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (_value: any, listing: AgentListing) => (
        <div className="flex items-center gap-1 font-semibold text-green-600">
          <DollarSign className="w-4 h-4" />
          {formatPrice(listing.price)}
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      sortable: true,
      render: (_value: any, listing: AgentListing) => (
        <div className="flex items-center gap-1 text-gray-700">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{listing.city}</span>
          {listing.district && <span className="text-gray-400">• {listing.district}</span>}
        </div>
      ),
    },
    {
      key: 'bedrooms',
      header: 'Beds/Baths',
      sortable: false,
      render: (_value: any, listing: AgentListing) => (
        <div className="text-sm text-gray-600">
          {listing.bedrooms || 0} BR / {listing.bathrooms || 0} BA
        </div>
      ),
    },
    {
      key: 'listingType',
      header: 'Type',
      sortable: true,
      render: (_value: any, listing: AgentListing) => (
        <Badge
          variant={listing.listingType === 'sale' ? 'blue' : 'purple'}
        >
          {listing.listingType === 'sale' ? 'For Sale' : 'For Rent'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_value: any, listing: AgentListing) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/scraper/listings/${encodeURIComponent(listing.rawUrl)}`);
          }}
          leftIcon={<ExternalLink className="w-4 h-4" />}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <AnimatedPage className="p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading agent details...</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (!agent) {
    return (
      <AnimatedPage className="p-4 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Not Found</h2>
          <p className="text-gray-600 mb-4">The agent you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/scraper/agents')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Agents
          </Button>
        </div>
      </AnimatedPage>
    );
  }

  const totalValue = listings.reduce((sum, listing) => sum + (listing.price || 0), 0);

  return (
    <AnimatedPage className="p-4 lg:p-8 overflow-x-hidden">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/scraper/agents')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Agents</span>
      </motion.button>

      {/* Agent Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Agent Avatar */}
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
              <User className="w-12 h-12 lg:w-16 lg:h-16" />
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {agent.name || 'Unknown Agent'}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a
                      href={`tel:${agent.phone}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {agent.phone}
                    </a>
                  </div>
                </div>

                {agent.email && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <a
                        href={`mailto:${agent.email}`}
                        className="font-medium text-gray-900 hover:text-green-600 transition-colors"
                      >
                        {agent.email}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">{formatDate(agent.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {total > 0 ? formatPrice(totalValue / total) : formatPrice(0)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Listings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent Listings</h2>
        <Table
          data={listings}
          columns={columns}
          isLoading={listingsLoading}
          emptyMessage="No listings found for this agent"
          onSort={handleSort}
          sortKey={sortBy}
          sortDirection={sortOrder}
          onRowClick={(listing: AgentListing) => navigate(`/scraper/listings/${encodeURIComponent(listing.rawUrl)}`)}
        />
      </motion.div>

      {/* Pagination */}
      {!listingsLoading && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / pageSize)}
            itemsPerPage={pageSize}
            totalItems={total}
            onPageChange={(newPage: number) => setPage(newPage)}
            onItemsPerPageChange={(newSize: number) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        </motion.div>
      )}
    </AnimatedPage>
  );
};

export default AgentDetail;

