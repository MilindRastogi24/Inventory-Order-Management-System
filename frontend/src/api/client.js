import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

const FRIENDLY_CODE_HINTS = {
  DUPLICATE_SKU: 'Choose a different SKU for this product.',
  DUPLICATE_EMAIL: 'Use a different email address.',
  PRODUCT_IN_USE: 'Remove this product from orders before deleting.',
  CUSTOMER_HAS_ORDERS: 'Customers with orders cannot be deleted.',
  INSUFFICIENT_STOCK: 'Reduce the quantity or restock the product.',
  NOT_FOUND: 'The requested item was not found.',
};

function formatValidationErrors(detail) {
  return detail
    .map((item) => {
      const field = item.loc?.slice(-1)[0];
      const label = field ? `${String(field)}: ` : '';
      return `${label}${item.msg}`;
    })
    .join('; ');
}

export function getErrorMessage(error) {
  if (!error) return 'Something went wrong';

  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your connection and try again.';
    }
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      const base = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
      return `Cannot reach the API server (${base}). Ensure the backend is running on port 8000.`;
    }
    return error.message || 'Something went wrong';
  }

  const data = error.response.data;
  const detail = data?.detail;
  const code = data?.code;

  let message;
  if (typeof detail === 'string') {
    message = detail;
  } else if (Array.isArray(detail)) {
    message = formatValidationErrors(detail);
  } else if (detail && typeof detail === 'object' && detail.message) {
    message = detail.message;
  } else {
    message = error.message || 'Something went wrong';
  }

  const hint = code && FRIENDLY_CODE_HINTS[code];
  if (hint && code !== 'INSUFFICIENT_STOCK') {
    return `${message} ${hint}`;
  }

  return message;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = getErrorMessage(error);
    return Promise.reject(error);
  },
);

export default api;
