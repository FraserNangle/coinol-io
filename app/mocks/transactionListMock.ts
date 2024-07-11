import { UserTransaction } from "../models/UserTransaction";

export const transactionListMock: UserTransaction[] = [
    {
        coinId: "bitcoin",
        date: new Date(),
        quantity: .11,
        type: 'buy',
    },
    {
        coinId: "bitcoin",
        date: new Date(),
        quantity: .05,
        type: 'buy',
    },
    {
        coinId: "bitcoin",
        date: new Date(),
        quantity: .1,
        type: 'sell',
    },
    {
        coinId: "ethereum",
        date: new Date(),
        quantity: 5,
        type: 'sell',
    },
    {
        coinId: "ripple",
        date: new Date(),
        quantity: 125.3758768,
        type: 'buy',
    },
    {
        coinId: "litecoin",
        date: new Date(),
        quantity: 20,
        type: 'sell',
    },
    {
        coinId: "cardano",
        date: new Date(),
        quantity: 25,
        type: 'buy',
    },
    {
        coinId: "polkadot",
        date: new Date(),
        quantity: 30,
        type: 'sell',
    },
    {
        coinId: "bitcoin-cash",
        date: new Date(),
        quantity: .5,
        type: 'buy',
    },
    {
        coinId: "stellar",
        date: new Date(),
        quantity: 40,
        type: 'sell',
    },
    {
        coinId: "chainlink",
        date: new Date(),
        quantity: 45,
        type: 'buy',
    },
    {
        coinId: "binance-coin",
        date: new Date(),
        quantity: 50.1238761236,
        type: 'sell',
    },
    {
        coinId: "tether",
        date: new Date(),
        quantity: 55,
        type: 'buy',
    },
    {
        coinId: "usd-coin",
        date: new Date(),
        quantity: 60,
        type: 'sell',
    },
    {
        coinId: "uniswap",
        date: new Date(),
        quantity: 55,
        type: 'buy',
    },
    {
        coinId: "dogecoin",
        date: new Date(),
        quantity: 60,
        type: 'sell',
    },
];