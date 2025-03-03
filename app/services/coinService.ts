import { coinsMarketsMock } from "../mocks/coinsMarketsMock";
import { coinsMock } from "../mocks/coinsMock";
import { Coin } from "../models/Coin";
import { CoinsMarkets } from "../models/CoinsMarkets";
import api from "./apiService";

export async function fetchCoinDataByCoinsList(coinsList: string[]) {
    if (process.env.NODE_ENV === 'development') {
        // Mock the data in development environment
        return new Promise<CoinsMarkets[]>((resolve) => {
            setTimeout(() => {
                resolve(coinsMarketsMock.filter((coin) => coinsList.includes(coin.id)));
            }, 100); // Simulate a delay of 1 second
        });
    } else {
        // send the coinsList to the backend to get the longform data of each coin
        const response = await api.post<CoinsMarkets[]>('/coinMarkets', {
            coinsList
        });

        return response.data;
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
        // Fetch all coins shorthand data
        const response = await api.get<Coin[]>('/coinMarkets');
        return response.data;
    }
}