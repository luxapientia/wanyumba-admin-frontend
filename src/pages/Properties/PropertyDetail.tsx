import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Building2,
  BedDouble,
  Bath,
  Square,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  DollarSign,
  Info,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import Button from '../../components/UI/Button.js';
import { ConfirmationModal } from '../../components/UI/index.js';
import { useToast } from '../../contexts/index.js';
import { propertiesService } from '../../api/index.js';
import type { Property } from '../../api/properties.service.js';
import { useAppDispatch } from '../../store/hooks.js';
import { approveProperty, rejectProperty } from '../../store/thunks/propertiesThunks.js';
import { updateProperty } from '../../store/slices/propertiesSlice.js';

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('Property ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await propertiesService.getPropertyById(id);
        if (response.success && response.data) {
          setProperty(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch property');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleApprove = async () => {
    if (!property || !id) return;

    setProcessing(true);
    try {
      const result = await dispatch(approveProperty({ id: property.id })).unwrap();
      setProperty(result);
      toast?.success('Property Approved', 'Property has been approved and is now active.');
      setProcessing(false);
    } catch (error: any) {
      toast?.error('Approval Failed', error || 'Failed to approve property');
      setProcessing(false);
    }
  };

  const handleReject = () => {
    setRejectionModalOpen(true);
    setRejectionReason('');
  };

  const confirmRejection = async () => {
    if (!property || !id) return;

    if (!rejectionReason || !rejectionReason.trim()) {
      toast?.warning('Rejection Reason Required', 'Please provide a reason for rejecting this property.');
      return;
    }

    setProcessing(true);
    try {
      const result = await dispatch(rejectProperty({ id: property.id, data: { reason: rejectionReason } })).unwrap();
      setProperty(result);
      toast?.success('Property Rejected', 'Property has been rejected and the owner will be notified.');
      setRejectionModalOpen(false);
      setRejectionReason('');
      setProcessing(false);
    } catch (error: any) {
      toast?.error('Rejection Failed', error || 'Failed to reject property');
      setProcessing(false);
    }
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Price on request';
    return `${currency || 'TZS'} ${price.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const statusConfig: Record<
    Property['status'],
    { label: string; icon: React.ReactNode; bgColor: string; textColor: string }
  > = {
    DRAFT: {
      label: 'Draft',
      icon: <Building2 size={16} />,
      bgColor: 'bg-gray-500',
      textColor: 'text-white',
    },
    PENDING: {
      label: 'Pending Review',
      icon: <Clock size={16} />,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
    },
    ACTIVE: {
      label: 'Active',
      icon: <CheckCircle size={16} />,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
    REJECTED: {
      label: 'Rejected',
      icon: <XCircle size={16} />,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
    },
    SOLD: {
      label: 'Sold',
      icon: <CheckCircle size={16} />,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
    RENTED: {
      label: 'Rented',
      icon: <CheckCircle size={16} />,
      bgColor: 'bg-indigo-500',
      textColor: 'text-white',
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-red-200/50 p-6 text-center"
          >
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
            <Button onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={18} />}>
              Go Back
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const badge = statusConfig[property.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            leftIcon={<ArrowLeft size={18} />}
          >
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              Property Details
            </h1>
          </div>
          {property.status === 'PENDING' && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleApprove}
                disabled={processing}
                leftIcon={processing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              >
                Approve
              </Button>
              <Button
                onClick={handleReject}
                disabled={processing}
                variant="outline"
                leftIcon={<XCircle size={18} />}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images & Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {property.media && property.media.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden"
              >
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={property.media[selectedImage].url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Status Badge */}
                  {badge && (
                    <div
                      className={`absolute top-4 left-4 px-4 py-2 ${badge.bgColor} ${badge.textColor} text-sm font-bold rounded-lg shadow-lg flex items-center gap-2`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>
                  )}
                </div>
                {property.media.length > 1 && (
                  <div className="p-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {property.media.map((media, index) => (
                      <Button
                        key={media.id}
                        onClick={() => setSelectedImage(index)}
                        variant="ghost"
                        className={`aspect-square p-0 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-purple-500 ring-2 ring-purple-200'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <img
                          src={media.thumbnailUrl || media.url}
                          alt={`${property.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </Button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-12 text-center"
              >
                <Building2 size={64} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No images available</p>
              </motion.div>
            )}

            {/* Description */}
            {property.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
              </motion.div>
            )}

            {/* Rejection Reason */}
            {property.status === 'REJECTED' && property.rejectionReason && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-sm border-2 border-red-200 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-2">Rejection Reason</h3>
                    <div className="bg-white rounded-xl p-4 border border-red-200">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {property.rejectionReason}
                      </p>
                    </div>
                    {property.moderatedAt && (
                      <p className="text-sm text-red-700 mt-3 flex items-center gap-2">
                        <Calendar size={16} />
                        Rejected on {formatDate(property.moderatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Details & Actions */}
          <div className="space-y-6">
            {/* Property Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">{property.title}</h2>
              
              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Price</p>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(property.price, property.currency)}</p>
                <p className="text-sm text-gray-600 mt-1 capitalize">{property.listingType}</p>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {(property.bedrooms !== null && property.bedrooms !== undefined) && (
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-200/50">
                    <BedDouble size={20} className="text-sky-600 mb-2" />
                    <p className="text-xs text-gray-600">Bedrooms</p>
                    <p className="text-lg font-bold text-gray-900">{property.bedrooms}</p>
                  </div>
                )}
                {(property.bathrooms !== null && property.bathrooms !== undefined) && (
                  <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200/50">
                    <Bath size={20} className="text-cyan-600 mb-2" />
                    <p className="text-xs text-gray-600">Bathrooms</p>
                    <p className="text-lg font-bold text-gray-900">{property.bathrooms}</p>
                  </div>
                )}
                {property.size && (
                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-200/50">
                    <Square size={20} className="text-teal-600 mb-2" />
                    <p className="text-xs text-gray-600">Size</p>
                    <p className="text-lg font-bold text-gray-900">{property.size} m²</p>
                  </div>
                )}
                {property.landSize && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/50">
                    <Building2 size={20} className="text-amber-600 mb-2" />
                    <p className="text-xs text-gray-600">Land Size</p>
                    <p className="text-lg font-bold text-gray-900">{property.landSize} m²</p>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="mb-6">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-gray-900 font-medium">{property.address}</p>
                    {(property.district || property.region) && (
                      <p className="text-sm text-gray-600">
                        {property.district && property.district}
                        {property.district && property.region && ', '}
                        {property.region && property.region}
                      </p>
                    )}
                  </div>
                </div>
                {property.latitude && property.longitude && (
                  <p className="text-xs text-gray-500 mt-2">
                    Coordinates: {Number(property.latitude).toFixed(6)}, {Number(property.longitude).toFixed(6)}
                  </p>
                )}
              </div>

              {/* Property Type */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Property Type</p>
                <p className="text-gray-900 font-semibold capitalize">{property.propertyType}</p>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {(property.views !== undefined && property.views !== null) && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye size={16} />
                      <span>Views</span>
                    </div>
                    <span className="font-semibold text-gray-900">{property.views}</span>
                  </div>
                )}
                {(property.favorites !== undefined && property.favorites !== null) && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Heart size={16} />
                      <span>Favorites</span>
                    </div>
                    <span className="font-semibold text-gray-900">{property.favorites}</span>
                  </div>
                )}
                {(property.inquiries !== undefined && property.inquiries !== null) && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageCircle size={16} />
                      <span>Inquiries</span>
                    </div>
                    <span className="font-semibold text-gray-900">{property.inquiries}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Contact Info */}
            {(property.contactName || property.contactPhone || property.contactEmail) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {property.contactName && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <User size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Owner</p>
                        <p className="text-sm font-semibold text-gray-900">{property.contactName}</p>
                      </div>
                    </div>
                  )}
                  {property.contactPhone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <Phone size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{property.contactPhone}</p>
                      </div>
                    </div>
                  )}
                  {property.contactEmail && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                        <Mail size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-900">{property.contactEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Dates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>Created</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatDate(property.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>Updated</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatDate(property.updatedAt)}</span>
                </div>
                {property.publishedAt && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>Published</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatDate(property.publishedAt)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <ConfirmationModal
        isOpen={rejectionModalOpen}
        onClose={() => {
          setRejectionModalOpen(false);
          setRejectionReason('');
        }}
        onConfirm={confirmRejection}
        title="Reject Property"
        message={`Are you sure you want to reject "${property.title}"? The owner will be notified.`}
        confirmText="Reject Property"
        cancelText="Cancel"
        variant="danger"
        loading={processing}
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

