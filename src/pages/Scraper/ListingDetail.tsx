import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { Button, Badge, AnimatedPage } from '../../components/UI';
import { scraperService } from '../../api';
import type { Listing } from '../../api/scraper.service';
import { useToast } from '../../contexts/ToastContext';
import { slideFromBottom, fadeIn } from '../../utils/animations';

const ListingDetail = () => {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      if (!url) return;

      setIsLoading(true);
      try {
        const decodedUrl = decodeURIComponent(url);
        const data = await scraperService.getListing(decodedUrl);
        setListing(data);
      } catch (err) {
        console.error('Error fetching listing:', err);
        showError('Error', 'Failed to fetch listing details');
        navigate('/scraper/listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [url, navigate, showError]);

  if (isLoading) {
    return (
      <AnimatedPage className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading listing details...</p>
        </div>
      </AnimatedPage>
    );
  }

  if (!listing) {
    return (
      <AnimatedPage className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Listing not found</h2>
          <Button onClick={() => navigate('/scraper/listings')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Listings
          </Button>
        </div>
      </AnimatedPage>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value: unknown }) => {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return null;
    }

    return (
      <div className="py-3 border-b border-gray-100 last:border-0">
        <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
        <dd className="text-sm text-gray-900 font-medium">{String(value ?? '')}</dd>
      </div>
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to get badge color for a source
  const getSourceColor = (source: string): 'orange' | 'teal' | 'green' | 'blue' | 'primary' | 'info' => {
    const sourceLower = source?.toLowerCase() || '';
    if (sourceLower.includes('jiji')) return 'orange';
    if (sourceLower.includes('kupatana')) return 'teal';
    if (sourceLower.includes('makazi')) return 'green';
    return 'blue';
  };

  return (
    <AnimatedPage className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        variants={slideFromBottom}
        initial="initial"
        animate="animate"
        className="mb-6"
      >
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="mb-6"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Title and Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {listing.source && (
                  <Badge variant={getSourceColor(listing.source)}>
                    {listing.source.toUpperCase()}
                  </Badge>
                )}
                {listing.listingType && (
                  <Badge variant={listing.listingType === 'rent' ? 'blue' : 'green'}>
                    FOR {listing.listingType.toUpperCase()}
                  </Badge>
                )}
                {listing.status && (
                  <Badge variant={listing.status === 'active' ? 'success' : 'warning'}>
                    {listing.status.toUpperCase()}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {listing.title || 'Untitled Listing'}
              </h1>
              
              {listing.addressText && (
                <div className="flex items-start gap-2 text-gray-600 mb-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-base">{listing.addressText}</p>
                </div>
              )}
              
              {/* Location Details */}
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                {listing.city && <span>📍 {listing.city}</span>}
                {listing.district && <span>• {listing.district}</span>}
                {listing.region && <span>• {listing.region}</span>}
                {listing.country && <span>• {listing.country}</span>}
              </div>
            </div>
            
            {/* Right: Price */}
            {listing.price && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 min-w-[240px]">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-900 uppercase tracking-wide">Price</span>
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                  {new Intl.NumberFormat().format(listing.price)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {listing.priceCurrency || 'TZS'}
                  {listing.pricePeriod && listing.pricePeriod !== 'once' && ` / ${listing.pricePeriod}`}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Column - Images and Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {listing.images && listing.images.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Property Images ({listing.images.length})
                </h2>
              </div>
              
              <div className="p-4">
                {/* Main Image */}
                <div className="mb-4">
                  <img
                    src={listing.images[selectedImageIndex]}
                    alt={`Property ${selectedImageIndex + 1}`}
                    className="w-full aspect-video object-cover rounded-lg bg-gray-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                    }}
                  />
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Image {selectedImageIndex + 1} of {listing.images.length}
                  </div>
                </div>
                
                {/* Thumbnails */}
                {listing.images.length > 1 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {listing.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          index === selectedImageIndex
                            ? 'border-indigo-500 ring-2 ring-indigo-200'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/150?text=N/A';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {listing.description}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
            </div>
            <div className="p-4">
              <dl className="divide-y divide-gray-100">
                <InfoRow label="Property Type" value={listing.propertyType} />
                <InfoRow label="Listing Type" value={listing.listingType} />
                <InfoRow 
                  label="Bedrooms" 
                  value={listing.bedrooms ? `${listing.bedrooms} bedroom${listing.bedrooms !== 1 ? 's' : ''}` : null} 
                />
                <InfoRow 
                  label="Bathrooms" 
                  value={listing.bathrooms ? `${listing.bathrooms} bathroom${listing.bathrooms !== 1 ? 's' : ''}` : null} 
                />
                <InfoRow 
                  label="Living Area" 
                  value={listing.livingAreaSqm ? `${listing.livingAreaSqm} sqm` : null} 
                />
                <InfoRow 
                  label="Land Area" 
                  value={listing.landAreaSqm ? `${listing.landAreaSqm} sqm` : null} 
                />
                <InfoRow label="Status" value={listing.status} />
              </dl>
            </div>
          </div>

          {/* Location */}
          {(listing.country || listing.region || listing.city || listing.district || (listing.latitude && listing.longitude)) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              </div>
              <div className="p-4">
                <dl className="divide-y divide-gray-100">
                  <InfoRow label="Country" value={listing.country} />
                  <InfoRow label="Region" value={listing.region} />
                  <InfoRow label="City" value={listing.city} />
                  <InfoRow label="District" value={listing.district} />
                  {listing.latitude && listing.longitude && (
                    <InfoRow 
                      label="Coordinates" 
                      value={`${listing.latitude}, ${listing.longitude}`} 
                    />
                  )}
                </dl>
              </div>
            </div>
          )}

          {/* Agent Information */}
          {(listing.agentName || listing.agentPhone || listing.agentEmail || listing.agentWhatsapp || listing.agentWebsite || listing.agentProfileUrl) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-indigo-50">
                <h2 className="text-lg font-semibold text-gray-900">Agent Information</h2>
              </div>
              <div className="p-4">
                <dl className="divide-y divide-gray-100">
                  <InfoRow label="Name" value={listing.agentName} />
                  
                  {listing.agentPhone && (
                    <div className="py-3 border-b border-gray-100 last:border-0">
                      <dt className="text-sm font-medium text-gray-500 mb-1">Phone</dt>
                      <dd className="text-sm">
                        <a 
                          href={`tel:${listing.agentPhone}`}
                          className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                        >
                          {listing.agentPhone}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  {listing.agentWhatsapp && (
                    <div className="py-3 border-b border-gray-100 last:border-0">
                      <dt className="text-sm font-medium text-gray-500 mb-1">WhatsApp</dt>
                      <dd className="text-sm">
                        <a 
                          href={`https://wa.me/${listing.agentWhatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                        >
                          {listing.agentWhatsapp}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  {listing.agentEmail && (
                    <div className="py-3 border-b border-gray-100 last:border-0">
                      <dt className="text-sm font-medium text-gray-500 mb-1">Email</dt>
                      <dd className="text-sm">
                        <a 
                          href={`mailto:${listing.agentEmail}`}
                          className="text-indigo-600 hover:text-indigo-800 font-medium break-all inline-flex items-center gap-1"
                        >
                          {listing.agentEmail}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  {listing.agentWebsite && (
                    <div className="py-3 border-b border-gray-100 last:border-0">
                      <dt className="text-sm font-medium text-gray-500 mb-1">Website</dt>
                      <dd className="text-sm">
                        <a 
                          href={listing.agentWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-medium break-all inline-flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  {listing.agentProfileUrl && (
                    <div className="py-3 border-b border-gray-100 last:border-0">
                      <dt className="text-sm font-medium text-gray-500 mb-1">Profile</dt>
                      <dd className="text-sm">
                        <a 
                          href={listing.agentProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                        >
                          View Profile
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {/* Source Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Source Information</h2>
            </div>
            <div className="p-4">
              <dl className="divide-y divide-gray-100">
                <InfoRow label="Source" value={listing.source} />
                <InfoRow label="Listing ID" value={listing.sourceListingId} />
                
                {listing.rawUrl && (
                  <div className="py-3 border-b border-gray-100 last:border-0">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Original URL</dt>
                    <dd className="text-sm">
                      <a 
                        href={listing.rawUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 break-all"
                      >
                        View Original Listing
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </dd>
                  </div>
                )}
                
                <InfoRow 
                  label="Scraped At" 
                  value={formatDate(listing.scrapeTimestamp)} 
                />
                <InfoRow 
                  label="Added to Database" 
                  value={formatDate(listing.createdAt)} 
                />
                <InfoRow 
                  label="Last Updated" 
                  value={formatDate(listing.updatedAt)} 
                />
              </dl>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatedPage>
  );
};

export default ListingDetail;

