import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../../api/events.api';
import { ticketsApi as ticketTypesApi } from '../../api/tickets.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiDollarSign, FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedTickets, setSelectedTickets] = useState({});
  
  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await eventsApi.getById(id);
      console.log('EventDetailPage - Full API Response:', response);
      console.log('EventDetailPage - Response.data:', response?.data);
      return response;
    },
    enabled: !!id,
  });
  
  const { data: ticketTypesData, isLoading: ticketTypesLoading, error: ticketTypesError } = useQuery({
    queryKey: ['ticketTypes', id],
    queryFn: async () => {
      const response = await ticketTypesApi.getEventTicketTypes(id);
      console.log('EventDetailPage - Ticket Types API Response:', response);
      return response;
    },
    enabled: !!id,
  });
  
  // Extract event data - handle various response structures
  let event = null;
  if (eventData) {
    const responseData = eventData.data; // Axios wraps response in .data
    console.log('EventDetailPage - Processing responseData:', responseData);
    
    if (responseData) {
      // Handle { success: true, data: {...} }
      if (responseData.success && responseData.data) {
        event = responseData.data;
        console.log('EventDetailPage - Extracted from success.data:', event);
      }
      // Handle { data: {...} } (nested data)
      else if (responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data) && Object.keys(responseData.data).length > 0) {
        event = responseData.data;
        console.log('EventDetailPage - Extracted from data.data:', event);
      }
      // Handle direct object (the event itself) - check if it has _id or title
      else if (typeof responseData === 'object' && !Array.isArray(responseData) && (responseData._id || responseData.title)) {
        event = responseData;
        console.log('EventDetailPage - Using responseData directly:', event);
      }
    }
    
    // Final fallback - try all possible paths
    if (!event || (typeof event === 'object' && Object.keys(event).length === 0)) {
      console.warn('EventDetailPage - Event extraction failed, trying fallbacks');
      event = eventData?.data?.data || eventData?.data || eventData;
      console.log('EventDetailPage - Fallback result:', event);
    }
  }
  
  // Extract ticket types - handle various response structures
  let ticketTypes = [];
  if (ticketTypesData) {
    const responseData = ticketTypesData.data;
    if (responseData) {
      // Handle { success: true, data: [...] }
      if (responseData.success && responseData.data) {
        if (Array.isArray(responseData.data)) {
          ticketTypes = responseData.data;
        } else if (responseData.data.data && Array.isArray(responseData.data.data)) {
          ticketTypes = responseData.data.data;
        }
      }
      // Handle { data: [...] }
      else if (responseData.data && Array.isArray(responseData.data)) {
        ticketTypes = responseData.data;
      }
      // Handle direct array
      else if (Array.isArray(responseData)) {
        ticketTypes = responseData;
      }
    }
  }
  
  // Ensure ticketTypes is always an array
  if (!Array.isArray(ticketTypes)) {
    ticketTypes = [];
  }

  // Debug logging
  if (import.meta.env.DEV) {
    console.log('EventDetailPage - Raw eventData:', eventData);
    console.log('EventDetailPage - Extracted event:', event);
    console.log('EventDetailPage - Raw ticketTypesData:', ticketTypesData);
    console.log('EventDetailPage - Extracted ticketTypes:', ticketTypes);
  }

  const updateTicketQuantity = (ticketTypeId, change) => {
    setSelectedTickets(prev => {
      const current = prev[ticketTypeId] || 0;
      const newQuantity = Math.max(0, current + change);
      
      const ticketType = ticketTypes.find(tt => tt._id === ticketTypeId);
      if (ticketType) {
        const maxQuantity = Math.min(
          ticketType.quantityAvailable || ticketType.quantity || 999,
          ticketType.maxPerPurchase || 10
        );
        const finalQuantity = Math.min(newQuantity, maxQuantity);
        
        if (finalQuantity === 0) {
          const { [ticketTypeId]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [ticketTypeId]: finalQuantity };
      }
      return prev;
    });
  };

  const handleQuantityChange = (ticketTypeId, value) => {
    const numValue = parseInt(value) || 0;
    const ticketType = ticketTypes.find(tt => tt._id === ticketTypeId);
    if (ticketType) {
      const maxQuantity = Math.min(
        ticketType.quantityAvailable || ticketType.quantity || 999,
        ticketType.maxPerPurchase || 10
      );
      const finalQuantity = Math.max(0, Math.min(numValue, maxQuantity));
      
      if (finalQuantity === 0) {
        setSelectedTickets(prev => {
          const { [ticketTypeId]: removed, ...rest } = prev;
          return rest;
        });
      } else {
        setSelectedTickets(prev => ({ ...prev, [ticketTypeId]: finalQuantity }));
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    const tickets = Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => {
        const ticketType = ticketTypes.find(tt => tt._id === ticketTypeId);
        return {
          ticketTypeId,
          quantity,
          price: ticketType?.price || 0,
        };
      });
    
    if (tickets.length === 0) return;
    
    navigate('/checkout', { state: { eventId: id, tickets } });
  };
  
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [ticketTypeId, quantity]) => {
    const ticketType = ticketTypes.find(tt => tt._id === ticketTypeId);
    return sum + (ticketType?.price || 0) * quantity;
  }, 0);
  
  if (eventLoading || ticketTypesLoading) {
    return <Loading fullScreen />;
  }

  // Handle errors
  if (eventError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-12 text-center">
          <p className="text-red-600 mb-2">Error loading event</p>
          <p className="text-gray-600 text-sm mb-4">{eventError.message}</p>
          <Link to="/events">
            <Button className="mt-4">Back to Events</Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  // Validate event has required fields
  if (!event || (typeof event === 'object' && Object.keys(event).length === 0) || (!event._id && !event.title)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-2">Event not found or data is incomplete</p>
          {import.meta.env.DEV && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Event ID: {id}</p>
              <p>Has eventData: {eventData ? 'Yes' : 'No'}</p>
              <p>Event data keys: {eventData?.data ? Object.keys(eventData.data).join(', ') : 'N/A'}</p>
            </div>
          )}
          <Link to="/events">
            <Button className="mt-4">Back to Events</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const totalTicketsSelected = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/events">
          <motion.div
            whileHover={{ x: -5 }}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Events</span>
          </motion.div>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Banner Image */}
            {event.bannerUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={event.bannerUrl}
                  alt={event.title}
                  className="w-full h-96 object-cover rounded-2xl shadow-lg"
                />
              </motion.div>
            )}

            {/* Event Info */}
            <Card className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
                  <div className="flex items-center gap-4 flex-wrap">
                    {event.category && (
                      <Badge variant="outline">{event.category}</Badge>
                    )}
                    <Badge variant={event.status === 'published' ? 'success' : 'default'}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FiCalendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                    <p className="font-semibold text-gray-900">{formatDateTime(event.startDate)}</p>
                    {event.endDate && (
                      <p className="text-sm text-gray-600 mt-1">Ends: {formatDateTime(event.endDate)}</p>
                    )}
                  </div>
                </div>

                {event.venue && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <FiMapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Venue</p>
                      <p className="font-semibold text-gray-900">{event.venue.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.venue.address}, {event.venue.city}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Ticket Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Tickets</h2>

              {ticketTypes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tickets available for this event</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {ticketTypes.map((ticketType) => {
                      const quantity = selectedTickets[ticketType._id] || 0;
                      const available = ticketType.quantityAvailable || ticketType.quantity || 0;
                      const maxPerPurchase = ticketType.maxPerPurchase || 10;

                      return (
                        <div key={ticketType._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{ticketType.name}</h3>
                              {ticketType.description && (
                                <p className="text-sm text-gray-600 mt-1">{ticketType.description}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-bold text-orange-600">{formatCurrency(ticketType.price)}</p>
                              <p className="text-xs text-gray-500 mt-1">{available} available</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateTicketQuantity(ticketType._id, -1)}
                              disabled={quantity === 0}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiMinus className="w-4 h-4" />
                            </button>
                            <Input
                              type="number"
                              min="0"
                              max={Math.min(available, maxPerPurchase)}
                              value={quantity}
                              onChange={(e) => handleQuantityChange(ticketType._id, e.target.value)}
                              className="w-20 text-center"
                            />
                            <button
                              type="button"
                              onClick={() => updateTicketQuantity(ticketType._id, 1)}
                              disabled={quantity >= Math.min(available, maxPerPurchase)}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiPlus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalTicketsSelected > 0 && (
                    <div className="border-t border-gray-200 pt-4 space-y-4">
                      <div className="flex items-center justify-between text-lg">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-orange-600 text-xl">
                          {formatCurrency(totalPrice)}
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleCheckout}
                        disabled={totalTicketsSelected === 0}
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
