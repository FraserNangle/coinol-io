import { coinsMarketsMock } from "../mocks/coinsMarketsMock";
import { CoinsMarkets } from "../models/CoinsMarkets";

export async function fetchCoinDataForCoinsList(coinsList: string[]) {
    if (process.env.NODE_ENV === 'development') {
        // Mock the data in development environment
        return new Promise<CoinsMarkets[]>((resolve) => {
            setTimeout(() => {
                resolve(coinsMarketsMock.filter((coin) => coinsList.includes(coin.id)));
            }, 1000); // Simulate a delay of 1 second
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