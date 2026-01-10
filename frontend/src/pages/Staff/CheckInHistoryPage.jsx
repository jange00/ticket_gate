import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkinApi } from '../../api/checkin.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { formatDateTime } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiTag, FiCheckCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import Dropdown from '../../components/ui/Dropdown';

const CheckInHistoryPage = () => {
  const [filter, setFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('');

  // This would need to fetch from an endpoint that returns all check-ins
  // For now, using a placeholder query
  const { data, isLoading, error } = useQuery({
    queryKey: ['checkInHistory', filter, selectedEvent],
    queryFn: async () => {
      // Placeholder - replace with actual API call
      return { data: { data: [] } };
    },
  });

  const checkIns = data?.data?.data || [];

  if (isLoading) {
    return <Loading fullScreen />;
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Check-in History
          </h1>
          <p className="text-gray-600 text-lg">View all check-in records</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-4"
        >
          <div className="w-48">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Check-ins</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </motion.div>

        {checkIns.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4 text-lg">No check-ins found</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <Table.Header>
                <Table.HeaderCell>Time</Table.HeaderCell>
                <Table.HeaderCell>Attendee</Table.HeaderCell>
                <Table.HeaderCell>Event</Table.HeaderCell>
                <Table.HeaderCell>Ticket Type</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {checkIns.map((checkIn) => (
                  <Table.Row key={checkIn._id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCalendar className="w-4 h-4" />
                        {checkIn.checkInTime && format(new Date(checkIn.checkInTime), 'MMM dd, yyyy • h:mm a')}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {checkIn.attendeeName || 'N/A'}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{checkIn.eventName || 'N/A'}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <FiTag className="w-4 h-4 text-gray-400" />
                        {checkIn.ticketType || 'General'}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="success">Checked In</Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckInHistoryPage;










