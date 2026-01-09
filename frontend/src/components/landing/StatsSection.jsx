import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { FiCalendar, FiUsers, FiCheckCircle, FiStar } from 'react-icons/fi';

const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    const suffix = value.replace(/[0-9.]/g, '');
    const steps = 60;
    const increment = numericValue / (steps * duration);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, (duration * 1000) / steps);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.]/g, '');
  const displayValue = isInView ? Math.floor(count) : 0;

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

const StatsSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const stats = [
    { value: '10,000+', label: 'Events Created', icon: FiCalendar },
    { value: '50,000+', label: 'Active Users', icon: FiUsers },
    { value: '99.9%', label: 'Uptime', icon: FiCheckCircle },
    { value: '4.9/5', label: 'User Rating', icon: FiStar },
  ];

  return (
    <section ref={sectionRef} className="py-16 bg-white border-b border-gray-200 relative overflow-hidden">
      <motion.div
        style={{ y, opacity }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ 
                  delay: index * 0.15,
                  type: 'spring',
                  stiffness: 100,
                  damping: 15
                }}
                className="text-center group"
              >
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.15 + 0.2,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4 group-hover:bg-slate-200 transition-colors"
                >
                  <Icon className="w-8 h-8 text-slate-700" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.15 + 0.3,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15
                  }}
                  className="text-4xl font-bold text-gray-900 mb-2"
                >
                  <AnimatedCounter value={stat.value} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.4 }}
                  className="text-sm text-gray-600 font-medium"
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default StatsSection;

