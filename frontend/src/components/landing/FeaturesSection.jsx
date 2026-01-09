import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Card from '../ui/Card';
import { 
  FiTag, 
  FiShield, 
  FiBarChart2, 
  FiUsers, 
  FiClock, 
  FiCheckCircle 
} from 'react-icons/fi';

const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const features = [
    {
      icon: FiTag,
      title: 'Easy Ticketing',
      description: 'Create and manage events with our intuitive platform. Sell tickets in minutes.',
      color: 'bg-blue-500'
    },
    {
      icon: FiShield,
      title: 'Secure Payments',
      description: 'Bank-level security with encrypted transactions. Your data is always protected.',
      color: 'bg-emerald-500'
    },
    {
      icon: FiBarChart2,
      title: 'Real-time Analytics',
      description: 'Track sales, attendance, and revenue with comprehensive analytics dashboard.',
      color: 'bg-orange-500'
    },
    {
      icon: FiUsers,
      title: 'Community Driven',
      description: 'Join thousands of event organizers and attendees worldwide.',
      color: 'bg-orange-500'
    },
    {
      icon: FiClock,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our round-the-clock customer support.',
      color: 'bg-indigo-500'
    },
    {
      icon: FiCheckCircle,
      title: 'Verified Events',
      description: 'All events are verified to ensure quality and authenticity for attendees.',
      color: 'bg-pink-500'
    },
  ];

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

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.8,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50 relative overflow-hidden">
      <motion.div
        style={{ opacity }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Everything You Need
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Powerful features to help you create, manage, and grow your events
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                style={{ y: useTransform(scrollYProgress, [0, 1], [0, index % 2 === 0 ? -30 : 30]) }}
                whileHover={{ 
                  y: -12,
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 300 }
                }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className={`inline-flex items-center justify-center w-14 h-14 ${feature.color} rounded-xl mb-6 shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <motion.h3
                      whileHover={{ x: 5 }}
                      className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-slate-700 transition-colors"
                    >
                      {feature.title}
                    </motion.h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FeaturesSection;

