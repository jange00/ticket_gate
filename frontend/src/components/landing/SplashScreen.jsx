import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiCalendar, FiTag, FiUsers, FiMapPin, FiStar, FiMic, FiMusic, FiHeadphones, FiRadio } from 'react-icons/fi';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [textVisible, setTextVisible] = useState(false);
  const [elementsVisible, setElementsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // Animate text letter by letter
    const text = 'TicketGate';
    let currentIndex = 0;

    const textTimer = setTimeout(() => {
      setTextVisible(true);
      const typingInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          // Show event elements after text completes
          setTimeout(() => {
            setElementsVisible(true);
          }, 300);
        }
      }, 100); // Speed of typing

      return () => clearInterval(typingInterval);
    }, 300);

    // Fade out and call onComplete after animation
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 800); // Wait for fade out animation
    }, 4500); // Total time: typing + pause + fade

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{
            backgroundImage: 'url(/assets/images/night-outdoor-music-festival-concert-600nw-2318139457.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/60 z-0"></div>
          {/* Decorative Event Elements - Background */}
          <div className="absolute inset-0 overflow-hidden z-0">
            {/* Microphones - Event Theme */}
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -30 }}
              animate={elementsVisible ? { 
                opacity: 0.15, 
                scale: [1, 1.2, 1],
                rotate: [-30, -20, -30],
                x: [0, 30, 0],
                y: [0, -20, 0]
              } : { opacity: 0 }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.3
              }}
              className="absolute top-16 left-8"
            >
              <FiMic className="w-20 h-20 text-orange-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: 45 }}
              animate={elementsVisible ? { 
                opacity: 0.12, 
                scale: [1, 1.15, 1],
                rotate: [45, 35, 45],
                x: [0, -40, 0],
                y: [0, 25, 0]
              } : { opacity: 0 }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.6
              }}
              className="absolute top-24 right-12"
            >
              <FiMic className="w-24 h-24 text-orange-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={elementsVisible ? { 
                opacity: 0.1, 
                scale: [1, 1.3, 1],
                rotate: [0, 15, 0]
              } : { opacity: 0 }}
              transition={{ 
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.9
              }}
              className="absolute bottom-40 left-16"
            >
              <FiMic className="w-18 h-18 text-orange-500" />
            </motion.div>

            {/* DJ Equipment - Headphones */}
            <motion.div
              initial={{ opacity: 0, x: -80, rotate: -60 }}
              animate={elementsVisible ? { 
                opacity: 0.12, 
                x: [0, 25, 0],
                y: [0, -15, 0],
                rotate: [-60, -45, -60]
              } : { opacity: 0 }}
              transition={{ 
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4
              }}
              className="absolute top-1/3 left-12"
            >
              <FiHeadphones className="w-22 h-22 text-orange-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 80, rotate: 60 }}
              animate={elementsVisible ? { 
                opacity: 0.1, 
                x: [0, -30, 0],
                y: [0, 20, 0],
                rotate: [60, 45, 60]
              } : { opacity: 0 }}
              transition={{ 
                duration: 5.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.8
              }}
              className="absolute bottom-1/3 right-14"
            >
              <FiHeadphones className="w-20 h-20 text-orange-500" />
            </motion.div>

            {/* Music Notes / Radio */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={elementsVisible ? { 
                opacity: 0.1, 
                y: [0, 25, 0],
                scale: [1, 1.2, 1],
                rotate: [0, 10, 0]
              } : { opacity: 0 }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5
              }}
              className="absolute top-1/4 right-1/4"
            >
              <FiMusic className="w-16 h-16 text-blue-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={elementsVisible ? { 
                opacity: 0.1, 
                scale: [1, 1.25, 1],
                rotate: [0, -15, 0]
              } : { opacity: 0 }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.1
              }}
              className="absolute bottom-1/4 left-1/3"
            >
              <FiRadio className="w-18 h-18 text-emerald-500" />
            </motion.div>

            {/* Additional Microphone - Bottom Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: 30 }}
              animate={elementsVisible ? { 
                opacity: 0.1, 
                scale: [1, 1.15, 1],
                rotate: [30, 20, 30],
                x: [0, -20, 0]
              } : { opacity: 0 }}
              transition={{ 
                duration: 4.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.2
              }}
              className="absolute bottom-24 right-20"
            >
              <FiMic className="w-16 h-16 text-orange-500" />
            </motion.div>

            {/* Floating Tickets */}
            <motion.div
              initial={{ opacity: 0, x: -100, rotate: -45 }}
              animate={elementsVisible ? { 
                opacity: 0.08, 
                x: [0, 50, 0],
                y: [0, -30, 0],
                rotate: [-45, -30, -45]
              } : { opacity: 0 }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.3
              }}
              className="absolute top-20 left-10"
            >
              <FiTag className="w-16 h-16 text-orange-500" />
            </motion.div>

            {/* Calendar Icons */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={elementsVisible ? { 
                opacity: 0.08, 
                y: [0, 20, 0],
                scale: [1, 1.1, 1]
              } : { opacity: 0 }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.5
              }}
              className="absolute bottom-32 left-20"
            >
              <FiCalendar className="w-24 h-24 text-orange-500" />
            </motion.div>
          </div>

          {/* Main Content - Centered Animated Text */}
          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            {/* Animated "TicketGate" Text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: textVisible ? 1 : 0, scale: textVisible ? 1 : 0.9 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.16, 1, 0.3, 1]
              }}
              className="text-center mb-6"
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight mb-4 relative">
                {displayedText.split('').map((letter, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      rotateX: 0,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 200,
                      damping: 15
                    }}
                    className="inline-block origin-center"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </motion.span>
                ))}
                {displayedText.length < 'TicketGate'.length && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="inline-block w-1 h-[0.9em] bg-orange-500 ml-1 align-middle"
                  />
                )}
              </h1>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: displayedText.length === 'TicketGate'.length ? 1 : 0, y: displayedText.length === 'TicketGate'.length ? 0 : 10 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.3,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="text-orange-500 text-xl sm:text-2xl md:text-3xl font-semibold tracking-wider flex items-center justify-center gap-3"
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <FiStar className="w-6 h-6 text-orange-500" />
                </motion.span>
                Event Management Platform
                <motion.span
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <FiStar className="w-6 h-6 text-orange-500" />
                </motion.span>
              </motion.p>
            </motion.div>

            {/* Event Icons Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: elementsVisible ? 1 : 0, y: elementsVisible ? 0 : 30 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2
              }}
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-12"
            >
              {[
                { icon: FiCalendar, label: 'Events', color: 'from-blue-500 to-blue-600' },
                { icon: FiTag, label: 'Tickets', color: 'from-orange-500 to-orange-600' },
                { icon: FiUsers, label: 'Community', color: 'from-orange-500 to-orange-600' },
                { icon: FiMapPin, label: 'Venues', color: 'from-emerald-500 to-emerald-600' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ 
                      opacity: elementsVisible ? 1 : 0, 
                      scale: elementsVisible ? 1 : 0,
                      y: elementsVisible ? 0 : 20
                    }}
                    transition={{ 
                      delay: 0.4 + index * 0.15,
                      type: 'spring',
                      stiffness: 200,
                      damping: 15
                    }}
                    whileHover={{ scale: 1.15, y: -5 }}
                    className="flex flex-col items-center gap-3 group cursor-pointer"
                  >
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-xl group-hover:shadow-orange-500/50 transition-all duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <span className="text-sm text-white/80 font-semibold tracking-wide group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Bottom Text - Fixed at bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1, ease: 'easeOut' }}
            className="absolute bottom-8 md:bottom-10 left-0 right-0 text-center"
          >
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm font-light tracking-[0.15em] uppercase">
              FOR THE PEOPLE, BY THE PEOPLE.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;

