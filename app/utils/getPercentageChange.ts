export const getPercentageChangeDisplay = (percentageChange: number) => {
    return percentageChange > 0
        ? `+${percentageChange.toFixed(2)}`
        : `${percentageChange.toFixed(2)}`;
};

export const getPercentageChangeDisplayNoSymbol = (percentageChange: number) => {
    return percentageChange > 0
        ? `${percentageChange.toFixed(2)}`
        : `${percentageChange.toFixed(2)}`;
};