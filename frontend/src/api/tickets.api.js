import client from './client.js';

export const ticketsApi = {
  getEventTicketTypes: (eventId) => client.get(`/tickets/event/${eventId}/types`),
  
  getMyTickets: () => client.get('/tickets/my-tickets'),
  
  getById: (id) => client.get(`/tickets/${id}`),
  
  getQRCode: (id) => client.get(`/tickets/${id}/qr`),
  
  createTicketType: (eventId, data) => client.post(`/tickets/event/${eventId}/types`, data),
  
  updateTicketType: (id, data) => client.put(`/tickets/types/${id}`, data),
  
  deleteTicketType: (id) => client.delete(`/tickets/types/${id}`),
};









