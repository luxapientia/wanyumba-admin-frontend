import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Calendar,
  Shield,
  Save,
  Edit2,
  X,
  Loader2,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import Button from '../../components/UI/Button.js';
import { useToast } from '../../contexts/index.js';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { updateUser, updateUserRoles } from '../../store/thunks/usersThunks.js';
import userService from '../../api/user.service.js';
import type { User, UpdateUserDto } from '../../api/index.js';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { items: availableRoles } = useAppSelector((state) => state.roles);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState<UpdateUserDto>({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    email: '',
    isActive: true,
    isEmailVerified: false,
    isPhoneVerified: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await userService.getUserById(id);
        if (response.success && response.data) {
          const userData = response.data.user;
          setUser(userData);
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || '',
            phone: userData.phone || '',
            email: userData.email || '',
            isActive: userData.isActive,
            isEmailVerified: userData.isEmailVerified,
            isPhoneVerified: userData.isPhoneVerified || false,
          });
          setSelectedRoles(userData.roles || []);
        } else {
          throw new Error(response.message || 'Failed to fetch user');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
        toast?.error('Error', 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate firstName (if provided)
    if (formData.firstName !== undefined && formData.firstName !== null && formData.firstName !== '') {
      if (formData.firstName.length < 1 || formData.firstName.length > 50) {
        errors.firstName = 'First name must be between 1 and 50 characters';
      }
    }

    // Validate lastName (if provided)
    if (formData.lastName !== undefined && formData.lastName !== null && formData.lastName !== '') {
      if (formData.lastName.length < 1 || formData.lastName.length > 50) {
        errors.lastName = 'Last name must be between 1 and 50 characters';
      }
    }

    // Username validation removed - admins cannot change username

    // Validate phone (if provided, must not be empty)
    if (formData.phone !== undefined && formData.phone !== null) {
      if (formData.phone.trim() === '') {
        errors.phone = 'Phone number cannot be empty';
      }
    }

    // Validate email (if provided and changed)
    if (formData.email !== undefined && formData.email !== null && formData.email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!user || !id) return;

    // Validate form before sending
    if (!validateForm()) {
      toast?.error('Validation Failed', 'Please fix the errors in the form before saving.');
      return;
    }

    setSaving(true);
    try {
      // Build update data - only include fields that have changed and are valid
      const updateData: UpdateUserDto = {};

      // Only include fields that have changed from the original user data
      // Convert empty strings to undefined to match backend expectations
      if (formData.firstName !== (user.firstName || '')) {
        updateData.firstName = formData.firstName?.trim() || undefined;
      }
      if (formData.lastName !== (user.lastName || '')) {
        updateData.lastName = formData.lastName?.trim() || undefined;
      }
      // Username cannot be changed by admin - removed from update
      if (formData.phone !== (user.phone || '')) {
        updateData.phone = formData.phone?.trim() || undefined;
      }
      if (formData.email !== user.email) {
        updateData.email = formData.email;
      }
      if (formData.isActive !== user.isActive) {
        updateData.isActive = formData.isActive;
      }
      if (formData.isEmailVerified !== user.isEmailVerified) {
        updateData.isEmailVerified = formData.isEmailVerified;
      }
      if (formData.isPhoneVerified !== (user.isPhoneVerified || false)) {
        updateData.isPhoneVerified = formData.isPhoneVerified;
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        // Check if roles changed
        const currentRoleNames = user.roles || [];
        const rolesChanged = JSON.stringify([...currentRoleNames].sort()) !== JSON.stringify([...selectedRoles].sort());
        
        if (!rolesChanged) {
          toast?.info('No Changes', 'No changes were made to the user profile.');
          setSaving(false);
          return;
        }
      }

      // Update user info if there are changes
      let result = user;
      if (Object.keys(updateData).length > 0) {
        result = await dispatch(updateUser({ userId: id, data: updateData })).unwrap();
      }
      
      // Update user roles if they changed
      const currentRoleNames = user.roles || [];
      const rolesChanged = JSON.stringify([...currentRoleNames].sort()) !== JSON.stringify([...selectedRoles].sort());
      
      if (rolesChanged) {
        const updatedUser = await dispatch(updateUserRoles({ userId: id, roles: selectedRoles })).unwrap();
        setUser(updatedUser);
        setSelectedRoles(updatedUser.roles || []);
      } else {
        setUser(result);
        setSelectedRoles(result.roles || []);
      }
      
      setIsEditing(false);
      setValidationErrors({});
      toast?.success('User Updated', 'User information has been updated successfully.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || error || 'Failed to update user';
      toast?.error('Update Failed', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        phone: user.phone || '',
        email: user.email || '',
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified || false,
      });
      setSelectedRoles(user.roles || []);
    }
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleName)) {
        return prev.filter((r) => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!user || !id) return;

    if (!validatePassword()) {
      toast?.error('Validation Failed', 'Please fix the password errors before saving.');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await userService.changeUserPassword(id, passwordData.newPassword, passwordData.confirmPassword);
      if (response.success) {
        toast?.success('Password Changed', 'User password has been changed successfully.');
        setShowPasswordModal(false);
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setValidationErrors({});
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Failed to change password';
      toast?.error('Change Password Failed', errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordModal(false);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setValidationErrors({});
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700 border-red-200',
      seller: 'bg-blue-100 text-blue-700 border-blue-200',
      buyer: 'bg-green-100 text-green-700 border-green-200',
      lawyer: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-purple-600" size={48} />
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/users')}
            leftIcon={<ArrowLeft size={18} />}
            variant="outline"
            className="mb-6"
          >
            Back to Users
          </Button>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 text-center">
            <XCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The user you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/users')}>Go Back to Users</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            onClick={() => navigate('/users')}
            leftIcon={<ArrowLeft size={18} />}
            variant="outline"
          >
            Back to Users
          </Button>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit2 size={18} />}
            >
              Edit User
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                leftIcon={<X size={18} />}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                leftIcon={saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8"
        >
          {/* User Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.firstName || user.email}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-4 ring-gray-200">
                  <span className="text-white font-semibold text-3xl">
                    {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                            validationErrors.firstName
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-300 focus:border-purple-500'
                          }`}
                        />
                        {validationErrors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                            validationErrors.lastName
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-300 focus:border-purple-500'
                          }`}
                        />
                        {validationErrors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : user.email.split('@')[0]}
                    </h1>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {user.isActive ? (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-semibold">
                      <CheckCircle size={14} />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-semibold">
                      <XCircle size={14} />
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      validationErrors.email
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 focus:border-purple-500'
                    }`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{user.email}</p>
              )}
              {user.isEmailVerified && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                  <CheckCircle size={12} />
                  Verified
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                Phone
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      validationErrors.phone
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 focus:border-purple-500'
                    }`}
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{user.phone || 'No phone number'}</p>
              )}
              {user.isPhoneVerified && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                  <CheckCircle size={12} />
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Roles */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Shield size={16} className="inline mr-2" />
              Roles
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">Select roles for this user:</p>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.length > 0 ? (
                    availableRoles.map((role) => {
                      const isSelected = selectedRoles.includes(role.name);
                      return (
                        <label
                          key={role.id}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? `${getRoleBadgeColor(role.name)} border-current shadow-md`
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRoleToggle(role.name)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium capitalize">{role.name}</span>
                          {role.description && (
                            <span className="text-xs text-gray-500">({role.description})</span>
                          )}
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-400">Loading roles...</p>
                  )}
                </div>
                {selectedRoles.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">⚠️ User must have at least one role</p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <span
                      key={role}
                      className={`px-3 py-1 text-sm font-semibold rounded-md border ${getRoleBadgeColor(role)}`}
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">No roles assigned</span>
                )}
              </div>
            )}
          </div>

          {/* Status Toggles (when editing) */}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Active Status</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isEmailVerified"
                  checked={formData.isEmailVerified}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Email Verified</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPhoneVerified"
                  checked={formData.isPhoneVerified}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Phone Verified</span>
              </label>
            </div>
          )}

          {/* Password Change Section */}
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Key size={16} className="inline mr-2" />
                  Password Management
                </label>
                <p className="text-sm text-gray-600">Change the user's password</p>
              </div>
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                leftIcon={<Key size={18} />}
              >
                Change Password
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Created At
              </label>
              <p className="text-gray-600">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Last Updated
              </label>
              <p className="text-gray-600">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={handleCancelPasswordChange}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={changingPassword}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }));
                      if (validationErrors.newPassword) {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.newPassword;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 pr-10 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      validationErrors.newPassword
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 focus:border-purple-500'
                    }`}
                    placeholder="Enter new password"
                    disabled={changingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {validationErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                      if (validationErrors.confirmPassword) {
                        setValidationErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.confirmPassword;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 pr-10 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      validationErrors.confirmPassword
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 focus:border-purple-500'
                    }`}
                    placeholder="Confirm new password"
                    disabled={changingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCancelPasswordChange}
                variant="outline"
                className="flex-1"
                disabled={changingPassword}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                className="flex-1"
                disabled={changingPassword}
                leftIcon={changingPassword ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

