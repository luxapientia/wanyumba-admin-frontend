import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface TeamInformationSectionProps {
  isSoloPractitioner?: boolean;
  firmSize?: number;
  companySize?: number;
  teamMembers?: unknown;
  colorScheme?: 'indigo' | 'blue';
  delay?: number;
}

export default function TeamInformationSection({
  isSoloPractitioner,
  firmSize,
  companySize,
  teamMembers,
  colorScheme = 'indigo',
  delay = 0.25,
}: TeamInformationSectionProps) {
  const iconColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';
  const hasTeamInfo = isSoloPractitioner !== undefined || firmSize || companySize || teamMembers;

  if (!hasTeamInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Users size={18} className={iconColor} />
        {isSoloPractitioner !== undefined ? 'Practice Information' : 'Company Information'}
      </h2>
      <div className="space-y-2 text-sm">
        {isSoloPractitioner !== undefined && (
          <div>
            <span className="text-gray-500">Practice Type:</span>
            <span className="ml-2 text-gray-900 font-semibold">
              {isSoloPractitioner ? 'Solo Practitioner' : 'Firm'}
            </span>
          </div>
        )}
        {firmSize && (
          <div>
            <span className="text-gray-500">Firm Size:</span>
            <span className="ml-2 text-gray-900 font-semibold">{firmSize} members</span>
          </div>
        )}
        {companySize && (
          <div>
            <span className="text-gray-500">Company Size:</span>
            <span className="ml-2 text-gray-900 font-semibold">{companySize} employees</span>
          </div>
        )}
        {teamMembers !== undefined && teamMembers !== null && (
          <div className="mt-3">
            <span className="text-gray-500 block mb-2">Team Members:</span>
            <div className="bg-gray-50 rounded-lg p-3">
              {typeof teamMembers === 'string' ? (
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{teamMembers}</pre>
              ) : (
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(teamMembers, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

