import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { eventsApi } from '../../api/events.api';
import { purchasesApi } from '../../api/purchases.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCreditCard, FiLock, FiCalendar, FiMapPin, FiTag, FiCheck, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { paymentsApi } from '../../api/payments.api';
import PaymentMethod from '../../components/PaymentMethod';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { eventId, tickets } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('esewa');

  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getById(eventId),
    enabled: !!eventId,
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: (data) => paymentsApi.initiateEsewa(data),
    onSuccess: (response) => {
      console.log('eSewa init response:', response);
      if (response.data?.success && response.data?.data) {
        const { payment_url, formData } = response.data.data;
        submitEsewaForm(payment_url, formData);
      } else {
        toast.error('Invalid response from payment gateway');
      }
    },
    onError: (error) => {
      console.error('eSewa initiation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate eSewa payment');
    }
  });

  const submitEsewaForm = (actionUrl, formData) => {
    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", actionUrl);
    form.style.display = "none";

    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        const hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", formData[key]);
        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  };

  const createPurchaseMutation = useMutation({
    mutationFn: (data) => purchasesApi.create(data),
    onSuccess: (response) => {
      console.log('Purchase API Response:', response);
      
      let purchase = null;
      // Handle various response structures
      if (response.data?.success && response.data?.data?.purchase) {
         purchase = response.data.data.purchase;
      } else if (response.data?.purchase) {
         purchase = response.data.purchase;
      } else if (response.data?.data) {
         purchase = response.data.data;
      }

      if (purchase && paymentMethod === 'esewa') {
        toast.loading('Redirecting to eSewa...');
        initiatePaymentMutation.mutate({
          purchaseId: purchase._id || purchase.id,
          amount: purchase.totalAmount
        });
      } else {
        toast.success('Purchase created!');
        navigate('/events'); 
      }
    },
    onError: (error) => {
      console.error('Purchase creation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate purchase');
    },
  });

  // Extract event data - handle various response structures (same as EventDetailPage)
  let event = null;
  if (eventData) {
    const responseData = eventData.data;
    if (responseData) {
      const isValidEvent = (obj) => {
        return obj && 
               typeof obj === 'object' && 
               !Array.isArray(obj) && 
               Object.keys(obj).length > 0 && 
               (obj._id || obj.id || obj.title);
      };
      
      if (responseData.success && responseData.data) {
        if (responseData.data.event && isValidEvent(responseData.data.event)) {
          event = responseData.data.event;
        } else if (isValidEvent(responseData.data)) {
          event = responseData.data;
        }
      } else if (responseData.data) {
        if (responseData.data.event && isValidEvent(responseData.data.event)) {
          event = responseData.data.event;
        } else if (isValidEvent(responseData.data)) {
          event = responseData.data;
        }
      } else if (isValidEvent(responseData)) {
        event = responseData;
      }
    }
    
    // Fallback
    if (!event || (typeof event === 'object' && Object.keys(event).length === 0)) {
      event = eventData?.data?.data?.event || eventData?.data?.data || eventData?.data?.event || eventData?.data || eventData;
    }
  }

  if (!eventId || !tickets || tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <p className="text-gray-600 mb-4">No tickets selected</p>
          <Button onClick={() => navigate('/events')}>Browse Events</Button>
        </Card>
      </div>
    );
  }

  if (eventLoading) {
    return <Loading fullScreen />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <p className="text-gray-600 mb-4">Event not found</p>
          <Button onClick={() => navigate('/events')}>Browse Events</Button>
        </Card>
      </div>
    );
  }

  const totalAmount = tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
  const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const purchaseData = {
      eventId,
      tickets: tickets.map(t => ({
        ticketTypeId: t.ticketTypeId,
        quantity: t.quantity,
      })),
      paymentMethod,
      totalAmount,
    };

    createPurchaseMutation.mutate(purchaseData);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors group"
        >
          <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Back</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                Checkout
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
            </motion.div>

            <Card className="p-8 md:p-10 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              {/* Event Details Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 pb-8 border-b-2 border-gray-200"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-white" />
                  </div>
                  Event Details
                </h2>
                <div className="flex gap-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-white border border-blue-100">
                  {(event.imageUrl || event.bannerUrl) && (
                    <motion.img
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      src={event.imageUrl || event.bannerUrl}
                      alt={event.title}
                      className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl shadow-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-xl mb-4">{event.title}</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg mt-0.5">
                          <FiCalendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Date & Time</p>
                          <p className="font-bold text-gray-900">{formatDateTime(event.startDate)}</p>
                        </div>
                      </div>
                      {event.venue && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                            <FiMapPin className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Venue</p>
                            <p className="font-bold text-gray-900">{event.venue.name}</p>
                            <p className="text-sm text-gray-600">{event.venue.city}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Ticket Summary Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8 pb-8 border-b-2 border-gray-200"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                    <FiTag className="w-5 h-5 text-white" />
                  </div>
                  Ticket Summary
                </h2>
                <div className="space-y-4">
                  {tickets.map((ticket, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                          <FiTag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">Ticket Type {index + 1}</p>
                          <p className="text-sm text-gray-600 font-medium">{ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'}</p>
                        </div>
                      </div>
                      <p className="font-bold text-2xl bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                        {formatCurrency(ticket.price * ticket.quantity)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Payment Method Section */}
              <form onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                      <FiCreditCard className="w-5 h-5 text-white" />
                    </div>
                    Payment Method
                  </h2>
                  
                  <PaymentMethod 
                    selectedMethod={paymentMethod}
                    onSelect={setPaymentMethod}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mb-6"
                >
                  <FiShield className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">
                    Your payment information is secure and encrypted with industry-standard SSL
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                    disabled={createPurchaseMutation.isPending}
                  >
                    {createPurchaseMutation.isPending ? (
                      <span className="flex items-center justify-center gap-3">
                        <Loading size="sm" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FiCheck className="w-5 h-5" />
                        Complete Purchase - {formatCurrency(totalAmount)}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="sticky top-8 p-0 shadow-2xl border-0 bg-gradient-to-br from-white via-white to-orange-50/30 backdrop-blur-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 md:p-8 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                      <FiTag className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold">Order Summary</h2>
                  </div>
                  <p className="text-orange-100 text-sm">Review your order</p>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                      <div className="flex items-center gap-3">
                        <FiTag className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold text-gray-700">Tickets ({totalTickets})</span>
                      </div>
                      <span className="font-bold text-gray-900 text-lg">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
      </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
