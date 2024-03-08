import * as Keychain from 'react-native-keychain';
import DeviceInfo from 'react-native-device-info';
import CryptoJS from 'crypto-js';

export interface IKeychainService {
  setAccessToken: (token: string) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  setRefreshToken: (token: string) => Promise<void>;
  getRefreshToken: () => Promise<string | null>;
  setCredentials: (username: string, password: string) => Promise<void>;
  getCredentials: () => Promise<{ username: string; password: string } | null>;
  logout: () => Promise<void>;
}

let deviceId: string;
let encryptionKey: string;

DeviceInfo.getUniqueId().then(id => {
  deviceId = id;
  const randomString = generateUniqueToken();
  encryptionKey = deviceId + randomString;
  Keychain.setGenericPassword('encryptionKey', encryptionKey, { service: 'encryptionKey' });
});

// Function to encrypt data
export const encryptData = async (data: string) => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: 'encryptionKey' });
    if (credentials) {
      const encryptionKey = credentials.password;
      return CryptoJS.AES.encrypt(data, encryptionKey).toString();
    }
  } catch (error) {
    console.error('Failed to encrypt data:', error);
  }
  throw new Error('Encryption key not found');
};

// Function to decrypt data
export const decryptData = async (data: string) => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: 'encryptionKey' });
    if (credentials) {
      const encryptionKey = credentials.password;
      const bytes = CryptoJS.AES.decrypt(data, encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    }
  } catch (error) {
    console.error('Failed to decrypt data:', error);
  }
  throw new Error('Encryption key not found');
};

// Function to set the access token
export const setAccessToken = async (token: string) => {
  try {
    const encryptedToken = await encryptData(token);
    await Keychain.setGenericPassword(deviceId, encryptedToken, { service: 'access_token' });
  } catch (error) {
    console.error('Failed to set access token:', error);
  }
};

// Function to get the access token
export const getAccessToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: 'access_token' });
    if (credentials) {
      return decryptData(credentials.password);
    }
  } catch (error) {
    console.error('Failed to get access token:', error);
  }
  return null;
};

// Function to set the refresh token
export const setRefreshToken = async (token: string) => {
  try {
    const encryptedToken = await encryptData(token);
    await Keychain.setGenericPassword(deviceId, encryptedToken, { service: 'refresh_token' });
  } catch (error) {
    console.error('Failed to set refresh token:', error);
  }
};

// Function to get the refresh token
export const getRefreshToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: 'refresh_token' });
    if (credentials) {
      return decryptData(credentials.password);
    }
  } catch (error) {
    console.error('Failed to get refresh token:', error);
  }
  return null;
};

// Function to generate a unique token
export const generateUniqueToken = () => {
  return CryptoJS.lib.WordArray.random(16).toString();
};

// Function to set the user's credentials
export const setCredentials = async (username: string = deviceId, password: string = generateUniqueToken()) => {
  try {
    const encryptedPassword = await encryptData(password);
    await Keychain.setGenericPassword(username, encryptedPassword, { service: 'user' });
  } catch (error) {
    console.error('Failed to set credentials:', error);
  }
};

// Function to get the user's credentials
export const getCredentials = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: 'user' });
    if (credentials) {
      return { username: credentials.username, password: credentials.password };
    }
  } catch (error) {
    console.error('Failed to get credentials:', error);
  }
  return null;
};

// Function to log in, stores the user's credentials in the Keychain
export const login = async (username: string, password: string) => {
  try {
    const encryptedPassword = await encryptData(password);
    await Keychain.setGenericPassword(username, encryptedPassword, { service: 'user' });
  } catch (error) {
    console.error('Failed to log in:', error);
  }
};

// Function to log out, removes the user's credentials from the Keychain
export const logout = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: 'user' });
    if (credentials && credentials.username !== deviceId) {
      await Keychain.resetGenericPassword({ service: 'user' });
      await deleteLocalHoldings();
    }
  } catch (error) {
    console.error('Failed to log out:', error);
  }
};

// Function to delete the holdings data from the Keychain
export const deleteLocalHoldings = async () => {
  try {
    await Keychain.resetGenericPassword({ service: 'holdings' });
  } catch (error) {
    console.error('Failed to delete holdings:', error);
  }
};
