import { SQLiteDatabase } from "expo-sqlite";
import { UserTransaction } from "../models/UserTransaction";
import api, { isGuest } from './apiService';
import { createTransactionsTable } from "./sqlService";

export const addBatchTransactionData = async (db: SQLiteDatabase, newTransactions: UserTransaction[]) => {
  await createTransactionsTable(db);

  for (const transaction of newTransactions) {
    await db.runAsync('INSERT INTO transactions ( id, coinId, quantity, date, type, folioId ) VALUES ( ?, ?, ?, ?, ?, ? )',
      transaction.id,
      transaction.coinId,
      transaction.quantity,
      transaction.date,
      transaction.type,
      transaction.folioId
    );
  }

  if (!isGuest()) {
    // If the user is not a guest, update the transactions on the server
    const response = await api.post('/transactions/add', {
      newTransactions
    });

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
  }
};

export const getTransactionList = async (db: SQLiteDatabase) => {
  await createTransactionsTable(db);

  if (!isGuest()) {
    // If the user is not a guest, download the transactions from the server and save them to local storage
    await downloadTransactionsToLocalStorage();
  }

  const transactions = await db.getAllAsync<UserTransaction>('SELECT * FROM transactions');

  if (transactions.length > 0) {
    return transactions;
  } else {
    return [];
  }
}

export const getTransactionListByFolioId = async (db: SQLiteDatabase, folioId: string) => {
  await createTransactionsTable(db);

  if (!isGuest()) {
    // If the user is not a guest, download the transactions from the server and save them to local storage
    await downloadTransactionsToLocalStorage();
  }

  const transactions = await db.getAllAsync<UserTransaction>('SELECT * FROM transactions WHERE folioId = ?', [folioId]);

  if (transactions.length > 0) {
    return transactions;
  } else {
    return [];
  }
}

export const getTransactionListByCoinId = async (db: SQLiteDatabase, coinId: string) => {
  await createTransactionsTable(db);

  if (!isGuest()) {
    // If the user is not a guest, download the transactions from the server and save them to local storage
    await downloadTransactionsToLocalStorage();
  }

  const transactions = await db.getAllAsync<UserTransaction>('SELECT * FROM transactions WHERE coinId = ?', [coinId]);

  if (transactions.length > 0) {
    return transactions;
  } else {
    return [];
  }
}

export const getTransactionListByCoinIdAndFolioId = async (db: SQLiteDatabase, coinId: string, folioId: string) => {
  await createTransactionsTable(db);

  if (!isGuest()) {
    // If the user is not a guest, download the transactions from the server and save them to local storage
    await downloadTransactionsToLocalStorage();
  }

  const transactions = await db.getAllAsync<UserTransaction>('SELECT * FROM transactions WHERE coinId = ? AND folioId = ?', [coinId, folioId]);

  if (transactions.length > 0) {
    return transactions;
  } else {
    return [];
  }
}

async function downloadTransactionsToLocalStorage() {
  // download the transactions from the server and save them to local storage
  const response = await api.get<UserTransaction[]>('/transactions');

  if (response.data.length > 0) {
    //TODO: Compare the transactions with the ones in the local storage and see which is more recent then update accordingly
    console.log("Transactions downloaded from the server: ", response.data);
  }
}

// Function to get the quantity of a specific coin in the local store (Read)
export const getCoinQuantity = async (coinId: string) => {
  if (!isGuest()) {
    // If the user is not a guest, retrieve the coin quantity from the server
    const response = await api.get(`/holdings/${coinId}`);
    return response.data.quantity;
  }
  //TODO: integrate this with sqlite system if needed
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
    //TODO: integrate this with sqlite system if needed
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
  }
  //TODO: integrate this with sqlite system if needed
};
