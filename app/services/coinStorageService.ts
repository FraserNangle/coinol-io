import { UserHolding } from '../models/coinData';
import api, { isGuest } from './apiService';
import * as SecureStore from 'expo-secure-store';

export interface ICoinStorageService {
  addCoinData: (holding: UserHolding) => Promise<void>;
  getCoinQuantity: (coinId: string) => Promise<number>;
  updateCoinData: (coinId: string, newQuantity: number) => Promise<void>;
  removeCoinData: (coinId: string) => Promise<void>;
}

// Function to add coin data to the local store (Create)
export const addCoinData = async (holding: UserHolding) => {
  if (!isGuest()) {
    // If the user is not a guest, update the holdings on the server
    const response = await api.post('/holdings', {
      holding
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
  } else {
    // If the user is a guest, update the local holdings
    const holdings = await SecureStore.getItemAsync('holdings');
    let holdingsArray = [];
    if (holdings) {
      holdingsArray = JSON.parse(holdings);
    }
    holdingsArray.push({ holding });
    await SecureStore.setItemAsync('holdings', JSON.stringify(holdingsArray));
  }
};

// Retrieve the user's holdings (Read)
export const getHoldings = async () => {
  if (!isGuest()) {
    // If the user is not a guest, retrieve the holdings from the server
    const response = await api.get('/holdings');
    return response.data;
  } else {
    // If the user is a guest, retrieve the holdings from the local storage
    const holdingsCredentials = await SecureStore.getItemAsync('holdings');
    if (holdingsCredentials) {
      return JSON.parse(holdingsCredentials);
    }
    return [];
  }
};

// Function to get the quantity of a specific coin in the local store (Read)
export const getCoinQuantity = async (coinId: string) => {
  if (!isGuest()) {
    // If the user is not a guest, retrieve the coin quantity from the server
    const response = await api.get(`/holdings/${coinId}`);
    return response.data.quantity;
  } else {
    // If the user is a guest, retrieve the coin quantity from the local storage
    const holdingsCredentials = await SecureStore.getItemAsync('holdings');
    if (holdingsCredentials) {
      const holdings = JSON.parse(holdingsCredentials);
      const coin = holdings.find((coin: { coinId: string }) => coin.coinId === coinId);
      return coin ? coin.quantity : 0;
    }
  }
};

// Function to update coin data in the local store (Update)
export const updateCoinData = async (coinId: string, newQuantity: number) => {
  if (!isGuest()) {
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
    const holdingsCredentials = await SecureStore.getItemAsync('holdings');
    if (holdingsCredentials) {
      holdings = JSON.parse(holdingsCredentials);
    }
    const coinIndex = holdings.findIndex((coin: { coinId: string }) => coin.coinId === coinId);
    if (coinIndex !== -1) {
      holdings[coinIndex].quantity = newQuantity;
    }
    await SecureStore.setItemAsync('holdings', JSON.stringify(holdings));
  }
};

// Function to remove coin data from the local store (Delete)
export const removeCoinData = async (coinId: string) => {
  if (!isGuest()) {
    // If the user is not a guest, remove the coin data from the server
    const response = await api.delete(`/holdings/${coinId}`);

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
  } else {
    // If the user is a guest, remove the coin data from the local storage
    let holdings = [];
    const holdingsCredentials = await SecureStore.getItemAsync('holdings');
    if (holdingsCredentials) {
      holdings = JSON.parse(holdingsCredentials);
    }
    holdings = holdings.filter((coin: { coinId: string }) => coin.coinId !== coinId);
    await SecureStore.setItemAsync('holdings', JSON.stringify(holdings));
  }
};

export const deleteAllHoldings = async () => {
  await SecureStore.deleteItemAsync('holdings');
};