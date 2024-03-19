import { UserHolding, CoinAPI } from "../models/coinData";

export const mockCoins: UserHolding[] = [
  {
    key: 1,
    name: "BTC",
    quantity: 4,
    price: 50000,
  },
  {
    key: 2,
    name: "ETH",
    quantity: 32,
    price: 3000,
  },
  {
    key: 3,
    name: "LTC",
    quantity: 26,
    price: 150,
  },
  {
    key: 4,
    name: "XRP",
    quantity: 32467,
    price: 0.8,
  },
  {
    key: 5,
    name: "ADA",
    quantity: 100000,
    price: 1.5,
  },
  {
    key: 6,
    name: "XLM",
    quantity: 98321,
    price: 0.4,
  },
];

export const mockCoinAPI: CoinAPI[] = [
  {
    name: "BTC",
    price24: 55000,
    ranking: 1,
  },
  {
    name: "ETH",
    price24: 2800,
    ranking: 2,
  },
  {
    name: "LTC",
    price24: 170,
    ranking: 21,
  },
  {
    name: "XRP",
    price24: 0.7,
    ranking: 6,
  },
  {
    name: "ADA",
    price24: 1.7,
    ranking: 9,
  },
  {
    name: "XLM",
    price24: 0.3,
    ranking: 34,
  },
  {
    name: "DOGE",
    price24: 0.5,
    ranking: 5,
  },
  {
    name: "BCH",
    price24: 600,
    ranking: 10,
  },
  {
    name: "LINK",
    price24: 30,
    ranking: 15,
  },
  {
    name: "DOT",
    price24: 20,
    ranking: 8,
  },
  {
    name: "UNI",
    price24: 25,
    ranking: 11,
  },
  {
    name: "USDT",
    price24: 1,
    ranking: 3,
  },
  {
    name: "SOL",
    price24: 40,
    ranking: 16,
  },
  {
    name: "AVAX",
    price24: 50,
    ranking: 12,
  },
  {
    name: "BNB",
    price24: 350,
    ranking: 4,
  },
  {
    name: "USDC",
    price24: 1,
    ranking: 13,
  },
  {
    name: "XEM",
    price24: 0.2,
    ranking: 25,
  },
  {
    name: "ATOM",
    price24: 20,
    ranking: 20,
  },
];
