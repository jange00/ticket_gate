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
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, email, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && otp.join('').length === 0) {
      // Logic for backspace if needed, but since it's a single input now, standard behavior works
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
      if (status === 'error') setStatus('idle');
    } catch (error) {
      // Toast handles the error message
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-600/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-600/20">
            <FiMail className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-gray-400">
            We've sent a 6-digit verification code to <span className="text-white font-medium">{email}</span>
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
              className="space-y-6"
            >
              {/* OTP Input */}
              <div className="relative">
                <input
                  type="text"
                  value={otp.join('')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    const newOtp = value.split('').concat(Array(6 - value.length).fill(''));
                    setOtp(newOtp);
                    if (value.length === 6) {
                      handleVerify(value);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="000000"
                  className={`
                    w-full px-4 py-4 rounded-lg border transition-all duration-200 outline-none
                    bg-gray-800 text-white placeholder:text-gray-500 text-center text-3xl tracking-[1em] font-mono
                    ${status === 'error' 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-700 focus:border-orange-500 focus:ring-orange-500/20'
                    }
                    focus:ring-2
                  `}
                  autoFocus
                />
              </div>

              {/* Status Message */}
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500 text-center"
                >
                  {message}
                </motion.div>
              )}

              {/* Action Button */}
              <button
                onClick={() => handleVerify()}
                disabled={status === 'loading' || otp.some(d => !d)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest shadow-lg shadow-orange-600/20"
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiRefreshCw className="animate-spin" /> Verifying...
                  </span>
                ) : 'Verify Account'}
              </button>

              {/* Footer Links */}
              <div className="mt-8 pt-6 border-t border-gray-800 space-y-4">
                <div className="text-center">
                  {canResend ? (
                    <button
                      onClick={handleResend}
                      className="text-orange-500 hover:text-orange-400 font-medium transition-colors"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Resend code in <span className="text-white font-mono">{timer}s</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => navigate('/register')}
                  className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors py-2"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back to Registration
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;
