import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { refundsApi } from '../../api/refunds.api';
import { adminApi } from '../../api/admin.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCheckCircle, FiXCircle, FiClock, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const RefundManagementPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [actionType, setActionType] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminRefunds', filter, searchQuery],
    queryFn: () => adminApi.getRefunds({ 
      status: filter !== 'all' ? filter : undefined,
      search: searchQuery || undefined
    }),
  });

  const processMutation = useMutation({
    mutationFn: ({ id, action }) => refundsApi.process(id, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminRefunds']);
      toast.success(`Refund ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSelectedRefund(null);
      setActionType(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    },
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
      }
    }
  }

  // Filter by search
  const filteredRefunds = refunds.filter(refund => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      refund._id?.toLowerCase().includes(query) ||
      refund.event?.title?.toLowerCase().includes(query) ||
      refund.purchase?.attendeeInfo?.firstName?.toLowerCase().includes(query) ||
      refund.purchase?.attendeeInfo?.lastName?.toLowerCase().includes(query)
    );
  });

  const handleProcess = () => {
    if (selectedRefund && actionType) {
      processMutation.mutate({
        id: selectedRefund._id,
        action: actionType,
      });
    }
  };

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
      <Card className="p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-red-600 dark:text-red-400 mb-4">Error loading refunds</p>
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
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Refund Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage all refund requests across the platform</p>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <FiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, event, customer..."
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
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {filteredRefunds.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiDollarSign className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">No refund requests found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Table>
              <Table.Header>
                <Table.HeaderCell>Request ID</Table.HeaderCell>
                <Table.HeaderCell>Event</Table.HeaderCell>
                <Table.HeaderCell>Customer</Table.HeaderCell>
                <Table.HeaderCell>Amount</Table.HeaderCell>
                <Table.HeaderCell>Reason</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {filteredRefunds.map((refund) => (
                  <Table.Row key={refund._id}>
                    <Table.Cell>
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        #{refund._id?.slice(-8)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {refund.event?.title || refund.purchase?.event?.title || 'Event'}
                      </p>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-gray-900 dark:text-white">
                        {refund.purchase?.attendeeInfo?.firstName} {refund.purchase?.attendeeInfo?.lastName}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(refund.amount || 0)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
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
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiClock className="w-4 h-4" />
                        {refund.createdAt && format(new Date(refund.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {refund.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRefund(refund);
                              setActionType('approve');
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRefund(refund);
                              setActionType('reject');
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Card>
        )}

        {/* Action Confirmation Modal */}
        {selectedRefund && actionType && (
          <Modal
            isOpen={!!selectedRefund}
            onClose={() => {
              setSelectedRefund(null);
              setActionType(null);
            }}
            title={actionType === 'approve' ? 'Approve Refund' : 'Reject Refund'}
          >
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to {actionType} this refund request?
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Event: {selectedRefund.event?.title || 'N/A'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount: {formatCurrency(selectedRefund.amount || 0)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reason: {selectedRefund.reason || 'N/A'}</p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRefund(null);
                    setActionType(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'approve' ? 'primary' : 'danger'}
                  onClick={handleProcess}
                  loading={processMutation.isPending}
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
    </div>
  );
};

export default RefundManagementPage;

