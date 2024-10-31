import { SQLiteDatabase } from "expo-sqlite";
import { coinMarketHistoricalData24hMock } from "../mocks/coinMarketHistoricalDataMock";
import { CoinMarketHistoricalDataPoint } from "../models/CoinsMarkets";
import { randomUUID } from "expo-crypto";

async function fetchAllHistoricalCoinDataByCoinId(coinId: string) {
    if (process.env.NODE_ENV === 'development') {
        // Mock the data in development environment
        return new Promise<CoinMarketHistoricalDataPoint[]>((resolve) => {
            setTimeout(() => {
                resolve(coinMarketHistoricalData24hMock);
            }, 500); // Simulate a delay of .5 second
        });
    } else {
        // send the coinId to the backend to get the historical data for the coin
        const response = await fetch(`/api/coinMarkets/historicalData/${coinId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json() as CoinMarketHistoricalDataPoint[];
    }
}

async function fetchHistoricalCoinDataByCoinIdForDates(coinId: string, startDate: string, endDate: string) {
    if (process.env.NODE_ENV === 'development') {
        // Mock the data in development environment
        return new Promise<CoinMarketHistoricalDataPoint[]>((resolve) => {
            setTimeout(() => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                resolve(coinMarketHistoricalData24hMock
                    .filter((coin) => coin.coinId === coinId)
                    .filter((coin) => {
                        const coinDate = new Date(coin.date);
                        return coinDate >= start && coinDate <= end;
                    })
                );
            }, 500); // Simulate a delay of .5 second
        });
    } else {
        // Fetch the data from backend in other environments
        // send the coinId, startDate and endDate to the backend to get the historical data for the coin
        const response = await fetch(`/api/coinMarkets/historicalData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ coinId, startDate, endDate }),
        });
        return await response.json() as CoinMarketHistoricalDataPoint[];
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

const getCoinHistoryDataPointsById = async (db: SQLiteDatabase, coinId: string) => {
    const coinHistoryDataPoints = await db.getAllAsync<CoinMarketHistoricalDataPoint>('SELECT * FROM coinHistoryDataPoints WHERE coinId = ?', [coinId]);
    return coinHistoryDataPoints;
}

export const getCoinHistoryDataPoints = async (db: SQLiteDatabase, coinId: string) => {
    await createCoinHistoryTable(db);

    const existingDataPoints = await getCoinHistoryDataPointsById(db, coinId);

    if (existingDataPoints.length === 0) {
        // No data points exist, fetch all historical data
        const allHistoricalData = await fetchAllHistoricalCoinDataByCoinId(coinId);
        await addCoinHistoryDataPointsToDb(db, allHistoricalData);
        return allHistoricalData;
    } else {
        // Data points exist, fetch new data from the most recent date
        const mostRecentDate = new Date(Math.max(...existingDataPoints.map(dataPoint => new Date(dataPoint.date).getTime())));
        const currentDate = new Date();
        const newHistoricalData = await fetchHistoricalCoinDataByCoinIdForDates(coinId, mostRecentDate.toISOString(), currentDate.toISOString());
        await addCoinHistoryDataPointsToDb(db, newHistoricalData);
        return [...existingDataPoints, ...newHistoricalData];
    }
};