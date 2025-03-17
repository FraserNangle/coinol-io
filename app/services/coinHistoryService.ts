import { SQLiteDatabase } from "expo-sqlite";
import { coinMarketHistoricalData24hMock } from "../mocks/coinMarketHistoricalDataMock";
import { CoinMarketHistoricalDataPoint } from "../models/CoinsMarkets";
import { randomUUID } from "expo-crypto";
import api from "./apiService";

//TODO: need to sum up all the data points for each coin into a single set of data points for the graph
async function fetchAllHistoricalCoinDataByCoinIds(coinIds: string[]) {
    if (process.env.NODE_ENV === 'development') {
        return new Promise<CoinMarketHistoricalDataPoint[]>((resolve) => {
            setTimeout(() => {
                resolve(coinMarketHistoricalData24hMock.filter((coin) => coinIds.includes(coin.coinId)));
            }, 500);
        });
    } else {
        const response = await api.post<CoinMarketHistoricalDataPoint[]>('/coinMarkets/historicalData/batch', { coinIds });
        return response.data;
    }
}

async function fetchHistoricalCoinDataByCoinIdsForDates(coinIds: string[], startDate: string, endDate: string) {
    if (process.env.NODE_ENV === 'development') {
        return new Promise<CoinMarketHistoricalDataPoint[]>((resolve) => {
            setTimeout(() => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                resolve(coinMarketHistoricalData24hMock
                    .filter((coin) => coinIds.includes(coin.coinId))
                    .filter((coin) => {
                        const coinDate = new Date(coin.date);
                        return coinDate >= start && coinDate <= end;
                    })
                );
            }, 500);
        });
    } else {
        const response = await api.post<CoinMarketHistoricalDataPoint[]>('/coinMarkets/historicalData', {
            coinIds, startDate, endDate
        });
        return response.data;
    }
}

const createCoinHistoryTable = async (db: SQLiteDatabase) => {
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS coinHistoryDataPoints (
        id TEXT PRIMARY KEY NOT NULL,
        coinId TEXT NOT NULL,
        date TEXT NOT NULL,
        currentPrice REAL NOT NULL
      );`
    );
};

const addCoinHistoryDataPointsToDb = async (db: SQLiteDatabase, newCoinHistoryDataPoints: CoinMarketHistoricalDataPoint[]) => {
    for (const dataPoint of newCoinHistoryDataPoints) {
        await db.runAsync('INSERT INTO coinHistoryDataPoints (id, coinId, date, currentPrice) VALUES (?, ?, ?, ?)',
            randomUUID(),
            dataPoint.coinId,
            dataPoint.date,
            dataPoint.currentPrice);
    }
};

const getCoinHistoryDataPointsByIds = async (db: SQLiteDatabase, coinIds: string[]) => {
    const placeholders = coinIds.map(() => '?').join(',');
    const coinHistoryDataPoints = await db.getAllAsync<CoinMarketHistoricalDataPoint>(
        `SELECT * FROM coinHistoryDataPoints WHERE coinId IN (${placeholders})`, 
        coinIds
    );
    return coinHistoryDataPoints;
}

export const getCoinHistoryDataPoints = async (db: SQLiteDatabase, coinIds: string[]) => {
    await createCoinHistoryTable(db);
    const existingDataPoints = await getCoinHistoryDataPointsByIds(db, coinIds);

    const missingCoinIds = coinIds.filter(id => 
        !existingDataPoints.some(point => point.coinId === id)
    );

    let newDataPoints: CoinMarketHistoricalDataPoint[] = [];

    if (missingCoinIds.length > 0) {
        // Fetch all historical data for missing coins
        const allHistoricalData = await fetchAllHistoricalCoinDataByCoinIds(missingCoinIds);
        if (allHistoricalData.length > 0) {
            await addCoinHistoryDataPointsToDb(db, allHistoricalData);
            newDataPoints = [...newDataPoints, ...allHistoricalData];
        }
    }

    if (existingDataPoints.length > 0) {
        // For existing coins, fetch new data since most recent date
        const mostRecentDate = new Date(Math.max(...existingDataPoints.map(dataPoint => new Date(dataPoint.date).getTime())));
        const currentDate = new Date();
        const newHistoricalData = await fetchHistoricalCoinDataByCoinIdsForDates(
            coinIds, 
            mostRecentDate.toISOString(), 
            currentDate.toISOString()
        );
        await addCoinHistoryDataPointsToDb(db, newHistoricalData);
        newDataPoints = [...newDataPoints, ...newHistoricalData];
    }

    return [...existingDataPoints, ...newDataPoints];
};

export const deleteAllCoinHistoryFromLocalStorage = async (db: SQLiteDatabase) => {
    console.log("Deleting all coin History from local storage");
    await db.execAsync('DELETE FROM coinHistoryDataPoints');
};