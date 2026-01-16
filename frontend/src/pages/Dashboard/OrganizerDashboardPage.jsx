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
  FiCreditCard,
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

  const totalEvents = stats.totalEvents || events.length;
  const publishedEvents = stats.publishedEvents || events.filter(e => e.status === 'published' || e.status === 'PUBLISHED').length;
  const totalTicketsSold = stats.totalTicketsSold || 0;
  const totalRevenue = stats.totalRevenue || 0;

  // Prepare revenue chart data (last 6 months)
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthKey = format(date, 'yyyy-MM');
    const monthData = stats.revenueByMonth?.find(m => m.month === monthKey);

    return {
      name: format(date, 'MMM'),
      revenue: monthData?.revenue || 0,
    };
  });


  if (statsLoading || eventsLoading) {
    return <Loading fullScreen />;
  }

  const statCards = [
    {
      label: 'Total Events',
      value: totalEvents,
      icon: FiCalendar,
      color: 'bg-blue-500',
    },
    {
      label: 'Published Events',
      value: publishedEvents,
      icon: FiTag,
      color: 'bg-green-500',
    },
    {
      label: 'Tickets Sold',
      value: totalTicketsSold,
      icon: FiTrendingUp,
      color: 'bg-purple-500',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: FiCreditCard,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Organizer Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your events and track performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
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
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.label}
                    </p>
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

      <div className="mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">Revenue Overview</h2>
                <p className="text-sm text-gray-600">Last 6 Months Performance</p>
              </div>
              <div className="px-4 py-2 bg-orange-500 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">Total: {formatCurrency(totalRevenue)}</p>
              </div>
            </div>
            <div className="rounded-lg p-4 bg-gray-50">
              <RevenueChart data={revenueData} />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OrganizerDashboardPage;



