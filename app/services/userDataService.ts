import { SQLiteDatabase } from "expo-sqlite";
import { UserTransaction } from "../models/UserTransaction";
import api, { isGuest } from './apiService';
import { Folio } from "../models/Folio";
import { UserData } from "../models/UserData";
import { createFoliosTable, createTransactionsTable } from "./sqlService";

export const getUserData = async (db: SQLiteDatabase) => {
    await createTransactionsTable(db);
    await createFoliosTable(db);

    if (!isGuest()) {
        // If the user is not a guest, download the user data from the server and save it to local storage
        await downloadUserDataToLocalStorage();
    }

    const transactions = await db.getAllAsync<UserTransaction>('SELECT * FROM transactions');
    const folios = await db.getAllAsync<Folio>('SELECT * FROM folios');

    const userData: UserData = {
        transactions,
        folios,
    };

    return userData;
}

async function downloadUserDataToLocalStorage() {
    // download the user data from the server and save it to local storage
    const response = await api.get<UserData>('/user-data/all');

    if (response.data) {
        //TODO: Compare the data with local storage and see which is more recent then update accordingly
        console.log("User data downloaded from the server: ", response.data);
    }
}

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
