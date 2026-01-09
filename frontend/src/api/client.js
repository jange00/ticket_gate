import axios from 'axios';

// Use environment variable or fallback to direct backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_BASE_URL,  // ← Points directly to backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor: Add auth token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log request for debugging (remove in production)
  if (import.meta.env.DEV) {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      // Special logging for registration to debug role issue
      ...(config.url === '/auth/register' ? {
        roleInPayload: config.data?.role,
        fullPayload: JSON.stringify(config.data, null, 2),
      } : {}),
    });
  }
  return config;
});

// Response interceptor: Handle errors, token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Enhanced error logging for debugging
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        requestData: error.config?.data,
        responseData: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', {
        message: error.message,
        url: error.config?.url,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
      });
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints (login, register, refresh) to avoid infinite loops
      if (originalRequest.url?.includes('/auth/refresh') || 
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register')) {
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token, logout user
        isRefreshing = false;
        processQueue(new Error('No refresh token available'), null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('sessionToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { data } = response;
        
        if (data.success && data.data) {
          const { accessToken, refreshToken: newRefreshToken, sessionToken } = data.data;

          // Update tokens in storage
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          if (sessionToken) {
            localStorage.setItem('sessionToken', sessionToken);
          }

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Process queued requests with new token
          processQueue(null, accessToken);

          // Retry original request
          return client(originalRequest);
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('sessionToken');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default client;
