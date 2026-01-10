import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { refundsApi } from '../../api/refunds.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Table from '../../components/ui/Table';

const RefundsPage = () => {
  const [filter, setFilter] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['myRefunds', filter],
    queryFn: () => refundsApi.getMyRefunds({ 
      status: filter !== 'all' ? filter : undefined 
    }),
  });

  // Process refunds data
  let refunds = [];
  if (data) {
    const responseData = data.data;
    if (responseData) {
      if (responseData.data && Array.isArray(responseData.data)) {
        refunds = responseData.data;
      } else if (Array.isArray(responseData)) {
        refunds = responseData;
      } else if (responseData.refunds && Array.isArray(responseData.refunds)) {
        refunds = responseData.refunds;
      }
    }
  }

  if (!Array.isArray(refunds)) {
    refunds = [];
  }

  const filterOptions = [
    { value: 'all', label: 'All Refunds' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'processed', label: 'Processed' },
  ];

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <p className="text-red-600 mb-4">Error loading refunds</p>
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
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
              Refunds
            </h1>
            <p className="text-gray-600 text-lg">Manage your refund requests</p>
          </div>
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
                onChange={(e) => setFilter(e.target.value)}
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
              {refunds.length} refund{refunds.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

        {refunds.length === 0 ? (
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
                  ? "You don't have any refund requests yet" 
                  : `No ${filter} refunds found`
                }
              </p>
            </Card>
          </motion.div>
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <Table.Header>
                <Table.HeaderCell>Request ID</Table.HeaderCell>
                <Table.HeaderCell>Event</Table.HeaderCell>
                <Table.HeaderCell>Amount</Table.HeaderCell>
                <Table.HeaderCell>Reason</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {refunds.map((refund, index) => (
                  <Table.Row key={refund._id}>
                    <Table.Cell>
                      <span className="font-mono text-sm text-gray-600">
                        #{refund._id?.slice(-8)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {refund.event?.title || refund.purchase?.event?.title || 'Event'}
                        </p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(refund.amount || 0)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {refund.reason || 'N/A'}
                      </p>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge 
                        variant={
                          refund.status === 'approved' ? 'success' :
                          refund.status === 'rejected' ? 'danger' :
                          refund.status === 'processed' ? 'default' :
                          'warning'
                        }
                      >
                        {refund.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiClock className="w-4 h-4" />
                        {refund.createdAt && format(new Date(refund.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRefund(refund)}
                      >
                        View Details
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Card>
        )}

        {/* Refund Details Modal */}
        {selectedRefund && (
          <Modal
            isOpen={!!selectedRefund}
            onClose={() => setSelectedRefund(null)}
            title="Refund Details"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Request ID</label>
                <p className="text-gray-900 font-mono">{selectedRefund._id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Event</label>
                <p className="text-gray-900">
                  {selectedRefund.event?.title || selectedRefund.purchase?.event?.title || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <p className="text-gray-900 font-semibold text-lg">
                  {formatCurrency(selectedRefund.amount || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Reason</label>
                <p className="text-gray-900">{selectedRefund.reason || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge 
                    variant={
                      selectedRefund.status === 'approved' ? 'success' :
                      selectedRefund.status === 'rejected' ? 'danger' :
                      selectedRefund.status === 'processed' ? 'default' :
                      'warning'
                    }
                  >
                    {selectedRefund.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Requested Date</label>
                <p className="text-gray-900">
                  {selectedRefund.createdAt && formatDateTime(selectedRefund.createdAt)}
                </p>
              </div>
              {selectedRefund.processedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Processed Date</label>
                  <p className="text-gray-900">
                    {formatDateTime(selectedRefund.processedAt)}
                  </p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default RefundsPage;








