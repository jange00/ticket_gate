import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkinApi } from '../../api/checkin.api';
import { eventsApi } from '../../api/events.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { formatDateTime } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiCamera, FiTag, FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Dropdown from '../../components/ui/Dropdown';

const CheckInPage = () => {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  // Fetch events for dropdown
  const { data: eventsData } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getAll({ status: 'published' }),
  });

  let events = [];
  if (eventsData) {
    const responseData = eventsData.data;
    if (responseData) {
      if (responseData.data && Array.isArray(responseData.data)) {
        events = responseData.data;
      } else if (Array.isArray(responseData)) {
        events = responseData;
      }
    }
  }

  const eventOptions = events.map(event => ({
    value: event._id,
    label: event.title,
  }));

  const checkInMutation = useMutation({
    mutationFn: (data) => checkinApi.checkIn(data),
    onSuccess: (response) => {
      const result = response.data?.data || response.data;
      setCheckInResult(result);
      setTicketId('');
      
      // Add to recent check-ins
      setRecentCheckIns(prev => [result, ...prev].slice(0, 10));
      
      queryClient.invalidateQueries(['checkIns']);
      toast.success('Check-in successful!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Check-in failed';
      setCheckInResult({ 
        success: false, 
        message,
        alreadyCheckedIn: message.includes('already') || message.includes('checked')
      });
      toast.error(message);
    },
  });

  const handleCheckIn = () => {
    if (!ticketId.trim()) {
      toast.error('Please enter a ticket ID');
      return;
    }

    checkInMutation.mutate({
      ticketId: ticketId.trim(),
      eventId: selectedEvent || undefined,
    });
  };

  const handleQRScan = (qrData) => {
    setTicketId(qrData);
    handleCheckIn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Check-In Interface
          </h1>
          <p className="text-gray-600 text-lg">Scan QR codes or enter ticket IDs to check in attendees</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Check-in Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Event Selector */}
            <Card className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event (Optional)
              </label>
              <Dropdown
                options={[{ value: '', label: 'All Events' }, ...eventOptions]}
                value={selectedEvent}
                onChange={setSelectedEvent}
              />
            </Card>

            {/* QR Scanner Area */}
            <Card className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiCamera className="w-6 h-6 text-blue-600" />
                QR Code Scanner
              </h2>
              
              <div className="bg-gray-900 rounded-lg p-8 mb-6 relative overflow-hidden">
                <div className="aspect-square max-w-md mx-auto relative">
                  {/* Scanner Frame */}
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                  </div>
                  
                  {/* Camera placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <FiCamera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-sm">Camera view will appear here</p>
                      <p className="text-gray-500 text-xs mt-2">Position QR code within frame</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual Entry */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiTag className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCheckIn()}
                    placeholder="Or enter ticket ID manually"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <Button
                  onClick={handleCheckIn}
                  loading={checkInMutation.isPending}
                  className="w-full"
                  variant="primary"
                >
                  Check In
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Recent Check-ins Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Check-ins</h2>
              {recentCheckIns.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No recent check-ins</p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {recentCheckIns.map((checkIn, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                        <p className="font-semibold text-gray-900 text-sm">
                          {checkIn.attendeeName || 'Attendee'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        {checkIn.eventName || 'Event'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(), 'h:mm a')}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Check-in Result Modal */}
        <AnimatePresence>
          {checkInResult && (
            <Modal
              isOpen={!!checkInResult}
              onClose={() => setCheckInResult(null)}
              title={checkInResult.success ? 'Check-in Successful' : checkInResult.alreadyCheckedIn ? 'Already Checked In' : 'Check-in Failed'}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                {checkInResult.success ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <FiCheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-900">
                        {checkInResult.attendeeName || 'Attendee'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {checkInResult.eventName || 'Event'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Ticket: {checkInResult.ticketType || 'General'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(), 'MMM dd, yyyy • h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCheckInResult(null)}
                        className="flex-1"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          setCheckInResult(null);
                          setTicketId('');
                        }}
                        className="flex-1"
                      >
                        Next Check-in
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                      checkInResult.alreadyCheckedIn ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {checkInResult.alreadyCheckedIn ? (
                        <FiXCircle className="w-10 h-10 text-yellow-600" />
                      ) : (
                        <FiXCircle className="w-10 h-10 text-red-600" />
                      )}
                    </div>
                    <p className="text-gray-600">{checkInResult.message}</p>
                    <Button
                      onClick={() => setCheckInResult(null)}
                      className="w-full"
                    >
                      Close
                    </Button>
                  </>
                )}
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CheckInPage;




