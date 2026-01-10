import client from './client.js';

export const organizerApi = {
  getStatistics: () => client.get('/organizer/statistics'),
  
  getEventAnalytics: (eventId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return client.get(`/organizer/events/${eventId}/analytics${queryString ? `?${queryString}` : ''}`);
  },
};






