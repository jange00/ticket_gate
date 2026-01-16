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
import { FiCalendar, FiMapPin, FiPlus, FiMinus, FiArrowLeft, FiTag, FiShoppingCart, FiCheck } from 'react-icons/fi';

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
    console.log('EventDetailPage - responseData.data:', responseData?.data);
    console.log('EventDetailPage - responseData.data keys:', responseData?.data ? Object.keys(responseData.data) : 'N/A');

    if (responseData) {
      // Helper function to check if an object is a valid event
      const isValidEvent = (obj) => {
        return obj &&
          typeof obj === 'object' &&
          !Array.isArray(obj) &&
          Object.keys(obj).length > 0 &&
          (obj._id || obj.id || obj.title);
      };

      // Handle { success: true, data: { event: {...}, ticketTypes: [...] } }
      if (responseData.success && responseData.data) {
        console.log('EventDetailPage - Checking success.data structure:', {
          hasEvent: !!responseData.data.event,
          eventKeys: responseData.data.event ? Object.keys(responseData.data.event) : [],
          eventIsValid: responseData.data.event ? isValidEvent(responseData.data.event) : false,
          dataIsValid: isValidEvent(responseData.data)
        });

        if (responseData.data.event && isValidEvent(responseData.data.event)) {
          event = responseData.data.event;
          console.log('EventDetailPage - Extracted from success.data.event:', event);
        } else if (isValidEvent(responseData.data)) {
          event = responseData.data;
          console.log('EventDetailPage - Extracted from success.data:', event);
        } else if (responseData.data.event) {
          // Even if validation fails, log what we found
          console.warn('EventDetailPage - Found event object but validation failed:', responseData.data.event);
          console.warn('EventDetailPage - Event object keys:', Object.keys(responseData.data.event));
        }
      }
      // Handle { data: { event: {...}, ticketTypes: [...] } }
      else if (responseData.data) {
        if (responseData.data.event && isValidEvent(responseData.data.event)) {
          event = responseData.data.event;
          console.log('EventDetailPage - Extracted from data.event:', event);
        } else if (isValidEvent(responseData.data)) {
          event = responseData.data;
          console.log('EventDetailPage - Extracted from data:', event);
        }
      }
      // Handle direct object (the event itself)
      else if (isValidEvent(responseData)) {
        event = responseData;
        console.log('EventDetailPage - Using responseData directly:', event);
      }
    }

    // Final fallback - try all possible paths
    if (!event || (typeof event === 'object' && Object.keys(event).length === 0)) {
      console.warn('EventDetailPage - Event extraction failed, trying fallbacks');
      const fallback1 = eventData?.data?.data?.event;
      const fallback2 = eventData?.data?.data;
      const fallback3 = eventData?.data?.event;
      const fallback4 = eventData?.data;
      const fallback5 = eventData;

      if (fallback1 && typeof fallback1 === 'object' && Object.keys(fallback1).length > 0 && (fallback1._id || fallback1.id || fallback1.title)) {
        event = fallback1;
      } else if (fallback2 && typeof fallback2 === 'object' && Object.keys(fallback2).length > 0 && (fallback2._id || fallback2.id || fallback2.title)) {
        event = fallback2;
      } else if (fallback3 && typeof fallback3 === 'object' && Object.keys(fallback3).length > 0 && (fallback3._id || fallback3.id || fallback3.title)) {
        event = fallback3;
      } else if (fallback4 && typeof fallback4 === 'object' && Object.keys(fallback4).length > 0 && (fallback4._id || fallback4.id || fallback4.title)) {
        event = fallback4;
      } else if (fallback5 && typeof fallback5 === 'object' && Object.keys(fallback5).length > 0 && (fallback5._id || fallback5.id || fallback5.title)) {
        event = fallback5;
      }
      console.log('EventDetailPage - Fallback result:', event);
    }
  }

  // Extract ticket types - handle various response structures
  // Also check if ticket types are included in the event response
  let ticketTypes = [];

  // First, try to get ticket types from the event response
  if (eventData) {
    const responseData = eventData.data;
    if (responseData?.data?.ticketTypes && Array.isArray(responseData.data.ticketTypes)) {
      ticketTypes = responseData.data.ticketTypes;
      console.log('EventDetailPage - Extracted ticketTypes from event response:', ticketTypes);
    }
  }

  // If not found in event response, use the separate ticket types API
  if (ticketTypes.length === 0 && ticketTypesData) {
    const responseData = ticketTypesData.data;
    if (responseData) {
      // Handle { success: true, data: [...] }
      if (responseData.success && responseData.data) {
        if (Array.isArray(responseData.data)) {
          ticketTypes = responseData.data;
        } else if (responseData.data.data && Array.isArray(responseData.data.data)) {
          ticketTypes = responseData.data.data;
        } else if (responseData.data.ticketTypes && Array.isArray(responseData.data.ticketTypes)) {
          ticketTypes = responseData.data.ticketTypes;
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
    console.log('EventDetailPage - Extracted ticketTypes from ticketTypesData:', ticketTypes);
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
  if (!event || (typeof event === 'object' && Object.keys(event).length === 0) || (!event._id && !event.id && !event.title)) {
    const responseData = eventData?.data;
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-2">Event not found or data is incomplete</p>
          {import.meta.env.DEV && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-left text-sm max-w-2xl mx-auto">
              <p><strong>Debug Info:</strong></p>
              <p>Event ID: {id}</p>
              <p>Has eventData: {eventData ? 'Yes' : 'No'}</p>
              <p>Response keys: {responseData ? Object.keys(responseData).join(', ') : 'N/A'}</p>
              <p>Has responseData.data: {responseData?.data ? 'Yes' : 'No'}</p>
              {responseData?.data && (
                <>
                  <p>responseData.data type: {Array.isArray(responseData.data) ? 'Array' : typeof responseData.data}</p>
                  <p>responseData.data keys: {typeof responseData.data === 'object' && !Array.isArray(responseData.data) ? Object.keys(responseData.data).join(', ') || 'Empty object' : 'N/A'}</p>
                  <p>responseData.data content: {JSON.stringify(responseData.data, null, 2).substring(0, 200)}</p>
                </>
              )}
              <p className="mt-2 text-xs text-gray-500">Check browser console for detailed logs</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/events">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
            className="mb-8 inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors group"
          >
            <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to Events</span>
          </motion.div>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Banner Section */}
            {(event.bannerUrl || event.imageUrl) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative rounded-3xl overflow-hidden shadow-2xl group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                <img
                  src={event.bannerUrl || event.imageUrl}
                  alt={event.title}
                  className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {event.category && (
                        <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-white/50 shadow-lg">
                          {event.category}
                        </Badge>
                      )}
                      <Badge variant={event.status === 'published' ? 'success' : 'default'} className="bg-white/90 backdrop-blur-sm shadow-lg">
                        {event.status}
                      </Badge>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl mb-2">
                      {event.title}
                    </h1>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Event Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-8 md:p-10 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                {!event.bannerUrl && !event.imageUrl && (
                  <div className="mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
                      {event.title}
                    </h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      {event.category && (
                        <Badge variant="outline" className="text-sm px-4 py-1.5">
                          {event.category}
                        </Badge>
                      )}
                      <Badge variant={event.status === 'published' ? 'success' : 'default'} className="text-sm px-4 py-1.5">
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-200">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-md transition-shadow"
                  >
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                      <FiCalendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Date & Time</p>
                      <p className="font-bold text-gray-900 text-lg">{formatDateTime(event.startDate)}</p>
                      {event.endDate && (
                        <p className="text-sm text-gray-600 mt-2 font-medium">Ends: {formatDateTime(event.endDate)}</p>
                      )}
                    </div>
                  </motion.div>

                  {event.venue && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <FiMapPin className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Venue</p>
                        <p className="font-bold text-gray-900 text-lg">{event.venue.name}</p>
                        <p className="text-sm text-gray-600 mt-2 font-medium">
                          {event.venue.address}, {event.venue.city}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Ticket Selection Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="sticky top-8 p-0 shadow-2xl border-0 bg-gradient-to-br from-white via-white to-orange-50/30 backdrop-blur-sm overflow-hidden">
                {/* Header Section */}
                <div className="p-6 md:p-8 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                      <FiTag className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      Select Tickets
                    </h2>
                  </div>
                  <p className="text-orange-100 text-sm">Choose your preferred ticket type</p>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8">
                  {ticketTypes.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
                        <FiTag className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-semibold text-lg mb-1">No tickets available</p>
                      <p className="text-gray-400 text-sm">Tickets for this event are not available yet</p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {ticketTypes.map((ticketType, index) => {
                          const quantity = selectedTickets[ticketType._id] || 0;
                          const available = ticketType.quantityAvailable || ticketType.quantity || 0;
                          const maxPerPurchase = ticketType.maxPerPurchase || 10;
                          const isSelected = quantity > 0;

                          return (
                            <motion.div
                              key={ticketType._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              className={`relative rounded-2xl p-5 transition-all duration-300 ${isSelected
                                  ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-400 shadow-lg'
                                  : 'bg-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-md'
                                }`}
                            >
                              {/* Selected Indicator */}
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg"
                                >
                                  <FiCheck className="w-5 h-5 text-white" />
                                </motion.div>
                              )}

                              {/* Ticket Icon */}
                              <div className="flex items-start gap-4 mb-4">
                                <div className={`p-3 rounded-xl ${isSelected
                                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg'
                                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                                  }`}>
                                  <FiTag className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h3 className="font-bold text-gray-900 text-lg mb-1">{ticketType.name}</h3>
                                      {ticketType.description && (
                                        <p className="text-sm text-gray-600 leading-relaxed">{ticketType.description}</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Price and Availability */}
                                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                    <div>
                                      <p className="text-xs text-gray-500 font-medium mb-1">Price</p>
                                      <p className="font-bold text-2xl bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                                        {formatCurrency(ticketType.price)}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500 font-medium mb-1">Available</p>
                                      <p className={`text-sm font-bold ${available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {available} left
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200">
                                <span className="text-sm font-semibold text-gray-700">Quantity</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateTicketQuantity(ticketType._id, -1)}
                                    disabled={quantity === 0}
                                    className="p-2.5 rounded-xl border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:border-gray-300 disabled:hover:bg-transparent active:scale-95"
                                  >
                                    <FiMinus className="w-4 h-4 text-gray-700" />
                                  </button>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={Math.min(available, maxPerPurchase)}
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(ticketType._id, e.target.value)}
                                    className="w-16 text-center font-bold text-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateTicketQuantity(ticketType._id, 1)}
                                    disabled={quantity >= Math.min(available, maxPerPurchase)}
                                    className="p-2.5 rounded-xl border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:border-gray-300 disabled:hover:bg-transparent active:scale-95"
                                  >
                                    <FiPlus className="w-4 h-4 text-gray-700" />
                                  </button>
                                </div>
                              </div>

                              {/* Subtotal for selected tickets */}
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-3 pt-3 border-t border-orange-200"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Subtotal ({quantity} {quantity === 1 ? 'ticket' : 'tickets'})</span>
                                    <span className="font-bold text-lg text-orange-600">
                                      {formatCurrency(ticketType.price * quantity)}
                                    </span>
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      {totalTicketsSelected > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                          className="border-t-2 border-gray-200 pt-6 space-y-4 bg-gradient-to-br from-orange-50 via-white to-orange-50/50 rounded-2xl p-6 -mx-6 -mb-6 mt-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <FiShoppingCart className="w-5 h-5 text-orange-600" />
                              <span className="font-bold text-gray-900 text-lg">Order Summary</span>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{totalTicketsSelected} {totalTicketsSelected === 1 ? 'ticket' : 'tickets'}</span>
                              <span className="font-medium">{formatCurrency(totalPrice)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t-2 border-orange-200">
                            <span className="font-bold text-gray-900 text-xl">Total</span>
                            <span className="font-bold text-3xl bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                              {formatCurrency(totalPrice)}
                            </span>
                          </div>

                          <Button
                            variant="primary"
                            className="w-full py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 transform hover:scale-[1.02] active:scale-[0.98]"
                            onClick={handleCheckout}
                            disabled={totalTicketsSelected === 0}
                          >
                            <span className="flex items-center justify-center gap-2">
                              <FiShoppingCart className="w-5 h-5" />
                              Proceed to Checkout
                            </span>
                          </Button>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
