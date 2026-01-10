import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../../api/events.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiSearch, FiTag } from 'react-icons/fi';
import { formatDateTime } from '../../utils/formatters';

const EventListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['events', 'list', categoryFilter],
    queryFn: () => eventsApi.getAll({ status: 'published', category: categoryFilter !== 'all' ? categoryFilter : undefined }),
  });

  // Extract events - handle various response structures (same pattern as FeaturedEventsSection)
  let events = [];
  if (eventsData) {
    const responseData = eventsData.data; // Axios wraps response in .data
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

  // Filter to only published events
  events = events.filter(e => e.status === 'published' || e.status === 'PUBLISHED');

  // Ensure events is always an array
  if (!Array.isArray(events)) {
    events = [];
  }

  // Debug logging
  if (import.meta.env.DEV) {
    console.log('EventListPage - Raw eventsData:', eventsData);
    console.log('EventListPage - Extracted events:', events.length, events);
  }

  // Filter by search query
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.venue?.name?.toLowerCase().includes(query) ||
      event.venue?.city?.toLowerCase().includes(query)
    );
  });

  const categories = [
    'all', 'Music', 'Sports', 'Arts & Culture', 'Food & Drink', 
    'Technology', 'Business', 'Education', 'Health & Wellness', 
    'Entertainment', 'Other'
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
            Discover Events
          </h1>
          <p className="text-gray-600 text-lg">Find exciting events happening near you</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Events Grid */}
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
                {searchQuery || categoryFilter !== 'all'
                  ? 'No events found matching your criteria'
                  : 'No events available at the moment'
                }
              </p>
            </Card>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -8 }}
              >
                <Link to={`/events/${event._id}`}>
                  <Card hover className="h-full overflow-hidden group">
                    {event.bannerUrl || event.imageUrl ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <img
                          src={event.bannerUrl || event.imageUrl}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                      </motion.div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <FiCalendar className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors flex-1">
                          {event.title}
                        </h3>
                        {event.category && (
                          <Badge variant="outline" className="ml-2 flex-shrink-0">
                            {event.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4" />
                          <span>{formatDateTime(event.startDate)}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <FiMapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{event.venue.name}, {event.venue.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventListPage;
