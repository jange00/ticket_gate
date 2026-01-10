import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../../api/tickets.api';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import { formatDateTime } from '../../utils/formatters';
import { QRCodeSVG } from 'qrcode.react';

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
      ticket = responseData.data || responseData;
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.event?.title}</h1>
            <Badge variant={ticket.status === 'confirmed' ? 'success' : 'default'}>
              {ticket.status}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ticket Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Ticket Type</p>
                <p className="font-medium text-gray-900">{ticket.ticketType?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Event Date</p>
                <p className="font-medium text-gray-900">{formatDateTime(ticket.event?.startDate)}</p>
              </div>
              {ticket.event?.venue && (
                <div>
                  <p className="text-sm text-gray-500">Venue</p>
                  <p className="font-medium text-gray-900">{ticket.event.venue.name}</p>
                  <p className="text-sm text-gray-600">{ticket.event.venue.address}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Code</h2>
            {ticket.qrCode && (
              <QRCodeSVG value={ticket.qrCode} size={200} />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TicketDetailPage;

