import { SQLiteDatabase } from "expo-sqlite";

export const createFoliosTable = async (db: SQLiteDatabase) => {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS folios (
        folioId TEXT PRIMARY KEY NOT NULL,
        folioName TEXT NOT NULL
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