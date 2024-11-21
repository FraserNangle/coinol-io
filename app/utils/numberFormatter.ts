export function numberFormatter(value: number) {
    if (value >= 1000000000000) {
        value = value / 1000000000000;
        return new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        }).format(value) + 'T';
    } else if (value >= 1000000000) {
        value = value / 1000000000;
        return new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        }).format(value) + 'B';
    } else if (value >= 1000000) {
        value = value / 1000000;
        return new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        }).format(value) + 'M';
    }

    return new Intl.NumberFormat("en-US", {
        style: "decimal",
    }).format(value);
}