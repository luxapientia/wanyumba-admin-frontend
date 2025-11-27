import React from 'react';
import { motion } from 'framer-motion';
import { staggerItem } from '../../utils/animations.js';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'teal' | 'purple' | 'pink';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = 'blue', loading = false }) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 shadow-blue-100',
    green: 'bg-gradient-to-br from-green-50 to-green-100/50 text-green-600 shadow-green-100',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100/50 text-orange-600 shadow-orange-100',
    teal: 'bg-gradient-to-br from-teal-50 to-teal-100/50 text-teal-600 shadow-teal-100',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100/50 text-purple-600 shadow-purple-100',
    pink: 'bg-gradient-to-br from-pink-50 to-pink-100/50 text-pink-600 shadow-pink-100',
  };

  const borderClasses = {
    blue: 'border-blue-100',
    green: 'border-green-100',
    orange: 'border-orange-100',
    teal: 'border-teal-100',
    purple: 'border-purple-100',
    pink: 'border-pink-100',
  };

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{
        y: -4,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
      }}
      className={`bg-white rounded-2xl shadow-sm border-2 ${borderClasses[color]} p-6 transition-all duration-200 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          {loading ? (
            <div className="mt-3 h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
          ) : (
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-3 text-4xl font-extrabold text-gray-900 tracking-tight"
            >
              {value}
            </motion.p>
          )}
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className={`mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                trend.positive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              <svg
                className={`w-3 h-3 mr-1 ${trend.positive ? 'rotate-0' : 'rotate-180'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {trend.value}
            </motion.div>
          )}
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className={`p-4 rounded-2xl shadow-lg ${colorClasses[color]}`}
        >
          <Icon size={28} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatCard;

