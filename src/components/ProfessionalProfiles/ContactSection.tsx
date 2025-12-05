import { motion } from 'framer-motion';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';

interface ContactSectionProps {
  businessEmail?: string;
  businessEmailAlt?: string;
  businessPhone?: string;
  businessPhoneAlt?: string;
  website?: string;
  officeAddress?: string;
  colorScheme?: 'indigo' | 'blue';
  delay?: number;
}

export default function ContactSection({
  businessEmail,
  businessEmailAlt,
  businessPhone,
  businessPhoneAlt,
  website,
  officeAddress,
  colorScheme = 'indigo',
  delay = 0.3,
}: ContactSectionProps) {
  const iconColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';
  const linkColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';

  const hasContactInfo = businessEmail || businessEmailAlt || businessPhone || businessPhoneAlt || website || officeAddress;

  if (!hasContactInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Phone size={20} className={iconColor} />
        Contact Information
      </h2>
      <div className="space-y-3">
        {businessEmail && (
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-gray-400" />
            <span className="text-gray-700">{businessEmail}</span>
          </div>
        )}
        {businessEmailAlt && (
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-gray-400" />
            <span className="text-gray-700">{businessEmailAlt} <span className="text-gray-500 text-sm">(Alternate)</span></span>
          </div>
        )}
        {businessPhone && (
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-gray-400" />
            <span className="text-gray-700">{businessPhone}</span>
          </div>
        )}
        {businessPhoneAlt && (
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-gray-400" />
            <span className="text-gray-700">{businessPhoneAlt} <span className="text-gray-500 text-sm">(Alternate)</span></span>
          </div>
        )}
        {website && (
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-gray-400" />
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkColor} hover:underline`}
            >
              {website}
            </a>
          </div>
        )}
        {officeAddress && (
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-gray-400 mt-1" />
            <span className="text-gray-700">{officeAddress}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

