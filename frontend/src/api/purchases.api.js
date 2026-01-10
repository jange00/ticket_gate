import client from './client.js';

export const purchasesApi = {
  getMyPurchases: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return client.get(`/purchases/my-purchases${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => client.get(`/purchases/${id}`),
  
  getByTransactionId: (transactionId) => client.get(`/purchases/transaction/${transactionId}`),
  
  getStatus: (transactionId) => client.get(`/purchases/status/${transactionId}`),
  
  getTickets: (id) => client.get(`/purchases/${id}/tickets`),
  
  create: (data) => client.post('/purchases', data),
};
