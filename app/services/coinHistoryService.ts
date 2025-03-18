import { SQLiteDatabase } from "expo-sqlite";
import { coinMarketHistoricalData24hMock } from "../mocks/coinMarketHistoricalDataMock";
import { CoinMarketHistoricalDataPoint } from "../models/CoinsMarkets";
import { randomUUID } from "expo-crypto";
import api from "./apiService";
import { UserTransaction } from "../models/UserTransaction";

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
        const response = await api.post<CoinMarketHistoricalDataPoint[]>('/coinMarkets/historicalData/batch', {
            coinIds, startDate, endDate
        });
        return response.data;
    }
}

export const getTotalPortfolioValueDataPoints = (coinHistoryDataPoints: CoinMarketHistoricalDataPoint[], transactions: UserTransaction[]) => {
    const totalPortfolioValueDataPoints: CoinMarketHistoricalDataPoint[] = [];
    
    // Add data points for transaction times if they don't exist
    const transactionDataPoints: CoinMarketHistoricalDataPoint[] = [];
    transactions.forEach(transaction => {
        const transactionTime = new Date(transaction.date).getTime();
        // Find the closest historical data point before this transaction
        const closestPoint = coinHistoryDataPoints
            .filter(point => point.coinId === transaction.coinId)
            .reduce((prev, curr) => {
                const prevDiff = Math.abs(new Date(prev.date).getTime() - transactionTime);
                const currDiff = Math.abs(new Date(curr.date).getTime() - transactionTime);
                return prevDiff < currDiff ? prev : curr;
            });
        
        // Add a data point at transaction time using the closest price
        transactionDataPoints.push({
            coinId: transaction.coinId,
            date: transaction.date,
            currentPrice: closestPoint.currentPrice
        });
    });

    // Combine historical and transaction data points
    const allDataPoints = [...coinHistoryDataPoints, ...transactionDataPoints];
    
    // Group history points by date for easier lookup
    const historyByDate = new Map<string, CoinMarketHistoricalDataPoint[]>();
    allDataPoints.forEach(point => {
        const points = historyByDate.get(point.date) || [];
        points.push(point);
        historyByDate.set(point.date, points);
    });

    // Sort dates chronologically
    const dates = Array.from(historyByDate.keys()).sort();

    // For each date, we'll calculate the total value based on all transactions up to that point
    dates.forEach(date => {
        const dataPointsAtDate = historyByDate.get(date)!;
        let totalValue = 0;

        // If we have no transactions yet for this date, skip it
        const dateTime = new Date(date).getTime();
        const hasTransactionsBeforeOrAt = transactions.some(t => new Date(t.date).getTime() <= dateTime);
        
        if (!hasTransactionsBeforeOrAt) {
            totalPortfolioValueDataPoints.push({
                coinId: 'total',
                date: date,
                currentPrice: 0
            });
            return;
        }

        // Group transactions by coinId
        const holdingsByCoin = new Map<string, number>();
        
        // Calculate holdings for each coin up to this date
        transactions.forEach(transaction => {
            if (new Date(transaction.date).getTime() <= dateTime) {
                const currentHoldings = holdingsByCoin.get(transaction.coinId) || 0;
                // Add for BUY, subtract for SELL
                const quantityChange = transaction.type === 'BUY' ? transaction.quantity : -transaction.quantity;
                holdingsByCoin.set(transaction.coinId, currentHoldings + quantityChange);
            }
        });

        // Calculate total value using current holdings and prices
        holdingsByCoin.forEach((quantity, coinId) => {
            const coinPrice = dataPointsAtDate.find(point => point.coinId === coinId)?.currentPrice || 0;
            totalValue += quantity * coinPrice;
        });

        totalPortfolioValueDataPoints.push({
            coinId: 'total',
            date: date,
            currentPrice: totalValue
        });
    });

    return totalPortfolioValueDataPoints;
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
        const oldestPossibleDate = new Date('2013-01-01');
        const currentDate = new Date();
        // Fetch all historical data for missing coins
        const allHistoricalData = await fetchHistoricalCoinDataByCoinIdsForDates(
            coinIds, 
            oldestPossibleDate.toISOString(), 
            currentDate.toISOString()
        );
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