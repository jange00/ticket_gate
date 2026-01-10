import { motion } from 'framer-motion';
import Accordion from '../ui/Accordion';

const FAQSection = () => {
  const faqs = [
    {
      question: 'How do I create an event?',
      answer: 'Creating an event is simple! Sign up for a free account, click "Create Event", fill in your event details including title, description, date, venue, and ticket types. Once published, you can start selling tickets immediately.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We support eSewa and other major payment gateways. All payments are processed securely through our encrypted payment system. You can also accept cash payments and mark them manually.',
    },
    {
      question: 'How much does it cost to use TicketGate?',
      answer: 'Our Starter plan is completely free for events up to 100 tickets. For larger events, we charge a small percentage per ticket sold (2.5% for Professional plan). There are no monthly fees, setup fees, or hidden charges.',
    },
    {
      question: 'Can I customize my event page?',
      answer: 'Yes! Professional and Enterprise plans include custom branding options. You can add your logo, customize colors, and create a unique event page that matches your brand identity.',
    },
    {
      question: 'How do attendees check in?',
      answer: 'Attendees receive a QR code ticket via email or in their account. At the event, staff can scan the QR code using our mobile app or web interface. Check-ins are recorded instantly and synced across all devices.',
    },
    {
      question: 'What happens if I need to cancel an event?',
      answer: 'You can cancel or postpone events at any time. We provide tools to notify all ticket holders via email. Refund policies can be set per event, and we support both automatic and manual refund processing.',
    },
    {
      question: 'Do you offer customer support?',
      answer: 'Yes! We offer email support for all users, with priority support for Professional and Enterprise plans. Our support team is available 24/7 to help with any questions or issues you may have.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption (SSL/TLS) for all data transmission, and our servers are protected with enterprise-grade security. We are ISO 27001 certified and SOC 2 compliant. Your data is never shared with third parties.',
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about TicketGate
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.2 }}
        >
          <Accordion items={faqs} />
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;









