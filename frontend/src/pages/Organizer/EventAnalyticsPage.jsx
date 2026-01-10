import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../../api/events.api';
import { organizerApi } from '../../api/organizer.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrendingUp, FiTag, FiDollarSign, FiUsers, FiCheckCircle } from 'react-icons/fi';
import RevenueChart from '../../components/charts/RevenueChart';
import SalesChart from '../../components/charts/SalesChart';
import Table from '../../components/ui/Table';
import { format } from 'date-fns';

const EventAnalyticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['eventAnalytics', id],
    queryFn: () => organizerApi.getEventAnalytics(id),
    enabled: !!id,
  });

  const event = eventData?.data?.data || eventData?.data;
  const analytics = analyticsData?.data?.data || analyticsData?.data || {};

  // Prepare chart data - ensure arrays
  const revenueData = Array.isArray(analytics.revenueByDay) ? analytics.revenueByDay : [];
  const salesByTypeData = Array.isArray(analytics.salesByType) ? analytics.salesByType : [];
  const recentPurchases = Array.isArray(analytics.recentPurchases) ? analytics.recentPurchases : [];

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(analytics.totalRevenue || 0),
      icon: FiDollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Tickets Sold',
      value: analytics.ticketsSold || 0,
      icon: FiTag,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Average Order',
      value: formatCurrency(analytics.averageOrder || 0),
      icon: FiTrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Check-in Rate',
      value: `${analytics.checkInRate || 0}%`,
      icon: FiCheckCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (eventLoading || analyticsLoading) {
    return <Loading fullScreen />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">Event not found</p>
            <Button onClick={() => navigate('/organizer/dashboard')}>
              Back to Dashboard
            </Button>
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
          <Button
            variant="ghost"
            onClick={() => navigate('/organizer/dashboard')}
            className="mb-4"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
            Event Analytics
          </h1>
          <p className="text-gray-600 text-lg">{event.title}</p>
        </motion.div>

        {/* Event Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Event Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue by Day</h2>
              <RevenueChart data={revenueData} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sales by Ticket Type</h2>
              <SalesChart data={salesByTypeData} />
            </Card>
          </motion.div>
        </div>

        {/* Recent Purchases */}
        {analytics.recentPurchases && analytics.recentPurchases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="overflow-hidden">
              <h2 className="text-xl font-bold text-gray-900 mb-6 p-6 pb-0">Recent Purchases</h2>
              <Table>
                <Table.Header>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell>Customer</Table.HeaderCell>
                  <Table.HeaderCell>Tickets</Table.HeaderCell>
                  <Table.HeaderCell>Amount</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                  {recentPurchases.slice(0, 10).map((purchase) => (
                    <Table.Row key={purchase._id}>
                      <Table.Cell>
                        {purchase.createdAt && format(new Date(purchase.createdAt), 'MMM dd, yyyy • h:mm a')}
                      </Table.Cell>
                      <Table.Cell>
                        {purchase.attendeeInfo?.firstName} {purchase.attendeeInfo?.lastName}
                      </Table.Cell>
                      <Table.Cell>{purchase.tickets?.length || 0}</Table.Cell>
                      <Table.Cell>{formatCurrency(purchase.totalAmount || 0)}</Table.Cell>
                      <Table.Cell>
                        <Badge variant={purchase.status === 'paid' ? 'success' : 'warning'}>
                          {purchase.status}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventAnalyticsPage;



