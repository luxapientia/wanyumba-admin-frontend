import axios from 'axios';

// API base URL - can be configured via environment variable
// IMPORTANT: All API calls go through the API Gateway (Traefik)
// Default to Traefik gateway URL (port 80)
// Traefik routes /api/v1/admin/* to admin service (port 3005)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api/v1';

// Wanyumba frontend URL for redirecting unauthorized users
const WANYUMBA_FRONTEND_URL = import.meta.env.VITE_WANYUMBA_FRONTEND_URL || 'http://localhost:8080';
const LOGIN_PATH = '/auth';

/**
 * Redirect to wanyumba-frontend login page
 */
const redirectToLogin = () => {
  const loginUrl = `${WANYUMBA_FRONTEND_URL}${LOGIN_PATH}`;
  // Use window.location.href for full page redirect (clears React state)
  window.location.href = loginUrl;
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: true, // REQUIRED: Send cookies in cross-origin requests
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Priority: Cookies (httpOnly) > localStorage token (fallback)
    // Cookies are automatically sent with withCredentials: true
    // Only add Authorization header if no cookie is available (backward compatibility)
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      // Redirect to wanyumba-frontend login page
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export default apiClient;

