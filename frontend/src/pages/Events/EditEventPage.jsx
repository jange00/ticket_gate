import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { eventsApi } from '../../api/events.api';
import { ticketsApi } from '../../api/tickets.api';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import FileUpload from '../../components/forms/FileUpload';
import Loading from '../../components/ui/Loading';
import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiMapPin, 
  FiDollarSign, 
  FiTag, 
  FiImage, 
  FiPlus, 
  FiX,
  FiSave,
  FiEye,
  FiArrowLeft
} from 'react-icons/fi';
import { EVENT_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const eventSchema = Yup.object().shape({
  title: Yup.string()
    .required('Event title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  
  description: Yup.string()
    .required('Event description is required')
    .trim(),
  
  category: Yup.string()
    .required('Category is required')
    .oneOf([
      'Music',
      'Sports',
      'Arts & Culture',
      'Food & Drink',
      'Technology',
      'Business',
      'Education',
      'Health & Wellness',
      'Entertainment',
      'Other'
    ], 'Please select a valid category'),
  
  startDate: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue || originalValue === '') return null;
      const date = originalValue instanceof Date ? originalValue : new Date(originalValue);
      return isNaN(date.getTime()) ? null : date;
    })
    .required('Start date is required')
    .typeError('Please enter a valid start date'),
  
  endDate: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue || originalValue === '') return null;
      const date = originalValue instanceof Date ? originalValue : new Date(originalValue);
      return isNaN(date.getTime()) ? null : date;
    })
    .required('End date is required')
    .typeError('Please enter a valid end date')
    .when('startDate', (startDate, schema) => {
      if (startDate && startDate instanceof Date && !isNaN(startDate.getTime())) {
        return schema.min(startDate, 'End date must be after start date');
      }
      return schema;
    }),
  
  venue: Yup.object().shape({
    name: Yup.string()
      .required('Venue name is required')
      .trim(),
    address: Yup.string()
      .required('Venue address is required')
      .trim(),
    city: Yup.string()
      .required('Venue city is required')
      .trim(),
    coordinates: Yup.object().shape({
      latitude: Yup.number()
        .nullable()
        .transform((value, originalValue) => {
          if (originalValue === '' || originalValue === null || originalValue === undefined) {
            return null;
          }
          const num = Number(originalValue);
          return isNaN(num) ? null : num;
        })
        .typeError('Latitude must be a number'),
      longitude: Yup.number()
        .nullable()
        .transform((value, originalValue) => {
          if (originalValue === '' || originalValue === null || originalValue === undefined) {
            return null;
          }
          const num = Number(originalValue);
          return isNaN(num) ? null : num;
        })
        .typeError('Longitude must be a number')
    }).nullable()
  }),
  
  imageUrl: Yup.string()
    .url('Image URL must be a valid URL')
    .nullable(),
  
  bannerUrl: Yup.string()
    .url('Banner URL must be a valid URL')
    .nullable(),
  
  ticketTypes: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .required('Ticket type name is required')
          .max(100, 'Name cannot exceed 100 characters')
          .trim(),
        description: Yup.string().trim(),
        price: Yup.number()
          .required('Price is required')
          .min(0, 'Price cannot be negative')
          .typeError('Price must be a number'),
        quantityAvailable: Yup.number()
          .required('Quantity is required')
          .min(1, 'Quantity must be at least 1')
          .integer('Quantity must be a whole number')
          .typeError('Quantity must be a number'),
        maxPerPurchase: Yup.number()
          .min(1, 'Max per purchase must be at least 1')
          .integer('Must be a whole number')
          .default(4)
          .typeError('Must be a number')
      })
    )
    .min(1, 'At least one ticket type is required')
    .test('unique-names', 'Ticket type names must be unique', function(ticketTypes) {
      if (!ticketTypes) return true;
      const names = ticketTypes.map(tt => tt.name?.toLowerCase().trim()).filter(Boolean);
      return new Set(names).size === names.length;
    })
});

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedBanner, setUploadedBanner] = useState(null);

  // Fetch event data
  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await eventsApi.getById(id);
      return response;
    },
    enabled: !!id,
  });

  // Fetch ticket types
  const { data: ticketTypesData, isLoading: ticketTypesLoading, error: ticketTypesError } = useQuery({
    queryKey: ['ticketTypes', id],
    queryFn: async () => {
      const response = await ticketsApi.getEventTicketTypes(id);
      return response;
    },
    enabled: !!id,
  });

  const updateEventMutation = useMutation({
    mutationFn: async (data) => {
      // Handle image URLs - convert uploaded files to base64 or use provided URLs
      let imageUrl = data.imageUrl || null;
      let bannerUrl = data.bannerUrl || null;

      // Convert uploaded files to base64 data URLs
      if (uploadedImage instanceof File) {
        try {
          imageUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(uploadedImage);
          });
        } catch (error) {
          console.error('Error converting image to base64:', error);
          toast.error('Failed to process image file');
        }
      }

      if (uploadedBanner instanceof File) {
        try {
          bannerUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(uploadedBanner);
          });
        } catch (error) {
          console.error('Error converting banner to base64:', error);
          toast.error('Failed to process banner file');
        }
      }

      // Prepare ticket types array
      const ticketTypes = (data.ticketTypes || [])
        .filter(tt => tt.name && tt.name.trim() && tt.price && tt.quantityAvailable)
        .map(ticketType => ({
          name: ticketType.name.trim(),
          description: (ticketType.description || '').trim(),
          price: parseFloat(ticketType.price),
          quantityAvailable: parseInt(ticketType.quantityAvailable),
          maxPerPurchase: parseInt(ticketType.maxPerPurchase) || 4,
        }));

      if (ticketTypes.length === 0) {
        throw new Error('At least one valid ticket type is required');
      }

      // Build payload
      const payload = {
        title: data.title?.trim(),
        description: data.description?.trim(),
        category: data.category,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        venue: {
          name: data.venue.name?.trim(),
          address: data.venue.address?.trim(),
          city: data.venue.city?.trim(),
          ...(data.venue.coordinates?.latitude && 
              data.venue.coordinates?.longitude && 
              !isNaN(parseFloat(data.venue.coordinates.latitude)) &&
              !isNaN(parseFloat(data.venue.coordinates.longitude)) && {
            coordinates: {
              latitude: parseFloat(data.venue.coordinates.latitude),
              longitude: parseFloat(data.venue.coordinates.longitude),
            }
          }),
        },
        ...(imageUrl && imageUrl.trim() && { imageUrl: imageUrl.trim() }),
        ...(bannerUrl && bannerUrl.trim() && { bannerUrl: bannerUrl.trim() }),
        ticketTypes: ticketTypes,
      };

      // Update the event
      const eventResponse = await eventsApi.update(id, payload);
      
      // Get the current event status from the response or the original event
      const currentEvent = eventResponse?.data?.data || eventResponse?.data || event;
      const currentStatus = currentEvent?.status || event?.status;

      // If status is PUBLISHED, publish the event
      if (data.status === EVENT_STATUS.PUBLISHED && currentStatus !== 'published' && currentStatus !== 'PUBLISHED') {
        try {
          await eventsApi.publish(id);
        } catch (publishError) {
          console.error('Error publishing event:', publishError);
          toast.error('Event updated but publishing failed. You can publish it later.');
        }
      }

      return eventResponse;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event updated successfully!');
      navigate('/organizer/events');
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update event';
      const errors = error.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach(err => toast.error(err.msg || err.message || errorMessage));
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const categories = [
    'Music',
    'Sports',
    'Arts & Culture',
    'Food & Drink',
    'Technology',
    'Business',
    'Education',
    'Health & Wellness',
    'Entertainment',
    'Other',
  ];

  // Extract event data - handle backend response structure: { success: true, data: { event: {...}, ticketTypes: [...] } }
  let event = null;
  let ticketTypes = [];
  
  if (eventData) {
    const responseData = eventData.data; // Axios wraps response in .data
    if (responseData?.success && responseData?.data) {
      // Backend returns { success: true, data: { event: {...}, ticketTypes: [...] } }
      event = responseData.data.event || responseData.data;
      ticketTypes = responseData.data.ticketTypes || [];
    } else if (responseData?.data) {
      // Fallback: direct data object
      event = responseData.data.event || responseData.data;
      ticketTypes = responseData.data.ticketTypes || [];
    } else if (responseData?._id) {
      // Direct event object
      event = responseData;
    }
  }

  // Extract ticket types from separate API call if not already extracted
  if (ticketTypes.length === 0 && ticketTypesData) {
    const responseData = ticketTypesData.data;
    if (responseData?.success && responseData?.data) {
      ticketTypes = Array.isArray(responseData.data) ? responseData.data : responseData.data.data || [];
    } else if (Array.isArray(responseData?.data)) {
      ticketTypes = responseData.data;
    } else if (Array.isArray(responseData)) {
      ticketTypes = responseData;
    }
  }
  
  // Ensure ticketTypes is always an array
  if (!Array.isArray(ticketTypes)) {
    ticketTypes = [];
  }

  // Debug logging
  if (import.meta.env.DEV) {
    console.log('EditEventPage - Raw eventData:', eventData);
    console.log('EditEventPage - Extracted event:', event);
    console.log('EditEventPage - Extracted ticketTypes:', ticketTypes);
  }

  // Create initial values from event data
  const initialValues = event && (event._id || event.title) ? {
    title: event.title || '',
    description: event.description || '',
    category: event.category || '',
    startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
    endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    venue: {
      name: event.venue?.name || '',
      address: event.venue?.address || '',
      city: event.venue?.city || '',
      coordinates: {
        latitude: event.venue?.coordinates?.latitude || '',
        longitude: event.venue?.coordinates?.longitude || '',
      },
    },
    imageUrl: event.imageUrl || '',
    bannerUrl: event.bannerUrl || '',
    ticketTypes: ticketTypes.length > 0 ? ticketTypes.map(tt => ({
      name: tt.name || '',
      description: tt.description || '',
      price: tt.price || '',
      quantityAvailable: tt.quantityAvailable || tt.quantity || '',
      maxPerPurchase: tt.maxPerPurchase || 4,
    })) : [{
      name: '',
      description: '',
      price: '',
      quantityAvailable: '',
      maxPerPurchase: 4,
    }],
    status: event.status || EVENT_STATUS.DRAFT,
  } : null;

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await updateEventMutation.mutateAsync(values);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (eventLoading || ticketTypesLoading) {
    return <Loading fullScreen />;
  }

  if (eventError || ticketTypesError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Event</h1>
          <p className="text-gray-600 mb-6">
            {eventError?.message || ticketTypesError?.message || 'Failed to load event data'}
          </p>
          <Button onClick={() => navigate('/organizer/events')}>Back to Events</Button>
        </Card>
      </div>
    );
  }

  if (!event || !initialValues) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Button onClick={() => navigate('/organizer/events')}>Back to Events</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
                Edit Event
              </h1>
              <p className="text-gray-600 text-lg">Update your event details</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/organizer/events')}
              className="flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Events
            </Button>
          </div>
        </motion.div>

        <Formik
          initialValues={initialValues}
          validationSchema={eventSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
          key={event?._id || 'new'}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting, submitForm }) => (
            <Form className="space-y-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></span>
                    Basic Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Title *
                      </label>
                      <Field
                        name="title"
                        as={Input}
                        placeholder="Enter event title"
                        error={errors.title && touched.title ? errors.title : null}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <Field
                        name="description"
                        as="textarea"
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
                        placeholder="Describe your event in detail..."
                        error={errors.description && touched.description ? errors.description : null}
                      />
                      {errors.description && touched.description && (
                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <Field
                        name="category"
                        as="select"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </Field>
                      {errors.category && touched.category && (
                        <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Date & Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiCalendar className="w-6 h-6 text-orange-600" />
                    Date & Time
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date & Time *
                      </label>
                      <Field
                        name="startDate"
                        type="datetime-local"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                      />
                      {errors.startDate && touched.startDate && (
                        <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date & Time *
                      </label>
                      <Field
                        name="endDate"
                        type="datetime-local"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                      />
                      {errors.endDate && touched.endDate && (
                        <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Venue Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiMapPin className="w-6 h-6 text-orange-600" />
                    Venue Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue Name *
                      </label>
                      <Field
                        name="venue.name"
                        as={Input}
                        placeholder="e.g., Convention Center"
                        error={errors.venue?.name && touched.venue?.name ? errors.venue.name : null}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <Field
                        name="venue.address"
                        as={Input}
                        placeholder="Street address"
                        error={errors.venue?.address && touched.venue?.address ? errors.venue.address : null}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <Field
                        name="venue.city"
                        as={Input}
                        placeholder="City"
                        error={errors.venue?.city && touched.venue?.city ? errors.venue.city : null}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Latitude (Optional)
                        </label>
                        <Field
                          name="venue.coordinates.latitude"
                          type="number"
                          step="any"
                          as={Input}
                          placeholder="27.7172"
                          error={errors.venue?.coordinates?.latitude && touched.venue?.coordinates?.latitude ? errors.venue.coordinates.latitude : null}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Longitude (Optional)
                        </label>
                        <Field
                          name="venue.coordinates.longitude"
                          type="number"
                          step="any"
                          as={Input}
                          placeholder="85.3240"
                          error={errors.venue?.coordinates?.longitude && touched.venue?.coordinates?.longitude ? errors.venue.coordinates.longitude : null}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Images */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiImage className="w-6 h-6 text-orange-600" />
                    Event Images (Optional)
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL or Upload File
                      </label>
                      <div className="space-y-2">
                        <Field
                          name="imageUrl"
                          type="text"
                          as={Input}
                          placeholder="https://example.com/image.jpg"
                          error={errors.imageUrl && touched.imageUrl ? errors.imageUrl : null}
                        />
                        <FileUpload
                          label="Or upload from device"
                          value={uploadedImage}
                          onChange={(file) => {
                            setUploadedImage(file);
                            if (file) {
                              setFieldValue('imageUrl', '');
                            }
                          }}
                          accept="image/*"
                          maxSize={5 * 1024 * 1024}
                        />
                        {values.imageUrl && (
                          <img src={values.imageUrl} alt="Preview" className="mt-2 max-w-xs rounded-lg" onError={(e) => e.target.style.display = 'none'} />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Banner URL or Upload File
                      </label>
                      <div className="space-y-2">
                        <Field
                          name="bannerUrl"
                          type="text"
                          as={Input}
                          placeholder="https://example.com/banner.jpg"
                          error={errors.bannerUrl && touched.bannerUrl ? errors.bannerUrl : null}
                        />
                        <FileUpload
                          label="Or upload from device"
                          value={uploadedBanner}
                          onChange={(file) => {
                            setUploadedBanner(file);
                            if (file) {
                              setFieldValue('bannerUrl', '');
                            }
                          }}
                          accept="image/*"
                          maxSize={5 * 1024 * 1024}
                        />
                        {values.bannerUrl && (
                          <img src={values.bannerUrl} alt="Banner Preview" className="mt-2 max-w-xs rounded-lg" onError={(e) => e.target.style.display = 'none'} />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Ticket Types */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <FiTag className="w-6 h-6 text-orange-600" />
                      Ticket Types
                    </h2>
                  </div>

                  <FieldArray name="ticketTypes">
                    {({ push, remove }) => (
                      <div className="space-y-4">
                        {values.ticketTypes.map((ticketType, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-900">
                                Ticket Type {index + 1}
                              </h3>
                              {values.ticketTypes.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <FiX className="w-4 h-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Name *
                                </label>
                                <Field
                                  name={`ticketTypes.${index}.name`}
                                  as={Input}
                                  placeholder="e.g., General Admission"
                                  error={
                                    errors.ticketTypes?.[index]?.name &&
                                    touched.ticketTypes?.[index]?.name
                                      ? errors.ticketTypes[index].name
                                      : null
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Price (NPR) *
                                </label>
                                <Field
                                  name={`ticketTypes.${index}.price`}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  as={Input}
                                  placeholder="0.00"
                                  error={
                                    errors.ticketTypes?.[index]?.price &&
                                    touched.ticketTypes?.[index]?.price
                                      ? errors.ticketTypes[index].price
                                      : null
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Quantity Available *
                                </label>
                                <Field
                                  name={`ticketTypes.${index}.quantityAvailable`}
                                  type="number"
                                  min="1"
                                  as={Input}
                                  placeholder="100"
                                  error={
                                    errors.ticketTypes?.[index]?.quantityAvailable &&
                                    touched.ticketTypes?.[index]?.quantityAvailable
                                      ? errors.ticketTypes[index].quantityAvailable
                                      : null
                                  }
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Max Per Purchase (Optional, default 4)
                                </label>
                                <Field
                                  name={`ticketTypes.${index}.maxPerPurchase`}
                                  type="number"
                                  min="1"
                                  as={Input}
                                  placeholder="4"
                                  error={
                                    errors.ticketTypes?.[index]?.maxPerPurchase &&
                                    touched.ticketTypes?.[index]?.maxPerPurchase
                                      ? errors.ticketTypes[index].maxPerPurchase
                                      : null
                                  }
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Description (Optional)
                                </label>
                                <Field
                                  name={`ticketTypes.${index}.description`}
                                  as="textarea"
                                  rows={2}
                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
                                  placeholder="Brief description of this ticket type"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            push({
                              name: '',
                              description: '',
                              price: '',
                              quantityAvailable: '',
                              maxPerPurchase: 4,
                            })
                          }
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <FiPlus className="w-4 h-4" />
                          Add Another Ticket Type
                        </Button>
                      </div>
                    )}
                  </FieldArray>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-end gap-4 pt-6"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/organizer/events')}
                  disabled={updateEventMutation.isPending || isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    await setFieldValue('status', EVENT_STATUS.DRAFT);
                    requestAnimationFrame(() => {
                      submitForm();
                    });
                  }}
                  disabled={updateEventMutation.isPending || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={async () => {
                    await setFieldValue('status', EVENT_STATUS.PUBLISHED);
                    requestAnimationFrame(() => {
                      submitForm();
                    });
                  }}
                  disabled={updateEventMutation.isPending || isSubmitting}
                  className="flex items-center gap-2"
                >
                  {updateEventMutation.isPending || isSubmitting ? (
                    <>
                      <Loading size="sm" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiEye className="w-4 h-4" />
                      Update & Publish
                    </>
                  )}
                </Button>
              </motion.div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditEventPage;
