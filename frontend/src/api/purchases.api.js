import client from './client.js';

export const purchasesApi = {
  // Create purchase and get payment URL (eSewa integration)
  create: (data) => client.post('/purchases', data),
  
  createPurchase: async (purchaseData) => {
    const response = await client.post('/purchases', purchaseData);
    return response.data;
  },

  // Get purchase by transaction ID (for eSewa payment verification)
  getPurchaseByTransactionId: async (transactionId) => {
    const response = await client.get(`/purchases/transaction/${transactionId}`);
    return response.data;
  },

  // Get purchase by ID
  getById: (id) => client.get(`/purchases/${id}`),
  
  getPurchaseById: async (purchaseId) => {
    const response = await client.get(`/purchases/${purchaseId}`);
    return response.data;
  },

  // Get tickets for a purchase
  getPurchaseTickets: async (purchaseId) => {
    const response = await client.get(`/purchases/${purchaseId}/tickets`);
    return response.data;
  },
  
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
};







