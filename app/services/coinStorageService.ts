import * as Keychain from 'react-native-keychain';
import { encryptData, decryptData } from './keychainService';

export interface ICoinStorageService {
    addCoinData: (coinId: string, quantity: number) => Promise<void>;
    getLocalHoldings: () => Promise<any[]>;
    getCoinQuantity: (coinId: string) => Promise<number>;
    updateCoinData: (coinId: string, newQuantity: number) => Promise<void>;
    removeCoinData: (coinId: string) => Promise<void>;
  }

// Function to add coin data to the local store (Create)
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

// Retrieve the user's holdings (Read)
export const getLocalHoldings = async () => {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    return JSON.parse(await decryptData(credentials.password));
  }
  return [];
};


// Function to get the quantity of a specific coin in the local store (Read)
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

// Function to update coin data in the local store (Update)
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

// Function to remove coin data from the local store (Delete)
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