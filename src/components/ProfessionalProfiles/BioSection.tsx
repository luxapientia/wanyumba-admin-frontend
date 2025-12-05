import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

interface BioSectionProps {
  bio?: string;
  shortBio?: string;
  colorScheme?: 'indigo' | 'blue';
  delay?: number;
}

export default function BioSection({ bio, shortBio, colorScheme = 'indigo', delay = 0.1 }: BioSectionProps) {
  const iconColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';

  if (!bio && !shortBio) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
    >
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText size={18} className={`sm:w-5 sm:h-5 ${iconColor}`} />
        {shortBio && !bio ? 'Short Bio' : 'Biography'}
      </h2>
      {bio && (
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words mb-4">{bio}</p>
      )}
      {shortBio && (
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words">{shortBio}</p>
      )}
    </motion.div>
  );
}

