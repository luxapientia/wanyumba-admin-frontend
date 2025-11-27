import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button.js';

export interface PaginationProps {
  // Current pagination state - support both naming conventions
  page?: number;
  limit?: number;
  total?: number;
  pages?: number;
  // Alternative prop names
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  totalPages?: number;

  // Callbacks
  onPageChange: (newPage: number) => void;
  onItemsPerPageChange?: (newLimit: number) => void;
  onLimitChange?: (newLimit: number) => void;

  // Options
  limitOptions?: number[];
  showPageInfo?: boolean;
  showLimitSelector?: boolean;
  className?: string;
}

export default function Pagination({
  page,
  limit,
  total,
  pages,
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  onPageChange,
  onLimitChange,
  onItemsPerPageChange,
  limitOptions = [10, 25, 50, 100],
  showPageInfo = true,
  showLimitSelector = true,
  className = '',
}: PaginationProps) {
  // Normalize prop names - support both naming conventions
  const normalizedPage = page ?? currentPage ?? 1;
  const normalizedLimit = limit ?? itemsPerPage ?? 10;
  const normalizedTotal = total ?? totalItems ?? 0;
  const normalizedPages = pages ?? totalPages ?? (Math.ceil(normalizedTotal / normalizedLimit) || 1);
  const normalizedOnLimitChange = onLimitChange ?? onItemsPerPageChange ?? (() => {});

  // Calculate display range with safe defaults
  const startItem = normalizedTotal > 0 ? Math.min((normalizedPage - 1) * normalizedLimit + 1, normalizedTotal) : 0;
  const endItem = normalizedTotal > 0 ? Math.min(normalizedPage * normalizedLimit, normalizedTotal) : 0;

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const maxVisible = 5;
    if (normalizedPages <= maxVisible) {
      return Array.from({ length: normalizedPages }, (_, i) => i + 1);
    }

    if (normalizedPage <= 3) {
      return Array.from({ length: maxVisible }, (_, i) => i + 1);
    }

    if (normalizedPage >= normalizedPages - 2) {
      return Array.from({ length: maxVisible }, (_, i) => normalizedPages - maxVisible + i + 1);
    }

    return Array.from({ length: maxVisible }, (_, i) => normalizedPage - 2 + i);
  };

  const pageNumbers = getPageNumbers();

  // Don't render if no pages
  if (normalizedPages <= 1 && !showPageInfo && !showLimitSelector) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 sm:p-6 ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left Side: Page Info & Items Per Page */}
        {(showPageInfo || showLimitSelector) && (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Page Info */}
            {showPageInfo && (
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{startItem.toLocaleString()}</span> to{' '}
                <span className="font-semibold text-gray-900">{endItem.toLocaleString()}</span> of{' '}
                <span className="font-semibold text-gray-900">{normalizedTotal.toLocaleString()}</span> results
              </div>
            )}

            {/* Items Per Page Selector */}
            {showLimitSelector && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">Per Page:</label>
                <select
                  value={normalizedLimit}
                  onChange={(e) => {
                    normalizedOnLimitChange(Number(e.target.value));
                  }}
                  className="px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium bg-white hover:border-purple-400 transition-all cursor-pointer"
                >
                  {limitOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Right Side: Pagination Controls */}
        {normalizedPages > 1 && (
          <div className="flex items-center gap-2">
            {/* First Page */}
            <Button
              onClick={() => onPageChange(1)}
              disabled={normalizedPage === 1}
              variant="outline"
              size="sm"
              className="p-2 border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50"
              aria-label="First page"
            >
              <ChevronsLeft size={18} />
            </Button>

            {/* Previous Page */}
            <Button
              onClick={() => onPageChange(Math.max(1, normalizedPage - 1))}
              disabled={normalizedPage === 1}
              variant="outline"
              size="sm"
              className="p-2 border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  variant={normalizedPage === pageNum ? 'primary' : 'outline'}
                  size="sm"
                  className={`min-w-[40px] h-[40px] px-3 ${
                    normalizedPage === pageNum ? '' : 'border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50'
                  }`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={normalizedPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            {/* Next Page */}
            <Button
              onClick={() => onPageChange(Math.min(normalizedPages, normalizedPage + 1))}
              disabled={normalizedPage === normalizedPages}
              variant="outline"
              size="sm"
              className="p-2 border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </Button>

            {/* Last Page */}
            <Button
              onClick={() => onPageChange(normalizedPages)}
              disabled={normalizedPage === normalizedPages}
              variant="outline"
              size="sm"
              className="p-2 border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50"
              aria-label="Last page"
            >
              <ChevronsRight size={18} />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

