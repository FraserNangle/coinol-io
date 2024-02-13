export type Coin = {
    key: number;
    name: string;
    quantity: number;
    price: number;
};

export type CoinAPI = {
    name: string;
    change24: number;
};