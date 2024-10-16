export function convertToCurrencyFormat(value: number, currencyType: string, hasNegatives: boolean) {

    if (hasNegatives) {
        value = Math.abs(value);
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyType,
    }).format(value);
}