import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { purchasesApi } from '../../api/purchases.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiTag, FiCalendar, FiDollarSign, FiDownload } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const purchaseId = location.state?.purchaseId;

  const { data: purchaseData, isLoading } = useQuery({
    queryKey: ['purchase', purchaseId],
    queryFn: () => purchasesApi.getById(purchaseId),
    enabled: !!purchaseId,
  });

  const purchase = purchaseData?.data?.data || purchaseData?.data;
  const tickets = purchase?.tickets || [];

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 md:p-12">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <FiCheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Purchase Successful!</h1>
              <p className="text-gray-600 text-lg">Your tickets have been purchased successfully</p>
              {purchase?._id && (
                <p className="text-sm text-gray-500 mt-2">
                  Order #<span className="font-mono">{purchase._id.slice(-8)}</span>
                </p>
              )}
            </div>

            {/* Purchase Summary */}
            {purchase && (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-8 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Purchase Summary</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Event:</span>
                    <span className="font-semibold text-gray-900">
                      {purchase.event?.title || 'Event'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tickets:</span>
                    <span className="font-semibold text-gray-900">
                      {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-2xl text-orange-600">
                      {formatCurrency(purchase.totalAmount || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="text-gray-900">
                      {purchase.createdAt && format(new Date(purchase.createdAt), 'MMM dd, yyyy • h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="success">Paid</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Ticket QR Codes */}
            {tickets.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Tickets</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tickets.map((ticket, index) => (
                    <motion.div
                      key={ticket._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-white border-2 border-gray-200 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {ticket.ticketType?.name || 'General Admission'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(ticket.ticketType?.price || 0)}
                          </p>
                        </div>
                        <Badge variant="success">Confirmed</Badge>
                      </div>
                      <div className="flex justify-center bg-gray-50 rounded-lg p-4 mb-4">
                        <QRCodeSVG
                          value={ticket._id || ''}
                          size={150}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Show this QR code at the event entrance
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/dashboard/tickets')}
                className="flex-1"
                variant="primary"
              >
                <div className="flex items-center justify-center gap-2">
                  <FiTag className="w-5 h-5" />
                  View My Tickets
                </div>
              </Button>
              <Button
                onClick={() => navigate('/events')}
                className="flex-1"
                variant="outline"
              >
                Browse More Events
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmationPage;



