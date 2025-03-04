import { FolioEntry } from "../models/FolioEntry";
import { UserTransaction } from "../models/UserTransaction";
import { fetchCoinDataByCoinsList } from "./coinService";
import { CoinsMarkets } from "../models/CoinsMarkets";
import { SQLiteDatabase } from "expo-sqlite";
import { Folio } from "../models/Folio";
import api, { isGuest } from "./apiService";
import { getUserData } from "./userDataService";
import { UserData } from "../models/UserData";
import { createFoliosTable } from "./sqlService";
import { deleteTransactionsByFolioId } from "./transactionService";
import Decimal from "decimal.js";

export async function fetchUserData(db: SQLiteDatabase) {
    const userData: UserData = await getUserData(db);

    // Send the unique coinIds from the transactionList to the backend to get the complex data of each coin
    const uniqueCoinIds = [...new Set(userData.transactions.map((transaction) => transaction.coinId))];
    let coinsMarketsList: CoinsMarkets[] = await fetchCoinDataByCoinsList(uniqueCoinIds);

    // Fetch colors for each coinMarket asynchronously
    const colorPromises = coinsMarketsList.map(async (coinMarket) => {
        try {
            const colors = await fetchSvgData(coinMarket.image);
            return { ...coinMarket, color: adjustColors(colors) };
        } catch (error) {
            console.error(`Error fetching color for coinMarket ${coinMarket.id}:`, error);
            return { ...coinMarket, color: 'hsl(0, 0%, 50%)' }; // Fallback color
        }
    });

    // Wait for all color fetches to complete
    coinsMarketsList = await Promise.all(colorPromises);

    return { userData, coinsMarketsList };
}

async function fetchSvgData(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch SVG data: ${response.statusText}`);
        }
        const svgData = await response.text();

        // Extract colors from the SVG data
        const colorRegex = /fill[:=]["']?(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*\d+)?\))["']?/g;
        const colors = [...svgData.matchAll(colorRegex)].map(match => match[1]);

        return colors;
    } catch (error) {
        console.error('Error fetching SVG data:', error);
        throw error;
    }
}

function adjustColors(colors: string[]): string {
    const normalizeColor = (color: string): string => {
        if (color.length === 4) {
            return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
        }
        return color.toLowerCase();
    };

    const calculateBrightness = (color: string): number => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
    };

    let brightestColor = 'hsl(0, 0%, 5%)';
    let maxBrightness = -1;

    for (const color of colors) {
        const normalizedColor = normalizeColor(color);
        if (normalizedColor !== '#000000' && normalizedColor !== '#ffffff') {
            const brightness = calculateBrightness(normalizedColor);
            if (brightness > maxBrightness) {
                maxBrightness = brightness;
                brightestColor = color;
            }
        }
    }
    return brightestColor;
}

export function generateFolioEntries(transactionList: UserTransaction[], coinsMarketsList: CoinsMarkets[], foliosList: Folio[]) {
    const folioEntries: FolioEntry[] = [];
    transactionList.forEach((transaction) => {
        const existingEntry = folioEntries.find((entry) => entry.coinId === transaction.coinId && entry.folio.folioId === transaction.folioId);
        const coinMarket = coinsMarketsList.find((coinMarket) => coinMarket.id === transaction.coinId);

        if (existingEntry) {
            if (transaction.type === 'BUY') {
                existingEntry.quantity = new Decimal(existingEntry.quantity).plus(transaction.quantity).toNumber();
            } else if (transaction.type === 'SELL') {
                existingEntry.quantity = new Decimal(existingEntry.quantity).minus(transaction.quantity).toNumber();
            }
            if (existingEntry.quantity <= 0) {
                folioEntries.splice(folioEntries.indexOf(existingEntry), 1);
            }
        } else {
            const newQuantity = transaction.type === 'BUY' ? transaction.quantity : -transaction.quantity;
            if (newQuantity > 0) {

                const folio = foliosList.find((folio) => folio.folioId === transaction.folioId);

                if (!folio) {
                    console.error(`Folio with id ${transaction.folioId} not found`);
                    return;
                }

                folioEntries.push({
                    folio: folio,
                    coinId: transaction.coinId,
                    quantity: new Decimal(newQuantity).toNumber(),
                    ticker: coinMarket ? coinMarket.symbol : "ERROR",
                    name: coinMarket ? coinMarket.name : "ERROR FINDING COIN",
                    image: coinMarket ? coinMarket.image : "",
                    color: coinMarket ? coinMarket.color : "hsl(0, 0%, 100%)",
                    currentPrice: coinMarket ? coinMarket.current_price : 0,
                    priceChange24h: coinMarket ? coinMarket.price_change_24h : 0,
                    priceChangePercentage24h: coinMarket ? coinMarket.price_change_percentage_24h : 0,
                });
            }
        }
    });
    return folioEntries;
}

export const addNewFolio = async (db: SQLiteDatabase, newFolio: Folio) => {
    await createFoliosTable(db);

    // Check if the folios table is empty
    const result = await db.runAsync('SELECT COUNT(*) as count FROM folios');
    const isFirstEntry = result.changes === 0;

    // Insert the new folio
    await db.runAsync('INSERT INTO folios (folioId, folioName, isFavorite) VALUES (?, ?, ?)',
        newFolio.folioId,
        newFolio.folioName
    );

    if (isFirstEntry) {
        // If first made folio, Set the new folio as the favourite folio
        await setFavoriteFolio(db, newFolio.folioId);
    }

    if (!isGuest()) {
        // If the user is not a guest, update the folios on the server
        const response = await api.post('/userData/userFolios/add', {
            newFolio
        });

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }
    }
};

export const deleteFolioById = async (db: SQLiteDatabase, folioId: string) => {
    await createFoliosTable(db);

    // Delete the folio
    await db.runAsync('DELETE FROM folios WHERE folioId = ?', folioId);

    // Delete the transactions associated with the folio
    await deleteTransactionsByFolioId(db, folioId);

    if (!isGuest()) {
        // If the user is not a guest, update the folios on the server
        const response = await api.post('/userData/userFolios/delete', {
            folioId
        });

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }
    }
};

export const updateFolioName = async (db: SQLiteDatabase, folioId: string, newFolioName: string) => {
    await createFoliosTable(db);

    // Update the folio name
    await db.runAsync('UPDATE folios SET folioName = ? WHERE folioId = ?', newFolioName, folioId);

    if (!isGuest()) {
        // If the user is not a guest, update the folios on the server
        const response = await api.post('/userData/userFolios/update', {
            folioId,
            newFolioName
        });

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }
    }
}

export const getFavoriteFolio = async (db: SQLiteDatabase): Promise<Folio | null> => {
    const favoriteFolio = await db.getAllAsync<Folio>('SELECT * FROM folios WHERE isFavorite = 1 LIMIT 1');
    return favoriteFolio[0] || null;
};

export const setFavoriteFolio = async (db: SQLiteDatabase, folioId: string) => {
    // Reset isFavorite for all folios
    await db.runAsync('UPDATE folios SET isFavorite = 0');

    // Set isFavorite for the specified folio
    await db.runAsync('UPDATE folios SET isFavorite = 1 WHERE folioId = ?', folioId);
};

export const getFoliosList = async (db: SQLiteDatabase) => {
    await createFoliosTable(db);

    if (!isGuest()) {
        // If the user is not a guest, download the folios from the server and save them to local storage
        await downloadFoliosToLocalStorage();
    }

    const folios = await db.getAllAsync<Folio>('SELECT * FROM folios');

    if (folios.length > 0) {
        return folios;
    } else {
        return [];
    }
}

async function downloadFoliosToLocalStorage() {
    // download the folios from the server and save them to local storage
    const response = await api.get<Folio[]>('/userData/userFolios');

    if (response.data.length > 0) {
        //TODO: Compare the folios with the ones in the local storage and see which is more recent then update accordingly
        console.log("Folios downloaded from the server: ", response.data);
    }
}