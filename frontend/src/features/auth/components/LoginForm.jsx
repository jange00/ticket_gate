import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiClock } from 'react-icons/fi';
import { emailSchema } from '../../../utils/validators';

const loginSchema = Yup.object({
  email: emailSchema,
  password: Yup.string().required('Password is required'),
  mfaCode: Yup.string().when('mfaRequired', {
    is: true,
    then: (schema) => schema.required('MFA code is required').length(6, 'MFA code must be 6 digits'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const LoginForm = () => {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mfaRequired, setMfaRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  
  const from = location.state?.from?.pathname || '/dashboard';

  // Check for existing lockout when email changes
  useEffect(() => {
    if (!currentEmail) {
      setIsLocked(false);
      setLockoutTimeLeft(null);
      return;
    }

    const lockoutKey = `accountLockoutEndTime_${currentEmail.toLowerCase().trim()}`;
    const lockoutEndTime = localStorage.getItem(lockoutKey);
    
    if (lockoutEndTime) {
      const endTime = parseInt(lockoutEndTime);
      const now = Date.now();
      if (endTime > now) {
        setIsLocked(true);
        setLockoutTimeLeft(Math.ceil((endTime - now) / 1000));
      } else {
        localStorage.removeItem(lockoutKey);
        setIsLocked(false);
        setLockoutTimeLeft(null);
      }
    } else {
      setIsLocked(false);
      setLockoutTimeLeft(null);
    }
  }, [currentEmail]);

  // Countdown timer effect
  useEffect(() => {
    if (!isLocked || lockoutTimeLeft === null || !currentEmail) return;

    if (lockoutTimeLeft <= 0) {
      setIsLocked(false);
      setLockoutTimeLeft(null);
      const lockoutKey = `accountLockoutEndTime_${currentEmail.toLowerCase().trim()}`;
      localStorage.removeItem(lockoutKey);
      return;
    }

    const timer = setInterval(() => {
      setLockoutTimeLeft((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          const lockoutKey = `accountLockoutEndTime_${currentEmail.toLowerCase().trim()}`;
          localStorage.removeItem(lockoutKey);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockoutTimeLeft, currentEmail]);

  // Format time remaining as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        mfaCode: '',
        rememberMe: false,
      }}
      validationSchema={loginSchema}
      onSubmit={async (values, { setFieldError }) => {
        try {
          const data = await login({
            email: values.email,
            password: values.password,
            mfaCode: values.mfaCode || undefined,
          });
          
          if (data.mfaRequired) {
            setMfaRequired(true);
          } else if (data.twoFactorRequired) {
            navigate('/login/2fa', { 
              state: { 
                email: values.email,
                from: from 
              } 
            });
          } else {
            // AuthContext will handle role-based redirect automatically
            // If no redirect happened, navigate to the original location or dashboard
            setTimeout(() => {
              navigate(from, { replace: true });
            }, 100);
          }
        } catch (error) {
          if (error.response?.data?.mfaRequired) {
            setMfaRequired(true);
          } else {
            const errorMessage = error.response?.data?.message || 'Invalid credentials';
            const errorStatus = error.response?.status;
            
            // Debug logging
            if (import.meta.env.DEV) {
              console.log('Login error:', {
                status: errorStatus,
                message: errorMessage,
                fullError: error.response?.data,
              });
            }
            
            // Check if account is locked (403 status)
            // Backend returns 403 for account lockout after multiple failed attempts
            // On login endpoint, 403 typically means account lockout
            // Treat any 403 from login as lockout (handles generic 403 messages)
            if (errorStatus === 403 && values.email) {
              if (import.meta.env.DEV) {
                console.log('Account lockout detected (403 status), setting timer for:', values.email);
              }
              // Set lockout for 3 minutes (180 seconds) - email-specific
              const lockoutDuration = 3 * 60; // 3 minutes in seconds
              const lockoutEndTime = Date.now() + (lockoutDuration * 1000);
              const lockoutKey = `accountLockoutEndTime_${values.email.toLowerCase().trim()}`;
              localStorage.setItem(lockoutKey, lockoutEndTime.toString());
              setIsLocked(true);
              setLockoutTimeLeft(lockoutDuration);
            }
            
            setFieldError('password', errorMessage);
          }
        }
      }}
    >
      {({ values, errors, touched, handleChange, handleBlur }) => {
        // Create a custom onChange handler that tracks email
        const handleEmailChange = (e) => {
          setCurrentEmail(e.target.value);
          handleChange(e);
        };

        return (
        <Form className="space-y-4">
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FiMail className="w-5 h-5" />
              </div>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleEmailChange}
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
            transition={{ delay: 0.15 }}
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
            {/* Lockout Timer - Display independently when account is locked */}
            {isLocked && lockoutTimeLeft !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <div className="flex items-center gap-2 text-red-400">
                  <FiClock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Account locked. Please try again in:
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-center">
                  <span className="text-2xl font-bold text-red-400 font-mono">
                    {formatTime(lockoutTimeLeft)}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
          
          {/* MFA Code */}
          <AnimatePresence>
            {mfaRequired && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '1.25rem' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  name="mfaCode"
                  value={values.mfaCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="000000"
                  maxLength={6}
                  className={`
                    w-full px-4 py-4 rounded-lg border transition-all duration-200 outline-none
                    bg-gray-900 text-white placeholder:text-gray-500 text-center text-2xl tracking-widest
                    ${errors.mfaCode && touched.mfaCode
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                    }
                  `}
                />
                {errors.mfaCode && touched.mfaCode && (
                  <p className="mt-2 text-sm text-red-500">{errors.mfaCode}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-2"
          >
            <motion.button
              type="submit"
              disabled={isLoggingIn || isLocked}
              whileHover={!isLocked ? { scale: 1.02 } : {}}
              whileTap={!isLocked ? { scale: 0.98 } : {}}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              {isLocked 
                ? `Locked (${formatTime(lockoutTimeLeft || 0)})` 
                : isLoggingIn 
                  ? 'Logging in...' 
                  : 'Login'
              }
            </motion.button>
          </motion.div>
          
          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative py-4"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-gray-400">or login through</span>
            </div>
          </motion.div>
          
          {/* Google Login Button */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
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
            <span>Login via Google</span>
          </motion.button>
          
          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center pt-4"
          >
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-orange-500 hover:text-orange-400 font-medium transition-colors"
              >
                Create one.
              </Link>
            </p>
          </motion.div>
          
          {/* Footer Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
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
        );
      }}
    </Formik>
  );
};

export default LoginForm;
