import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { refundsApi } from '../../api/refunds.api';
import { eventsApi } from '../../api/events.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { FiCreditCard, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const RefundManagementPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');

  // Get organizer's events first
  const { data: eventsData } = useQuery({
    queryKey: ['myEvents'],
    queryFn: () => eventsApi.getMyEvents(),
  });

  // Process events data - ensure it's always an array
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

  // Ensure events is always an array
  if (!Array.isArray(events)) {
    events = [];
  }

  const eventIds = events.map(e => e._id || e.id);

  // Get refunds for organizer's events
  const { data, isLoading, error } = useQuery({
    queryKey: ['organizerRefunds', filter],
    queryFn: () => refundsApi.getMyRefunds({
      status: filter !== 'all' ? filter : undefined
    }),
  });

  const processMutation = useMutation({
    mutationFn: ({ id, action, rejectionReason }) => {
      const data = { action };
      if (action === 'reject' && rejectionReason) {
        data.rejectionReason = rejectionReason;
      }
      return refundsApi.process(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['organizerRefunds']);
      queryClient.invalidateQueries(['myEvents']);
      toast.success(`Refund ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSelectedRefund(null);
      setActionType(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    },
  });

  // Process refunds data - filter by organizer's events
  let allRefunds = [];
  if (data) {
    const responseData = data.data;
    if (responseData) {
      if (responseData.data && Array.isArray(responseData.data)) {
        allRefunds = responseData.data;
      } else if (Array.isArray(responseData)) {
        allRefunds = responseData;
      } else if (responseData.refunds && Array.isArray(responseData.refunds)) {
        allRefunds = responseData.refunds;
      }
    }
  }

  // Filter refunds to only show those for organizer's events
  // If events haven't loaded yet or eventIds is empty, show all refunds (they'll be filtered once events load)
  let refunds = eventIds.length > 0
    ? allRefunds.filter(refund => {
      const eventId = refund.event?._id || refund.purchase?.event?._id || refund.eventId;
      return eventId && eventIds.includes(eventId);
    })
    : [];

  // Filter by selected event
  if (selectedEvent !== 'all') {
    refunds = refunds.filter(refund => {
      const eventId = refund.event?._id || refund.purchase?.event?._id || refund.eventId;
      return eventId === selectedEvent;
    });
  }

  // Filter by status
  if (filter !== 'all') {
    refunds = refunds.filter(refund => refund.status === filter);
  }

  // Calculate statistics
  const stats = {
    total: refunds.length,
    pending: refunds.filter(r => r.status === 'pending').length,
    approved: refunds.filter(r => r.status === 'approved').length,
    rejected: refunds.filter(r => r.status === 'rejected').length,
    totalAmount: refunds.reduce((sum, r) => sum + (r.amount || 0), 0),
    pendingAmount: refunds.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.amount || 0), 0),
  };

  const handleProcess = () => {
    if (selectedRefund && actionType) {
      if (actionType === 'reject' && !rejectionReason.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      processMutation.mutate({
        id: selectedRefund._id,
        action: actionType,
        rejectionReason: rejectionReason.trim(),
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
            Refund Management
          </h1>
          <p className="text-gray-600 text-lg">Review and manage refund requests for your events</p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiCreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FiClock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiCreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendingAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FiCreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            <div className="w-48">
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="all">All Events</option>
                {events.map(event => (
                  <option key={event._id || event.id} value={event._id || event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
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
              Showing {refunds.length} refund{refunds.length !== 1 ? 's' : ''}
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
                <FiCreditCard className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4 text-lg">No refund requests found</p>
            </Card>
          </motion.div>
        ) : (
          <Card className="overflow-hidden">
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
                {refunds.map((refund) => (
                  <Table.Row key={refund._id}>
                    <Table.Cell>
                      <span className="font-mono text-sm text-gray-600">
                        #{refund._id?.slice(-8)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <p className="font-semibold text-gray-900">
                        {refund.event?.title || refund.purchase?.event?.title || 'Event'}
                      </p>
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {refund.purchase?.attendeeInfo?.firstName || 'N/A'} {refund.purchase?.attendeeInfo?.lastName || ''}
                        </p>
                        {refund.purchase?.attendeeInfo?.email && (
                          <p className="text-sm text-gray-500">{refund.purchase.attendeeInfo.email}</p>
                        )}
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
              setRejectionReason('');
            }}
            title={actionType === 'approve' ? 'Approve Refund Request' : 'Reject Refund Request'}
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                {actionType === 'approve'
                  ? 'Are you sure you want to approve this refund request? The refund will be processed.'
                  : 'Are you sure you want to reject this refund request? Please provide a reason.'}
              </p>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Event</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedRefund.event?.title || selectedRefund.purchase?.event?.title || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Customer</p>
                  <p className="text-sm text-gray-900">
                    {selectedRefund.purchase?.attendeeInfo?.firstName || 'N/A'} {selectedRefund.purchase?.attendeeInfo?.lastName || ''}
                  </p>
                  {selectedRefund.purchase?.attendeeInfo?.email && (
                    <p className="text-xs text-gray-500">{selectedRefund.purchase.attendeeInfo.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Refund Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(selectedRefund.amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Customer Reason</p>
                  <p className="text-sm text-gray-700">{selectedRefund.reason || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Request Date</p>
                  <p className="text-sm text-gray-700">
                    {selectedRefund.createdAt && format(new Date(selectedRefund.createdAt), 'MMM dd, yyyy • h:mm a')}
                  </p>
                </div>
              </div>

              {actionType === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
                    placeholder="Please provide a reason for rejecting this refund request..."
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRefund(null);
                    setActionType(null);
                    setRejectionReason('');
                  }}
                  disabled={processMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'approve' ? 'primary' : 'danger'}
                  onClick={handleProcess}
                  loading={processMutation.isPending}
                  disabled={actionType === 'reject' && !rejectionReason.trim()}
                >
                  {actionType === 'approve' ? 'Approve Refund' : 'Reject Refund'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default RefundManagementPage;



