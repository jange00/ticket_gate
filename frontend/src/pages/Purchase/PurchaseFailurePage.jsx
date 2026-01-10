import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { FiXCircle, FiArrowLeft, FiHome, FiRefreshCw } from 'react-icons/fi';

const PurchaseFailurePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl"
          >
            <FiXCircle className="w-14 h-14 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
            Payment Failed
          </h1>
          <p className="text-xl text-gray-600">Your payment could not be processed</p>
        </motion.div>

        <Card className="p-8 md:p-10 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Transaction ID */}
            {transactionId && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Transaction ID</p>
                <p className="font-bold text-gray-900 text-lg">{transactionId}</p>
              </div>
            )}

            {/* Error Information */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
              <div className="flex items-start gap-4">
                <FiXCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">What Happened?</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Your payment could not be completed. This could be due to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Insufficient balance in your eSewa wallet</li>
                    <li>Network connectivity issues</li>
                    <li>Transaction timeout</li>
                    <li>Payment gateway issues</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Help Box */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-start gap-4">
                <FiRefreshCw className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Don't worry, your tickets were not charged. You can try again or contact our support team if the issue persists.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                variant="primary"
                className="flex-1 py-4 text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg hover:shadow-xl"
                onClick={() => navigate(-1)}
              >
                <span className="flex items-center justify-center gap-2">
                  <FiArrowLeft className="w-5 h-5" />
                  Try Again
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 py-4 text-lg font-semibold"
                onClick={() => navigate('/events')}
              >
                <span className="flex items-center justify-center gap-2">
                  <FiHome className="w-5 h-5" />
                  Browse Events
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseFailurePage;


