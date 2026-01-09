import client from './client.js';

export const checkinApi = {
  checkIn: (data) => client.post('/checkin', data),
  
  getTicketStatus: (ticketId) => client.get(`/checkin/ticket/${ticketId}`),
  
  getEventCheckIns: (eventId) => client.get(`/checkin/event/${eventId}`),
};







