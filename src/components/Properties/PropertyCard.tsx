import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Info,
  Building2,
  Calendar,
  User,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Button from '../UI/Button.js';
import type { Property } from '../../api/properties.service.js';

interface PropertyCardProps {
  property: Property;
  index: number;
  viewMode: 'pending' | 'all';
  displayFormat?: 'grid' | 'list';
  actionLoading: string | null;
  onApprove?: (property: Property) => void;
  onReject?: (property: Property) => void;
  onViewDetails?: (property: Property) => void;
}

export default function PropertyCard({
  property,
  index,
  viewMode,
  displayFormat = 'list',
  actionLoading,
  onApprove,
  onReject,
  onViewDetails,
}: PropertyCardProps) {
  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return 'Price on request';
    return `${currency || 'TZS'} ${price.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
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
      icon: <Building2 size={12} />,
      bgColor: 'bg-gray-500',
      textColor: 'text-white',
    },
    PENDING: {
      label: 'Pending Review',
      icon: <Clock size={12} />,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
    },
    ACTIVE: {
      label: 'Active',
      icon: <CheckCircle size={12} />,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
    REJECTED: {
      label: 'Rejected',
      icon: <XCircle size={12} />,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
    },
    SOLD: {
      label: 'Sold',
      icon: <CheckCircle size={12} />,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
    RENTED: {
      label: 'Rented',
      icon: <CheckCircle size={12} />,
      bgColor: 'bg-indigo-500',
      textColor: 'text-white',
    },
  };

  const isLoading = actionLoading === property.id;
  const badge = property.status ? statusConfig[property.status] : null;

  const isListView = displayFormat === 'list';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-2xl shadow-md border border-gray-200/50 overflow-hidden hover:shadow-2xl hover:border-gray-300/80 transition-all duration-300"
    >
      <div className={`flex ${isListView ? 'flex-col xl:flex-row min-h-[12rem] xl:min-h-0' : 'flex-col'} ${!isListView ? 'h-full' : ''}`}>
        {/* Image Section */}
        <div className={`relative ${isListView ? 'xl:w-72 h-48 xl:h-auto xl:min-h-full' : 'w-full h-56'} flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200`}>
          {/* Price Badge - Above Image */}
          <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold rounded-lg shadow-lg backdrop-blur-sm">
            {formatPrice(property.price, property.currency)}
          </div>
          
          {property.media && property.media.length > 0 ? (
            <>
              <img
                src={property.media[0].url}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Image Count Badge */}
              {property.media.length > 1 && (
                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                  <Building2 size={12} />
                  <span>{property.media.length} Photos</span>
                </div>
              )}
              {/* Status Badge */}
              {badge && (
                <div
                  className={`absolute top-3 left-3 px-3 py-1.5 ${badge.bgColor} ${badge.textColor} text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5`}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Building2 size={40} className="text-gray-300 mb-2" />
              <span className="text-gray-400 text-sm font-medium">No Image</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className={`flex-1 p-4 sm:p-5 ${!isListView ? 'flex flex-col' : ''}`}>
          {/* Header */}
          <div className={`mb-3 ${!isListView ? 'flex-1' : ''}`}>
            <h3 className={`${isListView ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} font-bold text-gray-900 mb-1 ${isListView ? 'line-clamp-1' : 'line-clamp-2'} group-hover:text-indigo-600 transition-colors`}>
              {property.title || 'Untitled Property'}
            </h3>
            {property.description && (
              <p className={`text-xs sm:text-sm text-gray-600 ${isListView ? 'line-clamp-1' : 'line-clamp-2'} leading-relaxed`}>
                {property.description}
              </p>
            )}
          </div>

          {/* Property Type */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <Building2 size={14} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-tight">Type</p>
              <p className="text-sm font-bold text-gray-900 capitalize">
                {property.propertyType || 'N/A'}
              </p>
            </div>
          </div>

          {/* Property Stats */}
          <div className={`grid ${isListView ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'} gap-2 mb-3`}>
            {(property.bedrooms !== null && property.bedrooms !== undefined) && (
              <div className="flex items-center gap-1.5 p-2 bg-sky-50 rounded-lg border border-sky-200/50">
                <BedDouble size={16} className="text-sky-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 leading-tight">Beds</p>
                  <p className="text-sm font-bold text-gray-900">{property.bedrooms}</p>
                </div>
              </div>
            )}
            {(property.bathrooms !== null && property.bathrooms !== undefined) && (
              <div className="flex items-center gap-1.5 p-2 bg-cyan-50 rounded-lg border border-cyan-200/50">
                <Bath size={16} className="text-cyan-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 leading-tight">Baths</p>
                  <p className="text-sm font-bold text-gray-900">{property.bathrooms}</p>
                </div>
              </div>
            )}
            {property.size && (
              <div className="flex items-center gap-1.5 p-2 bg-teal-50 rounded-lg border border-teal-200/50">
                <Square size={16} className="text-teal-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 leading-tight">Size</p>
                  <p className="text-sm font-bold text-gray-900">{property.size} m²</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1.5 p-2 bg-amber-50 rounded-lg border border-amber-200/50">
              <Calendar size={16} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 leading-tight">Submitted</p>
                <p className="text-xs font-bold text-gray-900">{formatDate(property.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Location & Owner - List View */}
          {isListView && (
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              {property.address && (
                <div className="flex items-start gap-2 flex-1">
                  <MapPin size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Location</p>
                    <p className="text-sm text-gray-900 font-medium line-clamp-1">
                      {property.address}
                      {property.district && `, ${property.district}`}
                    </p>
                  </div>
                </div>
              )}
              {property.contactName && (
                <div className="flex items-start gap-2">
                  <User size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Owner</p>
                    <p className="text-sm text-gray-900 font-medium">{property.contactName}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location - Grid View */}
          {!isListView && property.address && (
            <div className="flex items-start gap-2 mb-3">
              <MapPin size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 line-clamp-1">
                {property.address}
                {property.district && `, ${property.district}`}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
            {onViewDetails && (
              <div className="action-btn relative">
                <Button
                  onClick={() => onViewDetails(property)}
                  variant="outline"
                  size="sm"
                  className="w-11 h-11 p-0 border-2 border-indigo-200/60 text-indigo-600 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50"
                  aria-label="View Details"
                >
                  <Info size={18} />
                </Button>
                <span className="tooltip absolute -top-11 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none transition-all duration-300 whitespace-nowrap z-50">
                  View Details
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                </span>
              </div>
            )}
            {viewMode === 'pending' && onApprove && (
              <div className="action-btn relative">
                <Button
                  onClick={() => onApprove(property)}
                  disabled={isLoading}
                  loading={isLoading}
                  variant="primary"
                  size="sm"
                  className="w-11 h-11 p-0 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 hover:shadow-emerald-500/50"
                  aria-label="Approve Property"
                >
                  {!isLoading && <CheckCircle2 size={18} />}
                </Button>
                <span className="tooltip absolute -top-11 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none transition-all duration-300 whitespace-nowrap z-50">
                  Approve
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                </span>
              </div>
            )}
            {viewMode === 'pending' && onReject && (
              <div className="action-btn relative">
                <Button
                  onClick={() => onReject(property)}
                  disabled={isLoading}
                  loading={isLoading}
                  variant="danger"
                  size="sm"
                  className="w-11 h-11 p-0 bg-gradient-to-br from-red-500 via-rose-500 to-red-600 hover:shadow-red-500/50"
                  aria-label="Reject Property"
                >
                  {!isLoading && <XCircle size={18} />}
                </Button>
                <span className="tooltip absolute -top-11 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none transition-all duration-300 whitespace-nowrap z-50">
                  Reject
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

