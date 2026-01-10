import toast from 'react-hot-toast';

export const handleApiError = (error) => {
  if (!error.response) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return {
        message: data.message || 'Invalid request. Please check your input.',
        code: 'BAD_REQUEST',
        errors: data.errors,
      };
    case 401:
      // Use backend message if available (e.g., invalid credentials)
      return {
        message: data.message || 'Unauthorized. Please login again.',
        code: 'UNAUTHORIZED',
      };
    case 403:
      // Use backend message if available (e.g., account locked)
      return {
        message: data.message || 'Access denied. You do not have permission.',
        code: 'FORBIDDEN',
        isAccountLocked: data.message?.toLowerCase().includes('locked') || false,
      };
    case 404:
      return {
        message: 'Resource not found.',
        code: 'NOT_FOUND',
      };
    case 429:
      const retryAfter = error.response.headers['retry-after'];
      // Use backend message if available, otherwise construct message with retry-after
      const rateLimitMessage = data.message || `Too many requests. Please wait ${retryAfter || 'a few'} seconds.`;
      return {
        message: rateLimitMessage,
        code: 'RATE_LIMIT',
        retryAfter: retryAfter ? parseInt(retryAfter) : null,
      };
    case 500:
      return {
        message: 'Server error. Please try again later.',
        code: 'SERVER_ERROR',
      };
    default:
      return {
        message: data.message || 'An unexpected error occurred.',
        code: 'UNKNOWN_ERROR',
      };
  }
};

export const showErrorToast = (error) => {
  const errorInfo = handleApiError(error);
  toast.error(errorInfo.message);
  return errorInfo;
};

export const showSuccessToast = (message) => {
  toast.success(message);
};

export const showWarningToast = (message) => {
  toast(message, { icon: '⚠️' });
};










