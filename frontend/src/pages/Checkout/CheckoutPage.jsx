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
import { FiArrowLeft, FiCreditCard, FiLock, FiCalendar, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

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

  const createPurchaseMutation = useMutation({
    mutationFn: (data) => purchasesApi.create(data),
    onSuccess: (response) => {
      const purchase = response?.data?.data || response?.data;
      toast.success('Purchase completed successfully!');
      navigate('/checkout/confirmation', { state: { purchaseId: purchase?._id || purchase?.id } });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process purchase');
    },
  });

  const event = eventData?.data?.data || eventData?.data || eventData;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

              {/* Event Summary */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
                <div className="flex gap-4">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        <span>{formatDateTime(event.startDate)}</span>
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-2">
                          <FiMapPin className="w-4 h-4" />
                          <span>{event.venue.name}, {event.venue.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Summary */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ticket Summary</h2>
                <div className="space-y-3">
                  {tickets.map((ticket, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">Ticket Type {index + 1}</p>
                        <p className="text-sm text-gray-600">{ticket.quantity} ticket(s)</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(ticket.price * ticket.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiCreditCard className="w-5 h-5" />
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-orange-500 rounded-lg cursor-pointer bg-orange-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="esewa"
                        checked={paymentMethod === 'esewa'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">eSewa</p>
                        <p className="text-sm text-gray-600">Pay securely with eSewa</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  <FiLock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={createPurchaseMutation.isPending}
                >
                  {createPurchaseMutation.isPending ? (
                    <>
                      <Loading size="sm" />
                      Processing...
                    </>
                  ) : (
                    <>Complete Purchase - {formatCurrency(totalAmount)}</>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tickets ({totalTickets})</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
