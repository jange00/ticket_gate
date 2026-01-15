import { authApi } from '../api/auth.api';
import { storageService } from './storage.service';
import { showErrorToast, showSuccessToast } from '../utils/errorHandler';

export const authService = {
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },
  
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },
  
  setTokens: (accessToken, refreshToken, sessionToken = null) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    if (sessionToken) {
      localStorage.setItem('sessionToken', sessionToken);
    }
  },
  
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('user');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
  
  register: async (data) => {
    try {
      // Log registration data for debugging
      if (import.meta.env.DEV) {
        console.log('Registering with data:', {
          ...data,
          password: '***hidden***',
          role: data.role,
        });
      }
      
      const response = await authApi.register(data);
      
      // Log response for debugging
      if (import.meta.env.DEV) {
        console.log('Registration response:', {
          success: response.data.success,
          message: response.data.message,
          user: response.data.data?.user,
          userRole: response.data.data?.user?.role,
        });
      }
      
      if (response.data.success) {
        showSuccessToast(response.data.message || 'Registration successful');
        return response.data;
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      // Enhanced error logging
      if (import.meta.env.DEV) {
        console.error('Registration error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          roleSent: data.role,
        });
      }
      showErrorToast(error);
      throw error;
    }
  },
  
  login: async (data) => {
    try {
      const response = await authApi.login(data);
      
      // Handle MFA required response (can be in success: false or success: true)
      if (response.data.mfaRequired) {
        return {
          success: false,
          mfaRequired: true,
          message: response.data.message || 'Multi-factor authentication required',
        };
      }

      // Handle 2FA required response (Email OTP)
      if (response.data.twoFactorRequired) {
        return response.data;
      }
      
      if (response.data.success) {
        // Only destructure data if it exists
        if (response.data.data) {
          const { accessToken, refreshToken, sessionToken, user } = response.data.data;
          
          // Store tokens
          authService.setTokens(accessToken, refreshToken, sessionToken);
          
          showSuccessToast('Login successful');
          return response.data; // Return full response including user data
        }
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      // Handle MFA required in error response
      if (error.response?.data?.mfaRequired) {
        return {
          success: false,
          mfaRequired: true,
          message: error.response.data.message || 'Multi-factor authentication required',
        };
      }
      showErrorToast(error);
      throw error;
    }
  },

  googleLogin: async (credential) => {
    try {
      const response = await authApi.googleLogin(credential);
      
      if (response.data.success) {
        if (response.data.data) {
          const { accessToken, refreshToken, sessionToken, user } = response.data.data;
          
          // Store tokens
          authService.setTokens(accessToken, refreshToken, sessionToken);
          
          showSuccessToast('Google login successful');
          return response.data;
        }
      }
      throw new Error(response.data.message || 'Google login failed');
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.clearTokens();
    }
  },
  
  getProfile: async () => {
    try {
      const response = await authApi.getProfile();
      return response.data;
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
  
  updateProfile: async (data) => {
    try {
      const response = await authApi.updateProfile(data);
      if (response.data.success) {
        showSuccessToast('Profile updated successfully');
      }
      return response.data;
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
  
  changePassword: async (data) => {
    try {
      const response = await authApi.changePassword(data);
      if (response.data.success) {
        showSuccessToast('Password changed successfully');
      }
      return response.data;
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
  
  forgotPassword: async (data) => {
    try {
      const response = await authApi.forgotPassword(data);
      if (response.data.success) {
        showSuccessToast('Password reset email sent');
      }
      return response.data;
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
  
  resetPassword: async (data) => {
    try {
      const response = await authApi.resetPassword(data);
      if (response.data.success) {
        showSuccessToast('Password reset successful');
      }
      return response.data;
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
  
  verifyEmail: async (data) => {
    try {
      const response = await authApi.verifyEmail(data);
      if (response.data.success) {
        showSuccessToast('Email verified successfully');
      }
      return response.data;
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
  
  setupMFA: async () => {
    try {
      const response = await authApi.setupMFA();
      return response.data;
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
  
  verifyMFA: async (data) => {
    try {
      const response = await authApi.verifyMFA(data);
      if (response.data.success) {
        showSuccessToast('MFA enabled successfully');
      }
      return response.data;
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
  
  disableMFA: async (data) => {
    try {
      const response = await authApi.disableMFA(data);
      if (response.data.success) {
        showSuccessToast('MFA disabled successfully');
      }
      return response.data;
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
  
  resendOTP: async (data) => {
    try {
      const response = await authApi.resendOTP(data);
      if (response.data.success) {
        showSuccessToast(response.data.message || 'OTP resent successfully');
      }
      return response.data;
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
  
  verify2FALogin: async (data) => {
    try {
      const response = await authApi.verify2FALogin(data);
      if (response.data.success) {
        const { accessToken, refreshToken, sessionToken, user } = response.data.data;
        
        // Store tokens
        authService.setTokens(accessToken, refreshToken, sessionToken);
        
        showSuccessToast('Login successful');
        return response.data;
      }
      throw new Error(response.data.message || 'Verification failed');
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },

  toggle2FA: async (data) => {
    try {
      const response = await authApi.toggle2FA(data);
      if (response.data.success) {
        showSuccessToast(response.data.message);
      }
      return response.data;
    } catch (error) {
      showErrorToast(error);
      throw error;
    }
  },
};
