import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { purchasesApi } from '../../api/purchases.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiTag, FiHome } from 'react-icons/fi';

const PurchaseSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId');

  const { data: purchaseData, isLoading } = useQuery({
    queryKey: ['purchase-status', transactionId],
    queryFn: () => purchasesApi.getStatus(transactionId),
    enabled: !!transactionId,
  });

  const statusData = purchaseData?.data?.data || purchaseData?.data;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!transactionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <p className="text-red-600 mb-4">Invalid transaction</p>
          <Button onClick={() => navigate('/events')}>Browse Events</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50/30">
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
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl"
          >
            <FiCheckCircle className="w-14 h-14 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600">Your tickets have been purchased successfully</p>
        </motion.div>

        <Card className="p-8 md:p-10 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-6">
            {/* Transaction Details */}
            <div className="pb-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Transaction ID</p>
                  <p className="font-bold text-gray-900 text-lg">{transactionId}</p>
                </div>
                {statusData?.refId && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Reference ID</p>
                    <p className="font-bold text-gray-900 text-lg">{statusData.refId}</p>
                  </div>
                )}
                {statusData?.totalAmount && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-white border border-orange-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Amount Paid</p>
                    <p className="font-bold text-2xl bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                      {formatCurrency(statusData.totalAmount)}
                    </p>
                  </div>
                )}
                {statusData?.status && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</p>
                    <p className="font-bold text-green-600 text-lg uppercase">{statusData.status}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Information Box */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-start gap-4">
                <FiTag className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">What's Next?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Your tickets have been sent to your email. You can also view them in your{' '}
                    <Link to="/dashboard/tickets" className="text-orange-600 hover:text-orange-700 font-semibold underline">
                      Tickets
                    </Link>{' '}
                    section. Make sure to bring a valid ID to the event.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                variant="primary"
                className="flex-1 py-4 text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg hover:shadow-xl"
                onClick={() => navigate('/dashboard/tickets')}
              >
                <span className="flex items-center justify-center gap-2">
                  <FiTag className="w-5 h-5" />
                  View My Tickets
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 py-4 text-lg font-semibold"
                onClick={() => navigate('/events')}
              >
                <span className="flex items-center justify-center gap-2">
                  <FiHome className="w-5 h-5" />
                  Browse More Events
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;

