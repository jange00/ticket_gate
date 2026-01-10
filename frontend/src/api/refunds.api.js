import client from './client.js';

export const refundsApi = {
  request: (data) => client.post('/refunds', data),
  
  getMyRefunds: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return client.get(`/refunds/my-refunds${queryString ? `?${queryString}` : ''}`);
  },
  
  process: (id, data) => client.post(`/refunds/${id}/process`, data),
};










