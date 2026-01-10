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
      color: 'bg-green-500',
    },
    {
      label: 'Events Today',
      value: todayEvents.length,
      icon: FiCalendar,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Verified',
      value: 0, // Would come from API
      icon: FiUsers,
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Staff Portal
          </h1>
          <p className="text-gray-600">Manage event check-ins and attendee verification</p>
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
          {/* Today's Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                Today's Events
              </h2>
              {todayEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCalendar className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-600 mb-2">No events scheduled for today</p>
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
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
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
  );
};

export default StaffDashboardPage;



