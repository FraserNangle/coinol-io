import { coinMarketHistoricalData24hMock } from "../mocks/coinMarketHistoricalDataMock";
import { coinsMarketsMock } from "../mocks/coinsMarketsMock";
import { coinsMock } from "../mocks/coinsMock";
import { Coin } from "../models/Coin";
import { CoinMarketHistoricalDataPoint, CoinsMarkets } from "../models/CoinsMarkets";

export async function fetchCoinDataByCoinsList(coinsList: string[]) {
    if (process.env.NODE_ENV === 'development') {
        // Mock the data in development environment
        return new Promise<CoinsMarkets[]>((resolve) => {
            setTimeout(() => {
                resolve(coinsMarketsMock.filter((coin) => coinsList.includes(coin.id)));
            }, 100); // Simulate a delay of 1 second
        });
    } else {
        // Fetch the data from backend in other environments
        // send the coinsList to the backend to get the data of each coin
        const response = await fetch('/api/coinsMarkets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ coinsList }),
        });
        return await response.json() as CoinsMarkets[];
    }
}

export async function fetchHistoricalCoinDataByCoinId(coinId: string, startDate: string, endDate: string, interval: string) {
    if (process.env.NODE_ENV === 'development') {
        // Mock the data in development environment
        return new Promise<CoinMarketHistoricalDataPoint[]>((resolve) => {
            setTimeout(() => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                resolve(coinMarketHistoricalData24hMock
                    .filter((coin) => coin.id === coinId)
                    .filter((coin) => {
                        const coinDate = new Date(coin.date);
                        return coinDate >= start && coinDate <= end;
                    })
                );
            }, 100); // Simulate a delay of 1 second
        });
    } else {
        // Fetch the data from backend in other environments
        // send the coinId, startDate and endDate to the backend to get the historical data for the coin, at the specified interval
        const response = await fetch(`/api/coinMarkets/historicalData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ coinId, startDate, endDate, interval }),
        });
        return await response.json() as CoinMarketHistoricalDataPoint[];
    }
}

export async function fetchAllCoinData() {
    if (process.env.NODE_ENV === 'development') {
        // Mock the data in development environment
        return new Promise<Coin[]>((resolve) => {
            setTimeout(() => {
                resolve(coinsMock);
            }, 100); // Simulate a delay of 1 second
        });
    } else {
        // Fetch the data from backend in other environments
        const response = await fetch('/api/allCoins');
        return await response.json() as Coin[];
    }
}