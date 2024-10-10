import { CoinMarketHistoricalDataPoint } from "@/app/models/CoinsMarkets";
import { FolioEntry } from "@/app/models/FolioEntry";
import { LineGraphDataItem } from "@/app/models/LineGraphDataItem";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { getPercentageChangeDisplay } from "@/app/utils/getPercentageChange";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { StyleSheet, View, Text, LayoutChangeEvent } from "react-native";
import Svg, { ClipPath, Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

type TextAlign = "auto" | "center" | "left" | "right" | "justify";

interface LineGraphProps {
    data: CoinMarketHistoricalDataPoint[],
    currencyType: string,
    folioEntry: FolioEntry,
    width: number,
    height: number
}

const textWidth = 60;
const textHeight = 20;
const iconWidth = 12;

export const LineGraph: React.FC<LineGraphProps> = ({
    data,
    currencyType,
    folioEntry,
    width,
    height,
}: LineGraphProps) => {
    const [viewLayout, setViewLayout] = useState({ width: 0, height: 0 });

    const formatted24hChangeCoinValue = convertToCurrencyFormat(folioEntry.priceChange24h, currencyType);

    // Sort the historicalDataPointList by date
    const sortedHistoricalDataPointList = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find the maximum and minimum current_price in the historicalDataPointList
    const maxPrice = Math.max(...sortedHistoricalDataPointList.map(dataPoint => dataPoint.current_price));
    const minPrice = Math.min(...sortedHistoricalDataPointList.map(dataPoint => dataPoint.current_price));

    // Find the maximum and minimum date in the historicalDataPointList
    const maxDate = new Date(sortedHistoricalDataPointList[sortedHistoricalDataPointList.length - 1].date).getTime();
    const minDate = new Date(sortedHistoricalDataPointList[0].date).getTime();

    // Map the data points to x and y coordinates
    const lineGraphData: LineGraphDataItem[] = sortedHistoricalDataPointList.map(dataPoint => {
        const x = ((new Date(dataPoint.date).getTime() - minDate) / (maxDate - minDate)) * width;
        const y = ((dataPoint.current_price - minPrice) / (maxPrice - minPrice)) * (viewLayout.height / 2);
        return { x, y };
    });

    const pathData = lineGraphData.map((point, index) => {
        const invertedY = viewLayout.height - point.y;
        return `${index === 0 ? 'M' : 'L'} ${point.x} ${invertedY}`;
    }).join(' ');

    const maxDataPoint = lineGraphData.reduce((max, point) => (point.y > max.y ? point : max), lineGraphData[0]);
    const minDataPoint = lineGraphData.reduce((min, point) => (point.y < min.y ? point : min), lineGraphData[0]);

    const handleLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setViewLayout({ width, height });
    };

    // Adjust the text label position if it goes outside the bounds
    let minTextAdjustedX = Math.max(0, Math.min(minDataPoint.x - textWidth / 2, viewLayout.width - textWidth));
    let minTextAdjustedY = Math.max(0, Math.min(minDataPoint.y - textHeight / 2, viewLayout.height - textHeight));
    let maxTextAdjustedX = Math.max(0, Math.min(maxDataPoint.x - textWidth / 2, viewLayout.width - textWidth));
    let maxTextAdjustedY = Math.max(0, Math.min(maxDataPoint.y - textHeight / 2, viewLayout.height - textHeight));
    // Adjust the icon label position if it goes outside the bounds
    let minIconAdjustedX = Math.max(0, Math.min(minDataPoint.x - iconWidth / 2, viewLayout.width - iconWidth));
    let minIconAdjustedY = Math.max(0, Math.min(minDataPoint.y - iconWidth / 2, viewLayout.height - iconWidth));
    let maxIconAdjustedX = Math.max(0, Math.min(maxDataPoint.x - iconWidth / 2, viewLayout.width - iconWidth));
    let maxIconAdjustedY = Math.max(0, Math.min(maxDataPoint.y - iconWidth / 2, viewLayout.height - iconWidth));


    let minIcon = 'keyboard-arrow-up';
    let maxIcon = 'keyboard-arrow-down';
    let minTextAlign: TextAlign = 'center';
    let maxTextAlign: TextAlign = 'center';

    if (minDataPoint.x - textWidth / 2 < 0) {
        minIcon = 'keyboard-arrow-left';
        minTextAlign = 'left';
        minTextAdjustedX = minDataPoint.x + iconWidth;
        minTextAdjustedY = minDataPoint.y + textHeight / 2;
        minIconAdjustedX = minDataPoint.x;
        minIconAdjustedY += iconWidth / 2;
    } else if (minDataPoint.x + textWidth / 2 > viewLayout.width) {
        minIcon = 'keyboard-arrow-right';
        minTextAlign = 'right';
        minTextAdjustedX = minDataPoint.x - textWidth - iconWidth;
        minTextAdjustedY = minDataPoint.y + textHeight / 2;
        minIconAdjustedX = minDataPoint.x - iconWidth;
        minIconAdjustedY += iconWidth / 2;
    } else {
        minTextAdjustedY += -(iconWidth / 2);
    }

    if (maxDataPoint.x - textWidth / 2 < 0) {
        maxIcon = 'keyboard-arrow-left';
        maxTextAlign = 'left';
        maxTextAdjustedX = maxDataPoint.x + iconWidth;
        maxTextAdjustedY = maxDataPoint.y + textHeight / 2;
        maxIconAdjustedX = maxDataPoint.x;
        maxIconAdjustedY += iconWidth / 2;
    } else if (maxDataPoint.x + textWidth / 2 > viewLayout.width) {
        maxIcon = 'keyboard-arrow-right';
        maxTextAlign = 'right';
        maxTextAdjustedX = maxDataPoint.x - textWidth - iconWidth;
        maxTextAdjustedY = maxDataPoint.y + textHeight / 2;
        maxIconAdjustedX = maxDataPoint.x - iconWidth;
        maxIconAdjustedY += iconWidth;
    } else {
        maxIconAdjustedY += iconWidth + iconWidth / 2;
        maxTextAdjustedY += (textWidth / 2) + (iconWidth / 2);
    }

    return (
        <View style={styles.container} onLayout={handleLayout}>
            <View style={styles.titleContainer}>
                <View style={styles.subtitleContainer}>
                    <Text style={styles.headerTitle}>
                        {convertToCurrencyFormat(folioEntry.currentPrice, currencyType)}
                    </Text>
                </View>

                <View style={styles.subtitleContainer}>
                    <Text
                    >
                        {formatted24hChangeCoinValue}
                    </Text>
                    <Text style={[
                        styles.percentageContainer,
                        folioEntry.priceChangePercentage24h > 0 ? styles.positive : styles.negative,
                    ]}
                    >
                        {getPercentageChangeDisplay(folioEntry.priceChangePercentage24h)}%
                    </Text>
                </View>
            </View>
            <View style={styles.lineGraph}>
                <Svg width={width} height={height} translateY={height / 6}>
                    <Defs>
                        <LinearGradient id={`grad-${pathData}`} x1="50%" y1="100%" x2="50%" y2="0%">
                            <Stop offset="0%" stopColor="transparent" stopOpacity="0" />
                            <Stop offset="100%" stopColor="green" stopOpacity=".8" />
                        </LinearGradient>
                        <ClipPath id={`clip-${pathData}`}>
                            <Path d={`M0,${height}
                            L0,${viewLayout.height - lineGraphData[0].y}
                            L${width},${viewLayout.height - lineGraphData[lineGraphData.length - 1].y}
                            L${width},${height} ${pathData} Z`} />
                        </ClipPath>
                    </Defs>
                    <G x={0} y={0} width={viewLayout.width} height={viewLayout.height} viewBox={`0 0 ${viewLayout.width} ${viewLayout.height}`}>
                        <Rect
                            x="0"
                            y="0"
                            width={width}
                            height={height}
                            fill={`url(#grad-${pathData})`}
                            clipPath={`url(#clip-${pathData})`}
                        />
                        <Path d={pathData} stroke="white" strokeWidth="1" fill="none" />
                        <Text
                            style={[styles.dataLabel, {
                                left: maxTextAdjustedX,
                                top: viewLayout.height - maxTextAdjustedY,
                                textAlign: maxTextAlign
                            }]}
                        >
                            {convertToCurrencyFormat(maxPrice, currencyType)}
                        </Text>
                        <MaterialIcons style={[styles.dataLabel, {
                            left: maxIconAdjustedX,
                            top: viewLayout.height - maxIconAdjustedY,
                            width: 12,
                            height: 12
                        }]} name={maxIcon} color={"white"} size={10} />

                        <Text
                            style={[styles.dataLabel, {
                                left: minTextAdjustedX,
                                top: viewLayout.height - minTextAdjustedY,
                                textAlign: minTextAlign
                            }]}
                        >
                            {convertToCurrencyFormat(minPrice, currencyType)}
                        </Text>
                        <MaterialIcons style={[styles.dataLabel, {
                            left: minIconAdjustedX,
                            top: viewLayout.height - minIconAdjustedY,
                            width: 12,
                            height: 12
                        }]} name={minIcon} color={"white"} size={10} />
                    </G>
                </Svg>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    titleContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    subtitleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
    },
    title: {
        fontSize: 20,
        textAlign: "center",
    },
    percentageContainer: {
        borderRadius: 10,
        marginLeft: 10,
        padding: 5,
    },
    positive: {
        color: "#00ff00",
    },
    negative: {
        color: "red",
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lineGraph: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',

    },
    dataLabel: {
        position: 'absolute',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: "center",
        textAlignVertical: "center",
        backgroundColor: "transparent",
        color: "white",
        width: textWidth,
        height: textHeight,
        fontSize: 10
    },
})