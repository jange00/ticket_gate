import client from './client.js';

export const adminApi = {
  getUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return client.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  
  getUserById: (id) => client.get(`/admin/users/${id}`),
  
  updateUser: (id, data) => client.put(`/admin/users/${id}`, data),
  
  getActivityLogs: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return client.get(`/admin/activity-logs${queryString ? `?${queryString}` : ''}`);
  },
  
  getStatistics: () => client.get('/admin/statistics'),
  
  getRefunds: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return client.get(`/admin/refunds${queryString ? `?${queryString}` : ''}`);
  },
  
  getPurchases: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return client.get(`/admin/purchases${queryString ? `?${queryString}` : ''}`);
  },
};



