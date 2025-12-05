import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

interface LicenseSectionProps {
  licenseNumber?: string;
  licenseIssuer?: string;
  licenseExpiryDate?: string;
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

export default function LicenseSection({
  licenseNumber,
  licenseIssuer,
  licenseExpiryDate,
  colorScheme = 'indigo',
  delay = 0.2,
}: LicenseSectionProps) {
  const iconColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';

  if (!licenseNumber && !licenseIssuer && !licenseExpiryDate) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Award size={18} className={iconColor} />
        License Information
      </h2>
      <div className="space-y-2 text-sm">
        {licenseNumber && (
          <div className="break-words">
            <span className="text-gray-500">License Number:</span>
            <span className="ml-2 text-gray-900 font-semibold break-all">{licenseNumber}</span>
          </div>
        )}
        {licenseIssuer && (
          <div className="break-words">
            <span className="text-gray-500">Issuer:</span>
            <span className="ml-2 text-gray-900 break-words">{licenseIssuer}</span>
          </div>
        )}
        {licenseExpiryDate && (
          <div>
            <span className="text-gray-500">Expiry Date:</span>
            <span className="ml-2 text-gray-900">{formatDate(licenseExpiryDate)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

