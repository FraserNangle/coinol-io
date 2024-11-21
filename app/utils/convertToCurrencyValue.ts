export function convertToCurrencyFormat(value: number, currencyType: string, hasNegatives: boolean, append: boolean) {

    if (hasNegatives) {
        value = Math.abs(value);
    }

    if (append) {
        if (value >= 1000000000000) {
            value = value / 1000000000000;
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currencyType,
                minimumFractionDigits: 0,
                maximumFractionDigits: 3
            }).format(value) + 'T';
        } else if (value >= 1000000000) {
            value = value / 1000000000;
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currencyType,
                minimumFractionDigits: 0,
                maximumFractionDigits: 3
            }).format(value) + 'B';
        } else if (value >= 1000000) {
            value = value / 1000000;
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currencyType,
                minimumFractionDigits: 0,
                maximumFractionDigits: 3
            }).format(value) + 'M';
        }
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyType,
    }).format(value);
}