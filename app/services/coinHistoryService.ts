import { coinMarketHistoricalData24hMock } from "../mocks/coinMarketHistoricalDataMock";
import { CoinMarketHistoricalDataPoint } from "../models/CoinsMarkets";

export async function fetchHistoricalCoinData(coinId: string, startDate: string, endDate: string, interval: string) {
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
            }, 500); // Simulate a delay of .5 second
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