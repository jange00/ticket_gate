import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { checkinApi } from '../../api/checkin.api';
import { eventsApi } from '../../api/events.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { formatDateTime } from '../../utils/formatters';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUser, FiTag, FiCheckCircle, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { format } from 'date-fns';

const EventCheckInsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  });

  const { data: checkInsData, isLoading: checkInsLoading } = useQuery({
    queryKey: ['eventCheckIns', id],
    queryFn: () => checkinApi.getEventCheckIns(id),
    enabled: !!id,
  });

  const event = eventData?.data?.data || eventData?.data;
  const checkIns = checkInsData?.data?.data || checkInsData?.data || [];

  const stats = [
    {
      label: 'Total Tickets',
      value: event?.totalTickets || 0,
      icon: FiTag,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Checked In',
      value: checkIns.length,
      icon: FiCheckCircle,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Pending',
      value: (event?.totalTickets || 0) - checkIns.length,
      icon: FiCalendar,
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Check-in Rate',
      value: event?.totalTickets ? `${Math.round((checkIns.length / event.totalTickets) * 100)}%` : '0%',
      icon: FiTrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  if (eventLoading || checkInsLoading) {
    return <Loading fullScreen />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">Event not found</p>
            <Button onClick={() => navigate('/staff/dashboard')}>
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
            onClick={() => navigate('/staff/dashboard')}
            className="mb-4"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Event Check-ins
          </h1>
          <p className="text-gray-600 text-lg">{event.title}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
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
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Check-ins Table */}
        <Card className="overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 mb-6 p-6 pb-0">Check-in List</h2>
          {checkIns.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No check-ins yet</p>
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Ticket Type</Table.HeaderCell>
                <Table.HeaderCell>Check-in Time</Table.HeaderCell>
                <Table.HeaderCell>Staff Member</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {checkIns.map((checkIn) => (
                  <Table.Row key={checkIn._id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {checkIn.attendeeName || checkIn.ticket?.attendeeInfo?.firstName || 'N/A'}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <FiTag className="w-4 h-4 text-gray-400" />
                        {checkIn.ticketType || checkIn.ticket?.ticketType?.name || 'General'}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {checkIn.checkInTime && format(new Date(checkIn.checkInTime), 'MMM dd, yyyy • h:mm a')}
                    </Table.Cell>
                    <Table.Cell>{checkIn.staffMember || 'N/A'}</Table.Cell>
                    <Table.Cell>
                      <Badge variant="success">Checked In</Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EventCheckInsPage;








