/**
 * Utility function to clear all authentication-related localStorage items
 */
export const clearAuthStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('user');
  console.log('Authentication storage cleared');
};

/**
 * Utility function to clear all localStorage
 */
export const clearAllStorage = () => {
  localStorage.clear();
  console.log('All localStorage cleared');
};

// Make it available globally for easy access in browser console
if (typeof window !== 'undefined') {
  window.clearAuthStorage = clearAuthStorage;
  window.clearAllStorage = clearAllStorage;
}







