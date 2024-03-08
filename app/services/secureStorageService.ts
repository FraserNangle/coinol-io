import * as SecureStore from 'expo-secure-store';
import * as ExpoCrypto from 'expo-crypto';

export interface IKeychainService {
  setAccessToken: (token: string) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  setRefreshToken: (token: string) => Promise<void>;
  getRefreshToken: () => Promise<string | null>;
  setCredentials: (username: string, password: string) => Promise<void>;
  getCredentials: () => Promise<{ username: string; password: string } | null>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteLocalHoldings: () => Promise<void>;
}

const getRandomString = async (byteCount = 16) => {
  const randomBytes = await ExpoCrypto.getRandomBytesAsync(byteCount);
  const randomBytesArray = new Uint8Array(randomBytes);
  let randomString = '';
  for (let i = 0; i < randomBytesArray.length; i++) {
    randomString += randomBytesArray[i].toString(16).padStart(2, '0');
  }
  return randomString;
};

// Function to set the access token
export const setAccessToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('access_token', token);
  } catch (error) {
    console.error('Failed to set access token:', error);
  }
};

// Function to get the access token
export const getAccessToken = async () => {
  try {
    const access_token = await SecureStore.getItemAsync('access_token');
    if (access_token) {
      return access_token;
    }
  } catch (error) {
    console.error('Failed to get access token:', error);
  }
  return null;
};

// Function to set the refresh token
export const setRefreshToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync('refresh_token', token);
  } catch (error) {
    console.error('Failed to set refresh token:', error);
  }
}

// Function to get the refresh token
export const getRefreshToken = async () => {
  try {
    const refresh_token = await SecureStore.getItemAsync('refresh_token');
    if (refresh_token) {
      return refresh_token;
    }
  } catch (error) {
    console.error('Failed to get access token:', error);
  }
  return null;
};

// Function to set the user's credentials
export const setCredentials = async (username?: string, password?: string) => {
  let isGuest = false;
  if (!username) {
    username = await getRandomString();
    isGuest = true;
  }
  if (!password) {
    password = await getRandomString();
  }
  try {
    await SecureStore.setItemAsync('user', JSON.stringify({ username, password, isGuest }));
  } catch (error) {
    console.error('Failed to set credentials:', error);
  }
};

// Function to get the user's credentials
export const getCredentials = async () => {
  try {
    const credentials = await SecureStore.getItemAsync('user');
    if (credentials) {
      const { username, password, isGuest } = JSON.parse(credentials);
      return { username, password, isGuest };
    }
  } catch (error) {
    console.error('Failed to get credentials:', error);
  }
  return null;
};

// Function to log in, stores the user's credentials in SecureStore
export const login = async (username: string, password: string) => {
  try {
    await SecureStore.setItemAsync('user', JSON.stringify({ username, password }));
  } catch (error) {
    console.error('Failed to log in:', error);
  }
};

export const logout = async () => {
  try {
    await SecureStore.deleteItemAsync('user');
    await deleteLocalHoldings();
  } catch (error) {
    console.error('Failed to log out:', error);
  }
};

// Function to delete the holdings data from the Keychain
export const deleteLocalHoldings = async () => {
  try {
    await SecureStore.deleteItemAsync('holdings');
  } catch (error) {
    console.error('Failed to delete holdings:', error);
  }
};
