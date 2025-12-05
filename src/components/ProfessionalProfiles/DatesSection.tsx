import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface DatesSectionProps {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  verifiedAt?: string;
  unpublishedAt?: string;
  colorScheme?: 'indigo' | 'blue';
  delay?: number;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function DatesSection({
  createdAt,
  updatedAt,
  publishedAt,
  verifiedAt,
  unpublishedAt,
  colorScheme = 'indigo',
  delay = 0.4,
}: DatesSectionProps) {
  const iconColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar size={18} className={iconColor} />
        Important Dates
      </h2>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-500">Created:</span>
          <span className="ml-2 text-gray-900">{formatDate(createdAt)}</span>
        </div>
        <div>
          <span className="text-gray-500">Last Updated:</span>
          <span className="ml-2 text-gray-900">{formatDate(updatedAt)}</span>
        </div>
        {publishedAt && (
          <div>
            <span className="text-gray-500">Published:</span>
            <span className="ml-2 text-gray-900">{formatDate(publishedAt)}</span>
          </div>
        )}
        {unpublishedAt && (
          <div>
            <span className="text-gray-500">Unpublished:</span>
            <span className="ml-2 text-gray-900">{formatDate(unpublishedAt)}</span>
          </div>
        )}
        {verifiedAt && (
          <div>
            <span className="text-gray-500">Verified:</span>
            <span className="ml-2 text-gray-900">{formatDate(verifiedAt)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

