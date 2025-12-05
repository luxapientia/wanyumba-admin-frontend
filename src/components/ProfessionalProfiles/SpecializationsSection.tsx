import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

interface SpecializationsSectionProps {
  specializations?: string[];
  colorScheme?: 'indigo' | 'blue';
  delay?: number;
}

export default function SpecializationsSection({ 
  specializations, 
  colorScheme = 'indigo', 
  delay = 0.2 
}: SpecializationsSectionProps) {
  const iconColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';
  const badgeBg = colorScheme === 'indigo' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700';

  if (!specializations || specializations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Award size={20} className={iconColor} />
        Specializations
      </h2>
      <div className="flex flex-wrap gap-2">
        {specializations.map((spec, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 ${badgeBg} rounded-md text-sm font-semibold`}
          >
            {spec}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

