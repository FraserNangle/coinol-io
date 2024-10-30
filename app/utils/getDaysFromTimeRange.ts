export function getDaysFromTimeRange(timeRange: string) {
    const timeRangeToDays: { [key: string]: number; } = {
        "24H": 1,
        "7D": 7,
        "1M": 30,
        "1Y": 365
    };

    let days: number = timeRangeToDays[timeRange] ?? 365 * 20;
    return days;
}