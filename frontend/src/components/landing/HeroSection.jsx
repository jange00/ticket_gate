import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import Button from '../ui/Button';

const HeroSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // Text reveal animation
  const textReveal = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative text-white overflow-hidden min-h-screen flex items-center"
      style={{
        backgroundImage: 'url(/assets/images/1444x920_concert.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>
      
      {/* Parallax Background Pattern */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 opacity-10 z-0"
      >
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </motion.div>
      
      {/* Floating Orbs with Parallax */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
        className="absolute top-20 right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl z-0"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 150]) }}
        className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl z-0"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        style={{ opacity, scale }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <motion.div
              variants={textReveal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <FiStar className="w-5 h-5 text-yellow-400" />
              </motion.div>
              <span className="text-sm font-medium">Trusted by 50,000+ users</span>
            </motion.div>
            
            <motion.h1
              variants={textReveal}
              className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight"
            >
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="block"
              >
                Your Events,
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-blue-400 relative inline-block"
              >
                Our Platform
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-3 bg-blue-400/20 -z-10"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.span>
            </motion.h1>
            
            <motion.p
              variants={textReveal}
              className="text-xl text-slate-300 mb-8 leading-relaxed"
            >
              Create, manage, and sell tickets for your events with ease. Join thousands of organizers who trust TicketGate.
            </motion.p>
            
            <motion.div
              variants={textReveal}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="w-full sm:w-auto group">
                    Get Started Free
                    <FiArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/events">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/20 text-white hover:bg-orange-500/20 hover:border-orange-400">
                    Browse Events
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            
            {/* Trust Indicators */}
            <motion.div
              variants={textReveal}
              className="mt-12 flex items-center gap-8"
            >
              {[
                { value: '10K+', label: 'Events' },
                { value: '50K+', label: 'Users' },
                { value: '4.9/5', label: 'Rating' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    delay: 0.7 + index * 0.15,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{ scale: 1.1 }}
                  className={index > 0 ? 'border-l border-white/20 pl-8' : ''}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.15 }}
                    className="text-2xl font-bold"
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl"
            >
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.5 + i * 0.15,
                      type: 'spring',
                      stiffness: 200,
                      damping: 15
                    }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-lg mb-3" />
                    <div className="h-3 bg-white/20 rounded mb-2" />
                    <div className="h-2 bg-white/10 rounded w-2/3" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;

