import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

interface LanguagesSectionProps {
  languages?: string[];
  colorScheme?: 'indigo' | 'blue';
  delay?: number;
}

export default function LanguagesSection({ 
  languages, 
  colorScheme = 'indigo', 
  delay = 0.15 
}: LanguagesSectionProps) {
  const iconColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';
  const badgeBg = colorScheme === 'indigo' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700';

  if (!languages || languages.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
    >
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Globe size={18} className={`sm:w-5 sm:h-5 ${iconColor}`} />
        Languages
      </h2>
      <div className="flex flex-wrap gap-2">
        {languages.map((lang, idx) => (
          <span
            key={idx}
            className={`px-2 sm:px-3 py-1 ${badgeBg} rounded-md text-xs sm:text-sm font-semibold break-words`}
          >
            {lang}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

