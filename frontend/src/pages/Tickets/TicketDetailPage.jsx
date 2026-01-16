import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../../api/tickets.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import { formatDateTime } from '../../utils/formatters';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiDownload } from 'react-icons/fi';

const TicketDetailPage = () => {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getById(id),
  });

  // Handle different response structures
  let ticket = null;
  if (data) {
    const responseData = data.data;
    if (responseData) {
      ticket = responseData.data?.ticket || responseData.ticket || responseData.data || responseData;
      console.log('Ticket Data:', ticket);
      console.log('QR Value:', ticket?.qrCode);
    }
  }

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error || !ticket) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-12 text-center">
          <p className="text-red-600 mb-4">{error ? 'Error loading ticket' : 'Ticket not found'}</p>
          {error && <p className="text-gray-600 text-sm">{error.message}</p>}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Decorative Ticket Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl transform rotate-1 opacity-10"></div>

        <Card className="p-0 overflow-hidden rounded-3xl border-2 border-orange-100 shadow-2xl relative">
          {/* Top Perforation / Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-500 text-xs font-bold uppercase tracking-wider mb-4">
                  Official Ticket
                </span>
                <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">
                  {ticket.event?.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-orange-400" />
                    <span>{formatDateTime(ticket.event?.startDate)}</span>
                  </div>
                  {ticket.event?.venue && (
                    <div className="flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-orange-400" />
                      <span>{ticket.event.venue.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 self-center md:self-start">
                <Badge variant={ticket.status === 'confirmed' ? 'success' : 'default'} size="lg" className="text-sm px-4 py-2">
                  {ticket.status?.toUpperCase()}
                </Badge>
                <p className="text-gray-400 text-xs font-mono">
                  REF: {ticket._id?.slice(-12).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Body with "Perforation" effect */}
          <div className="p-8 md:p-12 bg-white relative">
            {/* Left and Right notches for perforation look */}
            <div className="absolute -left-4 top-0 w-8 h-8 bg-gray-50 rounded-full"></div>
            <div className="absolute -right-4 top-0 w-8 h-8 bg-gray-50 rounded-full"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2">Attendee</p>
                    <p className="font-bold text-lg text-gray-900">
                      {ticket.attendeeId?.firstName} {ticket.attendeeId?.lastName}
                    </p>
                    <p className="text-gray-500">{ticket.attendeeId?.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2">Ticket Type</p>
                    <p className="font-bold text-lg text-gray-900">{ticket.ticketTypeId?.name || ticket.ticketType?.name}</p>
                    <p className="text-orange-600 font-bold">NPR {ticket.ticketTypeId?.price || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2">Order ID</p>
                    <p className="font-mono font-bold text-gray-700">{ticket.purchaseId?.slice(-12).toUpperCase() || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2">Check-in Status</p>
                    <p className="font-bold text-gray-900">
                      {ticket.status === 'checked_in' ? 'Completed' : 'Awaiting Check-in'}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-dashed border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4">Important Instructions</h4>
                  <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
                    <li>Please arrive at least 30 minutes before the event starts.</li>
                    <li>Bring a valid photo ID that matches the attendee name.</li>
                    <li>Show this digital ticket or a printed copy for check-in.</li>
                    <li>Each ticket is valid for one person only.</li>
                  </ul>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-between p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="text-center mb-6">
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">Verify Entrance</p>
                  <p className="text-gray-900 font-bold">Scan QR Code</p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 rotate-0 hover:rotate-2 transition-transform duration-300">
                  {ticket.qrCode ? (
                    <QRCodeSVG
                      value={ticket.qrCode}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-[180px] h-[180px] bg-gray-100 text-center p-4">
                      <p className="text-xs text-red-500 font-bold">QR Code Data Missing</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 text-center">
                  <motion.button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full font-bold text-sm shadow-lg hover:bg-orange-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiDownload /> Print Ticket
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Support Link */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Need help? <Link to="/support" className="text-orange-600 font-bold hover:underline">Contact ticket support</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default TicketDetailPage;

