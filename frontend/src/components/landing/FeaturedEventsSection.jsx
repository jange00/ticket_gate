import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '../../api/events.api';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { FiArrowRight, FiCalendar, FiMapPin } from 'react-icons/fi';
import { formatDateTime } from '../../utils/formatters';

const FeaturedEventsSection = () => {
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => eventsApi.getAll({ limit: 6, status: 'published' }),
  });

  // Handle different response structures
  const now = new Date();
  let featuredEvents = [];
  if (eventsData) {
    const responseData = eventsData.data; // Axios wraps response in .data
    if (responseData) {
      let allEvents = [];
      // Handle { success: true, data: { events: [...] } }
      if (responseData.success && responseData.data) {
        if (Array.isArray(responseData.data)) {
          allEvents = responseData.data;
        } else if (responseData.data.events && Array.isArray(responseData.data.events)) {
          allEvents = responseData.data.events;
        } else if (responseData.data.data && Array.isArray(responseData.data.data)) {
          allEvents = responseData.data.data;
        }
      }
      // Handle { success: true, data: [...] } directly
      else if (responseData.data && Array.isArray(responseData.data)) {
        allEvents = responseData.data;
      }
      // Handle { events: [...] }
      else if (responseData.events && Array.isArray(responseData.events)) {
        allEvents = responseData.events;
      }
      // Handle direct array
      else if (Array.isArray(responseData)) {
        allEvents = responseData;
      }
      
      // Filter: published status AND end date not in the past
      featuredEvents = allEvents
        .filter(e => {
          const isPublished = e.status === 'published' || e.status === 'PUBLISHED';
          const isNotPast = e.endDate ? new Date(e.endDate) >= now : true;
          return isPublished && isNotPast;
        })
        .slice(0, 6);
    }
  }

  if (!Array.isArray(featuredEvents)) {
    featuredEvents = [];
  }

  if (featuredEvents.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-gray-600">
              Discover exciting events happening near you
            </p>
          </div>
          <Link to="/events">
            <Button variant="outline" className="group">
              View All
              <FiArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-gray-200" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event, index) => (
              <motion.div
                key={event._id || index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -8 }}
              >
                <Link to={`/events/${event._id}`}>
                  <Card hover className="h-full overflow-hidden group">
                    {event.imageUrl && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                      </motion.div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 line-clamp-1 group-hover:text-slate-700 transition-colors">
                          {event.title}
                        </h3>
                        <Badge variant={event.status === 'published' ? 'success' : 'default'}>
                          {event.status}
                        </Badge>
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
                            <span>{event.venue.name}, {event.venue.city}</span>
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
    </section>
  );
};

export default FeaturedEventsSection;





