import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiShield, FiSave, FiCheckCircle, FiAlertCircle, FiKey } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { nameSchema, phoneSchema, emailSchema } from '../../utils/validators';

const profileSchema = Yup.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(12, 'Password must be at least 12 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast.success('Profile updated successfully');
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      setIsSubmitting(false);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
      setIsSubmitting(false);
    },
  });

  const handleProfileSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    setSubmitting(true);
    try {
      // Clean the values - only include phone if it has a value
      const cleanedValues = {
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        email: values.email?.trim(),
      };
      
      // Only include phone if it has a value (omit if empty/null)
      const phoneValue = values.phone?.trim();
      if (phoneValue) {
        cleanedValues.phone = phoneValue;
      }
      
      await updateProfileMutation.mutateAsync(cleanedValues);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    setSubmitting(true);
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      resetForm();
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  if (!user) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </motion.div>

      {/* Tabs */}
      <Card className="mb-6 p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiUser className="w-4 h-4" />
              Profile
            </div>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'password'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiKey className="w-4 h-4" />
              Password
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'security'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiShield className="w-4 h-4" />
              Security
            </div>
          </button>
        </div>
      </Card>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiUser className="w-5 h-5 text-orange-600" />
                </div>
                Profile Information
              </h2>
              <p className="text-gray-600 text-sm ml-11">Update your personal information and contact details</p>
            </div>

              <Formik
                initialValues={{
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  email: user.email || '',
                  phone: user.phone || '',
                }}
                validationSchema={profileSchema}
                onSubmit={handleProfileSubmit}
                enableReinitialize
              >
                {({ errors, touched, isSubmitting: formSubmitting }) => (
                  <Form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Field
                          name="firstName"
                          as={Input}
                          placeholder="First Name"
                          error={errors.firstName && touched.firstName ? errors.firstName : null}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Field
                          name="lastName"
                          as={Input}
                          placeholder="Last Name"
                          error={errors.lastName && touched.lastName ? errors.lastName : null}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Field
                        name="email"
                        type="email"
                        as={Input}
                        placeholder="Email Address"
                        error={errors.email && touched.email ? errors.email : null}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Field
                        name="phone"
                        type="tel"
                        as={Input}
                        placeholder="Phone Number (Optional)"
                        error={errors.phone && touched.phone ? errors.phone : null}
                      />
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || formSubmitting}
                        className="flex items-center gap-2"
                      >
                        {isSubmitting || formSubmitting ? (
                          <>
                            <Loading size="sm" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card>
          </motion.div>
        )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiKey className="w-5 h-5 text-orange-600" />
                </div>
                Change Password
              </h2>
              <p className="text-gray-600 text-sm ml-11">Update your password to keep your account secure</p>
            </div>

              <Formik
                initialValues={{
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                }}
                validationSchema={passwordSchema}
                onSubmit={handlePasswordSubmit}
              >
                {({ errors, touched, isSubmitting: formSubmitting }) => (
                  <Form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password *
                      </label>
                      <Field
                        name="currentPassword"
                        type="password"
                        as={Input}
                        placeholder="Enter current password"
                        error={errors.currentPassword && touched.currentPassword ? errors.currentPassword : null}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <Field
                        name="newPassword"
                        type="password"
                        as={Input}
                        placeholder="Enter new password"
                        error={errors.newPassword && touched.newPassword ? errors.newPassword : null}
                      />
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800 font-medium mb-1">Password Requirements:</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li className="flex items-center gap-2">
                            <span>•</span>
                            <span>At least 12 characters long</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span>•</span>
                            <span>Contains uppercase and lowercase letters</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span>•</span>
                            <span>Contains at least one number and special character</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password *
                      </label>
                      <Field
                        name="confirmPassword"
                        type="password"
                        as={Input}
                        placeholder="Confirm new password"
                        error={errors.confirmPassword && touched.confirmPassword ? errors.confirmPassword : null}
                      />
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || formSubmitting}
                        className="flex items-center gap-2"
                      >
                        {isSubmitting || formSubmitting ? (
                          <>
                            <Loading size="sm" />
                            Changing...
                          </>
                        ) : (
                          <>
                            <FiKey className="w-4 h-4" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card>
          </motion.div>
        )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FiShield className="w-5 h-5 text-orange-600" />
                </div>
                Security Settings
              </h2>
              <p className="text-gray-600 text-sm ml-11">Manage your account security and authentication methods</p>
            </div>

            <div className="space-y-4">
              {/* Two-Factor Authentication */}
              <Card className="p-5 border-2 border-gray-100 hover:border-orange-200 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <FiShield className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                      {user.mfaEnabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <FiCheckCircle className="w-3 h-3" />
                          Enabled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 ml-11">
                      {user.mfaEnabled
                        ? 'An extra layer of security is currently protecting your account'
                        : 'Add an extra layer of security to protect your account from unauthorized access'}
                    </p>
                  </div>
                  <Link to="/mfa-setup">
                    <Button variant={user.mfaEnabled ? 'outline' : 'primary'} className="whitespace-nowrap">
                      {user.mfaEnabled ? 'Manage MFA' : 'Setup MFA'}
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Account Status */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-gray-600" />
                  Account Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <FiMail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Email Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.isEmailVerified ? (
                        <>
                          <FiCheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">Verified</span>
                        </>
                      ) : (
                        <>
                          <FiAlertCircle className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-semibold text-red-600">Not Verified</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <FiShield className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Account Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <>
                          <FiCheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <FiAlertCircle className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-semibold text-red-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <FiUser className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Role</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 capitalize px-3 py-1 bg-gray-100 rounded-full">
                      {user.role}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsPage;
