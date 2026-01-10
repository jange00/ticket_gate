import { motion } from 'framer-motion';
import Card from '../ui/Card';

const IntegrationsSection = () => {
  const integrations = [
    { name: 'eSewa', logo: '💳' },
    { name: 'Stripe', logo: '💳' },
    { name: 'PayPal', logo: '💰' },
    { name: 'Mailchimp', logo: '📧' },
    { name: 'Google Analytics', logo: '📊' },
    { name: 'Facebook', logo: '📘' },
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
            Integrations & Partners
          </h2>
          <p className="text-xl text-gray-600">
            Connect with the tools you already use
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={{ y: -8, scale: 1.05, rotate: 5 }}
            >
              <Card className="p-6 text-center hover:shadow-lg transition-all h-full flex flex-col items-center justify-center cursor-pointer group">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-4xl mb-3"
                >
                  {integration.logo}
                </motion.div>
                <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {integration.name}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;








