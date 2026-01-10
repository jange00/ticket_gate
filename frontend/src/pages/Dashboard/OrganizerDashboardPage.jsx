import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { eventsApi } from '../../api/events.api';
import { organizerApi } from '../../api/organizer.api';
import Card from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiDollarSign, 
  FiTag, 
  FiTrendingUp, 
  FiPlus,
  FiArrowRight,
  FiEye
} from 'react-icons/fi';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import RevenueChart from '../../components/charts/RevenueChart';
import { format, subMonths } from 'date-fns';

const OrganizerDashboardPage = () => {
  const { user } = useAuth();

  // Fetch organizer statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['organizerStats'],
    queryFn: () => organizerApi.getStatistics(),
  });

  // Fetch organizer's events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['myEvents'],
    queryFn: () => eventsApi.getMyEvents(),
  });

  const stats = statsData?.data?.data || statsData?.data || {};
  
  // Ensure events is always an array, handling various API response structures
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

  const totalEvents = events.length;
  const publishedEvents = events.filter(e => e.status === 'published').length;
  const totalTicketsSold = stats.totalTicketsSold || 0;
  const totalRevenue = stats.totalRevenue || 0;

  // Prepare revenue chart data (last 6 months)
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      name: format(date, 'MMM'),
      revenue: Math.floor(Math.random() * 50000) + 10000, // Mock data - replace with real data
    };
  });

  const recentEvents = events
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (statsLoading || eventsLoading) {
    return <Loading fullScreen />;
  }

  const statCards = [
    {
      label: 'Total Events',
      value: totalEvents,
      icon: FiCalendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Published Events',
      value: publishedEvents,
      icon: FiTag,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Tickets Sold',
      value: totalTicketsSold,
      icon: FiTrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: FiDollarSign,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

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
            Organizer Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage your events and track performance</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                Revenue Overview (Last 6 Months)
              </h2>
              <RevenueChart data={revenueData} />
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link to="/events/create">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full" variant="primary">
                      <div className="flex items-center justify-between w-full">
                        <span>Create New Event</span>
                        <FiPlus className="w-5 h-5" />
                      </div>
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/organizer/events">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full" variant="outline">
                      <div className="flex items-center justify-between w-full">
                        <span>Manage Events</span>
                        <FiArrowRight className="w-5 h-5" />
                      </div>
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/organizer/analytics">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full" variant="outline">
                      <div className="flex items-center justify-between w-full">
                        <span>View Analytics</span>
                        <FiArrowRight className="w-5 h-5" />
                      </div>
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                Recent Events
              </h2>
              <Link to="/organizer/events">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCalendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No events yet</p>
                <Link to="/events/create">
                  <Button variant="outline" size="sm">
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <Badge variant={event.status === 'published' ? 'success' : 'default'}>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatDateTime(event.startDate)}</span>
                        {event.venue && <span>{event.venue.name}</span>}
                      </div>
                    </div>
                    <Link to={`/events/${event._id}`}>
                      <Button variant="ghost" size="sm">
                        <FiEye className="w-4 h-4 mr-2" />
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
    </div>
  );
};

export default OrganizerDashboardPage;



