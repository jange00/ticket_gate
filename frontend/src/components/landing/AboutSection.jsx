import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Card from '../ui/Card';
import { FiLayers, FiGlobe, FiPhone, FiShield } from 'react-icons/fi';

const AboutSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const leftY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rightY = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const highlights = [
    { icon: FiLayers, title: 'Enterprise Ready', color: 'bg-blue-500' },
    { icon: FiGlobe, title: 'Global Reach', color: 'bg-emerald-500' },
    { icon: FiPhone, title: 'Mobile First', color: 'bg-orange-500' },
    { icon: FiShield, title: 'Secure & Compliant', color: 'bg-orange-500' },
  ];

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      <motion.div
        style={{ opacity }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            style={{ y: leftY }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            <motion.h2
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-900 mb-6"
            >
              About TicketGate
            </motion.h2>
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.2,
                  },
                },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4 text-gray-600 leading-relaxed"
            >
              <motion.p variants={textVariants}>
                TicketGate is a modern event management and ticketing platform designed to simplify the entire event lifecycle. From creation to check-in, we provide everything you need to run successful events.
              </motion.p>
              <motion.p variants={textVariants}>
                Founded in 2020, we've helped thousands of event organizers sell millions of tickets across various industries including music festivals, conferences, workshops, and corporate events.
              </motion.p>
              <motion.p variants={textVariants}>
                Our mission is to democratize event management by providing enterprise-grade tools that are accessible to everyone, from small community gatherings to large-scale productions.
              </motion.p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
              className="mt-8 grid grid-cols-2 gap-6"
            >
              {[
                { value: '2020', label: 'Founded' },
                { value: '50+', label: 'Countries' },
                { value: '24/7', label: 'Support' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 0.5 + index * 0.1,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          <motion.div
            style={{ y: rightY }}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="grid grid-cols-2 gap-4"
          >
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.8, rotate: -10 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.15,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{ y: -12, scale: 1.05, rotate: 5 }}
                >
                  <Card className="p-6 text-center h-full hover:shadow-lg transition-all relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="relative z-10">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className={`inline-flex items-center justify-center w-14 h-14 ${item.color} rounded-xl mb-4 shadow-lg`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default AboutSection;

