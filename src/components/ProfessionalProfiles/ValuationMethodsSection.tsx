import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

interface ValuationMethodsSectionProps {
  valuationMethods?: string[];
  delay?: number;
}

export default function ValuationMethodsSection({ 
  valuationMethods, 
  delay = 0.2 
}: ValuationMethodsSectionProps) {
  if (!valuationMethods || valuationMethods.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Award size={20} className="text-blue-600" />
        Valuation Methods
      </h2>
      <div className="flex flex-wrap gap-2">
        {valuationMethods.map((method, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold"
          >
            {method}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

