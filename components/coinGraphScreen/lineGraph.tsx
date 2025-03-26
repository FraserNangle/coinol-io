import { CoinMarketHistoricalDataPoint } from "@/app/models/CoinsMarkets";
import { LineGraphDataItem } from "@/app/models/LineGraphDataItem";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { getDaysFromTimeRange } from "@/app/utils/getDaysFromTimeRange";
import { getPercentageChangeDisplay } from "@/app/utils/getPercentageChange";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { FC, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Animated, PanResponder, PanResponderInstance } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import * as Haptics from 'expo-haptics';
import { AnimatedPath } from "@/components/Animation";
import { ActivityIndicator, Button } from "react-native-paper";
import { deleteAllCoinHistoryDataFromLocalStorageForId, getCoinHistoryDataPoints, getTotalPortfolioValueDataPoints } from "@/app/services/coinHistoryService";
import { useSQLiteContext } from "expo-sqlite";
import { UserTransaction } from "@/app/models/UserTransaction";

enum TextAlign {
    Auto = "auto",
    Center = "center",
    Left = "left",
    Right = "right",
    Justify = "justify"
}

interface LineGraphProps {
    coinsMarketsIds: string[],
    currencyType: string,
    width: number,
    height: number,
    refresh: React.Dispatch<React.SetStateAction<boolean>>,
    color: string,
    transactions?: UserTransaction[],
    onHighlightChange?: (isHighlighted: boolean) => void
    totalsGraph?: boolean,
    currentFolioId?: string
}

const textWidth = 60;
const textHeight = 20;
const iconWidth = 12;
const circleRadius = 12;

const AnimatedStop = Animated.createAnimatedComponent(Stop);

export const LineGraph: FC<LineGraphProps> = ({
    coinsMarketsIds,
    currencyType,
    width,
    height,
    refresh,
    color,
    transactions,
    onHighlightChange,
    totalsGraph,
    currentFolioId
}: LineGraphProps) => {
    const db = useSQLiteContext();
    const [priceChangeAmount, setPriceChangeAmount] = useState(0);
    const [priceChangePercentage, setPriceChangePercentage] = useState(0);
    const [highlightedDataPoint, setHighlightedDataPoint] = useState<LineGraphDataItem | null>(null);
    const [panResponder, setPanResponder] = useState<PanResponderInstance>();
    const [historicalLineGraphData, setHistoricalLineGraphData] = useState<CoinMarketHistoricalDataPoint[]>([]);
    const [isLoadingHistoricalData, setIsLoadingHistoricalData] = useState(true);
    const [timeRange, setTimeRange] = useState("24H");
    const [lineGraphData, setLineGraphData] = useState<LineGraphDataItem[]>([]);
    const [maxPrice, setMaxPrice] = useState(0);
    const [minPrice, setMinPrice] = useState(0);
    const [pathData, setPathData] = useState('');
    const [maxDataPoint, setMaxDataPoint] = useState<LineGraphDataItem | null>(null);
    const [minDataPoint, setMinDataPoint] = useState<LineGraphDataItem | null>(null);
    const [adjustments, setAdjustments] = useState({
        minText: { x: 0, y: 0, textAlign: TextAlign.Center, icon: 'keyboard-arrow-up', iconX: 0, iconY: 0 },
        maxText: { x: 0, y: 0, textAlign: TextAlign.Center, icon: 'keyboard-arrow-down', iconX: 0, iconY: 0 }
    });

    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        animatedValue.setValue(0);
        Animated.spring(animatedValue, {
            toValue: 1,
            tension: 2,
            friction: 10,
            useNativeDriver: false,
        }).start();
    }, [pathData, animatedValue, width, height]);

    const stopOffset = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    useEffect(() => {
        if (coinsMarketsIds.length > 0) {
            fetchHistoricalLineGraphData(coinsMarketsIds);
        } else {
            setIsLoadingHistoricalData(false);
            setHistoricalLineGraphData([]);
        }
    }, [refresh, coinsMarketsIds, timeRange]);

    const fetchHistoricalLineGraphData = async (coinsMarketIds: string[]) => {
        setIsLoadingHistoricalData(true);
        let historicalData = await getCoinHistoryDataPoints(db, coinsMarketIds);

        if (totalsGraph && transactions && transactions.length > 0 && currentFolioId) {
            await deleteAllCoinHistoryDataFromLocalStorageForId(db, 'total');
            const transactionsByFolioId = transactions.filter(transaction => transaction.folioId == currentFolioId);
            historicalData = getTotalPortfolioValueDataPoints(historicalData, transactionsByFolioId);
        }

        const sortedHistoricalDataPointList = [...historicalData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setHistoricalLineGraphData(filterHistoricalLineGraphDataByDate(sortedHistoricalDataPointList));
        setIsLoadingHistoricalData(false);
    };

    const filterHistoricalLineGraphDataByDate = (historicalData: CoinMarketHistoricalDataPoint[]) => {
        let days: number = getDaysFromTimeRange(timeRange);
        const currentDate = new Date();
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - days);

        return historicalData
            .filter((coin) => {
                const coinDate = new Date(coin.date);
                return coinDate >= startDate && coinDate <= currentDate;
            });
    };

    useEffect(() => {
        if (historicalLineGraphData.length > 0) {
            const sortedHistoricalDataPointList = [...historicalLineGraphData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            // Find the maximum and minimum current_price in the historicalDataPointList
            const maxPrice = Math.max(...sortedHistoricalDataPointList.map(dataPoint => dataPoint.currentPrice));
            const minPrice = Math.min(...sortedHistoricalDataPointList.map(dataPoint => dataPoint.currentPrice));

            if (isFinite(maxPrice) && isFinite(minPrice)) {
                setMaxPrice(maxPrice);
                setMinPrice(minPrice);

                // Find the maximum and minimum date in the historicalDataPointList
                const maxDate = new Date(sortedHistoricalDataPointList[sortedHistoricalDataPointList.length - 1].date).getTime();
                const minDate = new Date(sortedHistoricalDataPointList[0].date).getTime();

                if (maxDate > minDate) {
                    // Map the data points to x and y coordinates
                    const newLineGraphData: LineGraphDataItem[] = sortedHistoricalDataPointList.map(dataPoint => {
                        const x = ((new Date(dataPoint.date).getTime() - minDate) / (maxDate - minDate)) * width;
                        const y = ((dataPoint.currentPrice - minPrice) / (maxPrice - minPrice)) * (height / 1.5);
                        return {
                            x: isFinite(x) ? x : 0,
                            y: isFinite(y) ? y : 0,
                            value: dataPoint.currentPrice,
                            date: dataPoint.date
                        };
                    });

                    setLineGraphData(newLineGraphData);

                    // Calculate path data immediately after setting line graph data
                    if (newLineGraphData.length > 0) {
                        const newPathData = newLineGraphData.map((point, index) => {
                            const invertedY = height - point.y;
                            return `${index === 0 ? 'M' : 'L'} ${point.x} ${invertedY}`;
                        }).join(' ');
                        setPathData(newPathData);

                        // Set max and min data points
                        setMaxDataPoint(newLineGraphData.reduce((max, point) => (point.y > max.y ? point : max), newLineGraphData[0]));
                        setMinDataPoint(newLineGraphData.reduce((min, point) => (point.y < min.y ? point : min), newLineGraphData[0]));
                    }
                }
            }
        }
    }, [historicalLineGraphData, width, height, timeRange]);

    useEffect(() => {
        setPanResponder(PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                if (lineGraphData.length > 0) {
                    const touchX = gestureState.moveX;
                    const closestDataPoint = lineGraphData.reduce((prev, curr) => {
                        return Math.abs(curr.x - touchX) < Math.abs(prev.x - touchX) ? curr : prev;
                    }, lineGraphData[0]);
                    setHighlightedDataPoint(closestDataPoint);
                    onHighlightChange?.(true);
                }
            },
            onPanResponderRelease: () => {
                setHighlightedDataPoint(null);
                onHighlightChange?.(false);
            },
        }));
    }, [lineGraphData]);

    function timeRangeControlButton(value: string) {
        return <Button
            buttonColor="transparent"
            textColor={'white'}
            rippleColor={color}
            labelStyle={{ marginHorizontal: 0, marginVertical: 0, fontSize: 10 }}
            style={[styles.button, value === timeRange ?
                { opacity: 1, borderTopWidth: 2, borderColor: color }
                : { opacity: .5 }]}
            onPress={() => setTimeRange(value)}
            mode="contained">
            {value}
        </Button>;
    }

    const getDataAtDate = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        const dataPointsFromSameDay = historicalLineGraphData.filter(dataPoint => {
            const dataPointDate = new Date(dataPoint.date);
            return dataPointDate.getFullYear() === year &&
                dataPointDate.getMonth() === month &&
                dataPointDate.getDate() === day;
        });

        if (dataPointsFromSameDay.length === 0) {
            return historicalLineGraphData[0]; // Return the earliest data point if no data for the specified date
        }

        dataPointsFromSameDay.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return dataPointsFromSameDay[0];
    };

    const getPriceChange = (date: Date, returnPercentage: boolean = false) => {
        const dataPointAtDate = getDataAtDate(date);
        if (dataPointAtDate) {
            const latestPrice = highlightedDataPoint?.value ?? historicalLineGraphData[historicalLineGraphData.length - 1].currentPrice;
            const originalPrice = dataPointAtDate.currentPrice;
            const priceChange = latestPrice - originalPrice;

            if (returnPercentage) {
                const percentageChange = (priceChange / originalPrice) * 100;
                return percentageChange;
            }

            return priceChange;
        }
        return 0;
    };

    useEffect(() => {
        if (historicalLineGraphData.length > 0) {
            let days: number = getDaysFromTimeRange(timeRange);

            const currentDate = new Date();
            const pastDate = new Date(currentDate);
            pastDate.setDate(currentDate.getDate() - days);

            setPriceChangeAmount(getPriceChange(pastDate, false));
            setPriceChangePercentage(getPriceChange(pastDate, true));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }
    }, [historicalLineGraphData, timeRange, highlightedDataPoint]);

    useEffect(() => {
        if (minDataPoint && maxDataPoint && width > 0 && height > 0) {
            // Adjust the text label position if it goes outside the bounds
            let minTextAdjustedX = Math.max(0, Math.min(minDataPoint.x - textWidth / 2, width - textWidth));
            let minTextAdjustedY = Math.max(0, Math.min(minDataPoint.y - textHeight / 2, height - textHeight));
            let maxTextAdjustedX = Math.max(0, Math.min(maxDataPoint.x - textWidth / 2, width - textWidth));
            let maxTextAdjustedY = Math.max(0, Math.min(maxDataPoint.y - textHeight / 2, height - textHeight));
            // Adjust the icon label position if it goes outside the bounds
            let minIconAdjustedX = Math.max(0, Math.min(minDataPoint.x - iconWidth / 2, width - iconWidth));
            let minIconAdjustedY = Math.max(0, Math.min(minDataPoint.y - iconWidth / 2, height - iconWidth));
            let maxIconAdjustedX = Math.max(0, Math.min(maxDataPoint.x - iconWidth / 2, width - iconWidth));
            let maxIconAdjustedY = Math.max(0, Math.min(maxDataPoint.y - iconWidth / 2, height - iconWidth));

            let minIcon = 'keyboard-arrow-up';
            let maxIcon = 'keyboard-arrow-down';
            let minTextAlign: TextAlign = TextAlign.Center;
            let maxTextAlign: TextAlign = TextAlign.Center;

            if (minDataPoint.x - textWidth / 2 < 0) {
                minIcon = 'keyboard-arrow-left';
                minTextAlign = TextAlign.Left;
                minTextAdjustedX = minDataPoint.x + iconWidth;
                minTextAdjustedY = minDataPoint.y + textHeight / 2;
                minIconAdjustedX = minDataPoint.x;
                minIconAdjustedY += iconWidth / 2;
            } else if (minDataPoint.x + textWidth / 2 > width) {
                minIcon = 'keyboard-arrow-right';
                minTextAlign = TextAlign.Right;
                minTextAdjustedX = minDataPoint.x - textWidth - iconWidth;
                minTextAdjustedY = minDataPoint.y + textHeight / 2;
                minIconAdjustedX = minDataPoint.x - iconWidth;
                minIconAdjustedY += iconWidth / 2;
            } else {
                minTextAdjustedY += -(iconWidth / 2);
            }

            if (maxDataPoint.x - textWidth / 2 < 0) {
                maxIcon = 'keyboard-arrow-left';
                maxTextAlign = TextAlign.Left;
                maxTextAdjustedX = maxDataPoint.x + iconWidth;
                maxTextAdjustedY = maxDataPoint.y + textHeight / 2;
                maxIconAdjustedX = maxDataPoint.x;
                maxIconAdjustedY += iconWidth;
            } else if (maxDataPoint.x + textWidth / 2 > width) {
                maxIcon = 'keyboard-arrow-right';
                maxTextAlign = TextAlign.Right;
                maxTextAdjustedX = maxDataPoint.x - textWidth - iconWidth;
                maxTextAdjustedY = maxDataPoint.y + textHeight / 2;
                maxIconAdjustedX = maxDataPoint.x - iconWidth;
                maxIconAdjustedY += iconWidth;
            } else {
                maxIconAdjustedY += iconWidth + iconWidth / 2;
                maxTextAdjustedY += (textWidth / 2) + (iconWidth / 2);
            }
            setAdjustments({
                minText: { x: minTextAdjustedX, y: minTextAdjustedY, textAlign: minTextAlign, icon: minIcon, iconX: minIconAdjustedX, iconY: minIconAdjustedY },
                maxText: { x: maxTextAdjustedX, y: maxTextAdjustedY, textAlign: maxTextAlign, icon: maxIcon, iconX: maxIconAdjustedX, iconY: maxIconAdjustedY }
            });
        }
    }, [minDataPoint, maxDataPoint]);

    return (
        <View style={styles.container}>
            {isLoadingHistoricalData ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={color} />
                </View>
            ) : coinsMarketsIds.length === 0 || lineGraphData.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>No data available for {coinsMarketsIds[0]}</Text>
                </View>
            ) : (
                <>
                    <View style={styles.container} {...panResponder?.panHandlers}>
                        {isLoadingHistoricalData ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={color} />
                            </View>
                        ) : (
                            <><View style={[{ justifyContent: 'space-between', flexDirection: 'row' }]}>
                                <View style={[styles.pricingContainer]}>
                                    <View style={styles.pricingTitle}>
                                        <View style={[{ flexDirection: 'row' }]}>
                                            <Text style={[styles.headerTitle]}>
                                                {convertToCurrencyFormat(highlightedDataPoint?.value ?? historicalLineGraphData[historicalLineGraphData.length - 1]?.currentPrice, currencyType, false, true)}
                                            </Text>
                                            <Text style={[
                                                styles.percentageContainer,
                                                priceChangePercentage >= 0 ? styles.positive : styles.negative,
                                            ]}
                                            >
                                                {getPercentageChangeDisplay(priceChangePercentage)}%
                                            </Text>
                                        </View>
                                        <Text style={[styles.dateLabelText, { color: 'hsl(0, 0%, 80%)' }]}>
                                            {highlightedDataPoint ? new Date(highlightedDataPoint.date).toLocaleDateString() + " at " + new Date(highlightedDataPoint.date).toLocaleTimeString() : ''}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.priceChangeText, {
                                            color: 'hsl(0, 0%, 80%)',
                                        }]}>
                                            {convertToCurrencyFormat(priceChangeAmount, currencyType, true, true)}
                                            <MaterialIcons style={{
                                                color: priceChangeAmount >= 0 ? "#00ff00" : "red",
                                            }} name={priceChangeAmount >= 0 ? "arrow-drop-up" : "arrow-drop-down"} />
                                        </Text>
                                    </View>
                                </View>
                            </View>
                                <View style={styles.lineGraph}>
                                    <Svg width={width} height={height + circleRadius} translateY={-height / 7}>
                                        <Defs>
                                            <LinearGradient id={`grad-${pathData}-${timeRange}`} x1="50%" y1="0%" x2="50%" y2="75%">
                                                <Stop offset={0} stopColor={color} stopOpacity={1} />
                                                <AnimatedStop offset={stopOffset} stopColor={color} stopOpacity={0} />
                                            </LinearGradient>
                                            {lineGraphData.length > 0 && height && (
                                                <ClipPath id={`clip-${pathData}-${timeRange}`}>
                                                    <Path d={`M0,${height}
                                    L0,${height - (lineGraphData[0]?.y ?? 0)}
                                    L${width},${height - (lineGraphData[lineGraphData.length - 1]?.y ?? 0)}
                                    L${width},${height} ${pathData} Z`} />
                                                </ClipPath>
                                            )}
                                        </Defs>
                                        <G x={0} y={0} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                                            {lineGraphData.length > 0 && height && (
                                                <Rect
                                                    x={0}
                                                    y={0}
                                                    width={width}
                                                    height={height}
                                                    fill={`url(#grad-${pathData}-${timeRange})`}
                                                    clipPath={`url(#clip-${pathData}-${timeRange})`} />
                                            )}
                                            {Array.from({ length: 9 }).map((_, index) => (
                                                <Line
                                                    key={index}
                                                    x1="0"
                                                    y1={(index + 1) * (height / 20)}
                                                    x2={width}
                                                    y2={(index + 1) * (height / 20)}
                                                    stroke={'white'}
                                                    strokeOpacity={0.2}
                                                    strokeWidth="0.2"
                                                    strokeDasharray="4 2" />
                                            ))}
                                            <AnimatedPath
                                                d={pathData}
                                                stroke={color}
                                                strokeWidth="1"
                                                fill="none"
                                                strokeDashoffset={2200}
                                                strokeLinecap={"round"}
                                                strokeLinejoin={"bevel"} />
                                            <Text
                                                style={[styles.dataLabel, {
                                                    left: adjustments.maxText.x,
                                                    top: height - adjustments.maxText.y,
                                                    textAlign: adjustments.maxText.textAlign
                                                }]}
                                            >
                                                {convertToCurrencyFormat(maxPrice, currencyType, true, true)}
                                            </Text>
                                            <MaterialIcons style={[styles.dataLabel, {
                                                left: adjustments.maxText.iconX,
                                                top: height - adjustments.maxText.iconY,
                                                width: 12,
                                                height: 12,
                                                color: "#00ff00"
                                            }]} name={adjustments.maxText.icon} color={"#00ff00"} size={10} />

                                            <Text
                                                style={[styles.dataLabel, {
                                                    left: adjustments.minText.x,
                                                    top: height - adjustments.minText.y,
                                                    textAlign: adjustments.minText.textAlign
                                                }]}
                                            >
                                                {convertToCurrencyFormat(minPrice, currencyType, true, true)}
                                            </Text>
                                            <MaterialIcons style={[styles.dataLabel, {
                                                left: adjustments.minText.iconX,
                                                top: height - adjustments.minText.iconY,
                                                width: 12,
                                                height: 12,
                                                color: "red"
                                            }]} name={adjustments.minText.icon} color={"red"} size={10} />
                                            {highlightedDataPoint && (
                                                <>
                                                    <Circle
                                                        cx={highlightedDataPoint.x}
                                                        cy={height - highlightedDataPoint.y}
                                                        r={5}
                                                        fill="grey" />
                                                    <Circle
                                                        cx={highlightedDataPoint.x}
                                                        cy={height - highlightedDataPoint.y}
                                                        r={circleRadius}
                                                        fill={highlightedDataPoint.value >= historicalLineGraphData[0].currentPrice ? "#00ff00" : "red"}
                                                        opacity={0.5} />
                                                </>
                                            )}
                                        </G>
                                    </Svg>
                                </View></>
                        )}
                    </View>
                </>
            )}
            <View style={styles.buttonContainer}>
                {timeRangeControlButton("24H")}
                {timeRangeControlButton("7D")}
                {timeRangeControlButton("1M")}
                {timeRangeControlButton("1Y")}
                {timeRangeControlButton("ALL")}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pricingContainer: {
        display: "flex",
        flexDirection: "column",
        alignSelf: "flex-start",
        alignItems: "flex-start",
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    pricingTitle: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "left",
        color: "white",
    },
    priceChangeText: {
        color: "white",
        textAlign: "left",
        textAlignVertical: "center",
    },
    dateLabelText: {
        color: "hsl(0, 0%, 80%)",
        textAlign: "right",
        textAlignVertical: "center",
        fontSize: 12,
    },
    percentageContainer: {
        textAlign: "left",
        textAlignVertical: "center",
        paddingLeft: 5,
        fontSize: 15,
    },
    positive: {
        color: "#00ff00",
    },
    negative: {
        color: "red",
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        alignContent: 'center',
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
        color: "hsl(0, 0%, 80%)",
        width: textWidth,
        height: textHeight,
        fontSize: 10
    },
    buttonContainer: {
        backgroundColor: "transparent",
        flexDirection: "row",
        justifyContent: "space-evenly",
        height: 20
    },
    button: {
        width: "20%",
        borderRadius: 5,
        borderWidth: 0,
        borderColor: "rgba(255, 255, 255, 1)",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
    errorText: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 20,
        color: "white",
    }
});
