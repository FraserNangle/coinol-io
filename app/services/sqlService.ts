import { SQLiteDatabase } from "expo-sqlite";

export const createFoliosTable = async (db: SQLiteDatabase) => {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS folios (
        folioId TEXT PRIMARY KEY NOT NULL,
        folioName TEXT NOT NULL,
        isFavorite INTEGER DEFAULT 0
      );`
  );
};

export const createTransactionsTable = async (db: SQLiteDatabase) => {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      coinId TEXT NOT NULL,
      quantity REAL NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      folioId TEXT NOT NULL
    );`
  );
};

export const deleteAllTransactionsFromLocalStorage = async (db: SQLiteDatabase) => {
  console.log("Deleting all transactions from local storage");
  await db.execAsync('DELETE FROM transactions');
  await db.execAsync('DROP TABLE IF EXISTS transactions');
};

export const deleteAllUserDataFromLocalStorage = async (db: SQLiteDatabase) => {
  console.log("Deleting all transactions from local storage");
  await db.execAsync('DELETE FROM transactions');
  await db.execAsync('DROP TABLE IF EXISTS transactions');
  console.log("Deleted all transactions from local storage");
  console.log("Deleting all folios from local storage");
  await db.execAsync('DELETE FROM folios');
  await db.execAsync('DROP TABLE IF EXISTS folios');
  console.log("Deleted all folios from local storage");
};