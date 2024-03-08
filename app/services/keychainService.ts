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
  addCoinData: (coinId: string, quantity: number) => Promise<void>;
  getLocalHoldings: () => Promise<any[]>;
  removeCoinData: (coinId: string) => Promise<void>;
  updateCoinData: (coinId: string, newQuantity: number) => Promise<void>;
  getCoinQuantity: (coinId: string) => Promise<number>;
}

let deviceId: string;
let encryptionKey: string;

DeviceInfo.getUniqueId().then(id => {
  deviceId = id;
  const randomString = generateUniqueToken();
  encryptionKey = deviceId + randomString;
  Keychain.setGenericPassword('encryptionKey', encryptionKey);
});

// Function to encrypt data
const encryptData = async (data: string) => {
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
const decryptData = async (data: string) => {
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
    await Keychain.setGenericPassword(username, encryptedPassword);
  } catch (error) {
    console.error('Failed to set credentials:', error);
  }
};

// Function to get the user's credentials
export const getCredentials = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return { username: credentials.username, password: credentials.password };
    }
  } catch (error) {
    console.error('Failed to get credentials:', error);
  }
  return null;
};

// Function to log out
export const logout = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials && credentials.username !== deviceId) {
      await Keychain.resetGenericPassword();
    }
  } catch (error) {
    console.error('Failed to log out:', error);
  }
};

// Function to add coin data to the local store
export const addCoinData = async (coinId: string, quantity: number) => {
  const credentials = await Keychain.getGenericPassword();
  let holdings = [];
  if (credentials && typeof credentials !== 'boolean') {
    holdings = JSON.parse(await decryptData(credentials.password));
  }
  holdings.push({ coinId, quantity });
  const encryptedHoldings = await encryptData(JSON.stringify(holdings));
  if (credentials && typeof credentials !== 'boolean') {
    await Keychain.setGenericPassword(credentials.username, encryptedHoldings);
  }
};

// Retrieve the user's holdings
export const getLocalHoldings = async () => {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    return JSON.parse(await decryptData(credentials.password));
  }
  return [];
};

// Function to remove coin data from the local store
export const removeCoinData = async (coinId: string) => {
  const credentials = await Keychain.getGenericPassword();
  let holdings = [];
  if (credentials && typeof credentials !== 'boolean') {
    holdings = JSON.parse(await decryptData(credentials.password));
  }
  holdings = holdings.filter((coin: { coinId: string }) => coin.coinId !== coinId);
  const encryptedHoldings = await encryptData(JSON.stringify(holdings));
  if (credentials && typeof credentials !== 'boolean') {
    await Keychain.setGenericPassword(credentials.username, encryptedHoldings);
  }
};

// Function to update coin data in the local store
export const updateCoinData = async (coinId: string, newQuantity: number) => {
  const credentials = await Keychain.getGenericPassword();
  let holdings = [];
  if (credentials && typeof credentials !== 'boolean') {
    holdings = JSON.parse(await decryptData(credentials.password));
  }
  const coinIndex = holdings.findIndex((coin: { coinId: string }) => coin.coinId === coinId);
  if (coinIndex !== -1) {
    holdings[coinIndex].quantity = newQuantity;
  }
  const encryptedHoldings = await encryptData(JSON.stringify(holdings));
  if (credentials && typeof credentials !== 'boolean') {
    await Keychain.setGenericPassword(credentials.username, encryptedHoldings);
  }
};

// Function to get the quantity of a specific coin in the local store
export const getCoinQuantity = async (coinId: string) => {
  const credentials = await Keychain.getGenericPassword();
  let holdings = [];
  if (credentials) {
    holdings = JSON.parse(await decryptData(credentials.password));
  }
  const coin = holdings.find((coin: { coinId: string }) => coin.coinId === coinId);
  if (coin) {
    return coin.quantity;
  }
  return 0;
};