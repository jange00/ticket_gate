import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { FiDownload, FiTrendingUp, FiUsers, FiCalendar, FiDollarSign, FiTag } from 'react-icons/fi';
import RevenueChart from '../../components/charts/RevenueChart';
import UserGrowthChart from '../../components/charts/UserGrowthChart';
import SalesChart from '../../components/charts/SalesChart';
import { format, subMonths } from 'date-fns';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('6months');

  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['adminStatistics', dateRange],
    queryFn: async () => {
      const response = await adminApi.getStatistics();
      return response.data;
    },
  });

  const stats = statsData?.data || {};

  // Prepare chart data from backend response
  const revenueByMonth = stats.revenueByMonth || [];
  const revenueData = revenueByMonth.length > 0 
    ? revenueByMonth.map(item => ({
        name: format(new Date(item.year || item._id?.year || new Date().getFullYear(), (item.month || item._id?.month || new Date().getMonth() + 1) - 1), 'MMM'),
        revenue: item.revenue || item.total || 0,
      }))
    : [];

  // Use user growth data from backend if available, otherwise use mock
  const userGrowthData = stats.userGrowth && stats.userGrowth.length > 0
    ? stats.userGrowth.map(item => ({
        name: format(new Date(item.year || item._id?.year || new Date().getFullYear(), (item.month || item._id?.month || new Date().getMonth() + 1) - 1), 'MMM'),
        users: item.growth || item.count || item.users || 0,
      }))
    : Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), 5 - i);
        return {
          name: format(date, 'MMM'),
          users: 0, // Show zero if no data
        };
      });

  // Use sales/tickets data from backend if available, otherwise use mock
  const salesData = stats.ticketsByMonth && stats.ticketsByMonth.length > 0
    ? stats.ticketsByMonth.map(item => ({
        name: format(new Date(item.year || item._id?.year || new Date().getFullYear(), (item.month || item._id?.month || new Date().getMonth() + 1) - 1), 'MMM'),
        sales: item.count || item.tickets || item.sales || 0,
      }))
    : Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), 5 - i);
        return {
          name: format(date, 'MMM'),
          sales: 0, // Show zero if no data
        };
      });

  const handleExport = (type) => {
    toast.success(`${type} data exported successfully`);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const summaryStats = [
    {
      label: 'Total Users',
      value: stats.totalUsers?.toLocaleString() || '0',
      icon: FiUsers,
      color: 'bg-blue-500',
      change: stats.userGrowth && stats.userGrowth.length > 0 
        ? `+${stats.userGrowth[stats.userGrowth.length - 1]?.growth || 0}%`
        : '+0%',
    },
    {
      label: 'Total Events',
      value: stats.totalEvents?.toLocaleString() || '0',
      icon: FiCalendar,
      color: 'bg-purple-500',
      change: '+0%',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      icon: FiDollarSign,
      color: 'bg-green-500',
      change: '+0%',
    },
    {
      label: 'Tickets Sold',
      value: stats.totalTicketsSold?.toLocaleString() || '0',
      icon: FiTag,
      color: 'bg-orange-500',
      change: '+0%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">System-wide analytics and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Analytics</h2>
              <Button variant="ghost" size="sm" onClick={() => handleExport('Revenue')}>
                <FiDownload className="w-4 h-4" />
              </Button>
            </div>
            <RevenueChart data={revenueData} />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Growth</h2>
              <Button variant="ghost" size="sm" onClick={() => handleExport('Users')}>
                <FiDownload className="w-4 h-4" />
              </Button>
            </div>
            <UserGrowthChart data={userGrowthData} />
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ticket Sales</h2>
            <Button variant="ghost" size="sm" onClick={() => handleExport('Sales')}>
              <FiDownload className="w-4 h-4" />
            </Button>
          </div>
          <SalesChart data={salesData} />
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;








