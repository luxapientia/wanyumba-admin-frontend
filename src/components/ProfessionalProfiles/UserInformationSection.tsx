import { motion } from 'framer-motion';

interface UserInformationSectionProps {
  user?: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  delay?: number;
}

export default function UserInformationSection({
  user,
  delay = 0.45,
}: UserInformationSectionProps) {
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4">User Information</h2>
      <div className="space-y-2 text-sm">
        <div className="break-words">
          <span className="text-gray-500">User ID:</span>
          <span className="ml-2 text-gray-900 font-mono text-xs break-all">{user.id}</span>
        </div>
        {user.email && (
          <div className="break-words">
            <span className="text-gray-500">Email:</span>
            <span className="ml-2 text-gray-900 break-all">{user.email}</span>
          </div>
        )}
        {(user.firstName || user.lastName) && (
          <div className="break-words">
            <span className="text-gray-500">Name:</span>
            <span className="ml-2 text-gray-900 break-words">
              {user.firstName || ''} {user.lastName || ''}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

