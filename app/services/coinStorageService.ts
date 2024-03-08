import * as Keychain from 'react-native-keychain';
import { encryptData, decryptData } from './keychainService';
import api from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ICoinStorageService {
  addCoinData: (coinId: string, quantity: number) => Promise<void>;
  getLocalHoldings: () => Promise<any[]>;
  getCoinQuantity: (coinId: string) => Promise<number>;
  updateCoinData: (coinId: string, newQuantity: number) => Promise<void>;
  removeCoinData: (coinId: string) => Promise<void>;
}

const getDeviceId = async () => {
  return await AsyncStorage.getItem('deviceId');
}

  // Function to add coin data to the local store (Create)
  export const addCoinData = async (coinId: string, ticker: string, quantity: number) => {
    const credentials = await Keychain.getGenericPassword({ service: 'user' });
    if (credentials && credentials.username !== await getDeviceId()) {
      // If the user is not a guest, update the holdings on the server
      const response = await api.post('/holdings', {
        coinId,
        ticker,
        quantity,
      });
  
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
    } else {
      // If the user is a guest, update the local holdings
      let holdings = [];
      if (credentials && typeof credentials !== 'boolean') {
        holdings = JSON.parse(await decryptData(credentials.password));
      }
      holdings.push({ coinId, ticker, quantity });
      const encryptedHoldings = await encryptData(JSON.stringify(holdings));
      if (credentials && typeof credentials !== 'boolean') {
        await Keychain.setGenericPassword(credentials.username, encryptedHoldings, { service: 'holdings' });
      }
    }
  };
  
  // Retrieve the user's holdings (Read)
  export const getHoldings = async () => {
    const credentials = await Keychain.getGenericPassword({ service: 'user' });
    if (credentials && credentials.username !== await getDeviceId()) {
      // If the user is not a guest, retrieve the holdings from the server
      const response = await api.get('/holdings');
      return response.data;
    } else {
      // If the user is a guest, retrieve the holdings from the local storage
      const holdingsCredentials = await Keychain.getGenericPassword({ service: 'holdings' });
      if (holdingsCredentials) {
        return JSON.parse(await decryptData(holdingsCredentials.password));
      }
      return [];
    }
  };
  
  // Function to get the quantity of a specific coin in the local store (Read)
  export const getCoinQuantity = async (coinId: string) => {
    const credentials = await Keychain.getGenericPassword({ service: 'user' });
    if (credentials && credentials.username !== await getDeviceId()) {
      // If the user is not a guest, retrieve the coin quantity from the server
      const response = await api.get(`/holdings/${coinId}`);
      return response.data.quantity;
    } else {
      // If the user is a guest, retrieve the coin quantity from the local storage
      const holdingsCredentials = await Keychain.getGenericPassword({ service: 'holdings' });
      let holdings = [];
      if (holdingsCredentials) {
        holdings = JSON.parse(await decryptData(holdingsCredentials.password));
      }
      const coin = holdings.find((coin: { coinId: string }) => coin.coinId === coinId);
      if (coin) {
        return coin.quantity;
      }
      return 0;
    }
  };

  // Function to update coin data in the local store (Update)
  export const updateCoinData = async (coinId: string, newQuantity: number) => {
    const credentials = await Keychain.getGenericPassword({ service: 'user' });
    if (credentials && credentials.username !== await getDeviceId()) {
      // If the user is not a guest, update the coin data on the server
      const response = await api.put(`/holdings/${coinId}`, {
        quantity: newQuantity,
      });
  
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
    } else {
      // If the user is a guest, update the coin data in the local storage
      let holdings = [];
      const holdingsCredentials = await Keychain.getGenericPassword({ service: 'holdings' });
      if (holdingsCredentials && typeof holdingsCredentials !== 'boolean') {
        holdings = JSON.parse(await decryptData(holdingsCredentials.password));
      }
      const coinIndex = holdings.findIndex((coin: { coinId: string }) => coin.coinId === coinId);
      if (coinIndex !== -1) {
        holdings[coinIndex].quantity = newQuantity;
      }
      const encryptedHoldings = await encryptData(JSON.stringify(holdings));
      if (holdingsCredentials && typeof holdingsCredentials !== 'boolean') {
        await Keychain.setGenericPassword(holdingsCredentials.username, encryptedHoldings, { service: 'holdings' });
      }
    }
  };
  
  // Function to remove coin data from the local store (Delete)
  export const removeCoinData = async (coinId: string) => {
    const credentials = await Keychain.getGenericPassword({ service: 'user' });
    if (credentials && credentials.username !== await getDeviceId()) {
      // If the user is not a guest, remove the coin data from the server
      const response = await api.delete(`/holdings/${coinId}`);
  
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
    } else {
      // If the user is a guest, remove the coin data from the local storage
      let holdings = [];
      const holdingsCredentials = await Keychain.getGenericPassword({ service: 'holdings' });
      if (holdingsCredentials && typeof holdingsCredentials !== 'boolean') {
        holdings = JSON.parse(await decryptData(holdingsCredentials.password));
      }
      holdings = holdings.filter((coin: { coinId: string }) => coin.coinId !== coinId);
      const encryptedHoldings = await encryptData(JSON.stringify(holdings));
      if (holdingsCredentials && typeof holdingsCredentials !== 'boolean') {
        await Keychain.setGenericPassword(holdingsCredentials.username, encryptedHoldings, { service: 'holdings' });
      }
    }
  };