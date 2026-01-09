import { motion } from 'framer-motion';

const Logo = ({ 
  className = '', 
  size = 40, 
  animated = true,
  showText = false,
  textColor = 'auto' // 'auto', 'white', 'dark'
}) => {
  const letterVariants = {
    hidden: { 
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { 
          duration: 1.5, 
          ease: 'easeInOut',
        },
        opacity: { 
          duration: 0.6,
        },
      },
    },
  };

  const gVariants = {
    hidden: { 
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { 
          duration: 1.8, 
          ease: 'easeInOut',
          delay: 0.2,
        },
        opacity: { 
          duration: 0.6,
          delay: 0.2,
        },
      },
    },
  };

  const textVariants = {
    hidden: { 
      opacity: 0,
      x: -10,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: 1.2,
        ease: 'easeOut',
      },
    },
  };

  // When not animated, render static SVG paths
  if (!animated) {
    return (
      <motion.div 
        className={`flex items-center gap-2 ${className}`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
        >
          {/* Letter T - Clear and professional */}
          {/* T horizontal bar */}
          <path
            d="M 15 20 L 35 20"
            stroke="#ff6b35"
            strokeWidth="6.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* T vertical line */}
          <path
            d="M 25 20 L 25 65"
            stroke="#ff6b35"
            strokeWidth="6.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Letter G - Professional, unmistakable G shape */}
          {/* G left vertical line (full height) */}
          <path
            d="M 55 25 L 55 65"
            stroke="#ff6b35"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* G top horizontal line */}
          <path
            d="M 55 25 L 75 25"
            stroke="#ff6b35"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* G right vertical line (top half only) */}
          <path
            d="M 75 25 L 75 40"
            stroke="#ff6b35"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* G bottom horizontal line */}
          <path
            d="M 55 65 L 75 65"
            stroke="#ff6b35"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* G right vertical line (bottom half) */}
          <path
            d="M 75 50 L 75 65"
            stroke="#ff6b35"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* G opening line - horizontal bar extending RIGHT - THIS IS THE KEY THAT MAKES IT A G */}
          <path
            d="M 75 45 L 88 45"
            stroke="#ff6b35"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* G inner vertical - connects opening line downward */}
          <path
            d="M 82 45 L 82 60"
            stroke="#ff6b35"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* G inner horizontal - connects inner vertical back to main body */}
          <path
            d="M 82 60 L 75 60"
            stroke="#ff6b35"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        
        {showText && (
          <span
            className={`font-display font-bold text-xl ${
              textColor === 'white' || className.includes('text-white') 
                ? 'text-white' 
                : textColor === 'dark'
                ? 'text-gray-900'
                : 'text-gray-900'
            }`}
          >
            TicketGate
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        initial="hidden"
        animate="visible"
      >
        {/* Letter T - Clear and professional */}
        {/* T horizontal bar */}
        <motion.path
          d="M 15 20 L 35 20"
          stroke="#ff6b35"
          strokeWidth="6.5"
          fill="none"
          strokeLinecap="round"
          variants={letterVariants}
        />
        
        {/* T vertical line */}
        <motion.path
          d="M 25 20 L 25 65"
          stroke="#ff6b35"
          strokeWidth="6.5"
          fill="none"
          strokeLinecap="round"
          variants={letterVariants}
        />
        
        {/* Letter G - Professional, unmistakable G shape */}
        {/* G left vertical line (full height) */}
        <motion.path
          d="M 55 25 L 55 65"
          stroke="#ff6b35"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          variants={gVariants}
        />
        
        {/* G top horizontal line */}
        <motion.path
          d="M 55 25 L 75 25"
          stroke="#ff6b35"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          variants={gVariants}
        />
        
        {/* G right vertical line (top half only) */}
        <motion.path
          d="M 75 25 L 75 40"
          stroke="#ff6b35"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          variants={gVariants}
        />
        
        {/* G bottom horizontal line */}
        <motion.path
          d="M 55 65 L 75 65"
          stroke="#ff6b35"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          variants={gVariants}
        />
        
        {/* G right vertical line (bottom half) */}
        <motion.path
          d="M 75 50 L 75 65"
          stroke="#ff6b35"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          variants={gVariants}
        />
        
        {/* G opening line - horizontal bar extending RIGHT - THIS IS THE KEY THAT MAKES IT A G */}
        <motion.path
          d="M 75 45 L 88 45"
          stroke="#ff6b35"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          variants={gVariants}
        />
        
        {/* G inner vertical - connects opening line downward */}
        <motion.path
          d="M 82 45 L 82 60"
          stroke="#ff6b35"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          variants={gVariants}
        />
        
        {/* G inner horizontal - connects inner vertical back to main body */}
        <motion.path
          d="M 82 60 L 75 60"
          stroke="#ff6b35"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          variants={gVariants}
        />
      </motion.svg>
      
      {showText && (
        <motion.span
          variants={textVariants}
          initial={animated ? "hidden" : "visible"}
          animate={animated ? "visible" : "visible"}
          className={`font-display font-bold text-xl ${
            textColor === 'white' || className.includes('text-white') 
              ? 'text-white' 
              : textColor === 'dark'
              ? 'text-gray-900'
              : 'text-gray-900'
          }`}
        >
          TicketGate
        </motion.span>
      )}
    </motion.div>
  );
};

export default Logo;

