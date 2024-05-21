import { transactionListMock } from "../mocks/transactionListMock";
import { UserTransaction } from "../models/UserTransaction";
import api, { isGuest } from './apiService';
import * as SecureStore from 'expo-secure-store';

export interface ICoinStorageService {
  addTransactionData: (transaction: UserTransaction) => Promise<void>;
  getCoinQuantity: (coinId: string) => Promise<number>;
  updateCoinData: (coinId: string, newQuantity: number) => Promise<void>;
  removeCoinData: (coinId: string) => Promise<void>;
}

// Function to add transaction data to the local store (Create)
export const addTransactionData = async (newTransaction: UserTransaction) => {
  const isUserGuest = await isGuest();
  if (!isUserGuest) {
    // If the user is not a guest, update the transactions on the server
    const response = await api.post('/holdings', {
      newTransaction
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
  } else {
    // If the user is a guest, update the local holdings
    const transactions = await SecureStore.getItemAsync('transactions');
    let transactionsArray = [];
    if (transactions) {
      transactionsArray = JSON.parse(transactions);
    }
    transactionsArray.push({ newTransaction });
    await SecureStore.setItemAsync('transactions', JSON.stringify(transactionsArray));
  }
};

// Retrieve the user's transaction list (Read)
export const getTransactionList = async () => {
  if (process.env.NODE_ENV === 'development') {
    // Mock the data in development environment
    return new Promise<UserTransaction[]>((resolve) => {
      setTimeout(() => {
        resolve(transactionListMock);
      }, 1000); // Simulate a delay of 1 second
    });
  } else {
    const isUserGuest = await isGuest();
    if (!isUserGuest) {
      // If the user is not a guest, retrieve the transactions from the server
      const response = await api.get<UserTransaction[]>('/holdings');
      return response.data;
    } else {
      // If the user is a guest, retrieve the transactions from the local storage
      const holdingsCredentials = await SecureStore.getItemAsync('holdings');
      if (holdingsCredentials) {
        return JSON.parse(holdingsCredentials) as UserTransaction[];
      }
      return [];
    }
  };
}

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