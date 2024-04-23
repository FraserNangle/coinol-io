export type UserHolding = {
    coinId: number;
    date: Date;
    quantity: number;
    type: string;
};

export type Coin = {
    key: number;
    name: string;
    price24: number;
    ranking: number;
};