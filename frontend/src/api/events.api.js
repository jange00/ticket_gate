import client from './client.js';

export const eventsApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return client.get(`/events${queryString ? `?${queryString}` : ''}`);
  },
  
  getMyEvents: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return client.get(`/events/my-events${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => client.get(`/events/${id}`),
  
  create: (data) => client.post('/events', data),
  
  update: (id, data) => client.put(`/events/${id}`, data),
  
  delete: (id) => client.delete(`/events/${id}`),
  
  publish: (id) => client.post(`/events/${id}/publish`),
};









