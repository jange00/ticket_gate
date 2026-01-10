import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { eventsApi } from '../../api/events.api';
import Card from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { FiMaximize2, FiCalendar, FiCheckCircle, FiUsers, FiArrowRight } from 'react-icons/fi';
import { format, isToday } from 'date-fns';

const StaffDashboardPage = () => {
  const { user } = useAuth();

  // Fetch today's events
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['todayEvents'],
    queryFn: () => eventsApi.getAll({ status: 'published' }),
  });

  let events = [];
  if (eventsData) {
    const responseData = eventsData.data;
    if (responseData) {
      if (responseData.data && Array.isArray(responseData.data)) {
        events = responseData.data;
      } else if (Array.isArray(responseData)) {
        events = responseData;
      }
    }
  }

  // Filter today's events
  const todayEvents = events.filter(event => {
    if (!event.startDate) return false;
    return isToday(new Date(event.startDate));
  });

  const stats = [
    {
      label: "Today's Check-ins",
      value: 0, // Would come from API
      icon: FiCheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Events Today',
      value: todayEvents.length,
      icon: FiCalendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Verified',
      value: 0, // Would come from API
      icon: FiUsers,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Staff Portal
          </h1>
          <p className="text-gray-600 text-lg">Manage event check-ins and attendee verification</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></span>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link to="/checkin">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full" variant="primary">
                      <div className="flex items-center justify-between w-full">
                        <span>Start Check-in</span>
                        <FiMaximize2 className="w-5 h-5" />
                      </div>
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/staff/checkins">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full" variant="outline">
                      <div className="flex items-center justify-between w-full">
                        <span>Check-in History</span>
                        <FiArrowRight className="w-5 h-5" />
                      </div>
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/events">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full" variant="outline">
                      <div className="flex items-center justify-between w-full">
                        <span>View Events</span>
                        <FiArrowRight className="w-5 h-5" />
                      </div>
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Today's Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></span>
                Today's Events
              </h2>
              {todayEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCalendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">No events scheduled for today</p>
                  <Link to="/events">
                    <Button variant="outline" size="sm">
                      View All Events
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayEvents.map((event, index) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <Badge variant="success">Today</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {event.startDate && (
                            <span>{format(new Date(event.startDate), 'h:mm a')}</span>
                          )}
                          {event.venue && <span>{event.venue.name}</span>}
                        </div>
                      </div>
                      <Link to={`/staff/checkins/event/${event._id}`}>
                        <Button variant="ghost" size="sm">
                          View Check-ins
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
    </div>
  );
};

export default StaffDashboardPage;



