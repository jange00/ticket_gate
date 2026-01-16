import { motion } from 'framer-motion';
import Card from '../ui/Card';
import {

  FiCreditCard,
  FiEdit,
  FiPhone,
  FiMail,
  FiCode
} from 'react-icons/fi';

const BenefitsSection = () => {
  const benefits = [
    {
      title: 'No Hidden Fees',
      description: 'Transparent pricing with no surprise charges. Keep more of your revenue.',
      icon: FiCreditCard,
      color: 'bg-green-500'
    },
    {
      title: 'Instant Payouts',
      description: 'Get paid quickly with our fast payout system. Funds available within 24-48 hours.',
      icon: FiCreditCard,
      color: 'bg-blue-500'
    },
    {
      title: 'Custom Branding',
      description: 'White-label your event pages with your own branding and colors.',
      icon: FiEdit,
      color: 'bg-orange-500'
    },
    {
      title: 'Mobile App',
      description: 'Manage events on the go with our mobile app for iOS and Android.',
      icon: FiPhone,
      color: 'bg-indigo-500'
    },
    {
      title: 'Email Marketing',
      description: 'Built-in email tools to promote your events and engage with attendees.',
      icon: FiMail,
      color: 'bg-pink-500'
    },
    {
      title: 'API Access',
      description: 'Integrate with your existing tools using our comprehensive REST API.',
      icon: FiCode,
      color: 'bg-orange-500'
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose TicketGate?
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to succeed, all in one platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex items-center justify-center w-12 h-12 ${benefit.color} rounded-lg mb-4 shadow-md`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-slate-700 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;

