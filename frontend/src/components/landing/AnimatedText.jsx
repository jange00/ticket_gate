import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const AnimatedText = ({ 
  text = 'TicketGate', 
  className = '',
  delay = 0,
  speed = 0.1,
  showCursor = true,
  cursorBlinkSpeed = 0.8
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const textArray = text.split('');
    
    const typeInterval = setTimeout(() => {
      const typingInterval = setInterval(() => {
        if (currentIndex < textArray.length) {
          setDisplayedText(textArray.slice(0, currentIndex + 1).join(''));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typingInterval);
          // Hide cursor after a delay
          if (showCursor) {
            setTimeout(() => {
              setIsTyping(false);
            }, 2000);
          }
        }
      }, speed * 1000);

      return () => clearInterval(typingInterval);
    }, delay * 1000);

    return () => {
      clearTimeout(typeInterval);
    };
  }, [text, speed, delay, showCursor]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed,
        delayChildren: delay,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.5,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`inline-block ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div className="flex items-center">
        {text.split('').map((letter, index) => {
          const isVisible = index < displayedText.length;
          return (
            <motion.span
              key={index}
              variants={letterVariants}
              initial="hidden"
              animate={isVisible ? 'visible' : 'hidden'}
              className="inline-block origin-center"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          );
        })}
        {showCursor && isTyping && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{
              duration: cursorBlinkSpeed,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-block w-0.5 h-[1.2em] bg-current ml-1 align-middle"
          />
        )}
      </div>
    </motion.div>
  );
};

export default AnimatedText;











