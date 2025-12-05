import { motion } from 'framer-motion';
import { Eye, MessageCircle, Clock } from 'lucide-react';

interface ProfileStatsSectionProps {
  views?: number;
  inquiries?: number;
  profileCompleteness?: number;
  averageTurnaroundTime?: string;
  delay?: number;
}

export default function ProfileStatsSection({
  views,
  inquiries,
  profileCompleteness,
  averageTurnaroundTime,
  delay = 0.3,
}: ProfileStatsSectionProps) {
  const hasStats = views !== undefined || inquiries !== undefined || profileCompleteness !== undefined || averageTurnaroundTime;

  if (!hasStats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Statistics</h2>
      <div className="space-y-3 text-sm">
        {views !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-2">
              <Eye size={16} />
              Views
            </span>
            <span className="font-semibold text-gray-900">{views}</span>
          </div>
        )}
        {inquiries !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-2">
              <MessageCircle size={16} />
              Inquiries
            </span>
            <span className="font-semibold text-gray-900">{inquiries}</span>
          </div>
        )}
        {profileCompleteness !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Completeness</span>
            <span className="font-semibold text-gray-900">{profileCompleteness}%</span>
          </div>
        )}
        {averageTurnaroundTime && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-2">
              <Clock size={16} />
              Avg Turnaround
            </span>
            <span className="font-semibold text-gray-900">{averageTurnaroundTime}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

