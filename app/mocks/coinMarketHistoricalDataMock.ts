import { CoinMarketHistoricalDataPoint } from "../models/CoinsMarkets";

const bitcoinEntries24h = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - i);
    return {
        id: "bitcoin",
        date,
        current_price: 56001.32 + Math.random() * 2002.43,
    };
});

const cardanoEntries24h = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - i);
    return {
        id: "cardano",
        date: date.toISOString(),
        current_price: 1.4031 + Math.random() * 1.10431,
    };
});

export const coinMarketHistoricalData24hMock: CoinMarketHistoricalDataPoint[] = [
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        current_price: 50000.324,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        current_price: 2.223,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        current_price: 49129,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        current_price: 2.45,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        current_price: 56000.13,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        current_price: 2.52,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
        current_price: 48000.87,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
        current_price: 2.4015,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        current_price: 50500.3214,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        current_price: 2.60234,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(),
        current_price: 51000.143,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(),
        current_price: 2.55,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        current_price: 48500.9584,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        current_price: 2.52012,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        current_price: 50500.21387,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        current_price: 2.6012,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 9)).toISOString(),
        current_price: 49000.65,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 9)).toISOString(),
        current_price: 2.502,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        current_price: 48500.6534,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        current_price: 2.45345,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 11)).toISOString(),
        current_price: 50000.123,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 11)).toISOString(),
        current_price: 2.55123,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString(),
        current_price: 48743.542,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString(),
        current_price: 3.12,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 13)).toISOString(),
        current_price: 46800.12,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 13)).toISOString(),
        current_price: 3.0701,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
        current_price: 50000.12,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
        current_price: 2.5523,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
        current_price: 49503.65,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
        current_price: 2.5025,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 16)).toISOString(),
        current_price: 48202.98,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 16)).toISOString(),
        current_price: 2.204,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 17)).toISOString(),
        current_price: 50502.76,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 17)).toISOString(),
        current_price: 2.621,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 18)).toISOString(),
        current_price: 49001.98,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 18)).toISOString(),
        current_price: 2.5012,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 19)).toISOString(),
        current_price: 48500.98,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 19)).toISOString(),
        current_price: 2.45,
    },
    {
        id: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
        current_price: 50000.78,
    },
    {
        id: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
        current_price: 2.55,
    },
    ...bitcoinEntries24h, ...cardanoEntries24h,
];