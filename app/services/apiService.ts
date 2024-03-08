import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import * as Keychain from 'react-native-keychain';
import { setAccessToken, getRefreshToken, setRefreshToken, setCredentials, logout } from './keychainService';
import { getHoldings } from './coinStorageService';

export interface IApiService {
  initiateGuestUser: () => Promise<string>;
  getUserToken: (username: string, password: string) => Promise<string>;
  onSignUp: (localHoldings: any) => Promise<any>;
  getHoldings: () => Promise<any>;
  updateRemoteHoldings: (holdings: any) => Promise<any>;
}

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000', // Replace with your actual API base URL
});

// Apply axios-retry
axiosRetry(api, { retries: 3 });

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void, reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add a response interceptor
api.interceptors.response.use(undefined, async (error) => {
  if (error.config && error.response && error.response.status === 401) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({resolve, reject});
      }).then(token => {
        error.config.headers['Authorization'] = `Bearer ${token}`;
        return api.request(error.config);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    isRefreshing = true;

    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        const res = await api.post('/auth/refresh_token', { refreshToken });
        const newToken = res.data.accessToken;
        await setAccessToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        error.config.headers['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        isRefreshing = false;
        return api.request(error.config);
      } catch (err) {
        const axiosError = err as AxiosError;
        if (axiosError.response && axiosError.response.status === 401) {
          const credentials = await Keychain.getGenericPassword();
          if (credentials) {
            try {
              const res = await api.post('/auth/token', {
                username: credentials.username,
                password: credentials.password,
              });
              const newToken = res.data.accessToken;
              const newRefreshToken = res.data.refreshToken;
              await setAccessToken(newToken);
              await setRefreshToken(newRefreshToken);
              api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              if (axiosError.config) {
                axiosError.config.headers['Authorization'] = `Bearer ${newToken}`;
                processQueue(null, newToken);
                isRefreshing = false;
                return api.request(axiosError.config);
              } else {
                throw axiosError;
              }
            } catch (err) {
              console.error('Failed to get new token with stored credentials', err);
              throw err;
            }
          }
        }
        console.error('Failed to refresh token', err);
        throw err;
      }
    }
  }
  return Promise.reject(error);
});

// Function to get a guest token and set it in the Keychain and set guest credentials
export const initiateGuestUser = async () => {
  try {
    const response = await api.get('/auth/guest');
    const { accessToken, refreshToken } = response.data;
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
    await setCredentials();
    return accessToken;
  } catch (e) {
    console.error('Could not get guest token', e);
    throw e;
  }
}

// Function to get a user token
export const getUserToken = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/token', {
      username,
      password,
    });
    const { accessToken, refreshToken } = response.data;
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
    await setCredentials(username, password); // Store the user's credentials
    return accessToken;
  } catch (e) {
    console.error('Could not get user token', e);
    throw e;
  }
}

// When a user signs up
export const onSignUp = async (username: string, password: string) => {
  try {
    // Retrieve the locally stored coin data
    const localHoldings = await getHoldings();

    // Post the local holdings to the API
    const response = await api.post('/holdings', {
      holdings: localHoldings,
    });

    // If the request is successful, remove the local holdings
    if (response.status >= 200 && response.status < 300) {
      // Logout to remove the guest user data
      await logout();

      // Set new credentials on the Keychain using the username and password that was used to sign up
      await setCredentials(username, password);

      return response.data;
    } else {
      console.error('Failed to sync local holdings with server', response.status, response.data);
      throw new Error('Failed to sync local holdings with server');
    }
  } catch (e) {
    console.error('Could not sign up', e);
    throw e;
  }
};

export default api; // Export the configured axios instance