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
    const selectedSection = useSelector((state: RootState) => state.selectedSection.id);
    const transaction = useSelector((state: RootState) => state.lastTransaction.transactionId);

    const [outerRadius, setOuterRadius] = useState(150);
    const [thickness, setThickness] = useState(30);
    const [displayMode, setDisplayMode] = useState("percentage");

    const totalPortfolioValue = data.reduce((acc, section) => acc + section.currentPrice, 0);

    const significantItems = data.filter(
        (section) => section.currentPrice / totalPortfolioValue >= 0.05
    );

    const otherItemValue = data.reduce((acc, section) => {
        if (section.currentPrice / totalPortfolioValue < 0.05) {
            return acc + section.currentPrice;
        }
        return acc;
    }, 0);

    if (otherItemValue > 0) {
        significantItems.push({
            name: "Other",
            currentPrice: otherItemValue,
            quantity: 0,
            id: "other",
            ticker: "OTH",
            priceChangePercentage24h: 0,
            ranking: 0
        });
    }

    const sortedData = useMemo(() => {
        return [...significantItems].sort((a, b) => b.currentPrice - a.currentPrice);
    }, [significantItems]);

    const minSliceAngle = 2 * Math.PI * 0.05;
    let startAngle = -Math.PI / 2;
    let accumulatedValue = 0;

    let sections = sortedData.map((section) => {
        const gapSize = 2 / outerRadius;
        const sliceAngle = Math.max(
            2 * Math.PI * (section.currentPrice / totalPortfolioValue),
            minSliceAngle
        );
        const startAngleGap = startAngle + gapSize;
        const endAngle = startAngleGap + sliceAngle - 2 * gapSize;
        const s = {
            ...section,
            startAngle: startAngleGap,
            endAngle,
            accumulatedValue,
        };
        startAngle = endAngle + gapSize;
        accumulatedValue += section.currentPrice;
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

    /* useFocusEffect(
        React.useCallback(() => {
            if (sections.length > 0) {
                dispatch(
                    setSelectedSection({ index: 0, name: sections[0].name })
                );
            }
        }, [dispatch])
    ); */

    useEffect(() => {
        setThickness(outerRadius * 0.3);
    }, [outerRadius]);

    /*     const prevSelectedSectionRef = useRef();
    
        useFocusEffect(
            React.useCallback(() => {
                prevSelectedSectionRef.current = selectedSection;
            }, [selectedSection])
        ); */

    /*     useFocusEffect(
            React.useCallback(() => {
                const prevSelectedSection = prevSelectedSectionRef.current;
                if (
                    selectedSection !== prevSelectedSection &&
                    (
                        (displayMode === "percentage" && !((selectedSection?.value / totalPortfolioValue) * 100)) ||
                        (displayMode === "value" && !selectedSection?.value) ||
                        (displayMode === "quantity" && !selectedSection?.quantity)
                    )
                ) {
                    toggleDisplayMode();
                }
            }, [selectedSection, displayMode, toggleDisplayMode])
        ); */


    const toggleDisplayMode = React.useCallback(() => {
        /* setDisplayMode((prevMode) => {
            let newMode;
            switch (prevMode) {
                case "percentage":
                    newMode = selectedSection?.value ? "value" : "quantity";
                    break;
                case "value":
                    newMode = selectedSection?.quantity ? "quantity" : "percentage";
                    break;
                case "quantity":
                default:
                    newMode =
                        (selectedSection?.value / totalPortfolioValue) * 100
                            ? "percentage"
                            : "value";
                    break;
            }
            return newMode;
        }); */
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
                if (transaction) {
                    setSelectedSection(transaction)
                }
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
                                {displayMode === "percentage" &&
                                    (selectedSection.value / totalPortfolioValue) * 100
                                    ? `${((selectedSection.value / totalPortfolioValue) * 100).toFixed(2)}%`
                                    : displayMode === "value" && selectedSection.value
                                        ? formatCurrency(selectedSection.value, currencyTicker)
                                        : displayMode === "quantity" && selectedSection.quantity
                                            ? formatQuantity(Number(selectedSection.quantity))
                                            : null}
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
                                {selectedSection.name}
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