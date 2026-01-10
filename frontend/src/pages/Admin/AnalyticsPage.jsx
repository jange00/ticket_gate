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

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['adminStatistics', dateRange],
    queryFn: () => adminApi.getStatistics(),
  });

  const stats = statsData?.data?.data || statsData?.data || {};

  // Prepare chart data
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      name: format(date, 'MMM'),
      revenue: Math.floor(Math.random() * 100000) + 20000, // Mock - replace with real data
    };
  });

  const userGrowthData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      name: format(date, 'MMM'),
      users: Math.floor(Math.random() * 200) + 50, // Mock - replace with real data
    };
  });

  const salesData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      name: format(date, 'MMM'),
      sales: Math.floor(Math.random() * 500) + 100, // Mock - replace with real data
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
      value: stats.totalUsers || 0,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
    },
    {
      label: 'Total Events',
      value: stats.totalEvents || 0,
      icon: FiCalendar,
      color: 'from-purple-500 to-purple-600',
      change: '+8%',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      icon: FiDollarSign,
      color: 'from-green-500 to-green-600',
      change: '+15%',
    },
    {
      label: 'Tickets Sold',
      value: stats.totalTicketsSold || 0,
      icon: FiTag,
      color: 'from-orange-500 to-orange-600',
      change: '+10%',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600 text-lg">System-wide analytics and insights</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
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
              <Card className="p-6">
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
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
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">User Growth</h2>
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
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Ticket Sales</h2>
              <Button variant="ghost" size="sm" onClick={() => handleExport('Sales')}>
                <FiDownload className="w-4 h-4" />
              </Button>
            </div>
            <SalesChart data={salesData} />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;








