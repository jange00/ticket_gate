import { motion } from 'framer-motion';

const SplashScreenLogo = ({ className = '', size = 280, animated = true }) => {
  const letterVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 30,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const glowVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.5,
      rotate: 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 360,
      transition: {
        duration: 3,
        ease: 'easeInOut',
        delay: 0.5,
      },
    },
  };

  return (
    <motion.div 
      className={`relative ${className}`}
      initial="hidden"
      animate={animated ? "visible" : "hidden"}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className="relative z-10"
      >
        {/* Letter T - Bold, blocky with blue gradient */}
        <defs>
          <linearGradient id="tGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="gGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Letter T - Bold blocky design */}
        <motion.g variants={letterVariants}>
          {/* T horizontal bar */}
          <rect
            x="20"
            y="30"
            width="50"
            height="18"
            rx="4"
            fill="url(#tGradient)"
            filter="url(#glow)"
          />
          {/* T vertical line */}
          <rect
            x="40"
            y="30"
            width="18"
            height="80"
            rx="4"
            fill="url(#tGradient)"
            filter="url(#glow)"
          />
        </motion.g>

        {/* Letter G - Bold with purple gradient */}
        <motion.g variants={letterVariants} style={{ transitionDelay: '0.2s' }}>
          {/* G left vertical */}
          <rect
            x="90"
            y="40"
            width="18"
            height="70"
            rx="4"
            fill="url(#gGradient)"
            filter="url(#glow)"
          />
          {/* G top horizontal */}
          <rect
            x="90"
            y="40"
            width="50"
            height="18"
            rx="4"
            fill="url(#gGradient)"
            filter="url(#glow)"
          />
          {/* G right vertical (top half) */}
          <rect
            x="122"
            y="40"
            width="18"
            height="35"
            rx="4"
            fill="url(#gGradient)"
            filter="url(#glow)"
          />
          {/* G bottom horizontal */}
          <rect
            x="90"
            y="92"
            width="50"
            height="18"
            rx="4"
            fill="url(#gGradient)"
            filter="url(#glow)"
          />
          {/* G right vertical (bottom half) */}
          <rect
            x="122"
            y="75"
            width="18"
            height="35"
            rx="4"
            fill="url(#gGradient)"
            filter="url(#glow)"
          />
          {/* G opening line */}
          <rect
            x="122"
            y="65"
            width="25"
            height="18"
            rx="4"
            fill="url(#gGradient)"
            filter="url(#glow)"
          />
          {/* G inner vertical */}
          <rect
            x="135"
            y="65"
            width="12"
            height="20"
            rx="4"
            fill="url(#gGradient)"
            filter="url(#glow)"
          />
        </motion.g>

        {/* Swirling/orbiting elements around G - animated */}
        {animated && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: [0, 360],
            }}
            transition={{
              opacity: { duration: 1, delay: 1 },
              scale: { duration: 1, delay: 1 },
              rotate: {
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
                delay: 1,
              },
            }}
            style={{ transformOrigin: '140px 95px' }}
          >
            {/* Swirling element 1 - light blue */}
            <circle
              cx="140"
              cy="90"
              r="8"
              fill="#60a5fa"
              opacity="0.9"
              filter="url(#glow)"
            />
            {/* Swirling element 2 - purple */}
            <circle
              cx="150"
              cy="100"
              r="6"
              fill="#c084fc"
              opacity="0.9"
              filter="url(#glow)"
            />
            {/* Swirling element 3 - light blue */}
            <circle
              cx="145"
              cy="110"
              r="7"
              fill="#3b82f6"
              opacity="0.8"
              filter="url(#glow)"
            />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
};

export default SplashScreenLogo;

