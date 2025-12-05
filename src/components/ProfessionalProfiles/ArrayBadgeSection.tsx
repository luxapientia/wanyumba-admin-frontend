import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ArrayBadgeSectionProps {
  title: string;
  icon: ReactNode;
  items?: string[];
  colorScheme?: 'indigo' | 'blue' | 'purple' | 'cyan';
  delay?: number;
}

export default function ArrayBadgeSection({
  title,
  icon,
  items,
  colorScheme = 'indigo',
  delay = 0.25,
}: ArrayBadgeSectionProps) {
  if (!items || items.length === 0) return null;

  const badgeColors: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    cyan: 'bg-cyan-100 text-cyan-700',
  };

  const badgeColor = badgeColors[colorScheme] || badgeColors.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
    >
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`px-2 sm:px-3 py-1 ${badgeColor} rounded-md text-xs sm:text-sm font-semibold break-words`}
          >
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

