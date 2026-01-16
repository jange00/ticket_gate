import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { purchasesApi } from '../../api/purchases.api';
import { paymentsApi } from '../../api/payments.api';
import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiTag, FiHome, FiCalendar, FiMapPin, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PurchaseSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionIdParam = searchParams.get('transactionId');

  // eSewa params
  // eSewa params
  const oid = searchParams.get('oid');
  const amt = searchParams.get('amt');
  const refId = searchParams.get('refId');
  const dataParam = searchParams.get('data'); // V2 param

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedTransactionId, setVerifiedTransactionId] = useState(null);

  // Determine effective transaction ID for UI
  // V2: we need to decode 'data' to get the transaction ID locally if we want to show it before verification
  // But usually we just verify first.

  const getTransactionId = () => {
    if (verifiedTransactionId) return verifiedTransactionId;
    if (transactionIdParam) return transactionIdParam;
    if (oid) return oid;
    if (dataParam) {
      try {
        const decoded = JSON.parse(atob(dataParam));
        return decoded.transaction_uuid;
      } catch (e) {
        console.error('Failed to decode data param', e);
      }
    }
    return null;
  };

  const transactionId = getTransactionId();

  // Verification Mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: (data) => paymentsApi.verifyEsewa(data),
    onSuccess: (response) => {
      console.log('Payment verification success:', response);
      if (response.data && response.data.success) {
        toast.success('Payment verified successfully!');
        // If backend returns the updated purchase object, we might assume success
        // But we still need to fetch details or just use what we have.
        // Let's rely on useQuery to fetch details using the transactionId/oid
        // Let's rely on useQuery to fetch details using the transactionId/oid
        // For V2, we might have decoded the transactionId from data
        setVerifiedTransactionId(transactionId);
      }
    },
    onError: (error) => {
      console.error('Payment verification failed:', error);
      toast.error('Payment verification failed. Please contact support.');
      navigate('/purchase/failure'); // Or stay here with error
    }
  });

  useEffect(() => {
    if (dataParam && !verifiedTransactionId && !isVerifying) {
      setIsVerifying(true);
      verifyPaymentMutation.mutate(
        { data: dataParam },
        {
          onSettled: () => setIsVerifying(false)
        }
      );
    } else if (oid && refId && amt && !verifiedTransactionId && !isVerifying) {
      setIsVerifying(true);
      verifyPaymentMutation.mutate(
        { purchaseId: oid, amount: amt, refId, oid },
        {
          onSettled: () => setIsVerifying(false)
        }
      );
    }
  }, [oid, refId, amt, dataParam, verifiedTransactionId]);

  const { data: purchaseData, isLoading: isLoadingPurchase, error } = useQuery({
    queryKey: ['purchase-transaction', transactionId],
    queryFn: () => purchasesApi.getByTransactionId(transactionId),
    enabled: !!transactionId && !isVerifying, // Wait for verification if pending
    retry: 1
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

  // Fetch Tickets for this purchase
  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['purchase-tickets', purchase?._id],
    queryFn: () => purchasesApi.getTickets(purchase?._id),
    enabled: !!purchase?._id,
  });

  let tickets = [];
  if (ticketsData?.data) {
    const data = ticketsData.data;
    if (data.data?.tickets) {
      tickets = data.data.tickets;
    } else if (data.tickets) {
      tickets = data.tickets;
    } else if (Array.isArray(data.data)) {
      tickets = data.data;
    } else if (Array.isArray(data)) {
      tickets = data;
    }
  }

  if (isLoadingPurchase || isVerifying) {
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

  if (error || !purchase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <p className="text-red-600 mb-4">Failed to load purchase details</p>
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
            {/* Event Details */}
            {purchase.event && (
              <div className="pb-6 border-b-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-white" />
                  </div>
                  Event Details
                </h2>
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50/50 to-white border border-blue-100">
                  <h3 className="font-bold text-gray-900 text-xl mb-4">{purchase.event.title}</h3>
                  <div className="space-y-3">
                    {purchase.event.startDate && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg mt-0.5">
                          <FiCalendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Date & Time</p>
                          <p className="font-bold text-gray-900">{formatDateTime(purchase.event.startDate)}</p>
                        </div>
                      </div>
                    )}
                    {purchase.event.venue && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                          <FiMapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Venue</p>
                          <p className="font-bold text-gray-900">{purchase.event.venue.name}</p>
                          {purchase.event.venue.city && (
                            <p className="text-sm text-gray-600">{purchase.event.venue.city}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Details */}
            <div className="pb-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <FiCreditCard className="w-5 h-5 text-white" />
                </div>
                Purchase Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Transaction ID</p>
                  <p className="font-bold text-gray-900 text-lg break-all">{transactionId}</p>
                </div>
                {purchase.totalAmount && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-white border border-orange-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Amount Paid</p>
                    <p className="font-bold text-2xl bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                      {formatCurrency(purchase.totalAmount)}
                    </p>
                  </div>
                )}
                {tickets.length > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Tickets</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                    </p>
                  </div>
                )}
                {purchase.status && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-200">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</p>
                    <p className="font-bold text-green-600 text-lg uppercase">{purchase.status}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tickets with QR Codes */}
            {tickets.length > 0 && (
              <div className="pb-6 border-b-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                    <FiTag className="w-5 h-5 text-white" />
                  </div>
                  Your Tickets
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tickets.map((ticket, index) => (
                    <motion.div
                      key={ticket._id || index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col p-6 rounded-2xl bg-white border-2 border-orange-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                          <FiTag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {ticket.ticketTypeId?.name || 'Standard Ticket'}
                          </p>
                          <p className="text-sm text-gray-500 font-medium">
                            Ticket #{index + 1}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {ticket.status}
                        </span>
                        <Link
                          to={`/dashboard/tickets/${ticket._id}`}
                          className="text-orange-600 hover:text-orange-700 font-bold text-sm flex items-center gap-1"
                        >
                          View QR Code →
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

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

