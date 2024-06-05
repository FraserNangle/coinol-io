import React, {
    useState,
    useMemo,
    useEffect,
    useRef,
} from "react";
import { useFocusEffect } from "expo-router";
import { View, StyleSheet, Image } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedSection } from "@/app/slices/selectedSectionSlice";
import { donutChartColors } from "@/app/styling/donutChartColors";
import Svg, { G, Text, Circle } from "react-native-svg";
import { Section } from "./section";
import { RootState } from "@/app/store/store";
import { UserTransaction } from "@/app/models/UserTransaction";
import { FolioEntry } from "@/app/models/FolioEntry";


interface DonutChartProps {
    data: FolioEntry[],
    width: number,
    height: number,
    backgroundColor: string,
    currencyTicker: string,
}

export const DonutChart: React.FC<DonutChartProps> = ({
    data,
    width,
    height,
    backgroundColor = "white",
    currencyTicker = "USD",
}: DonutChartProps) => {

    const styles = getStyles();

    const dispatch = useDispatch();
    let selectedSection = useSelector((state: RootState) => state.selectedSection.section);
    let lastTransaction = useSelector((state: RootState) => state.lastTransaction.transactionId);

    const [outerRadius, setOuterRadius] = useState(150);
    const [thickness, setThickness] = useState(30);
    const [displayMode, setDisplayMode] = useState("percentage");

    //TODO - convert all this logic to use React Hooks so that the section indexes work properly

    const totalPortfolioValue = data.reduce((acc, folioEntry) => acc + (folioEntry.quantity * folioEntry.currentPrice), 0);

    const significantItems = data.filter(
        (folioEntry) => (folioEntry.quantity * folioEntry.currentPrice) / totalPortfolioValue >= 0.05
    );

    const otherItemValue = data.reduce((acc, folioEntry) => {
        if ((folioEntry.quantity * folioEntry.currentPrice) / totalPortfolioValue < 0.05) {
            return acc + (folioEntry.quantity * folioEntry.currentPrice);
        }
        return acc;
    }, 0);

    const otherSectionDetails = {
        name: "Other",
        currentPrice: otherItemValue,
        quantity: 0,
        id: "other",
        ticker: "OTHER",
        priceChangePercentage24h: 0,
        ranking: 0
    }

    if (otherItemValue > 0) {
        significantItems.push(otherSectionDetails);
    }

    const sortedData = useMemo(() => {
        return [...significantItems].sort((a, b) => (b.currentPrice * b.quantity) - (a.currentPrice * a.quantity));
    }, [significantItems]);

    const minSliceAngle = 2 * Math.PI * 0.05;
    let startAngle = -Math.PI / 2;
    let accumulatedValue = 0;

    let sections = sortedData.map((folioEntry) => {
        const gapSize = 2 / outerRadius;
        const sliceAngle = Math.max(
            2 * Math.PI * ((folioEntry.quantity * folioEntry.currentPrice) / totalPortfolioValue),
            minSliceAngle
        );
        const startAngleGap = startAngle + gapSize;
        const endAngle = startAngleGap + sliceAngle - 2 * gapSize;
        const s = {
            ...folioEntry,
            startAngle: startAngleGap,
            endAngle,
            accumulatedValue,
        };
        startAngle = endAngle + gapSize;
        accumulatedValue += (folioEntry.quantity * folioEntry.currentPrice);
        return s;
    });

    const totalAngle = sections.reduce(
        (total, section) => total + (section.endAngle - section.startAngle),
        0
    );

    if (totalAngle > 2 * Math.PI) {
        const scale = (2 * Math.PI) / totalAngle;
        let startAngle = -Math.PI / 2;

        sections = sections.map((section) => {
            const gapSize = 2 / outerRadius;
            const sliceAngle = (section.endAngle - section.startAngle) * scale;
            const startAngleGap = startAngle + gapSize * scale;
            const endAngle = startAngleGap + sliceAngle - 2 * gapSize * scale;
            const s = { ...section, startAngle: startAngleGap, endAngle };
            startAngle = endAngle + gapSize * scale;
            return s;
        });
    }

    let displayValue;
    if (displayMode === "percentage" && selectedSection?.details) {
        const percentage = ((selectedSection?.details?.currentPrice * selectedSection?.details?.quantity) / totalPortfolioValue) * 100;
        displayValue = `${percentage.toFixed(2)}%`;
    } else if (displayMode === "value" && selectedSection?.details?.currentPrice) {
        displayValue = formatCurrency(selectedSection?.details.currentPrice, currencyTicker);
    } else if (displayMode === "quantity" && selectedSection?.details?.quantity) {
        displayValue = formatQuantity(Number(selectedSection?.details.quantity));
    }

    useEffect(() => {
        if (sections.length > 0) {
            dispatch(
                setSelectedSection({ details: sections[0], index: 0, color: donutChartColors[0] })
            );
        }
    }, []);

    useEffect(() => {
        setThickness(outerRadius * 0.3);
    }, [outerRadius]);

    const toggleDisplayMode = React.useCallback(() => {
        setDisplayMode((prevMode) => {
            let newMode;
            switch (prevMode) {
                case "percentage":
                    newMode = "value";
                    break;
                case "value":
                    newMode = "quantity";
                    break;
                case "quantity":
                default:
                    newMode = "percentage";
                    break;
            }
            return newMode;
        });
    }, [selectedSection]);

    const circleSize = 10;

    function formatQuantity(quantity: number) {
        if (quantity >= 1e9) {
            return (quantity / 1e9).toFixed(2) + 'B';
        } else if (quantity >= 1e6) {
            return (quantity / 1e6).toFixed(2) + 'M';
        } else {
            return new Intl.NumberFormat().format(quantity);
        }
    }

    function formatCurrency(value: number, currencyTicker: string) {
        if (value >= 1e9) {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currencyTicker,
            }).format(value / 1e9) + 'B';
        } else if (value >= 1e6) {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currencyTicker,
            }).format(value / 1e6) + 'M';
        } else {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currencyTicker,
            }).format(value);
        }
    }


    return (
        <View
            style={styles.container}
            onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setOuterRadius(Math.min(width, height) / 2.5 / 1.1);
            }}
        >
            <Svg width={width} height={height}>
                <G x={width / 2} y={height / 2}>
                    {sections.map((section, index) => (
                        <Section
                            key={section.id}
                            section={section}
                            index={index}
                            totalValue={totalPortfolioValue}
                            outerRadius={outerRadius}
                            totalSections={sections.length}
                        />
                    ))}
                    <Circle
                        r={outerRadius - thickness}
                        fill={backgroundColor}
                        onPressIn={toggleDisplayMode}
                    />
                    {selectedSection && (
                        <View>
                            <Text style={styles.selectedSliceValue}>
                                {displayValue}
                            </Text>
                            {selectedSection.image ? (
                                <Image
                                    source={{ uri: selectedSection.image }}
                                    style={[
                                        styles.selectedSliceImage,
                                        { width: circleSize * 2, height: circleSize * 2 },
                                    ]}
                                />
                            ) : (
                                <G style={styles.selectedSliceCircle}>
                                    <Circle r={circleSize} fill={selectedSection.color} />
                                </G>
                            )}
                            <Text style={styles.selectedSliceName}>
                                {selectedSection.details?.name}
                            </Text>
                        </View>
                    )}
                </G>
            </Svg>
        </View>
    );
};

const getStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            backgroundColor: "black",
        },
        selectedSliceValue: {
            y: -10,
            textAnchor: "middle",
            fill: "white",
            fontSize: 24,
        },
        selectedSliceImage: {
            width: 20,
            height: 20,
        },
        selectedSliceCircle: {
            y: 10,
            x: -13,
        },
        selectedSliceName: {
            y: 10,
            x: 2,
            dy: "0.35em",
            fill: "rgba(255, 255, 255, 0.5)",
        },
    });