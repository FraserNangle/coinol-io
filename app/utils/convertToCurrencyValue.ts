import { CURRENCY_TYPE } from "../(tabs)/_layout";

export function convertToCurrencyFormat(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: CURRENCY_TYPE,
    }).format(value);
}