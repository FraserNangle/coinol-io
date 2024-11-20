import { coinsMarketsMock } from "../mocks/coinsMarketsMock";
import { coinsMock } from "../mocks/coinsMock";
import { Coin } from "../models/Coin";
import { CoinsMarkets } from "../models/CoinsMarkets";

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

export async function fetchAllCoins() {
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