import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../../api/events.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiTrash2, FiCalendar, FiUser, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EventManagementPage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteEventId, setDeleteEventId] = useState(null);

  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['allEvents', filter, searchQuery],
    queryFn: async () => {
      const response = await eventsApi.getAll({ 
        status: filter !== 'all' ? filter : undefined,
        search: searchQuery || undefined,
        limit: 1000, // Fetch a large number of events
        populate: 'organizer' // Request populated organizer data
      });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['allEvents']);
      toast.success('Event deleted successfully');
      setDeleteEventId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    },
  });

  // Extract events - handle various response structures
  let events = [];
  if (eventsData) {
    const responseData = eventsData;
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

  // Debug: Log event structure to understand organizer data
  if (import.meta.env.DEV && events.length > 0) {
    console.log('EventManagementPage - First event structure:', events[0]);
    console.log('EventManagementPage - Organizer data:', events[0]?.organizer);
    console.log('EventManagementPage - OrganizerId:', events[0]?.organizerId);
  }

  // Ensure events is always an array
  if (!Array.isArray(events)) {
    events = [];
  }

  // Helper function to get organizer display name
  const getOrganizerName = (event) => {
    // Check organizerId first (backend returns populated organizer data in organizerId field)
    if (event.organizerId) {
      if (typeof event.organizerId === 'object' && !Array.isArray(event.organizerId) && event.organizerId !== null) {
        // organizerId is a populated object with firstName/lastName
        if (event.organizerId.firstName || event.organizerId.lastName) {
          const name = `${event.organizerId.firstName || ''} ${event.organizerId.lastName || ''}`.trim();
          if (name) return name;
        }
        if (event.organizerId.name) {
          return event.organizerId.name;
        }
        if (event.organizerId.email) {
          return event.organizerId.email;
        }
      }
      // If organizerId is a string (just an ID)
      if (typeof event.organizerId === 'string') {
        return event.organizerId;
      }
    }
    
    // Check organizer field as fallback
    if (event.organizer) {
      if (typeof event.organizer === 'object' && !Array.isArray(event.organizer) && event.organizer !== null) {
        if (event.organizer.firstName || event.organizer.lastName) {
          const name = `${event.organizer.firstName || ''} ${event.organizer.lastName || ''}`.trim();
          if (name) return name;
        }
        if (event.organizer.name) {
          return event.organizer.name;
        }
        if (event.organizer.email) {
          return event.organizer.email;
        }
      }
      if (typeof event.organizer === 'string') {
        return event.organizer;
      }
    }
    
    return 'N/A';
  };

  // Filter by search
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const organizerName = getOrganizerName(event).toLowerCase();
    return (
      event.title?.toLowerCase().includes(query) ||
      organizerName.includes(query) ||
      event.venue?.name?.toLowerCase().includes(query)
    );
  });

  const handleDelete = () => {
    if (deleteEventId) {
      deleteMutation.mutate(deleteEventId);
    }
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
      <Card className="p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-red-600 dark:text-red-400 mb-4">Error loading events</p>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and moderate all events</p>
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
            placeholder="Search events, organizers, venues..."
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

      {filteredEvents.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No events found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Table>
              <Table.Header>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Organizer</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Venue</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {filteredEvents.map((event) => {
                  const eventId = event._id || event.id;
                  return (
                  <Table.Row key={eventId}>
                    <Table.Cell>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{event.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{event.description}</p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getOrganizerName(event)}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiCalendar className="w-4 h-4" />
                        {event.startDate && format(new Date(event.startDate), 'MMM dd, yyyy')}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {event.venue?.name || 'N/A'}
                      </span>
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
                        <Link 
                          to={`/events/${eventId}`}
                          className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                          title="View Event"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteEventId(eventId)}
                          className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
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
              <p className="text-gray-600 dark:text-gray-400">
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
  );
};

export default EventManagementPage;









