import React, {
    useState,
    useEffect,
} from "react";
import { View, StyleSheet, Image } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedSection } from "@/app/slices/selectedSectionSlice";
import { donutChartColors } from "@/app/styling/donutChartColors";
import Svg, { G, Text, Circle } from "react-native-svg";
import { Section } from "./section";
import { RootState } from "@/app/store/store";
import { FolioEntry, SectionFolioEntry } from "@/app/models/FolioEntry";
import {
    interpolate,
} from "react-native-reanimated";


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
    let lastTransaction = useSelector((state: RootState) => state.lastTransaction.transaction);

    const [outerRadius, setOuterRadius] = useState(150);
    const [thickness, setThickness] = useState(30);
    const [displayMode, setDisplayMode] = useState("percentage");
    const [significantItems, setSignificantItems] = useState<FolioEntry[]>([]);
    const [sortedData, setSortedData] = useState<FolioEntry[]>([]);
    const [otherItemValue, setOtherItemValue] = useState(0);
    const [sections, setSections] = useState<SectionFolioEntry[]>([]);
    const [refreshCount, setRefreshCount] = useState(0);
    const [otherSectionDetails, setOtherSectionDetails] = useState<FolioEntry>({
        name: "Other",
        currentPrice: 0,
        quantity: 0,
        id: "other",
        ticker: "OTHER",
        priceChangePercentage24h: 0,
        ranking: 0
    });

    const minSliceAngle = 2 * Math.PI * 0.05;

    const totalPortfolioValue = useSelector(
        (state: any) => state?.totalPortfolioValue?.totalPortfolioValue
    );

    const forceRefresh = () => {
        setRefreshCount((prevCount) => prevCount + 1);
    };

    useEffect(() => {
        console.log("Data changed, refreshing...");
        forceRefresh();
    }, [data]);

    useEffect(() => {
        if (totalPortfolioValue === 0) {
            console.log("Total Portfolio Value is 0");
            return;
        }

        setSignificantItems(data.filter((folioEntry) =>
            (folioEntry?.quantity * folioEntry?.currentPrice) / totalPortfolioValue >= 0.05
        ));

        setOtherSectionDetails(details => ({
            ...details,
            currentPrice: (() => {
                let smallEntries = 0;
                const total = data.reduce((acc, folioEntry) => {
                    if ((folioEntry?.quantity * folioEntry?.currentPrice) / totalPortfolioValue < 0.05) {
                        smallEntries += 1;
                        return acc + folioEntry?.currentPrice;
                    }
                    return acc;
                }, 0);
                return smallEntries > 0 ? total / smallEntries : 0;
            })(),
            quantity: (() => {
                let smallEntries = 0; // Initialize counter for entries that pass the condition
                const totalQuantity = data.reduce((acc, folioEntry) => {
                    if ((folioEntry?.quantity * folioEntry?.currentPrice) / totalPortfolioValue < 0.05) {
                        smallEntries += 1; // Increment counter for each entry that passes the condition
                        return acc + folioEntry?.quantity;
                    }
                    return acc;
                }, 0);
                return smallEntries > 0 ? totalQuantity / smallEntries : 0; // Divide total by count if count is not zero
            })()
        }));
        setOtherItemValue(data.reduce((acc, folioEntry) => {
            if ((folioEntry?.quantity * folioEntry?.currentPrice) / totalPortfolioValue < 0.05) {
                return acc + (folioEntry?.quantity * folioEntry?.currentPrice);
            }
            return acc;
        }, 0));

    }, [data, totalPortfolioValue]);

    useEffect(() => {
        if (otherItemValue > 0) {
            setSignificantItems((prevItems) => {
                const filteredItems = prevItems.filter(item => item.id !== "other");
                return [...filteredItems, otherSectionDetails];
            });
        }
    }, [otherSectionDetails, data]);

    useEffect(() => {
        setSortedData([...significantItems].sort((a, b) => (b.currentPrice * b.quantity) - (a.currentPrice * a.quantity)));
    }, [significantItems]);

    useEffect(() => {
        setSections([]);
        let startAngle = -Math.PI / 2;
        let accumulatedValue = 0;

        setSections(sortedData.map((folioEntry) => {
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
                color: donutChartColors[0],
            };
            startAngle = endAngle + gapSize;
            accumulatedValue += (folioEntry.quantity * folioEntry.currentPrice);
            return s;
        }));

    }, [sortedData]);

    useEffect(() => {
        const totalAngle = sections.reduce(
            (total, section) => total + (section.endAngle - section.startAngle),
            0
        );

        if (totalAngle > 2 * Math.PI) {
            const scale = (2 * Math.PI) / totalAngle;
            let startAngle = -Math.PI / 2;

            setSections(sections.map((section) => {
                const gapSize = 2 / outerRadius;
                const sliceAngle = (section.endAngle - section.startAngle) * scale;
                const startAngleGap = startAngle + gapSize * scale;
                const endAngle = startAngleGap + sliceAngle - 2 * gapSize * scale;
                const s = { ...section, startAngle: startAngleGap, endAngle };
                startAngle = endAngle + gapSize * scale;
                return s;
            }));
        }
    }, [sections]);

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
        if (sections.length > 0 && selectedSection === undefined) {
            dispatch(
                setSelectedSection({ details: sections[0], index: 0, color: donutChartColors[0] })
            );
        }
    }, [sections]);

    // If lastTransaction is set, find the section with the same id and dispatch setSelectedSection with its details
    useEffect(() => {
        if (sections.length > 0) {

            const lastTransactionSection = sections.find(section => section.id === lastTransaction?.id);

            const matchingSection = lastTransactionSection || sections.find(section => section.id === "other") || sections[0];

            // If a matching section is found, dispatch setSelectedSection with its details
            if (matchingSection) {
                dispatch(
                    setSelectedSection({
                        details: matchingSection,
                        index: sections.indexOf(matchingSection),
                        color: matchingSection?.color
                    })
                );
            }
        }
    }, [sections, lastTransaction, dispatch]);

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
                    {sections.map((section, index) => {

                        const colorIndex = interpolate(
                            index,
                            [0, sections.length - 1],
                            [0, donutChartColors.length - 1]
                        );
                        const roundedColorIndex = Math.round(colorIndex);
                        const color = donutChartColors[roundedColorIndex];

                        section.color = color;

                        return (
                            <Section
                                key={`${section.id}-${refreshCount}`}
                                section={section}
                                index={index}
                                totalValue={totalPortfolioValue}
                                outerRadius={outerRadius}
                                color={color}
                            />
                        );
                    })}
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