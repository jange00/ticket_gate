import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../../api/tickets.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { FiCalendar, FiMapPin, FiTag, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { format, isAfter } from 'date-fns';
import Dropdown from '../../components/ui/Dropdown';

const MyTicketsPage = () => {
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['myTickets'],
    queryFn: () => ticketsApi.getMyTickets(),
  });
  
  // Handle different response structures
  let tickets = [];
  if (data) {
    const responseData = data.data;
    if (responseData) {
      if (responseData.data && Array.isArray(responseData.data)) {
        tickets = responseData.data;
      } else if (Array.isArray(responseData)) {
        tickets = responseData;
      } else if (responseData.tickets && Array.isArray(responseData.tickets)) {
        tickets = responseData.tickets;
      }
    }
  }
  
  if (!Array.isArray(tickets)) {
    tickets = [];
  }
  
  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return ticket.event?.startDate && isAfter(new Date(ticket.event.startDate), new Date());
    }
    if (filter === 'past') {
      return ticket.event?.startDate && !isAfter(new Date(ticket.event.startDate), new Date());
    }
    if (filter === 'checked-in') {
      return ticket.status === 'checked_in';
    }
    return true;
  });
  
  const filterOptions = [
    { value: 'all', label: 'All Tickets' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past Events' },
    { value: 'checked-in', label: 'Checked In' },
  ];
  
  if (isLoading) {
    return <Loading fullScreen />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-6">
            My Tickets
          </h1>
          <Card className="p-12 text-center">
            <p className="text-red-600 mb-4">Error loading tickets</p>
            <p className="text-gray-600 text-sm">{error.message}</p>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
            My Tickets
          </h1>
          <p className="text-gray-600 text-lg">Manage and view all your event tickets</p>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="w-48">
              <Dropdown
                options={filterOptions}
                value={filter}
                onChange={setFilter}
              />
            </div>
            <span className="text-sm text-gray-600">
              {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>
      
        {filteredTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTag className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4 text-lg">
                {filter === 'all' 
                  ? "You don't have any tickets yet" 
                  : `No ${filter.replace('-', ' ')} tickets found`
                }
              </p>
              {filter === 'all' && (
                <Link to="/events">
                  <Button>Browse Events</Button>
                </Link>
              )}
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket, index) => {
              const isExpanded = expandedTicket === ticket._id;
              const isUpcoming = ticket.event?.startDate && isAfter(new Date(ticket.event.startDate), new Date());
              
              return (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {ticket.event?.title || 'Event'}
                            </h3>
                            <Badge 
                              variant={
                                ticket.status === 'checked_in' ? 'success' :
                                ticket.status === 'confirmed' ? 'default' :
                                ticket.status === 'cancelled' ? 'danger' : 'default'
                              }
                            >
                              {ticket.status?.replace('_', ' ') || 'confirmed'}
                            </Badge>
                            {isUpcoming && (
                              <Badge variant="info">Upcoming</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                              <FiTag className="w-4 h-4" />
                              {ticket.ticketType?.name || 'General Admission'}
                            </span>
                            <span className="flex items-center gap-2">
                              <FiCalendar className="w-4 h-4" />
                              {ticket.event?.startDate && format(new Date(ticket.event.startDate), 'MMM dd, yyyy • h:mm a')}
                            </span>
                            {ticket.event?.venue && (
                              <span className="flex items-center gap-2">
                                <FiMapPin className="w-4 h-4" />
                                {ticket.event.venue.name}
                              </span>
                            )}
                            <span className="font-semibold text-orange-600">
                              {formatCurrency(ticket.ticketType?.price || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/tickets/${ticket._id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <motion.button
                            onClick={() => setExpandedTicket(isExpanded ? null : ticket._id)}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isExpanded ? (
                              <FiChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <FiChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </motion.button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3">Ticket Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Ticket ID:</span>
                                      <span className="font-mono text-gray-900">{ticket._id?.slice(-8)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Purchase Date:</span>
                                      <span className="text-gray-900">
                                        {ticket.createdAt && format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Status:</span>
                                      <Badge variant={ticket.status === 'confirmed' ? 'success' : 'default'} size="sm">
                                        {ticket.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                                  <h4 className="font-semibold text-gray-900 mb-3">QR Code</h4>
                                  <div className="bg-white p-4 rounded-lg">
                                    <QRCodeSVG
                                      value={ticket._id || ''}
                                      size={150}
                                      level="H"
                                      includeMargin={true}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2 text-center">
                                    Show this QR code at the event entrance
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;

