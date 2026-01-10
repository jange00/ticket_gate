import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const AnimatedLogo = ({ text = 'TicketGate', className = '' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const textArray = text.split('');
    
    const typeInterval = setInterval(() => {
      if (currentIndex < textArray.length) {
        setDisplayedText(textArray.slice(0, currentIndex + 1).join(''));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Blink cursor a few times then hide
        setTimeout(() => {
          setShowCursor(false);
        }, 1000);
      }
    }, 100); // Typing speed

    return () => clearInterval(typeInterval);
  }, [text]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`inline-block ${className}`}
    >
      <div className="flex items-center">
        {text.split('').map((letter, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            className="inline-block"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
        {showCursor && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-block w-0.5 h-8 bg-current ml-1"
          />
        )}
      </div>
    </motion.div>
  );
};

export default AnimatedLogo;












