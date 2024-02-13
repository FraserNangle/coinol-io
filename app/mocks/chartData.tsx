import { Coin, CoinAPI } from "../models/coinData";

export const mockCoins: Coin[] = [
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
  },
  {
    name: "ETH",
    price24: 2800,
  },
  {
    name: "LTC",
    price24: 170,
  },
  {
    name: "XRP",
    price24: 0.7,
  },
  {
    name: "ADA",
    price24: 1.7,
  },
  {
    name: "XLM",
    price24: 0.3,
  },
];