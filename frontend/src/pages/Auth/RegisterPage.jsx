import { motion } from 'framer-motion';
import RegisterForm from '../../features/auth/components/RegisterForm';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMic, FiMusic, FiHeadphones, FiRadio, FiZap } from 'react-icons/fi';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 lg:p-6 relative overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0,
          }}
          className="absolute top-20 right-10 text-orange-500/20"
        >
          <FiMusic className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 25, 0],
            rotate: [0, -15, 15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-32 left-8 text-pink-500/20"
        >
          <FiMic className="w-20 h-20" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            rotate: [0, 20, -20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute top-1/3 left-1/4 text-orange-500/15"
        >
          <FiHeadphones className="w-14 h-14" />
        </motion.div>
      </div>

      <div className="w-full max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row bg-black rounded-xl overflow-hidden shadow-2xl">
          {/* Left Section - Branding and Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex lg:w-2/5 relative overflow-hidden bg-black p-8 flex flex-col justify-between"
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-pink-600/10"></div>
            
            {/* Animated Event Elements */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Microphone - Top Left */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.3,
                }}
                className="absolute top-8 right-8 text-orange-500/30"
              >
                <FiMic className="w-12 h-12" />
              </motion.div>

              {/* Music Note - Middle */}
              <motion.div
                animate={{
                  y: [0, 20, 0],
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.6,
                }}
                className="absolute top-1/2 right-12 text-pink-500/25"
              >
                <FiMusic className="w-16 h-16" />
              </motion.div>

              {/* Headphones - Bottom Right */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  x: [0, 10, 0],
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.9,
                }}
                className="absolute bottom-16 left-6 text-orange-500/20"
              >
                <FiHeadphones className="w-14 h-14" />
              </motion.div>

              {/* Radio - Top Center */}
              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -8, 8, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.2,
                }}
                className="absolute top-24 left-1/2 text-pink-500/20"
              >
                <FiRadio className="w-10 h-10" />
              </motion.div>

              {/* Zap/Energy - Floating */}
              <motion.div
                animate={{
                  y: [0, -25, 0],
                  rotate: [0, 180, 360],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4,
                }}
                className="absolute bottom-24 right-16 text-orange-500/25"
              >
                <FiZap className="w-12 h-12" />
              </motion.div>
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Logo and Brand */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">TG</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
                    TicketGate
                  </h1>
                </div>
                <h2 className="text-3xl font-bold text-orange-500 mb-4">
                  Member Sign Up.
                </h2>
                <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
                  <p>
                    Welcome! Discover like-minded individuals like yourself and join us in engaging conversations and actions to lead for causes aimed at creating a better future.
                  </p>
                  <p>
                    Let's interact, collaborate, and make a positive impact together!
                  </p>
                </div>
              </motion.div>

              {/* Back to Website Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-auto"
              >
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-orange-600/50 bg-orange-600/10 text-white rounded-lg hover:bg-orange-600/20 transition-all group text-sm"
                >
                  <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Back to Website</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Section - Register Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 lg:w-3/5 flex items-center justify-center bg-black p-8 lg:p-10 relative"
          >
            {/* Subtle background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 360],
                  opacity: [0.05, 0.1, 0.05],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute top-10 right-10 text-orange-500"
              >
                <FiMic className="w-24 h-24" />
              </motion.div>
              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotate: [360, 0],
                  opacity: [0.05, 0.08, 0.05],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute bottom-20 left-12 text-pink-500"
              >
                <FiMusic className="w-20 h-20" />
              </motion.div>
            </div>

            <div className="w-full max-w-md relative z-10">
              <RegisterForm />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
