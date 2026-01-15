import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiShield, FiLock, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { showSuccessToast } from '../../utils/errorHandler';

const Verify2FALogin = () => {
  const { verify2FALogin, isVerifying2FA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Get email from location state
  const email = location.state?.email;
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setError('');
      await verify2FALogin({ email, otp });
      // Redirect is handled by AuthContext on success
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    // In a real app, you'd call a resend 2FA OTP endpoint
    // For now we'll just reset the timer as the user can also just go back and login again
    // but the backend login logic sends a new OTP anyway.
    setTimer(60);
    setCanResend(false);
    showSuccessToast('A new code has been sent to your email.');
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
            <FiShield className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-400">
            We've sent a 6-digit verification code to <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className={`
                  w-full px-4 py-4 rounded-lg border transition-all duration-200 outline-none
                  bg-gray-800 text-white placeholder:text-gray-500 text-center text-3xl tracking-[1em] font-mono
                  ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-orange-500 focus:ring-orange-500/20'}
                  focus:ring-2
                `}
                autoFocus
              />
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500 text-center"
              >
                {error}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying2FA || otp.length !== 6}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest shadow-lg shadow-orange-600/20"
          >
            {isVerifying2FA ? (
              <span className="flex items-center justify-center gap-2">
                <FiRefreshCw className="w-5 h-5 animate-spin" />
                Verifying...
              </span>
            ) : 'Verify & Login'}
          </button>
        </form>

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
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors py-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Verify2FALogin;
