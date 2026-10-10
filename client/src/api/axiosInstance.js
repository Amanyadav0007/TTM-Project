import axios from 'axios';

// ---------------------------------------------------------------------------
// Centralized Axios instance
// - Base URL comes from the Vite env variable VITE_API_BASE_URL
// - Auth header is injected automatically from localStorage on every request
// - On 401 responses the instance attempts a silent token refresh once;
//   if that also fails it clears storage and redirects to /login
// ---------------------------------------------------------------------------

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL,
});

// ── Request interceptor: attach the current access token ──────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: silent refresh on 401 ───────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401s that haven't already been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue subsequent requests while a refresh is in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const { refreshToken } = userInfo;

        if (!refreshToken) throw new Error('No refresh token');

        // Call the refresh endpoint directly (no interceptor loop)
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken }
        );

        // Persist updated tokens
        const updated = { ...userInfo, token: data.token, refreshToken: data.refreshToken };
        localStorage.setItem('userInfo', JSON.stringify(updated));

        processQueue(null, data.token);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear session and redirect to login
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
