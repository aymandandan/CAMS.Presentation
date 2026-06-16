import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/application/stores/useAuthStore";
import { Result } from "@/domain/shared/Result";
import { AuthenticationResult } from "@/domain/auth/AuthenticationResult";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true, // needed to send cookies automatically
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v));
        } else if (value != null) {
          searchParams.append(key, value as string);
        }
      });
      return searchParams.toString();
    },
  },
});

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

let refreshSubscribers: ((token: string) => void)[] = [];
let isRefreshingFlag = false;

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// Attach access token before every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 and auto-refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops
      if (isRefreshingFlag) {
        // Queue this request until refresh completes
        return new Promise((resolve, _reject) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshingFlag = true;

      try {
        // Call refresh endpoint; the cookie will be sent automatically
        const response = await axios.post<Result<AuthenticationResult>>(
          `${import.meta.env.VITE_API_BASE_URL || ""}/auth/refresh-token`,
          {}, // empty body; cookie is sent via withCredentials
          { withCredentials: true },
        );

        if (response.data.succeeded && response.data.data) {
          const { accessToken } = response.data.data;
          const store = useAuthStore.getState();
          store.setToken(accessToken);

          // Retry all queued requests with new token
          onRefreshed(accessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosClient(originalRequest);
        } else {
          console.log("Refresh failed - no data returned", error);
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.log("Refresh error:", refreshError);
        useAuthStore.getState().logout();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshingFlag = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
