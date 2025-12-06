import { motion } from 'framer-motion';
import { Building2, MapPin } from 'lucide-react';
import { Map } from '../UI';

interface OfficeInformationSectionProps {
  officeName?: string;
  officeAddress?: string;
  officeLatitude?: number;
  officeLongitude?: number;
  timezone?: string;
  colorScheme?: 'indigo' | 'blue';
  delay?: number;
}

export default function OfficeInformationSection({
  officeName,
  officeAddress,
  officeLatitude,
  officeLongitude,
  timezone,
  colorScheme = 'indigo',
  delay = 0.4,
}: OfficeInformationSectionProps) {
  const iconColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';

  const hasOfficeInfo = officeName || officeAddress || officeLatitude || officeLongitude || timezone;

  if (!hasOfficeInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Building2 size={20} className={iconColor} />
        Office Information
      </h2>
      <div className="space-y-3">
        {officeName && (
          <div>
            <span className="text-sm text-gray-500">Office Name:</span>
            <p className="text-gray-900 font-medium">{officeName}</p>
          </div>
        )}
        {officeAddress && (
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-gray-400 mt-1" />
            <div>
              <span className="text-sm text-gray-500 block mb-1">Address:</span>
              <span className="text-gray-700">{officeAddress}</span>
            </div>
          </div>
        )}
        {officeLatitude && officeLongitude && (
          <div>
            <span className="text-sm text-gray-500 mb-2 block">Location Map:</span>
            <Map
              latitude={Number(officeLatitude)}
              longitude={Number(officeLongitude)}
              address={officeAddress}
              title={officeName}
              height="300px"
              className="mt-2"
            />
            <p className="text-gray-500 font-mono text-xs mt-2">
              {Number(officeLatitude).toFixed(6)}, {Number(officeLongitude).toFixed(6)}
            </p>
          </div>
        )}
        {timezone && (
          <div>
            <span className="text-sm text-gray-500">Timezone:</span>
            <p className="text-gray-700">{timezone}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

