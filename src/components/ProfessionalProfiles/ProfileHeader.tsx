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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profile.professionalPhoto ? (
              <img
                src={profile.professionalPhoto}
                alt={profile.professionalTitle || type}
                className={`w-32 h-32 rounded-full object-cover ring-4 ${ringColor}`}
              />
            ) : (
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center ring-4 ${ringColor}`}>
                <span className="text-white font-bold text-4xl">
                  {(profile.user?.firstName?.[0] || profile.user?.email?.[0] || type[0].toUpperCase()).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
                {profile.professionalTitle && (
                  <p className="text-xl text-gray-600 mb-2">{profile.professionalTitle}</p>
                )}
                {firmOrCompany && (
                  <p className="text-lg text-gray-500 mb-4">{firmOrCompany}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {profile.isVerified && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-semibold">
                    <CheckCircle size={16} />
                    Verified
                  </div>
                )}
                {getStatusBadge(profile.status)}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {profile.yearsOfExperience && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className={`text-2xl font-bold ${textColor}`}>{profile.yearsOfExperience}</div>
                  <div className="text-xs text-gray-600">Years Experience</div>
                </div>
              )}
              {type === 'lawyer' && (profile as LawyerProfile).casesHandled !== undefined && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className={`text-2xl font-bold ${textColor}`}>{(profile as LawyerProfile).casesHandled}</div>
                  <div className="text-xs text-gray-600">Cases Handled</div>
                </div>
              )}
              {type === 'valuer' && (profile as ValuerProfile).propertiesValuated !== undefined && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className={`text-2xl font-bold ${textColor}`}>{(profile as ValuerProfile).propertiesValuated}</div>
                  <div className="text-xs text-gray-600">Properties Valuated</div>
                </div>
              )}
              {type === 'lawyer' && (profile as LawyerProfile).successRate !== undefined && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className={`text-2xl font-bold ${textColor}`}>{(profile as LawyerProfile).successRate}%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
              )}
              {type === 'valuer' && (profile as ValuerProfile).averageAccuracy !== undefined && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className={`text-2xl font-bold ${textColor}`}>{(profile as ValuerProfile).averageAccuracy}%</div>
                  <div className="text-xs text-gray-600">Avg Accuracy</div>
                </div>
              )}
              {profile.averageRating !== undefined && profile.averageRating !== null && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className={`text-2xl font-bold ${textColor} flex items-center gap-1`}>
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    {typeof profile.averageRating === 'number' ? profile.averageRating.toFixed(1) : Number(profile.averageRating).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">Rating ({profile.totalReviews || 0} reviews)</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

