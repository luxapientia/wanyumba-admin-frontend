import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Loader2, FileText, Award, Briefcase, MapPin, Clock, GraduationCap, Users, Star, TrendingUp, CheckCircle, X } from 'lucide-react';
import Button from '../../components/UI/Button.js';
import Modal from '../../components/UI/Modal.js';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { fetchValuerProfileById, approveValuerProfile, rejectValuerProfile } from '../../store/thunks/professionalProfilesThunks.js';
import { useToast } from '../../contexts/ToastContext.js';
import {
  ProfileHeader,
  BioSection,
  SpecializationsSection,
  ContactSection,
  LicenseSection,
  ProfileStatsSection,
  DatesSection,
  LanguagesSection,
  PropertyTypesSection,
  ValuationMethodsSection,
  ArrayBadgeSection,
  JsonDataSection,
  GallerySection,
  IdCardSection,
  OfficeInformationSection,
  PricingSection,
  TeamInformationSection,
  ModerationSection,
  UserInformationSection,
} from '../../components/ProfessionalProfiles/index.js';

export default function ValuerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { success: showSuccess, error: showError } = useToast();
  const { selectedProfile: profile, detailLoading: loading, detailError: error } = useAppSelector(
    (state) => state.valuerProfiles
  );
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveConfirmModal, setShowApproveConfirmModal] = useState(false);
  const [showRejectConfirmModal, setShowRejectConfirmModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [moderationNotes, setModerationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchValuerProfileById(id));
    }
  }, [id, dispatch]);

  const handleApproveClick = () => {
    setShowApproveConfirmModal(true);
  };

  const handleApprove = async () => {
    if (!id) return;
    
    setShowApproveConfirmModal(false);
    setIsProcessing(true);
    try {
      await dispatch(approveValuerProfile(id)).unwrap();
      showSuccess('Success', 'Profile approved successfully');
      // Redirect to valuers list page after successful approval
      navigate('/professional-profiles/valuers');
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || (typeof error === 'string' ? error : 'Failed to approve profile');
      showError('Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = () => {
    if (!id || !rejectionReason.trim()) {
      showError('Validation Error', 'Rejection reason is required');
      return;
    }
    setShowRejectModal(false);
    setShowRejectConfirmModal(true);
  };

  const handleReject = async () => {
    if (!id || !rejectionReason.trim()) {
      showError('Validation Error', 'Rejection reason is required');
      return;
    }

    setShowRejectConfirmModal(false);
    setIsProcessing(true);
    try {
      await dispatch(rejectValuerProfile({
        id,
        rejectionReason: rejectionReason.trim(),
        moderationNotes: moderationNotes.trim() || undefined,
      })).unwrap();
      showSuccess('Success', 'Profile rejected successfully');
      setRejectionReason('');
      setModerationNotes('');
      // Redirect to valuers list page after successful rejection
      navigate('/professional-profiles/valuers');
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || (typeof error === 'string' ? error : 'Failed to reject profile');
      showError('Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-700 font-semibold mb-2">Error loading profile</p>
          <p className="text-red-600 text-sm">{error || 'Profile not found'}</p>
          <Button onClick={() => navigate('/professional-profiles/valuers')} className="mt-4">
            Back to Valuers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
      {/* Back Button */}
      <Button
        onClick={() => navigate('/professional-profiles/valuers')}
        variant="ghost"
        leftIcon={<ArrowLeft size={18} />}
        className="mb-3 sm:mb-4 text-sm sm:text-base"
      >
        Back to Valuers
      </Button>

      {/* Profile Header */}
      <ProfileHeader profile={profile} type="valuer" />

      {/* Approve/Reject Buttons - Only show for PENDING_REVIEW status */}
      {profile.status === 'PENDING_REVIEW' && (
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end">
          <Button
            variant="success"
            leftIcon={<CheckCircle size={18} />}
            onClick={handleApproveClick}
            disabled={isProcessing || loading}
            loading={isProcessing}
            className="w-full sm:w-auto"
          >
            Approve Profile
          </Button>
          <Button
            variant="danger"
            leftIcon={<X size={18} />}
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing || loading}
            className="w-full sm:w-auto"
          >
            Reject Profile
          </Button>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Bio */}
          <BioSection
            bio={profile.bio}
            shortBio={profile.shortBio}
            colorScheme="blue"
            delay={0.1}
          />

          {/* Languages */}
          <LanguagesSection
            languages={profile.languages}
            colorScheme="blue"
            delay={0.12}
          />

          {/* Property Types */}
          <PropertyTypesSection
            propertyTypes={profile.propertyTypes}
            delay={0.15}
          />

          {/* Valuation Methods */}
          <ValuationMethodsSection
            valuationMethods={profile.valuationMethods}
            delay={0.2}
          />

          {/* Specializations */}
          <SpecializationsSection
            specializations={profile.specializations}
            colorScheme="blue"
            delay={0.25}
          />

          {/* Service Areas */}
          <ArrayBadgeSection
            title="Service Areas"
            icon={<MapPin size={20} className="text-blue-600" />}
            items={profile.serviceAreas}
            colorScheme="purple"
            delay={0.28}
          />

          {/* Consultation Types */}
          <ArrayBadgeSection
            title="Consultation Types"
            icon={<Briefcase size={20} className="text-blue-600" />}
            items={profile.consultationTypes}
            colorScheme="cyan"
            delay={0.3}
          />

          {/* Education */}
          <JsonDataSection
            title="Education"
            icon={<GraduationCap size={20} className="text-blue-600" />}
            data={profile.education}
            colorScheme="blue"
            delay={0.35}
          />

          {/* Certifications */}
          <JsonDataSection
            title="Certifications"
            icon={<Award size={20} className="text-blue-600" />}
            data={profile.certifications}
            colorScheme="blue"
            delay={0.4}
          />

          {/* Services */}
          <JsonDataSection
            title="Services"
            icon={<Briefcase size={20} className="text-blue-600" />}
            data={profile.services}
            colorScheme="blue"
            delay={0.45}
          />

          {/* Contact Information */}
          <ContactSection
            businessEmail={profile.businessEmail}
            businessEmailAlt={profile.businessEmailAlt}
            businessPhone={profile.businessPhone}
            businessPhoneAlt={profile.businessPhoneAlt}
            website={profile.website}
            officeAddress={profile.officeAddress}
            colorScheme="blue"
            delay={0.5}
          />

          {/* Office Information */}
          <OfficeInformationSection
            officeName={profile.officeName}
            officeAddress={profile.officeAddress}
            officeLatitude={profile.officeLatitude}
            officeLongitude={profile.officeLongitude}
            timezone={profile.timezone}
            colorScheme="blue"
            delay={0.55}
          />

          {/* Response Time & Availability */}
          {(profile.responseTime || profile.availability) && (
            <JsonDataSection
              title="Response Time & Availability"
              icon={<Clock size={20} className="text-blue-600" />}
              data={{
                responseTime: profile.responseTime,
                availability: profile.availability,
              }}
              colorScheme="blue"
              delay={0.6}
            />
          )}

          {/* Pricing & Payment */}
          <PricingSection
            freeConsultation={profile.freeConsultation}
            consultationFee={profile.consultationFee}
            currency={profile.currency}
            paymentMethods={profile.paymentMethods}
            acceptsInsurance={profile.acceptsInsurance}
            colorScheme="blue"
            delay={0.65}
          />

          {/* Valuation Reports */}
          <JsonDataSection
            title="Valuation Reports"
            icon={<FileText size={20} className="text-blue-600" />}
            data={profile.valuationReports}
            colorScheme="blue"
            delay={0.7}
          />

          {/* Portfolio */}
          <JsonDataSection
            title="Portfolio"
            icon={<Briefcase size={20} className="text-blue-600" />}
            data={profile.portfolio}
            colorScheme="blue"
            delay={0.75}
          />

          {/* Market Analysis */}
          <JsonDataSection
            title="Market Analysis"
            icon={<TrendingUp size={20} className="text-blue-600" />}
            data={profile.marketAnalysis}
            colorScheme="blue"
            delay={0.8}
          />

          {/* Testimonials */}
          <JsonDataSection
            title="Testimonials"
            icon={<Star size={20} className="text-blue-600" />}
            data={profile.testimonials}
            colorScheme="blue"
            delay={0.85}
          />

          {/* Professional Memberships */}
          <JsonDataSection
            title="Professional Memberships"
            icon={<Users size={20} className="text-blue-600" />}
            data={profile.professionalMemberships}
            colorScheme="blue"
            delay={0.9}
          />

          {/* Awards */}
          <JsonDataSection
            title="Awards"
            icon={<Award size={20} className="text-blue-600" />}
            data={profile.awards}
            colorScheme="blue"
            delay={0.95}
          />

          {/* Publications */}
          <JsonDataSection
            title="Publications"
            icon={<FileText size={20} className="text-blue-600" />}
            data={profile.publications}
            colorScheme="blue"
            delay={1.0}
          />

          {/* Gallery */}
          <GallerySection
            gallery={profile.gallery}
            colorScheme="blue"
            delay={1.05}
          />

          {/* ID Card/Passport */}
          <IdCardSection
            idCardOrPassport={profile.idCardOrPassport}
            colorScheme="blue"
            delay={1.1}
          />

          {/* Moderation Information */}
          <ModerationSection
            rejectionReason={profile.rejectionReason}
            moderationNotes={profile.moderationNotes}
            delay={1.15}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* License Information */}
          <LicenseSection
            licenseNumber={profile.licenseNumber}
            licenseIssuer={profile.licenseIssuer}
            licenseExpiryDate={profile.licenseExpiryDate}
            colorScheme="blue"
            delay={0.2}
          />

          {/* Company Information */}
          <TeamInformationSection
            companySize={profile.companySize}
            teamMembers={profile.teamMembers}
            colorScheme="blue"
            delay={0.25}
          />

          {/* Profile Stats */}
          <ProfileStatsSection
            views={profile.views}
            inquiries={profile.inquiries}
            profileCompleteness={profile.profileCompleteness}
            averageTurnaroundTime={profile.averageTurnaroundTime}
            delay={0.3}
          />

          {/* Dates */}
          <DatesSection
            createdAt={profile.createdAt}
            updatedAt={profile.updatedAt}
            publishedAt={profile.publishedAt}
            verifiedAt={profile.verifiedAt}
            unpublishedAt={profile.unpublishedAt}
            colorScheme="blue"
            delay={0.4}
          />

          {/* User Information */}
          <UserInformationSection
            user={profile.user}
            delay={0.45}
          />
        </div>
      </div>

      {/* Reject Profile Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
          setModerationNotes('');
        }}
        title="Reject Profile"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this profile..."
              rows={4}
              required
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moderation Notes (Optional)
            </label>
            <textarea
              value={moderationNotes}
              onChange={(e) => setModerationNotes(e.target.value)}
              placeholder="Additional notes for internal use..."
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
                setModerationNotes('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectSubmit}
              disabled={isProcessing || !rejectionReason.trim()}
              loading={isProcessing}
            >
              Reject Profile
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={showApproveConfirmModal}
        onClose={() => setShowApproveConfirmModal(false)}
        title="Confirm Approval"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to approve this valuer profile? Once approved, the profile will be published and visible to the public.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowApproveConfirmModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={isProcessing}
              loading={isProcessing}
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={showRejectConfirmModal}
        onClose={() => {
          setShowRejectConfirmModal(false);
          setShowRejectModal(true);
        }}
        title="Confirm Rejection"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to reject this valuer profile? The rejection reason will be sent to the user.
          </p>
          {rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
              <p className="text-sm text-red-700">{rejectionReason}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowRejectConfirmModal(false);
                setShowRejectModal(true);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={isProcessing}
              loading={isProcessing}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
