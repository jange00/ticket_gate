import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { purchasesApi } from '../../api/purchases.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiTag, FiDollarSign, FiEye, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';

const MyPurchasesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const itemsPerPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['myPurchases', filter, currentPage],
    queryFn: () => purchasesApi.getMyPurchases({ 
      status: filter !== 'all' ? filter : undefined,
      page: currentPage,
      limit: itemsPerPage 
    }),
  });

  // Process purchases data
  let purchases = [];
  let totalPages = 1;
  
  if (data) {
    const responseData = data.data;
    if (responseData) {
      if (responseData.data && Array.isArray(responseData.data)) {
        purchases = responseData.data;
      } else if (Array.isArray(responseData)) {
        purchases = responseData;
      } else if (responseData.purchases && Array.isArray(responseData.purchases)) {
        purchases = responseData.purchases;
      }
      
      if (responseData.pagination) {
        totalPages = responseData.pagination.totalPages || 1;
      }
    }
  }

  if (!Array.isArray(purchases)) {
    purchases = [];
  }

  const filterOptions = [
    { value: 'all', label: 'All Purchases' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <p className="text-red-600 mb-4">Error loading purchases</p>
            <p className="text-gray-600 text-sm">{error.message}</p>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
            My Purchases
          </h1>
          <p className="text-gray-600 text-lg">View all your ticket purchases</p>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="w-48">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-sm text-gray-600">
              {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

        {purchases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiDollarSign className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4 text-lg">
                {filter === 'all' 
                  ? "You don't have any purchases yet" 
                  : `No ${filter} purchases found`
                }
              </p>
              {filter === 'all' && (
                <Link to="/events">
                  <Button>Browse Events</Button>
                </Link>
              )}
            </Card>
          </motion.div>
        ) : (
          <>
            <Card className="overflow-hidden">
              <Table>
                <Table.Header>
                  <Table.HeaderCell>Event</Table.HeaderCell>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell>Tickets</Table.HeaderCell>
                  <Table.HeaderCell>Amount</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                  {purchases.map((purchase, index) => (
                    <Table.Row key={purchase._id}>
                      <Table.Cell>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {purchase.event?.title || 'Event'}
                          </p>
                          {purchase.event?.venue && (
                            <p className="text-sm text-gray-600">{purchase.event.venue.name}</p>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4" />
                          {purchase.createdAt && format(new Date(purchase.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiTag className="w-4 h-4" />
                          {purchase.tickets?.length || 0} ticket{purchase.tickets?.length !== 1 ? 's' : ''}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-semibold text-gray-900">
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
                        <div className="flex items-center gap-2">
                          <Link to={`/tickets/${purchase.tickets?.[0]?._id}`}>
                            <Button variant="ghost" size="sm">
                              <FiEye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Card>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyPurchasesPage;









