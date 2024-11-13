import { CoinMarketHistoricalDataPoint } from "@/app/models/CoinsMarkets";
import { LineGraphDataItem } from "@/app/models/LineGraphDataItem";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { getDaysFromTimeRange } from "@/app/utils/getDaysFromTimeRange";
import { getPercentageChangeDisplay } from "@/app/utils/getPercentageChange";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, LayoutChangeEvent, Animated, PanResponder, PanResponderInstance } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import * as Haptics from 'expo-haptics';
import { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import { AnimatedPath } from "@/components/Animation";

type TextAlign = "auto" | "center" | "left" | "right" | "justify";

interface LineGraphProps {
    data: CoinMarketHistoricalDataPoint[],
    currencyType: string,
    width: number,
    height: number,
    timeRange: string,
}

const textWidth = 60;
const textHeight = 20;
const iconWidth = 12;

const AnimatedStop = Animated.createAnimatedComponent(Stop);

export const LineGraph: React.FC<LineGraphProps> = ({
    data,
    currencyType,
    width,
    height,
    timeRange
}: LineGraphProps) => {
    const [viewLayout, setViewLayout] = useState({ width: 0, height: 0 });
    const [priceChangeAmount, setPriceChangeAmount] = useState(0);
    const [priceChangePercentage, setPriceChangePercentage] = useState(0);
    const [highlightedDataPoint, setHighlightedDataPoint] = useState<LineGraphDataItem | null>(null);
    const [panResponder, setPanResponder] = useState<PanResponderInstance>();
    const animatedValue = useRef(new Animated.Value(0)).current;
    const strokeDashoffset = useSharedValue(2200);

    useEffect(() => {
        strokeDashoffset.value = withTiming(0, { duration: 1000 });
    }, [data]);

    const animatedPathProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: strokeDashoffset.value,
        };
    });

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [animatedValue, timeRange]);

    const stopOffset = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });

    // Sort the historicalDataPointList by date
    const sortedHistoricalDataPointList = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find the maximum and minimum current_price in the historicalDataPointList
    const maxPrice = Math.max(...sortedHistoricalDataPointList.map(dataPoint => dataPoint.currentPrice));
    const minPrice = Math.min(...sortedHistoricalDataPointList.map(dataPoint => dataPoint.currentPrice));

    // Find the maximum and minimum date in the historicalDataPointList
    const maxDate = new Date(sortedHistoricalDataPointList[sortedHistoricalDataPointList.length - 1].date).getTime();
    const minDate = new Date(sortedHistoricalDataPointList[0].date).getTime();

    // Map the data points to x and y coordinates
    const lineGraphData: LineGraphDataItem[] = sortedHistoricalDataPointList.map(dataPoint => {
        const x = ((new Date(dataPoint.date).getTime() - minDate) / (maxDate - minDate)) * width;
        const y = ((dataPoint.currentPrice - minPrice) / (maxPrice - minPrice)) * (viewLayout.height / 2);
        const value = dataPoint.currentPrice;
        const date = dataPoint.date;
        return { x, y, value, date };
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

    const getDataAtDate = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        const dataPointsFromSameDay = sortedHistoricalDataPointList.filter(dataPoint => {
            const dataPointDate = new Date(dataPoint.date);
            return dataPointDate.getFullYear() === year &&
                dataPointDate.getMonth() === month &&
                dataPointDate.getDate() === day;
        });

        if (dataPointsFromSameDay.length === 0) {
            return sortedHistoricalDataPointList[0]; // Return the earliest data point if no data for the specified date
        }

        dataPointsFromSameDay.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return dataPointsFromSameDay[0];
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
        maxIconAdjustedY += iconWidth;
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

    const getPriceChange = (date: Date, returnPercentage: boolean = false) => {
        const dataPointAtDate = getDataAtDate(date);
        if (dataPointAtDate) {
            const latestPrice = highlightedDataPoint?.value ?? sortedHistoricalDataPointList[sortedHistoricalDataPointList.length - 1].currentPrice;
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
        if (data.length > 0) {
            let days: number = getDaysFromTimeRange(timeRange);

            const currentDate = new Date();
            const pastDate = new Date(currentDate);
            pastDate.setDate(currentDate.getDate() - days);

            setPriceChangeAmount(getPriceChange(pastDate, false));
            setPriceChangePercentage(getPriceChange(pastDate, true));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }
    }, [data, timeRange, highlightedDataPoint]);

    useEffect(() => {
        setPanResponder(PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                const touchX = gestureState.moveX;
                const closestDataPoint = lineGraphData.reduce((prev, curr) => {
                    return Math.abs(curr.x - touchX) < Math.abs(prev.x - touchX) ? curr : prev;
                }, lineGraphData[0]);
                setHighlightedDataPoint(closestDataPoint);
            },
            onPanResponderRelease: () => {
                setHighlightedDataPoint(null);
            },
        }));
    }, [timeRange, data, pathData]);

    return (
        <View style={styles.container} onLayout={handleLayout} {...panResponder?.panHandlers}>
            <View style={[{ justifyContent: 'space-between', flexDirection: 'row' }]}>
                <View style={[styles.pricingContainer]}>
                    <View style={styles.pricingTitle}>
                        <View style={[{ flexDirection: 'row' }]}>
                            <Text style={styles.headerTitle}>
                                {convertToCurrencyFormat(highlightedDataPoint?.value ?? sortedHistoricalDataPointList[sortedHistoricalDataPointList.length - 1].currentPrice, currencyType, false)}
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
                            {convertToCurrencyFormat(priceChangeAmount, currencyType, true)}
                            <MaterialIcons style={{
                                color: priceChangeAmount >= 0 ? "#00ff00" : "red",
                            }} name={priceChangeAmount >= 0 ? "arrow-drop-up" : "arrow-drop-down"} />
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.lineGraph}>
                <Svg width={width} height={height} translateY={height / 6}>
                    <Defs>
                        <LinearGradient id={`grad-${pathData}-${timeRange}`} x1="50%" y1="35%" x2="50%" y2="0%">
                            <AnimatedStop offset={stopOffset} stopColor="transparent" stopOpacity="0" />
                            <Stop offset={1} stopColor="white" stopOpacity="1" />
                        </LinearGradient>
                        <ClipPath id={`clip-${pathData}-${timeRange}`}>
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
                            fill={`url(#grad-${pathData}-${timeRange})`}
                            clipPath={`url(#clip-${pathData}-${timeRange})`}
                        />
                        {Array.from({ length: 9 }).map((_, index) => (
                            <Line
                                key={index}
                                x1="0"
                                y1={(index + 1) * (height / 20)}
                                x2={width}
                                y2={(index + 1) * (height / 20)}
                                stroke="white"
                                strokeOpacity={0.2}
                                strokeWidth="0.2"
                                strokeDasharray="4 2"
                            />
                        ))}
                        <AnimatedPath
                            d={pathData}
                            stroke="white"
                            strokeWidth="1"
                            fill="none"
                            strokeLinecap={"round"}
                            strokeLinejoin={"bevel"}
                            //strokeDasharray={2200} // TODO: Adjust this value for the animation
                            animatedProps={animatedPathProps}
                        />
                        {highlightedDataPoint && (
                            <>
                                <Circle
                                    cx={highlightedDataPoint.x}
                                    cy={viewLayout.height - highlightedDataPoint.y}
                                    r={5}
                                    fill="grey"
                                />
                                <Circle
                                    cx={highlightedDataPoint.x}
                                    cy={viewLayout.height - highlightedDataPoint.y}
                                    r={12}
                                    fill={highlightedDataPoint.value >= sortedHistoricalDataPointList[0].currentPrice ? "#00ff00" : "red"}
                                    opacity={0.5}
                                />
                            </>
                        )}
                        <Text
                            style={[styles.dataLabel, {
                                left: maxTextAdjustedX,
                                top: viewLayout.height - maxTextAdjustedY,
                                textAlign: maxTextAlign
                            }]}
                        >
                            {convertToCurrencyFormat(maxPrice, currencyType, true)}
                        </Text>
                        <MaterialIcons style={[styles.dataLabel, {
                            left: maxIconAdjustedX,
                            top: viewLayout.height - maxIconAdjustedY,
                            width: 12,
                            height: 12,
                            color: "#00ff00"
                        }]} name={maxIcon} color={"#00ff00"} size={10} />

                        <Text
                            style={[styles.dataLabel, {
                                left: minTextAdjustedX,
                                top: viewLayout.height - minTextAdjustedY,
                                textAlign: minTextAlign
                            }]}
                        >
                            {convertToCurrencyFormat(minPrice, currencyType, true)}
                        </Text>
                        <MaterialIcons style={[styles.dataLabel, {
                            left: minIconAdjustedX,
                            top: viewLayout.height - minIconAdjustedY,
                            width: 12,
                            height: 12,
                            color: "red"
                        }]} name={minIcon} color={"red"} size={10} />
                    </G>
                </Svg>
            </View>
        </View >
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
        justifyContent: 'center',
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
})