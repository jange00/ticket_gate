import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { authService } from '../../services/auth.service';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Filter out potential empty strings and join
    const fullOtp = newOtp.join('');
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Auto-submit if all digits entered
    if (fullOtp.length === 6) {
      handleVerify(fullOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) return;
    
    setStatus('loading');
    try {
      await authService.verifyEmail({ email, otp: otpValue });
      setStatus('success');
      setMessage('Your email has been successfully verified.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Invalid or expired verification code.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      await authService.resendOTP({ email });
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
      if (status === 'error') setStatus('idle');
    } catch (error) {
      // Toast handles the error message
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 mb-4">
              <FiMail className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-gray-400">
              We've sent a 6-digit verification code to <span className="text-gray-200 font-medium">{email}</span>
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6"
              >
                <div className="flex justify-center mb-4">
                  <FiCheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Verification Successful!</h2>
                <p className="text-gray-400">Redirecting to login page...</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* OTP Inputs */}
                <div className="flex justify-between gap-2 mb-8">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`
                        w-12 h-14 text-center text-2xl font-bold rounded-xl border transition-all duration-200 outline-none
                        bg-gray-800 text-white
                        ${status === 'error' 
                          ? 'border-red-500/50 focus:border-red-500 ring-2 ring-red-500/10' 
                          : 'border-gray-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                        }
                      `}
                    />
                  ))}
                </div>

                {/* Status Message */}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-2 text-red-400 text-sm mb-6 bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                  >
                    <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{message}</p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <button
                  onClick={() => handleVerify()}
                  disabled={status === 'loading' || otp.some(d => !d)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-lg shadow-orange-600/20"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <FiRefreshCw className="animate-spin" /> Verifying...
                    </span>
                  ) : 'Verify Account'}
                </button>

                {/* Resend Logic */}
                <div className="text-center space-y-4">
                  <p className="text-gray-400 text-sm">
                    Didn't receive the code?{' '}
                    {canResend ? (
                      <button
                        onClick={handleResend}
                        className="text-orange-500 hover:text-orange-400 font-semibold transition-colors"
                      >
                        Resend Code
                      </button>
                    ) : (
                      <span className="text-gray-200 font-mono">
                        Resend in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                      </span>
                    )}
                  </p>
                  
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
                  >
                    <FiArrowLeft /> Back to Registration
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer Info */}
        <p className="text-center text-gray-600 text-xs mt-8">
          By verifying, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;












