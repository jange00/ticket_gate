import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { purchasesApi } from '../../api/purchases.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { FiXCircle, FiArrowLeft, FiHome, FiRefreshCw, FiCalendar, FiTag, FiDollarSign } from 'react-icons/fi';

const PurchaseFailurePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract transaction ID from various eSewa callback parameters
  const transactionIdParam = searchParams.get('transactionId');
  const oid = searchParams.get('oid'); // eSewa legacy param
  const dataParam = searchParams.get('data'); // eSewa V2 param (Base64 encoded)
  
  // Function to extract transaction ID from eSewa V2 data parameter
  const getTransactionId = () => {
    if (transactionIdParam) return transactionIdParam;
    if (oid) return oid;
    if (dataParam) {
      try {
        const decoded = JSON.parse(atob(dataParam));
        return decoded.transaction_uuid || decoded.transactionId;
      } catch (e) {
        console.error('Failed to decode eSewa data param', e);
      }
    }
    return null;
  };

  const transactionId = getTransactionId();

  // Optionally fetch purchase details
  const { data: purchaseData, isLoading: isLoadingPurchase } = useQuery({
    queryKey: ['purchase-transaction', transactionId],
    queryFn: () => purchasesApi.getByTransactionId(transactionId),
    enabled: !!transactionId,
    retry: false, // Don't retry on failure page
  });

  // Extract purchase data - handle various response structures
  let purchase = null;
  if (purchaseData) {
    const responseData = purchaseData?.data;
    if (responseData) {
      if (responseData.success && responseData.data) {
        purchase = responseData.data.purchase || responseData.data;
      } else if (responseData.data) {
        purchase = responseData.data.purchase || responseData.data;
      } else {
        purchase = responseData.purchase || responseData;
      }
    }
  }

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
                <p className="font-bold text-gray-900 text-lg break-all">{transactionId}</p>
              </div>
            )}

            {/* Purchase Details (if available) */}
            {isLoadingPurchase && (
              <div className="py-8">
                <Loading />
              </div>
            )}

            {purchase && !isLoadingPurchase && (
              <div className="pb-6 border-b-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                    <FiTag className="w-5 h-5 text-white" />
                  </div>
                  Purchase Details
                </h2>
                <div className="space-y-4">
                  {(purchase.eventId || purchase.event) && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                          <FiCalendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Event</p>
                          <p className="font-bold text-gray-900 text-lg">{(purchase.eventId || purchase.event)?.title}</p>
                          {((purchase.eventId || purchase.event)?.startDate) && (
                            <p className="text-sm text-gray-600 mt-1">{formatDateTime((purchase.eventId || purchase.event).startDate)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {purchase.totalAmount && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-white border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <FiDollarSign className="w-5 h-5 text-orange-600" />
                          </div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Amount</p>
                        </div>
                        <p className="font-bold text-xl bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                          {formatCurrency(purchase.totalAmount)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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



