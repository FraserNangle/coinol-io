import { FolioEntry } from "../models/FolioEntry";

export function fetchUserFolio() {
    if (process.env.NODE_ENV === 'development') {
        // Mock the data in development environment
        return new Promise<FolioEntry[]>((resolve) => {
            setTimeout(() => {
                resolve([
                    { key: 1, ticker: 'BTC', name: 'Bitcoin', currentPrice: 60812, price24h: 60000, ranking: 1, quantity: 0.56 },
                    { key: 2, ticker: 'ETH', name: 'Ethereum', currentPrice: 4000, price24h: 3000, ranking: 2, quantity: 10 },
                    { key: 3, ticker: 'ADA', name: 'Cardano', currentPrice: 2.16, price24h: 2, ranking: 3, quantity: 500 },
                    { key: 4, ticker: 'BNB', name: 'Binance Coin', currentPrice: 480, price24h: 550, ranking: 4, quantity: 20 },
                    { key: 5, ticker: 'USDT', name: 'Tether', currentPrice: 1, price24h: 1, ranking: 5, quantity: 1000 },
                    { key: 6, ticker: 'XRP', name: 'Ripple', currentPrice: 1.08, price24h: 1.05, ranking: 6, quantity: 1000 },
                    { key: 7, ticker: 'SOL', name: 'Solana', currentPrice: 200, price24h: 459, ranking: 7, quantity: 50 },
                    { key: 8, ticker: 'DOT', name: 'Polkadot', currentPrice: 40, price24h: 25, ranking: 8, quantity: 100 },
                    { key: 9, ticker: 'DOGE', name: 'Dogecoin', currentPrice: 0.24, price24h: 0.286, ranking: 9, quantity: 5000 },
                    { key: 10, ticker: 'USDC', name: 'USD Coin', currentPrice: 1, price24h: 1.0001, ranking: 10, quantity: 1000 },
                ]);
            }, 1000); // Simulate a delay of 1 second
        });
    } else {
        // Fetch the data from backend in other environments
        // TODO: Replace this with our actual API call
        return fetch('/api/userHoldings').then(response => response.json());
    }
}