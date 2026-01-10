import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../../api/events.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEye, FiEdit, FiTrash2, FiTrendingUp, FiCalendar, FiTag, FiBarChart2 } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Dropdown from '../../components/ui/Dropdown';

const MyEventsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteEventId, setDeleteEventId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['myEvents', filter, searchQuery],
    queryFn: async () => {
      const response = await eventsApi.getMyEvents({ 
        status: filter !== 'all' ? filter : undefined,
        search: searchQuery || undefined
      });
      console.log('MyEvents API Response:', response);
      return response;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['myEvents']);
      toast.success('Event deleted successfully');
      setDeleteEventId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id) => eventsApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['myEvents']);
      toast.success('Event published successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to publish event');
    },
  });

  // Process events data - handle various response structures
  let events = [];
  if (data) {
    const responseData = data.data; // Axios wraps response in .data
    if (responseData) {
      // Handle { success: true, data: { events: [...] } }
      if (responseData.success && responseData.data) {
        if (Array.isArray(responseData.data)) {
          events = responseData.data;
        } else if (responseData.data.events && Array.isArray(responseData.data.events)) {
          events = responseData.data.events;
        } else if (responseData.data.data && Array.isArray(responseData.data.data)) {
          events = responseData.data.data;
        }
      }
      // Handle { success: true, data: [...] } directly
      else if (responseData.data && Array.isArray(responseData.data)) {
        events = responseData.data;
      }
      // Handle { events: [...] }
      else if (responseData.events && Array.isArray(responseData.events)) {
        events = responseData.events;
      }
      // Handle direct array
      else if (Array.isArray(responseData)) {
        events = responseData;
      }
    }
  }

  // Ensure events is always an array
  if (!Array.isArray(events)) {
    console.warn('Events data is not an array:', events);
    events = [];
  }

  console.log('MyEventsPage - Extracted events:', events.length, events);

  // Filter events by search query
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.venue?.name?.toLowerCase().includes(query)
    );
  });

  const handleDelete = () => {
    if (deleteEventId) {
      deleteMutation.mutate(deleteEventId);
    }
  };

  const handlePublish = (id) => {
    publishMutation.mutate(id);
  };

  const filterOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <p className="text-red-600 mb-4">Error loading events</p>
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
              My Events
            </h1>
            <p className="text-gray-600 text-lg">Manage all your events</p>
          </div>
          <Link to="/events/create">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="primary">
                <div className="flex items-center gap-2">
                  <FiPlus className="w-5 h-5" />
                  Create New Event
                </div>
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
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
        </motion.div>

        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4 text-lg">
                {searchQuery || filter !== 'all'
                  ? 'No events found matching your criteria'
                  : "You don't have any events yet"
                }
              </p>
              {!searchQuery && filter === 'all' && (
                <Link to="/events/create">
                  <Button>Create Your First Event</Button>
                </Link>
              )}
            </Card>
          </motion.div>
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <Table.Header>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Tickets Sold</Table.HeaderCell>
                <Table.HeaderCell>Revenue</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {filteredEvents.map((event, index) => {
                  const ticketsSold = event.ticketsSold || 0;
                  const revenue = event.revenue || 0;
                  
                  return (
                    <Table.Row key={event._id}>
                      <Table.Cell>
                        <div>
                          <p className="font-semibold text-gray-900">{event.title}</p>
                          {event.venue && (
                            <p className="text-sm text-gray-600">{event.venue.name}</p>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4" />
                          {event.startDate && format(new Date(event.startDate), 'MMM dd, yyyy')}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          variant={
                            event.status === 'published' ? 'success' :
                            event.status === 'draft' ? 'default' :
                            event.status === 'cancelled' ? 'danger' : 'default'
                          }
                        >
                          {event.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <FiTag className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{ticketsSold}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <FiTrendingUp className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(revenue)}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <Link to={`/events/${event._id}`}>
                            <Button variant="ghost" size="sm" title="View">
                              <FiEye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={`/events/${event._id}/edit`}>
                            <Button variant="ghost" size="sm" title="Edit">
                              <FiEdit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={`/organizer/analytics/${event._id}`}>
                            <Button variant="ghost" size="sm" title="Analytics">
                              <FiBarChart2 className="w-4 h-4 text-blue-600" />
                            </Button>
                          </Link>
                          {event.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublish(event._id)}
                              title="Publish"
                            >
                              <FiTrendingUp className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteEventId(event._id)}
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        {deleteEventId && (
          <Modal
            isOpen={!!deleteEventId}
            onClose={() => setDeleteEventId(null)}
            title="Delete Event"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteEventId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;



