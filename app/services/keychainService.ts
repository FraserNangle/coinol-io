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
  encryptionKey = deviceId + 'hard-coded-string';
});

// Function to encrypt data
const encryptData = (data: string) => {
  return CryptoJS.AES.encrypt(data, encryptionKey).toString();
};

// Function to decrypt data
const decryptData = (data: string) => {
  const bytes = CryptoJS.AES.decrypt(data, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Function to set the access token
export const setAccessToken = async (token: string) => {
  const encryptedToken = encryptData(token);
  await Keychain.setGenericPassword(deviceId, encryptedToken, { service: 'access_token' });
};

// Function to get the access token
export const getAccessToken = async () => {
  const credentials = await Keychain.getGenericPassword({ service: 'access_token' });
  if (credentials) {
    return decryptData(credentials.password);
  }
  return null;
};

// Function to set the refresh token
export const setRefreshToken = async (token: string) => {
  const encryptedToken = encryptData(token);
  await Keychain.setGenericPassword(deviceId, encryptedToken, { service: 'refresh_token' });
};

// Function to get the refresh token
export const getRefreshToken = async () => {
  const credentials = await Keychain.getGenericPassword({ service: 'refresh_token' });
  if (credentials) {
    return decryptData(credentials.password);
  }
  return null;
};

// Function to set the user's credentials
export const setCredentials = async (username: string = deviceId, password: string = 'guest') => {
  const encryptedPassword = encryptData(password);
  await Keychain.setGenericPassword(username, encryptedPassword);
};

// Function to get the user's credentials
export const getCredentials = async () => {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    const decryptedPassword = decryptData(credentials.password);
    return { username: credentials.username, password: decryptedPassword };
  }
  return null;
};

// Function to log out
export const logout = async () => {
  await Keychain.resetGenericPassword();
};

// Function to add coin data to the local store
export const addCoinData = async (coinId: string, quantity: number) => {
  const credentials = await Keychain.getGenericPassword();
  let holdings = [];
  if (credentials && typeof credentials !== 'boolean') {
    holdings = JSON.parse(decryptData(credentials.password));
  }
  holdings.push({ coinId, quantity });
  const encryptedHoldings = encryptData(JSON.stringify(holdings));
  if (credentials && typeof credentials !== 'boolean') {
    await Keychain.setGenericPassword(credentials.username, encryptedHoldings);
  }
};

// Retrieve the user's holdings
export const getLocalHoldings = async () => {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    return JSON.parse(decryptData(credentials.password));
  }
  return [];
};

// Function to remove coin data from the local store
export const removeCoinData = async (coinId: string) => {
  const credentials = await Keychain.getGenericPassword();
  let holdings = [];
  if (credentials && typeof credentials !== 'boolean') {
    holdings = JSON.parse(decryptData(credentials.password));
  }
  holdings = holdings.filter((coin: { coinId: string }) => coin.coinId !== coinId);
  const encryptedHoldings = encryptData(JSON.stringify(holdings));
  if (credentials && typeof credentials !== 'boolean') {
    await Keychain.setGenericPassword(credentials.username, encryptedHoldings);
  }
};

// Function to update coin data in the local store
export const updateCoinData = async (coinId: string, newQuantity: number) => {
  const credentials = await Keychain.getGenericPassword();
  let holdings = [];
  if (credentials && typeof credentials !== 'boolean') {
    holdings = JSON.parse(decryptData(credentials.password));
  }
  const coinIndex = holdings.findIndex((coin: { coinId: string }) => coin.coinId === coinId);
  if (coinIndex !== -1) {
    holdings[coinIndex].quantity = newQuantity;
  }
  const encryptedHoldings = encryptData(JSON.stringify(holdings));
  if (credentials && typeof credentials !== 'boolean') {
    await Keychain.setGenericPassword(credentials.username, encryptedHoldings);
  }
};

// Function to get the quantity of a specific coin in the local store
export const getCoinQuantity = async (coinId: string) => {
  const credentials = await Keychain.getGenericPassword();
  let holdings = [];
  if (credentials) {
    holdings = JSON.parse(decryptData(credentials.password));
  }
  const coin = holdings.find((coin: { coinId: string }) => coin.coinId === coinId);
  if (coin) {
    return coin.quantity;
  }
  return 0;
};