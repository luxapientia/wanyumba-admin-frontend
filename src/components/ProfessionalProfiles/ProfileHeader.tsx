import { motion } from 'framer-motion';
import { CheckCircle, Star } from 'lucide-react';
import type { LawyerProfile, ValuerProfile } from '../../api/index.js';

interface ProfileHeaderProps {
  profile: LawyerProfile | ValuerProfile;
  type: 'lawyer' | 'valuer';
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
    PENDING_REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Review' },
    PUBLISHED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Published' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
    SUSPENDED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Suspended' },
  };
  const config = statusConfig[status] || statusConfig.DRAFT;
  return (
    <span className={`px-3 py-1 rounded-md text-sm font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default function ProfileHeader({ profile, type }: ProfileHeaderProps) {
  const ringColor = type === 'lawyer' ? 'ring-indigo-100' : 'ring-blue-100';
  const gradientFrom = type === 'lawyer' ? 'from-indigo-500' : 'from-blue-500';
  const gradientTo = type === 'lawyer' ? 'to-purple-500' : 'to-cyan-500';
  const textColor = type === 'lawyer' ? 'text-indigo-600' : 'text-blue-600';

  const displayName = profile.user?.firstName || profile.user?.lastName
    ? `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim()
    : profile.user?.email?.split('@')[0] || 'Unknown';

  const firmOrCompany = type === 'lawyer' 
    ? (profile as LawyerProfile).firmName 
    : (profile as ValuerProfile).companyName;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0 flex justify-center sm:justify-start">
            {profile.professionalPhoto ? (
              <img
                src={profile.professionalPhoto}
                alt={profile.professionalTitle || type}
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ${ringColor}`}
              />
            ) : (
              <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center ring-4 ${ringColor}`}>
                <span className="text-white font-bold text-3xl sm:text-4xl">
                  {(profile.user?.firstName?.[0] || profile.user?.email?.[0] || type[0].toUpperCase()).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">{displayName}</h1>
                {profile.professionalTitle && (
                  <p className="text-lg sm:text-xl text-gray-600 mb-2 break-words">{profile.professionalTitle}</p>
                )}
                {firmOrCompany && (
                  <p className="text-base sm:text-lg text-gray-500 mb-4 break-words">{firmOrCompany}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                {profile.isVerified && (
                  <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap">
                    <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Verified</span>
                  </div>
                )}
                {getStatusBadge(profile.status)}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
              {profile.yearsOfExperience && (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <div className={`text-xl sm:text-2xl font-bold ${textColor}`}>{profile.yearsOfExperience}</div>
                  <div className="text-xs text-gray-600 leading-tight">Years Experience</div>
                </div>
              )}
              {type === 'lawyer' && (profile as LawyerProfile).casesHandled !== undefined && (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <div className={`text-xl sm:text-2xl font-bold ${textColor}`}>{(profile as LawyerProfile).casesHandled}</div>
                  <div className="text-xs text-gray-600 leading-tight">Cases Handled</div>
                </div>
              )}
              {type === 'valuer' && (profile as ValuerProfile).propertiesValuated !== undefined && (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <div className={`text-xl sm:text-2xl font-bold ${textColor}`}>{(profile as ValuerProfile).propertiesValuated}</div>
                  <div className="text-xs text-gray-600 leading-tight">Properties Valuated</div>
                </div>
              )}
              {type === 'lawyer' && (profile as LawyerProfile).successRate !== undefined && (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <div className={`text-xl sm:text-2xl font-bold ${textColor}`}>{(profile as LawyerProfile).successRate}%</div>
                  <div className="text-xs text-gray-600 leading-tight">Success Rate</div>
                </div>
              )}
              {type === 'valuer' && (profile as ValuerProfile).averageAccuracy !== undefined && (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <div className={`text-xl sm:text-2xl font-bold ${textColor}`}>{(profile as ValuerProfile).averageAccuracy}%</div>
                  <div className="text-xs text-gray-600 leading-tight">Avg Accuracy</div>
                </div>
              )}
              {profile.averageRating !== undefined && profile.averageRating !== null && (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <div className={`text-xl sm:text-2xl font-bold ${textColor} flex items-center gap-1`}>
                    <Star size={16} className="sm:w-[18px] sm:h-[18px] fill-yellow-400 text-yellow-400" />
                    {typeof profile.averageRating === 'number' ? profile.averageRating.toFixed(1) : Number(profile.averageRating).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600 leading-tight">Rating ({profile.totalReviews || 0} reviews)</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

