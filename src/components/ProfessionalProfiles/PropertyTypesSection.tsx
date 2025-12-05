import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

interface PropertyTypesSectionProps {
  propertyTypes?: string[];
  delay?: number;
}

export default function PropertyTypesSection({ 
  propertyTypes, 
  delay = 0.15 
}: PropertyTypesSectionProps) {
  if (!propertyTypes || propertyTypes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Home size={20} className="text-blue-600" />
        Property Types
      </h2>
      <div className="flex flex-wrap gap-2">
        {propertyTypes.map((type, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold"
          >
            {type}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

