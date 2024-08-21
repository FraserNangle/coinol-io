export function convertToCurrencyFormat(value: number, currencyType: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyType,
    }).format(value);
}