import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Square, Activity, FileText, Play, Clock, TrendingUp, RefreshCw, AlertCircle, CheckCircle, Loader, Zap, Info } from 'lucide-react';
import { Button, Badge, AnimatedPage, StatCard } from '../../components/UI';
import { scraperService } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { fadeIn, slideFromBottom, staggerContainer } from '../../utils/animations';
import type { ScrapingStatus } from '../../api/scraper.service';

// Color schemes for scrapers - dynamically assigned based on index
const COLOR_SCHEMES = [
  {
    primary: 'orange',
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    darkBg: 'bg-orange-500',
    lightGradient: 'from-orange-100 to-amber-100'
  },
  {
    primary: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    border: 'border-teal-200',
    darkBg: 'bg-teal-500',
    lightGradient: 'from-teal-100 to-cyan-100'
  },
  {
    primary: 'blue',
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    darkBg: 'bg-blue-500',
    lightGradient: 'from-blue-100 to-indigo-100'
  },
  {
    primary: 'green',
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    darkBg: 'bg-green-500',
    lightGradient: 'from-green-100 to-emerald-100'
  },
  {
    primary: 'purple',
    gradient: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    darkBg: 'bg-purple-500',
    lightGradient: 'from-purple-100 to-indigo-100'
  }
];

// Default colors for unknown scrapers
const DEFAULT_COLORS = {
  primary: 'blue',
  gradient: 'from-blue-500 to-indigo-500',
  bg: 'bg-blue-50',
  text: 'text-blue-600',
  border: 'border-blue-200',
  darkBg: 'bg-blue-500',
  lightGradient: 'from-blue-100 to-indigo-100'
};

// Helper function to get color scheme for a scraper based on its index
const getColorScheme = (scraperIndex: number) => {
  return COLOR_SCHEMES[scraperIndex % COLOR_SCHEMES.length] || DEFAULT_COLORS;
};

// Helper function to format scraper name from ID
const formatScraperName = (scraperId: string): string => {
  // Convert snake_case or kebab-case to Title Case
  return scraperId
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ScrapeControl = () => {
  const [availableScrapers, setAvailableScrapers] = useState<string[]>([]);
  const [scraperStatuses, setScraperStatuses] = useState<Record<string, ScrapingStatus | null>>({});
  const [scraperScrapingStates, setScraperScrapingStates] = useState<Record<string, boolean>>({});
  const [scraperStoppingStates, setScraperStoppingStates] = useState<Record<string, boolean>>({});
  const { success, error } = useToast();
  const { lastMessage } = useWebSocket();

  // Fetch initial scraping status on mount
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const statusResponse = await scraperService.getStatus();
        
        // Extract available scraper types from response keys (include all keys, even if status is null)
        const scrapers = Object.keys(statusResponse);
        
        setAvailableScrapers(scrapers);
        
        // Store all statuses in a dynamic object
        const statuses: Record<string, ScrapingStatus | null> = {};
        const scrapingStates: Record<string, boolean> = {};
        
        scrapers.forEach(scraperId => {
          const status = statusResponse[scraperId];
          statuses[scraperId] = status;
          scrapingStates[scraperId] = status?.status === 'scraping' || status?.status === 'running' || false;
        });
        
        setScraperStatuses(statuses);
        setScraperScrapingStates(scrapingStates);
      } catch (err) {
        // Silently fail - status will be updated via WebSocket
        console.error('Failed to fetch initial scraping status:', err);
      }
    };

    fetchInitialStatus();
  }, []);

  // Listen for WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'scraping_status') {
      const statusData = lastMessage.data as ScrapingStatus;
      const targetSite = lastMessage.target_site as string;

      if (targetSite) {
        // Update status for the specific scraper
        setScraperStatuses(prev => ({
          ...prev,
          [targetSite]: statusData
        }));
        
        setScraperScrapingStates(prev => ({
          ...prev,
          [targetSite]: statusData.status === 'scraping' || statusData.status === 'running'
        }));
        
        // Add to available scrapers if not already present
        setAvailableScrapers(prev => {
          if (!prev.includes(targetSite)) {
            return [...prev, targetSite];
          }
          return prev;
        });
      }
    }
  }, [lastMessage]);

  const handleScrapeAll = async (targetSite: string) => {
    setScraperScrapingStates(prev => ({ ...prev, [targetSite]: true }));

    try {
      const response = await scraperService.scrapeAllListings({
        target_site: targetSite,
        save_to_db: true,
      });

      if (response.status === 'started') {
        success(
          'Scraping Started',
          `Scraping all ${targetSite} listings has been started in the background. ${response.message || ''}`
        );
      } else {
        success(
          'Scraping Completed',
          `Successfully scraped ${response.count || 0} listings from ${targetSite}.`
        );
        setScraperScrapingStates(prev => ({ ...prev, [targetSite]: false }));
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to start scraping operation';
      if (err && typeof err === 'object') {
        const errorObj = err as { response?: { data?: { detail?: string } }; message?: string };
        errorMessage = errorObj.response?.data?.detail || errorObj.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      error('Scraping Failed', errorMessage);
      setScraperScrapingStates(prev => ({ ...prev, [targetSite]: false }));
    }
  };

  const handleScrapeDetails = async (targetSite: string) => {
    setScraperScrapingStates(prev => ({ ...prev, [targetSite]: true }));

    try {
      const response = await scraperService.scrapeAllDetails({
        target_site: targetSite,
        save_to_db: true,
      });

      if (response.status === 'started') {
        success(
          'Details Scraping Started',
          `Scraping details for ${response.urls_count || 0} existing ${targetSite} listings has been started in the background. ${response.message || ''}`
        );
      } else {
        success(
          'Details Scraping Completed',
          `Successfully scraped details for ${response.success_count || 0} listings from ${targetSite}.`
        );
        setScraperScrapingStates(prev => ({ ...prev, [targetSite]: false }));
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to start details scraping operation';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorObj = err as { response?: { data?: { detail?: string } } };
        errorMessage = errorObj.response?.data?.detail || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      error('Details Scraping Failed', errorMessage);
      setScraperScrapingStates(prev => ({ ...prev, [targetSite]: false }));
    }
  };

  const handleStartAutoCycle = async (targetSite: string) => {
    setScraperScrapingStates(prev => ({ ...prev, [targetSite]: true }));

    try {
      const response = await scraperService.startAutoCycle({
        target_site: targetSite,
        max_pages: null,
        cycle_delay_minutes: 30,
        headless: true,
      });

      if (response.status === 'started') {
        success(
          'Auto Cycle Started',
          `Automatic scraping cycle for ${targetSite} has been started. ${response.message || ''}`
        );
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to start auto cycle';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorObj = err as { response?: { data?: { detail?: string } } };
        errorMessage = errorObj.response?.data?.detail || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      error('Auto Cycle Failed', errorMessage);
      setScraperScrapingStates(prev => ({ ...prev, [targetSite]: false }));
    }
  };

  const handleStopScraping = async (targetSite: string) => {
    setScraperStoppingStates(prev => ({ ...prev, [targetSite]: true }));

    try {
      const response = await scraperService.stopScraping({
        target_site: targetSite,
      });

      if (response.status === 'stopped') {
        success(
          'Stop Signal Sent',
          response.message || `Stop signal sent to ${targetSite} scraper. It will stop after completing the current page.`
        );
        setScraperScrapingStates(prev => ({ ...prev, [targetSite]: false }));
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to stop scraping operation';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorObj = err as { response?: { data?: { detail?: string } } };
        errorMessage = errorObj.response?.data?.detail || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      error('Stop Failed', errorMessage);
    } finally {
      setScraperStoppingStates(prev => ({ ...prev, [targetSite]: false }));
    }
  };

  const renderScrapingSection = (targetSite: string) => {
    const isScraping = scraperScrapingStates[targetSite] || false;
    const isStopping = scraperStoppingStates[targetSite] || false;
    const status = scraperStatuses[targetSite] || null;
    const scraperIndex = availableScrapers.indexOf(targetSite);
    const siteName = formatScraperName(targetSite);
    
    // Color scheme - assign based on scraper index
    const colors = getColorScheme(scraperIndex);

    // Get status message
    const getStatusMessage = () => {
      if (!status) return { text: 'Initializing...', icon: Loader, color: 'text-gray-500' };
      
      if (status.auto_cycle_running) {
        return { text: 'Auto Cycle Running', icon: RefreshCw, color: 'text-purple-600' };
      }
      
      if (status.status === 'scraping' || status.status === 'running') {
        const type = status.type === 'listings' ? 'Basic Listings' : 'Listing Details';
        return { text: `Scraping ${type}`, icon: Activity, color: 'text-blue-600' };
      }
      
      if (status.status === 'completed') {
        return { text: 'Operation Completed', icon: CheckCircle, color: 'text-green-600' };
      }
      
      if (status.status === 'stopped') {
        return { text: 'Operation Stopped', icon: AlertCircle, color: 'text-yellow-600' };
      }
      
      if (status.status === 'error') {
        return { text: 'Operation Failed', icon: AlertCircle, color: 'text-red-600' };
      }
      
      return { text: 'Ready to Scrape', icon: Clock, color: 'text-gray-600' };
    };

    const statusInfo = getStatusMessage();

    // Calculate progress percentage
    const getProgressPercentage = () => {
      if (!status || (status.status !== 'scraping' && status.status !== 'running')) return 0;
      
      if (status.type === 'listings' && status.total_pages) {
        return Math.round((status.pages_scraped / status.total_pages) * 100);
      } else if (status.type === 'details' && status.total_urls > 0) {
        return Math.round((status.urls_scraped / status.total_urls) * 100);
      }
      return 0;
    };

    const progressPercentage = getProgressPercentage();

    return (
      <div className="space-y-6">
        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.lightGradient}`}>
                <statusInfo.icon className={`w-6 h-6 ${statusInfo.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Current Status</p>
                <p className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.text}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {status?.auto_cycle_running && (
                <Badge variant="info" className="bg-purple-100 text-purple-700 border-purple-200">
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" style={{ animationDuration: '3s' }} />
                  Cycle #{status.cycle_number || 1}
                </Badge>
              )}
              {(isScraping || status?.status === 'scraping' || status?.status === 'running') && !status?.auto_cycle_running && (
                <Badge variant="blue">
                  <Activity className="w-3 h-3 animate-pulse mr-1" />
                  Scraping
                </Badge>
              )}
              {!isScraping && !status?.auto_cycle_running && status?.status !== 'scraping' && status?.status !== 'running' && (
                <Badge variant="success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status Cards */}
        {status && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              title="Mode"
              value={status.auto_cycle_running ? 'Auto Cycle' : status.status === 'scraping' || status.status === 'running' ? 'Manual' : 'Idle'}
              icon={status.auto_cycle_running ? RefreshCw : status.status === 'scraping' || status.status === 'running' ? Activity : Clock}
              color={status.auto_cycle_running ? 'blue' : status.status === 'scraping' || status.status === 'running' ? 'green' : 'blue'}
              loading={false}
            />
            {status.type === 'listings' && (
              <>
                <StatCard
                  title="Pages Scraped"
                  value={`${status.pages_scraped}${status.total_pages ? `/${status.total_pages}` : ''}`}
                  icon={FileText}
                  color={colors.primary as 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'teal'}
                  loading={false}
                />
                <StatCard
                  title="Listings Found"
                  value={status.listings_found.toString()}
                  icon={TrendingUp}
                  color="blue"
                  loading={false}
                />
                <StatCard
                  title="Listings Saved"
                  value={status.listings_saved.toString()}
                  icon={Download}
                  color="green"
                  loading={false}
                />
              </>
            )}
            {status.type === 'details' && (
              <>
                <StatCard
                  title="URLs Processed"
                  value={`${status.urls_scraped}/${status.total_urls}`}
                  icon={FileText}
                  color={colors.primary as 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'teal'}
                  loading={false}
                />
                <StatCard
                  title="Progress"
                  value={`${progressPercentage}%`}
                  icon={TrendingUp}
                  color="blue"
                  loading={false}
                />
              </>
            )}
          </motion.div>
        )}

        {/* Main Control Panel */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl p-6 lg:p-8 border-2 border-gray-200 shadow-xl"
        >
          <div className="flex items-start gap-4 sm:gap-6 mb-6">
            <div className={`p-4 ${colors.bg} rounded-xl`}>
              <Download className={`w-8 h-8 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {siteName} Scraping Operations
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Control and monitor real-time scraping operations for {siteName} property listings
              </p>
            </div>
          </div>
          
          {/* Progress Bar - Active Scraping */}
          <AnimatePresence>
            {status && (status.status === 'scraping' || status.status === 'running') && (status.total_pages || status.total_urls > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
                      <span className="font-semibold text-blue-900">
                        {status.type === 'listings' ? 'Scraping Listings' : 'Scraping Details'}
                      </span>
                      <Badge variant="blue">In Progress</Badge>
                      {status.auto_cycle_running && (
                        <Badge variant="info" className="bg-purple-100 text-purple-700 border-purple-200">
                          Auto Cycle #{status.cycle_number}
                        </Badge>
                      )}
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`absolute h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                  {status.type === 'details' && status.current_url && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-2 font-mono truncate"
                      title={status.current_url}
                    >
                      {status.current_url}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Scraping Operations</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Scrape All Listings */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`relative overflow-hidden ${colors.bg} rounded-xl p-6 border-2 ${colors.border} transition-all duration-300`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 bg-white rounded-lg ${colors.text} shadow-sm`}>
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">Basic Scraping</h4>
                        <p className="text-xs text-gray-500 font-medium">Quick Collection</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 mb-4">
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      Collect all available listings with essential information:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1.5 mb-3">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>Property URLs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>Titles & Prices</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>Property Types</span>
                      </li>
                    </ul>
                    <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Fast initial scan to discover new listings
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant={status?.type === 'listings' && !status?.auto_cycle_running && (status?.status === 'scraping' || status?.status === 'running') ? "danger" : "primary"}
                    fullWidth
                    size="lg"
                    onClick={() => {
                      if (status?.type === 'listings' && !status?.auto_cycle_running && (status?.status === 'scraping' || status?.status === 'running')) {
                        handleStopScraping(targetSite);
                      } else {
                        handleScrapeAll(targetSite);
                      }
                    }}
                    loading={status?.type === 'listings' && !status?.auto_cycle_running && (status?.status === 'scraping' || status?.status === 'running') && isStopping}
                    disabled={status?.auto_cycle_running || isStopping || (status?.type !== 'listings' && status?.type !== null && isScraping)}
                    leftIcon={
                      status?.type === 'listings' && !status?.auto_cycle_running && (status?.status === 'scraping' || status?.status === 'running') ? (
                        <Square className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )
                    }
                  >
                    {status?.type === 'listings' && !status?.auto_cycle_running && (status?.status === 'scraping' || status?.status === 'running') 
                      ? (isStopping ? 'Stopping...' : 'Stop Scraping')
                      : 'Start Basic Scraping'}
                  </Button>
                </div>
              </motion.div>

              {/* Scrape All Details */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-lg text-green-600 shadow-sm">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">Full Details</h4>
                        <p className="text-xs text-gray-500 font-medium">Deep Extraction</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 mb-4">
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      Extract comprehensive property information:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1.5 mb-3">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>Agent Contact Details</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>Property Specifications</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>Amenities & Features</span>
                      </li>
                    </ul>
                    <div className="flex items-start gap-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-700">
                        Requires basic listings to be scraped first
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant={status?.type === 'details' && !status?.auto_cycle_running && (status?.status === 'scraping' || status?.status === 'running') ? "danger" : "success"}
                    fullWidth
                    size="lg"
                    onClick={() => {
                      if (status?.type === 'details' && !status?.auto_cycle_running && (status?.status === 'scraping' || status?.status === 'running')) {
                        handleStopScraping(targetSite);
                      } else {
                        handleScrapeDetails(targetSite);
                      }
                    }}
                    loading={status?.type === 'details' && !status?.auto_cycle_running && (status?.status === 'scraping' || status?.status === 'running') && isStopping}
                    disabled={status?.auto_cycle_running || isStopping || (status?.type !== 'details' && status?.type !== null && isScraping)}
                    leftIcon={
                      status?.type === 'details' && !status?.auto_cycle_running && (status?.status === 'scraping' || status?.status === 'running') ? (
                        <Square className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )
                    }
                  >
                    {status?.type === 'details' && !status?.auto_cycle_running && (status?.status === 'scraping' || status?.status === 'running') 
                      ? (isStopping ? 'Stopping...' : 'Stop Scraping')
                      : 'Start Detail Scraping'}
                  </Button>
                </div>
              </motion.div>

              {/* Auto Cycle */}
              <motion.div
                whileHover={{ scale: status?.auto_cycle_running ? 1 : 1.02 }}
                className={`relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 ${
                  status?.auto_cycle_running ? 'border-purple-400 shadow-lg' : 'border-purple-200'
                } transition-all duration-300`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 bg-white rounded-lg text-purple-600 shadow-sm ${status?.auto_cycle_running ? 'animate-pulse' : ''}`}>
                        <RefreshCw className={`w-5 h-5 ${status?.auto_cycle_running ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">Auto Cycle</h4>
                        <p className="text-xs text-gray-500 font-medium">Automated Mode</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 mb-4">
                    {status?.auto_cycle_running ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-purple-100 rounded-lg">
                          <span className="text-sm font-medium text-purple-900">Current Cycle</span>
                          <Badge variant="info" className="bg-purple-200 text-purple-800 border-purple-300">
                            #{status.cycle_number || 1}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Phase:</span>
                            <span className="font-semibold text-gray-900">
                              {status.phase === 'basic_listings' ? '🔄 Listings' : 
                               status.phase === 'details' ? '📋 Details' : 
                               `⏳ Waiting (${status.wait_minutes}min)`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-green-700">
                            System is running autonomously
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          Fully automated continuous operation:
                        </p>
                        <ul className="text-xs text-gray-600 space-y-1.5 mb-3">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-purple-500 flex-shrink-0" />
                            <span>Scrape new listings</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-purple-500 flex-shrink-0" />
                            <span>Extract full details</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-purple-500 flex-shrink-0" />
                            <span>Repeat every 30 minutes</span>
                          </li>
                        </ul>
                        <div className="flex items-start gap-2 p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                          <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-purple-700">
                            Best for keeping database always up-to-date
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <Button
                    variant={status?.auto_cycle_running ? "danger" : "secondary"}
                    fullWidth
                    size="lg"
                    onClick={() => status?.auto_cycle_running ? handleStopScraping(targetSite) : handleStartAutoCycle(targetSite)}
                    loading={(status?.auto_cycle_running && isStopping) || (!status?.auto_cycle_running && isScraping && status?.type === 'auto_cycle')}
                    disabled={(status?.auto_cycle_running ? isStopping : (isScraping || isStopping))}
                    leftIcon={
                      status?.auto_cycle_running ? (
                        <Square className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )
                    }
                  >
                    {status?.auto_cycle_running 
                      ? (isStopping ? 'Stopping...' : 'Stop Auto Cycle')
                      : 'Start Auto Cycle'}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

        </motion.div>
      </div>
    );
  };

  const [activeTab, setActiveTab] = useState<string>('');
  
  // Set initial active tab when scrapers are available
  useEffect(() => {
    if (availableScrapers.length > 0 && !activeTab) {
      setActiveTab(availableScrapers[0]);
    }
  }, [availableScrapers, activeTab]);

  return (
    <AnimatedPage className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        variants={slideFromBottom}
        initial="initial"
        animate="animate"
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
              Scrape Control Center
            </h1>
            <p className="mt-2 text-[clamp(0.875rem,2vw,1.125rem)] text-gray-600 max-w-2xl">
              Automate property data collection from leading real estate platforms in Tanzania
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
            <div className="text-left">
              <p className="text-xs font-medium text-gray-500">System Status</p>
              <p className="text-sm font-bold text-gray-900">Operational</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      {availableScrapers.length > 0 && (
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="mb-6 sm:mb-8"
        >
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-xl max-w-full overflow-x-auto">
            {availableScrapers.map((scraperId, index) => {
              const scraperName = formatScraperName(scraperId);
              const status = scraperStatuses[scraperId];
              const colors = getColorScheme(index);
              
              // Map color names to Tailwind classes
              const colorMap: Record<string, string> = {
                orange: 'bg-orange-500',
                teal: 'bg-teal-500',
                blue: 'bg-blue-500',
                green: 'bg-green-500',
                purple: 'bg-purple-500',
                red: 'bg-red-500',
                yellow: 'bg-yellow-500',
                indigo: 'bg-indigo-500',
                pink: 'bg-pink-500',
              };
              
              const activeDotColor = colorMap[colors.primary] || 'bg-blue-500';
              
              return (
                <button
                  key={scraperId}
                  onClick={() => setActiveTab(scraperId)}
                  className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    activeTab === scraperId
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      activeTab === scraperId 
                        ? activeDotColor
                        : 'bg-gray-400'
                    }`} />
                    <span className="truncate">{scraperName}</span>
                    {status?.auto_cycle_running && (
                      <RefreshCw className="w-3 h-3 text-purple-600 animate-spin flex-shrink-0" style={{ animationDuration: '2s' }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Content */}
      {activeTab && availableScrapers.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderScrapingSection(activeTab)}
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Loader className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Loading scrapers...</p>
        </motion.div>
      )}
    </AnimatedPage>
  );
};

export default ScrapeControl;

