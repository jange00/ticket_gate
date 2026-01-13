import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiUser, FiPhone, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import PasswordStrengthMeter from '../../../components/forms/PasswordStrengthMeter';
import { emailSchema, passwordSchema, confirmPasswordSchema, nameSchema, phoneSchema } from '../../../utils/validators';
import { ROLES } from '../../../utils/constants';

const registerSchema = Yup.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema('password'),
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  role: Yup.string().oneOf([ROLES.USER, ROLES.ORGANIZER, ROLES.STAFF], 'Invalid role selected'),
});

const RegisterForm = () => {
  const { register, isRegistering } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: ROLES.USER, // Default to user role
      }}
      validationSchema={registerSchema}
      onSubmit={async (values, { setFieldError }) => {
        try {
          // Ensure role is always set (default to 'user' if somehow undefined)
          const selectedRole = values.role || ROLES.USER;
          
          const registrationData = {
            email: values.email,
            password: values.password,
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone || undefined,
            role: selectedRole, // Always include role field
          };
          
          // Debug: Log the registration data
          if (import.meta.env.DEV) {
            console.log('=== REGISTRATION DEBUG ===');
            console.log('Form Values:', values);
            console.log('Selected Role:', selectedRole);
            console.log('Registration Payload:', {
              ...registrationData,
              password: '***hidden***',
            });
            console.log('Role in payload:', registrationData.role);
            console.log('========================');
          }
          
          await register(registrationData);
          navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
        } catch (error) {
          if (error.response?.data?.errors) {
            Object.keys(error.response.data.errors).forEach((key) => {
              setFieldError(key, error.response.data.errors[key]);
            });
          } else {
            setFieldError('email', error.response?.data?.message || 'Registration failed');
          }
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <Form className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiUser className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="First Name"
                  className={`
                    w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 outline-none
                    bg-gray-900 text-white placeholder:text-gray-500
                    ${errors.firstName && touched.firstName
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                    }
                  `}
                />
              </div>
              {errors.firstName && touched.firstName && (
                <p className="mt-2 text-sm text-red-500">{errors.firstName}</p>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiUser className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="lastName"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Last Name"
                  className={`
                    w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 outline-none
                    bg-gray-900 text-white placeholder:text-gray-500
                    ${errors.lastName && touched.lastName
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                    }
                  `}
                />
              </div>
              {errors.lastName && touched.lastName && (
                <p className="mt-2 text-sm text-red-500">{errors.lastName}</p>
              )}
            </motion.div>
          </div>
          
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FiMail className="w-5 h-5" />
              </div>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Email Address"
                className={`
                  w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 outline-none
                  bg-gray-900 text-white placeholder:text-gray-500
                  ${errors.email && touched.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                  }
                `}
              />
            </div>
            {errors.email && touched.email && (
              <p className="mt-2 text-sm text-red-500">{errors.email}</p>
            )}
          </motion.div>
          
          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Password"
                className={`
                  w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 outline-none
                  bg-gray-900 text-white placeholder:text-gray-500
                  ${errors.password && touched.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                  }
                `}
              />
            </div>
            {errors.password && touched.password && (
              <p className="mt-2 text-sm text-red-500">{errors.password}</p>
            )}
            {values.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2"
              >
                <PasswordStrengthMeter password={values.password} />
              </motion.div>
            )}
          </motion.div>
          
          {/* Confirm Password Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm Password"
                className={`
                  w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 outline-none
                  bg-gray-900 text-white placeholder:text-gray-500
                  ${errors.confirmPassword && touched.confirmPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                  }
                `}
              />
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </motion.div>
          
          {/* Phone Input (Optional) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FiPhone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Phone Number (Optional)"
                className={`
                  w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 outline-none
                  bg-gray-900 text-white placeholder:text-gray-500
                  ${errors.phone && touched.phone
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                  }
                `}
              />
            </div>
            {errors.phone && touched.phone && (
              <p className="mt-2 text-sm text-red-500">{errors.phone}</p>
            )}
          </motion.div>

          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Account Type
            </label>
            <div className="relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FiShield className="w-5 h-5" />
              </div>
              <select
                name="role"
                value={values.role}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`
                  w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 outline-none appearance-none
                  bg-gray-900 text-white
                  ${errors.role && touched.role
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                  }
                `}
              >
                <option value={ROLES.USER}>Regular User</option>
                <option value={ROLES.ORGANIZER}>Event Organizer</option>
                <option value={ROLES.STAFF}>Event Staff</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.role && touched.role && (
              <p className="mt-2 text-sm text-red-500">{errors.role}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Note: Admin accounts are managed by existing administrators. Use your seeded admin credentials to login.
            </p>
          </motion.div>
          
          {/* Sign Up Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="pt-2"
          >
            <motion.button
              type="submit"
              disabled={isRegistering}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              {isRegistering ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
          </motion.div>
          
          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative py-3"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-gray-400">or sign up through</span>
            </div>
          </motion.div>
          
          {/* Google Sign Up Button */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-3 border border-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign Up via Google</span>
          </motion.button>
          
          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center pt-4"
          >
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-orange-500 hover:text-orange-400 font-medium transition-colors"
              >
                Sign in.
              </Link>
            </p>
          </motion.div>
          
          {/* Footer Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center pt-8"
          >
            <p className="text-xs text-gray-500">
              By processing, I agree to TicketGate's{' '}
              <Link to="/terms" className="text-orange-500 hover:text-orange-400 transition-colors">
                Terms of Use
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-orange-500 hover:text-orange-400 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </Form>
      )}
    </Formik>
  );
};

export default RegisterForm;
