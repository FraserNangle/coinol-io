import { CoinMarketHistoricalDataPoint } from "../models/CoinsMarkets";

export const coinMarketHistoricalData24hMock: CoinMarketHistoricalDataPoint[] = [
    // Current minute data point (exact current time)
    {
        coinId: "bitcoin",
        date: new Date().toISOString(),
        currentPrice: 57770,
    },
    {
        coinId: "cardano",
        date: new Date().toISOString(),
        currentPrice: 2.34,
    },
    // Last hour data points with minute-level granularity
    ...Array.from({ length: 60 }, (_, i) => {
        const date = new Date();
        // Each data point is 1 minute apart
        date.setMinutes(date.getMinutes() - i);
        return [
            {
                coinId: "bitcoin",
                date: date.toISOString(),
                currentPrice: i === 0 ? 57770 : 57770 - (Math.random() * 50),
            },
            {
                coinId: "cardano",
                date: date.toISOString(),
                currentPrice: i === 0 ? 2.34 : 2.34 - (Math.random() * 0.01),
            }
        ];
    }).flat(),
    // Rest of 24 hours data points
    ...Array.from({ length: 24 * 12 }, (_, i) => {
        const date = new Date();
        // Each data point is 5 minutes apart
        date.setMinutes(date.getMinutes() - (i * 5 + 60)); // Start after the first hour
        return [
            {
                coinId: "bitcoin",
                date: date.toISOString(),
                currentPrice: 57770 - (Math.random() * 100),
            },
            {
                coinId: "cardano",
                date: date.toISOString(),
                currentPrice: 2.34 - (Math.random() * 0.02),
            }
        ];
    }).flat(),
    // Daily data points
    ...Array.from({ length: 300 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (i + 1));
        return [
            {
                coinId: "bitcoin",
                date: date.toISOString(),
                currentPrice: 57770 - (Math.random() * 2000),
            },
            {
                coinId: "cardano",
                date: date.toISOString(),
                currentPrice: 2.34 - (Math.random() * 0.2),
            }
        ];
    }).flat()
];