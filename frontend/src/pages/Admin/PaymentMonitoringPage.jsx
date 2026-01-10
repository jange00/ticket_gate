import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiSearch, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PaymentMonitoringPage = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminPurchases', filter, searchQuery, dateRange],
    queryFn: () => adminApi.getPurchases({ 
      status: filter !== 'all' ? filter : undefined,
      search: searchQuery || undefined,
      dateRange: dateRange !== 'all' ? dateRange : undefined
    }),
  });

  // Process purchases data
  let purchases = [];
  if (data) {
    const responseData = data.data;
    if (responseData) {
      if (responseData.data && Array.isArray(responseData.data)) {
        purchases = responseData.data;
      } else if (Array.isArray(responseData)) {
        purchases = responseData;
      }
    }
  }

  // Filter by search
  const filteredPurchases = purchases.filter(purchase => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      purchase._id?.toLowerCase().includes(query) ||
      purchase.event?.title?.toLowerCase().includes(query) ||
      purchase.attendeeInfo?.email?.toLowerCase().includes(query)
    );
  });

  // Calculate statistics
  const totalRevenue = purchases
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  
  const totalTransactions = purchases.length;
  const successfulTransactions = purchases.filter(p => p.status === 'paid').length;
  const failedTransactions = purchases.filter(p => p.status === 'failed').length;

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: FiDollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Total Transactions',
      value: totalTransactions,
      icon: FiTrendingUp,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Successful',
      value: successfulTransactions,
      icon: FiTrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Failed',
      value: failedTransactions,
      icon: FiTrendingDown,
      color: 'from-red-500 to-red-600',
    },
  ];

  const handleExport = () => {
    toast.success('Payment data exported successfully');
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <Card className="p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-red-600 dark:text-red-400 mb-4">Error loading payments</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{error.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor all payment transactions</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <FiDownload className="w-5 h-5 mr-2" />
          Export
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <FiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, event, customer email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div className="w-48">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </motion.div>

      {filteredPurchases.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiDollarSign className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">No payments found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Table>
              <Table.Header>
                <Table.HeaderCell>Transaction ID</Table.HeaderCell>
                <Table.HeaderCell>Event</Table.HeaderCell>
                <Table.HeaderCell>Customer</Table.HeaderCell>
                <Table.HeaderCell>Amount</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Payment Method</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {filteredPurchases.map((purchase) => (
                  <Table.Row key={purchase._id}>
                    <Table.Cell>
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        #{purchase._id?.slice(-8)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {purchase.event?.title || 'Event'}
                      </p>
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {purchase.attendeeInfo?.firstName} {purchase.attendeeInfo?.lastName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {purchase.attendeeInfo?.email}
                        </p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(purchase.totalAmount || 0)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge 
                        variant={
                          purchase.status === 'paid' ? 'success' :
                          purchase.status === 'pending' ? 'warning' :
                          purchase.status === 'failed' ? 'danger' :
                          purchase.status === 'refunded' ? 'default' : 'default'
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {purchase.createdAt && format(new Date(purchase.createdAt), 'MMM dd, yyyy • h:mm a')}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {purchase.paymentMethod || 'eSewa'}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Card>
        )}
    </div>
  );
};

export default PaymentMonitoringPage;

