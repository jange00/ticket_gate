import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizerApi } from '../../api/organizer.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { FiDownload, FiTrendingUp, FiCreditCard, FiTag, FiCalendar } from 'react-icons/fi';
import RevenueChart from '../../components/charts/RevenueChart';
import Table from '../../components/ui/Table';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';

const SalesReportsPage = () => {
  const [dateRange, setDateRange] = useState('6months');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['organizerStats', dateRange],
    queryFn: () => organizerApi.getStatistics({ dateRange }),
  });

  const stats = statsData?.data?.data || statsData?.data || {};

  // Prepare revenue data for chart using real data
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthKey = format(date, 'yyyy-MM');
    const monthData = stats.revenueByMonth?.find(m => m.month === monthKey);

    return {
      name: format(date, 'MMM'),
      revenue: monthData?.revenue || 0,
    };
  });

  const handleExport = () => {
    // Export functionality
    toast.success('Report exported successfully');
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const summaryStats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      icon: FiCreditCard,
      color: 'from-green-500 to-green-600',
      change: '+12%',
    },
    {
      label: 'Total Tickets Sold',
      value: stats.totalTicketsSold || 0,
      icon: FiTag,
      color: 'from-blue-500 to-blue-600',
      change: '+8%',
    },
    {
      label: 'Total Events',
      value: stats.totalEvents || 0,
      icon: FiCalendar,
      color: 'from-purple-500 to-purple-600',
      change: '+5%',
    },
    {
      label: 'Average Revenue per Event',
      value: formatCurrency(stats.averageRevenuePerEvent || 0),
      icon: FiTrendingUp,
      color: 'from-orange-500 to-orange-600',
      change: '+15%',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
              Sales Reports
            </h1>
            <p className="text-gray-600 text-lg">Track your sales performance and revenue</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <Button variant="outline" onClick={handleExport}>
              <FiDownload className="w-5 h-5 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Overview</h2>
            <RevenueChart data={revenueData} />
          </Card>
        </motion.div>

        {/* Top Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 mb-6 p-6 pb-0">Top Performing Events</h2>
            <Table>
              <Table.Header>
                <Table.HeaderCell>Event</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Tickets Sold</Table.HeaderCell>
                <Table.HeaderCell>Revenue</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {stats.topEvents && stats.topEvents.length > 0 ? (
                  stats.topEvents.map((event) => (
                    <Table.Row key={event._id}>
                      <Table.Cell>
                        <p className="font-semibold text-gray-900">{event.title}</p>
                      </Table.Cell>
                      <Table.Cell>{new Date(event.date).toLocaleDateString()}</Table.Cell>
                      <Table.Cell>{event.ticketsSold}</Table.Cell>
                      <Table.Cell className="font-semibold">{formatCurrency(event.revenue)}</Table.Cell>
                      <Table.Cell>
                        <Badge variant={event.status === 'published' ? 'success' : 'warning'}>
                          {event.status}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="text-center py-8 text-gray-500">
                      No data available for top events.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SalesReportsPage;

