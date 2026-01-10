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
import { FiUser, FiMail, FiPhone, FiLock, FiShield, FiSave } from 'react-icons/fi';
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
      await updateProfileMutation.mutateAsync(values);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-gray-600 text-lg">Manage your account settings and preferences</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiUser className="w-4 h-4" />
              Profile
            </div>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'password'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiLock className="w-4 h-4" />
              Password
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'security'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FiShield className="w-4 h-4" />
              Security
            </div>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiUser className="w-6 h-6 text-orange-600" />
                Profile Information
              </h2>

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

                    <div className="flex justify-end pt-4">
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
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiLock className="w-6 h-6 text-orange-600" />
                Change Password
              </h2>

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
                      <p className="mt-1 text-xs text-gray-500">
                        Must be at least 12 characters with uppercase, lowercase, number, and special character
                      </p>
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

                    <div className="flex justify-end pt-4">
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
                            <FiLock className="w-4 h-4" />
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
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiShield className="w-6 h-6 text-orange-600" />
                Security Settings
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {user.mfaEnabled
                        ? 'MFA is currently enabled on your account'
                        : 'Add an extra layer of security to your account'}
                    </p>
                  </div>
                  <Link to="/mfa/setup">
                    <Button variant={user.mfaEnabled ? 'outline' : 'primary'}>
                      {user.mfaEnabled ? 'Manage MFA' : 'Setup MFA'}
                    </Button>
                  </Link>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Account Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email Verified:</span>
                      <span className={user.isEmailVerified ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {user.isEmailVerified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Status:</span>
                      <span className={user.isActive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="text-gray-900 font-semibold capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
