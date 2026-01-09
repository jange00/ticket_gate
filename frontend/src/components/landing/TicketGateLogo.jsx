import { motion } from 'framer-motion';

const TicketGateLogo = ({ className = '', size = 200, animated = true }) => {
  const logoVariants = {
    hidden: { 
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { 
          duration: 2.5, 
          ease: 'easeInOut',
        },
        opacity: { 
          duration: 0.8,
        },
      },
    },
  };

  const ticketVariants = {
    hidden: { 
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { 
          duration: 2, 
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

  const gateVariants = {
    hidden: { 
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { 
          duration: 2, 
          ease: 'easeInOut',
          delay: 0.8,
        },
        opacity: { 
          duration: 0.6,
          delay: 0.8,
        },
      },
    },
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      initial="hidden"
      animate={animated ? "visible" : "hidden"}
    >
      {/* TICKET - Left side, clearly recognizable */}
      {/* Ticket main rectangle */}
      <motion.path
        d="M 25 60 L 75 60 L 75 140 L 25 140 Z"
        stroke="#ff6b35"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={ticketVariants}
      />
      
      {/* Ticket perforations (scalloped edges) - makes it clearly a ticket */}
      <motion.path
        d="M 50 60 Q 52 58 50 56 Q 48 58 50 60"
        stroke="#ff6b35"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        variants={ticketVariants}
      />
      <motion.path
        d="M 50 140 Q 52 142 50 144 Q 48 142 50 140"
        stroke="#ff6b35"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        variants={ticketVariants}
      />
      
      {/* Ticket details - lines inside to show it's a ticket */}
      <motion.path
        d="M 35 85 L 65 85"
        stroke="#ff6b35"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
        variants={ticketVariants}
      />
      <motion.path
        d="M 35 105 L 65 105"
        stroke="#ff6b35"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
        variants={ticketVariants}
      />
      
      {/* GATE - Right side, clearly an entrance/archway */}
      {/* Gate arch (top curve) */}
      <motion.path
        d="M 110 140 Q 110 100 130 100 Q 150 100 150 140"
        stroke="#ff6b35"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        variants={gateVariants}
      />
      
      {/* Gate left pillar */}
      <motion.path
        d="M 110 140 L 110 170"
        stroke="#ff6b35"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        variants={gateVariants}
      />
      
      {/* Gate right pillar */}
      <motion.path
        d="M 150 140 L 150 170"
        stroke="#ff6b35"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        variants={gateVariants}
      />
      
      {/* Gate base/horizontal bar */}
      <motion.path
        d="M 110 170 L 150 170"
        stroke="#ff6b35"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        variants={gateVariants}
      />
      
      {/* Arrow/Flow - showing ticket leads to gate */}
      <motion.path
        d="M 75 100 L 105 100"
        stroke="#ff6b35"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
        variants={logoVariants}
      />
      <motion.path
        d="M 100 95 L 105 100 L 100 105"
        stroke="#ff6b35"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
        variants={logoVariants}
      />
      
      {/* Decorative wavy line at top - minimalist accent like Hami Nepal */}
      <motion.path
        d="M 20 40 Q 50 35 80 40 T 120 40 T 160 40"
        stroke="#ff6b35"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
        variants={logoVariants}
      />
    </motion.svg>
  );
};

export default TicketGateLogo;

