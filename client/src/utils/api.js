import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (!envUrl) return 'http://localhost:5000/api';

  // If it already ends with /api, return it
  if (envUrl.endsWith('/api')) return envUrl;
  // If it ends with /api/, remove the trailing slash
  if (envUrl.endsWith('/api/')) return envUrl.slice(0, -1);

  // Otherwise, add /api
  return `${envUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || 'Something went wrong';

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      return Promise.reject(error);
    }
  }
);

export default api;