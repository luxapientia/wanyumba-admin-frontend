import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

interface IdCardSectionProps {
  idCardOrPassport?: string;
  colorScheme?: 'indigo' | 'blue';
  delay?: number;
}

export default function IdCardSection({
  idCardOrPassport,
  colorScheme = 'indigo',
  delay = 0.55,
}: IdCardSectionProps) {
  const iconColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';

  if (!idCardOrPassport) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FileText size={20} className={iconColor} />
        ID Card / Passport
      </h2>
      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
        <img
          src={idCardOrPassport}
          alt="ID Card or Passport"
          className="w-full h-auto max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(idCardOrPassport, '_blank')}
        />
      </div>
    </motion.div>
  );
}

