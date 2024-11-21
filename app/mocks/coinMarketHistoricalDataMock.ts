import { CoinMarketHistoricalDataPoint } from "../models/CoinsMarkets";

const bitcoinEntries24h = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - i);
    return {
        coinId: "bitcoin",
        date: date.toISOString(),
        currentPrice: 56001.32 + Math.random() * 2002.43,
    };
});

const cardanoEntries24h = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - i);
    return {
        coinId: "cardano",
        date: date.toISOString(),
        currentPrice: 1.4031 + Math.random() * 1.10431,
    };
});

export const coinMarketHistoricalData24hMock: CoinMarketHistoricalDataPoint[] = [
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        currentPrice: 50000.324,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        currentPrice: 2.223,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        currentPrice: 49129,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        currentPrice: 2.45,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        currentPrice: 56000.13,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        currentPrice: 2.52,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
        currentPrice: 48000.87,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
        currentPrice: 2.4015,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        currentPrice: 50500.3214,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        currentPrice: 2.60234,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(),
        currentPrice: 51000.143,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(),
        currentPrice: 2.52,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        currentPrice: 48500.9584,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        currentPrice: 2.52012,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        currentPrice: 50500.21387,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        currentPrice: 2.6012,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 9)).toISOString(),
        currentPrice: 49000.65,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 9)).toISOString(),
        currentPrice: 2.502,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        currentPrice: 48500.6534,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        currentPrice: 2.45345,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 11)).toISOString(),
        currentPrice: 50000.123,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 11)).toISOString(),
        currentPrice: 2.55123,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString(),
        currentPrice: 48743.542,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString(),
        currentPrice: 3.12,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 13)).toISOString(),
        currentPrice: 46800.12,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 13)).toISOString(),
        currentPrice: 3.0701,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
        currentPrice: 50000.12,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
        currentPrice: 2.5523,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
        currentPrice: 49503.65,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
        currentPrice: 2.5025,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 16)).toISOString(),
        currentPrice: 48202.98,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 16)).toISOString(),
        currentPrice: 2.204,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 17)).toISOString(),
        currentPrice: 50502.76,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 17)).toISOString(),
        currentPrice: 2.621,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 18)).toISOString(),
        currentPrice: 49001.98,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 18)).toISOString(),
        currentPrice: 2.5012,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 19)).toISOString(),
        currentPrice: 48500.98,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 19)).toISOString(),
        currentPrice: 2.45,
    },
    {
        coinId: "bitcoin",
        date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
        currentPrice: 50000.78,
    },
    {
        coinId: "cardano",
        date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
        currentPrice: 2.55,
    },
    ...bitcoinEntries24h, ...cardanoEntries24h,
];