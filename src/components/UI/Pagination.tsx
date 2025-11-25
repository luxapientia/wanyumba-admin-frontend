import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button.js';

export interface PaginationProps {
  // Current pagination state
  page: number;
  limit: number;
  total: number;
  pages: number;

  // Callbacks
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;

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
  onPageChange,
  onLimitChange,
  limitOptions = [10, 25, 50, 100],
  showPageInfo = true,
  showLimitSelector = true,
  className = '',
}: PaginationProps) {
  // Calculate display range
  const startItem = Math.min((page - 1) * limit + 1, total);
  const endItem = Math.min(page * limit, total);

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const maxVisible = 5;
    if (pages <= maxVisible) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }

    if (page <= 3) {
      return Array.from({ length: maxVisible }, (_, i) => i + 1);
    }

    if (page >= pages - 2) {
      return Array.from({ length: maxVisible }, (_, i) => pages - maxVisible + i + 1);
    }

    return Array.from({ length: maxVisible }, (_, i) => page - 2 + i);
  };

  const pageNumbers = getPageNumbers();

  // Don't render if no pages
  if (pages <= 1 && !showPageInfo && !showLimitSelector) {
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
                Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
                <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
                <span className="font-semibold text-gray-900">{total}</span> results
              </div>
            )}

            {/* Items Per Page Selector */}
            {showLimitSelector && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">Per Page:</label>
                <select
                  value={limit}
                  onChange={(e) => {
                    onLimitChange(Number(e.target.value));
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
        {pages > 1 && (
          <div className="flex items-center gap-2">
            {/* First Page */}
            <Button
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              variant="outline"
              size="sm"
              className="p-2 border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50"
              aria-label="First page"
            >
              <ChevronsLeft size={18} />
            </Button>

            {/* Previous Page */}
            <Button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
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
                  variant={page === pageNum ? 'primary' : 'outline'}
                  size="sm"
                  className={`min-w-[40px] h-[40px] px-3 ${
                    page === pageNum ? '' : 'border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50'
                  }`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={page === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            {/* Next Page */}
            <Button
              onClick={() => onPageChange(Math.min(pages, page + 1))}
              disabled={page === pages}
              variant="outline"
              size="sm"
              className="p-2 border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </Button>

            {/* Last Page */}
            <Button
              onClick={() => onPageChange(pages)}
              disabled={page === pages}
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

