import { lineDataItem } from "gifted-charts-core";
import { coinMarketHistoricalData24hMock } from "../mocks/coinMarketHistoricalDataMock";
import { CoinMarketHistoricalDataPoint } from "../models/CoinsMarkets";
import { DataPointLabelComponentLayoutSetter } from "@/components/index/coinGraph/coinGraph";
import { LineGraphDataItem } from "../models/LineGraphDataItem";

async function fetchHistoricalCoinData(coinId: string, startDate: string, endDate: string, interval: string) {
    if (process.env.NODE_ENV === 'development') {
        // Mock the data in development environment
        return new Promise<CoinMarketHistoricalDataPoint[]>((resolve) => {
            setTimeout(() => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                resolve(coinMarketHistoricalData24hMock
                    .filter((coin) => coin.id === coinId)
                    .filter((coin) => {
                        const coinDate = new Date(coin.date);
                        return coinDate >= start && coinDate <= end;
                    })
                );
            }, 100); // Simulate a delay of .1 second
        });
    } else {
        // Fetch the data from backend in other environments
        // send the coinId, startDate and endDate to the backend to get the historical data for the coin, at the specified interval
        const response = await fetch(`/api/coinMarkets/historicalData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ coinId, startDate, endDate, interval }),
        });
        return await response.json() as CoinMarketHistoricalDataPoint[];
    }
}

export async function getHistoricalLineGraphDataForCoinId(coinId: string, startDate: string, endDate: string, interval: string, currencyType: string): Promise<lineDataItem[]> {
    const historicalDataPointList: CoinMarketHistoricalDataPoint[] = await fetchHistoricalCoinData(coinId, startDate, endDate, interval);

    const data: lineDataItem[] = [];

    // Sort the historicalDataPointList by date
    const sortedHistoricalDataPointList = historicalDataPointList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find the maximum and minimum current_price in the historicalDataPointList
    const maxPrice = Math.max(...sortedHistoricalDataPointList.map(dataPoint => dataPoint.current_price));
    const minPrice = Math.min(...sortedHistoricalDataPointList.map(dataPoint => dataPoint.current_price));

    sortedHistoricalDataPointList.forEach((dataPoint) => {
        let dataPointHeight = 0;
        if (dataPoint.current_price == maxPrice) {
            dataPointHeight = -5;
        } else if (dataPoint.current_price == minPrice) {
            dataPointHeight = 25;
        }
        data.push({
            value: dataPoint.current_price,
            hideDataPoint: dataPoint.current_price !== maxPrice && dataPoint.current_price !== minPrice,
            dataPointLabelComponent: () => {
                if (dataPoint.current_price === minPrice) {
                    return DataPointLabelComponentLayoutSetter(minPrice, false, currencyType);
                } else if (dataPoint.current_price === maxPrice) {
                    return DataPointLabelComponentLayoutSetter(maxPrice, true, currencyType);
                } else {
                    return null;
                }
            },
            dataPointLabelShiftY: dataPointHeight,
            dataPointLabelShiftX: 24,
        });
    });

    return data;
}

export async function getLineGraphDataForCoinId(coinId: string, startDate: string, endDate: string, interval: string, width: number, height: number): Promise<LineGraphDataItem[]> {
    const historicalDataPointList: CoinMarketHistoricalDataPoint[] = await fetchHistoricalCoinData(coinId, startDate, endDate, interval);

    // Sort the historicalDataPointList by date
    const sortedHistoricalDataPointList = historicalDataPointList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find the maximum and minimum current_price in the historicalDataPointList
    const maxPrice = Math.max(...sortedHistoricalDataPointList.map(dataPoint => dataPoint.current_price));
    const minPrice = Math.min(...sortedHistoricalDataPointList.map(dataPoint => dataPoint.current_price));

    // Find the maximum and minimum date in the historicalDataPointList
    const maxDate = new Date(sortedHistoricalDataPointList[sortedHistoricalDataPointList.length - 1].date).getTime();
    const minDate = new Date(sortedHistoricalDataPointList[0].date).getTime();

    // Define the dimensions of the chart
    const chartWidth = width;
    const chartHeight = height;

    // Map the data points to x and y coordinates
    const lineGraphData: LineGraphDataItem[] = sortedHistoricalDataPointList.map(dataPoint => {
        const x = ((new Date(dataPoint.date).getTime() - minDate) / (maxDate - minDate)) * chartWidth;
        const y = ((dataPoint.current_price - minPrice) / (maxPrice - minPrice)) * chartHeight;
        return { x, y };
    });

    return lineGraphData;
}