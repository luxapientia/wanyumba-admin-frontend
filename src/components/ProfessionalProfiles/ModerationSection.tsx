import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ModerationSectionProps {
  rejectionReason?: string;
  moderationNotes?: string;
  delay?: number;
}

export default function ModerationSection({
  rejectionReason,
  moderationNotes,
  delay = 0.6,
}: ModerationSectionProps) {
  if (!rejectionReason && !moderationNotes) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <AlertCircle size={20} className="text-orange-600" />
        Moderation Information
      </h2>
      <div className="space-y-3">
        {rejectionReason && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">Rejection Reason:</span>
            <p className="text-red-700 bg-red-50 p-3 rounded-lg">{rejectionReason}</p>
          </div>
        )}
        {moderationNotes && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">Moderation Notes:</span>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{moderationNotes}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

