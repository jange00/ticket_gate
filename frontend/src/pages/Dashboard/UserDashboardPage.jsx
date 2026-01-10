import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { ticketsApi } from '../../api/tickets.api';
import { purchasesApi } from '../../api/purchases.api';
import { eventsApi } from '../../api/events.api';
import Card from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { FiTag, FiCalendar, FiDollarSign, FiArrowRight, FiClock } from 'react-icons/fi';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { format, isAfter } from 'date-fns';

const UserDashboardPage = () => {
  const { user } = useAuth();

  // Fetch user's tickets
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['myTickets'],
    queryFn: () => ticketsApi.getMyTickets(),
  });

  // Fetch user's purchases
  const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ['myPurchases'],
    queryFn: () => purchasesApi.getMyPurchases(),
  });

  // Fetch upcoming events
  const { data: eventsData } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: () => eventsApi.getAll({ status: 'published', limit: 5 }),
  });

  // Process tickets data - handle different response structures
  let tickets = [];
  if (ticketsData) {
    const responseData = ticketsData.data;
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
  
  // Ensure tickets is always an array
  if (!Array.isArray(tickets)) {
    tickets = [];
  }
  
  const totalTickets = tickets.length;
  const upcomingTickets = tickets.filter(ticket => {
    if (!ticket?.event?.startDate) return false;
    return isAfter(new Date(ticket.event.startDate), new Date());
  }).length;

  // Process purchases data - handle different response structures
  let purchases = [];
  if (purchasesData) {
    const responseData = purchasesData.data;
    if (responseData) {
      if (responseData.data && Array.isArray(responseData.data)) {
        purchases = responseData.data;
      } else if (Array.isArray(responseData)) {
        purchases = responseData;
      } else if (responseData.purchases && Array.isArray(responseData.purchases)) {
        purchases = responseData.purchases;
      }
    }
  }
  
  // Ensure purchases is always an array
  if (!Array.isArray(purchases)) {
    purchases = [];
  }
  
  const totalSpent = purchases
    .filter(p => p?.status === 'paid')
    .reduce((sum, p) => sum + (p?.totalAmount || 0), 0);

  // Process events data - handle different response structures
  let events = [];
  if (eventsData) {
    const responseData = eventsData.data;
    if (responseData) {
      if (responseData.data && Array.isArray(responseData.data)) {
        events = responseData.data;
      } else if (Array.isArray(responseData)) {
        events = responseData;
      } else if (responseData.events && Array.isArray(responseData.events)) {
        events = responseData.events;
      }
    }
  }
  
  // Ensure events is always an array
  if (!Array.isArray(events)) {
    events = [];
  }
  
  const upcomingEvents = events.slice(0, 5);

  // Recent purchases
  const recentPurchases = purchases
    .filter(p => p?.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const stats = [
    {
      label: 'Total Tickets',
      value: totalTickets,
      icon: FiTag,
      color: 'bg-orange-500',
    },
    {
      label: 'Upcoming Events',
      value: upcomingTickets,
      icon: FiCalendar,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(totalSpent),
      icon: FiDollarSign,
      color: 'bg-green-500',
    },
  ];

  if (ticketsLoading || purchasesLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your account</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div>
          {/* Recent Purchases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Recent Purchases
                </h2>
                {recentPurchases.length > 0 && (
                  <Link to="/dashboard/tickets">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                )}
              </div>
              
              {recentPurchases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiTag className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">No purchases yet</p>
                  <Link to="/events">
                    <Button variant="outline" size="sm">
                      Browse Events
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPurchases.map((purchase, index) => (
                    <motion.div
                      key={purchase._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {purchase.event?.title || 'Event'}
                          </h3>
                          <Badge variant={purchase.status === 'paid' ? 'success' : 'warning'}>
                            {purchase.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FiTag className="w-4 h-4" />
                            {purchase.tickets?.length || 0} tickets
                          </span>
                          <span className="flex items-center gap-1">
                            <FiDollarSign className="w-4 h-4" />
                            {formatCurrency(purchase.totalAmount || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {format(new Date(purchase.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                      <Link to={`/tickets/${purchase.tickets?.[0]?._id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Upcoming Events
                </h2>
                <Link to="/events">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <Link key={event._id} to={`/events/${event._id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(event.startDate)}
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
    </div>
  );
};

export default UserDashboardPage;



