import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { FiArrowRight } from 'react-icons/fi';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Your Event',
      description: 'Sign up and create your event in minutes. Add details, set ticket prices, and customize your event page.',
    },
    {
      number: '02',
      title: 'Promote & Sell',
      description: 'Share your event link and start selling tickets. Our platform handles all payments securely.',
    },
    {
      number: '03',
      title: 'Manage Attendees',
      description: 'Track ticket sales, manage check-ins, and communicate with your attendees all in one place.',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Get started in three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.2, type: 'spring', stiffness: 100 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gray-200 -z-10" style={{ width: 'calc(100% - 4rem)' }}>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.5, duration: 0.8 }}
                    className="h-full bg-slate-900 origin-left"
                  />
                </div>
              )}
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="p-8 text-center h-full relative overflow-hidden group">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-full text-2xl font-bold mb-6 relative z-10"
                  >
                    {step.number}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.6 }}
                      className="hidden md:block absolute top-16 right-0 translate-x-1/2"
                    >
                      <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                        <FiArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;









