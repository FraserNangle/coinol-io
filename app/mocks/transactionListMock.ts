import { UserTransaction } from "../models/UserTransaction";

export const transactionListMock: UserTransaction[] = [
    {
        id: "bitcoin",
        date: new Date(),
        quantity: .1,
        type: 'buy',
    },
    {
        id: "bitcoin",
        date: new Date(),
        quantity: .1,
        type: 'buy',
    },
    {
        id: "bitcoin",
        date: new Date(),
        quantity: .1,
        type: 'sell',
    },
    {
        id: "ethereum",
        date: new Date(),
        quantity: 5,
        type: 'sell',
    },
    {
        id: "ripple",
        date: new Date(),
        quantity: 15,
        type: 'buy',
    },
    {
        id: "litecoin",
        date: new Date(),
        quantity: 20,
        type: 'sell',
    },
    {
        id: "cardano",
        date: new Date(),
        quantity: 25,
        type: 'buy',
    },
    {
        id: "polkadot",
        date: new Date(),
        quantity: 30,
        type: 'sell',
    },
    {
        id: "bitcoin-cash",
        date: new Date(),
        quantity: 3,
        type: 'buy',
    },
    {
        id: "stellar",
        date: new Date(),
        quantity: 40,
        type: 'sell',
    },
    {
        id: "chainlink",
        date: new Date(),
        quantity: 45,
        type: 'buy',
    },
    {
        id: "binance-coin",
        date: new Date(),
        quantity: 50,
        type: 'sell',
    },
    {
        id: "tether",
        date: new Date(),
        quantity: 55,
        type: 'buy',
    },
    {
        id: "usd-coin",
        date: new Date(),
        quantity: 60,
        type: 'sell',
    },
    {
        id: "uniswap",
        date: new Date(),
        quantity: 55,
        type: 'buy',
    },
    {
        id: "dogecoin",
        date: new Date(),
        quantity: 60,
        type: 'sell',
    },
];