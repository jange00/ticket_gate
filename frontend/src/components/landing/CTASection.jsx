import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { FiArrowRight } from 'react-icons/fi';

const CTASection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section ref={sectionRef} className="py-24 bg-slate-900 text-white relative overflow-hidden min-h-[60vh] flex items-center">
      {/* Parallax Background Elements */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
        className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        style={{ opacity, scale, y }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl lg:text-5xl font-bold mb-6"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of event organizers who trust TicketGate for their ticketing needs. Start for free today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="secondary" className="!bg-white !text-slate-900 hover:!bg-orange-50 hover:!text-orange-700 group border-0">
                  Create Free Account
                  <FiArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/events">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-orange-500/20 hover:border-orange-400">
                  Browse Events
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTASection;

