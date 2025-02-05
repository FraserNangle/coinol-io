import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedSection } from "@/app/slices/selectedSectionSlice";
import Svg, { G, Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { Section } from "./section";
import { RootState } from "@/app/store/store";
import { FolioEntry, SectionFolioEntry } from "@/app/models/FolioEntry";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from 'expo-haptics';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from 'expo-image';


interface DonutChartProps {
    data: FolioEntry[],
    width: number,
    height: number,
    currencyTicker: string,
}

const AnimatedStop = Animated.createAnimatedComponent(Stop);

export const DonutChart: React.FC<DonutChartProps> = ({
    data,
    width,
    height,
    currencyTicker = "USD",
}: DonutChartProps) => {

    const styles = getStyles();

    const dispatch = useDispatch();
    const selectedSection = useSelector(
        (state: RootState) => state.selectedSection.section
    );
    const lastTransaction = useSelector((state: RootState) => state.lastTransaction.transaction);

    const [outerRadius, setOuterRadius] = useState(150);
    const [thickness, setThickness] = useState(30);
    const [displayMode, setDisplayMode] = useState("percentage");
    const [sortedData, setSortedData] = useState<FolioEntry[]>([]);
    const [sections, setSections] = useState<SectionFolioEntry[]>([]);
    const [refreshCount, setRefreshCount] = useState(0);
    const radialGradientValue = useRef(new Animated.Value(0)).current;

    const centerX = width / 2;
    const centerY = height / 2;
    const minSliceAngle = 2 * Math.PI * 0.02;
    const circleSize = 10;

    const totalPortfolioValue = useSelector(
        (state: any) => state?.totalPortfolioValue?.totalPortfolioValue
    );

    useEffect(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }, [selectedSection]);

    const forceRefresh = () => {
        setRefreshCount((prevCount) => prevCount + 1);
    };

    useEffect(() => {
        forceRefresh();
    }, [data]);

    useEffect(() => {
        radialGradientValue.setValue(0);
        Animated.timing(radialGradientValue, {
            toValue: 100,
            duration: 3300,
            useNativeDriver: false,
        }).start();
    }, [data]);

    const stopOffset = radialGradientValue.interpolate({
        inputRange: [0, 100],
        outputRange: [0, .5],
    });

    useEffect(() => {
        if (totalPortfolioValue === 0) {
            return;
        }
        setSortedData([...data].sort((a, b) => (b.currentPrice * b.quantity) - (a.currentPrice * a.quantity)));
    }, [data, totalPortfolioValue]);

    useEffect(() => {
        let startAngle = -Math.PI / 2;
        let accumulatedValue = 0;

        const newSections = sortedData.map((folioEntry) => {
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
                color: folioEntry.color,
            };
            startAngle = endAngle + gapSize;
            accumulatedValue += (folioEntry.quantity * folioEntry.currentPrice);
            return s;
        });

        const totalAngle = newSections.reduce(
            (total, section) => total + (section.endAngle - section.startAngle),
            0
        );

        const totalGapSize = 2 * newSections.length / outerRadius;

        if (totalAngle + totalGapSize > 2 * Math.PI) {
            const scale = (2 * Math.PI) / totalAngle;
            startAngle = -Math.PI / 2;

            const scaledSections = newSections.map((section) => {
                const gapSize = 2 / outerRadius;
                const sliceAngle = (section.endAngle - section.startAngle) * scale;
                const startAngleGap = startAngle + gapSize * scale;
                const endAngle = startAngleGap + sliceAngle - 2 * gapSize * scale;
                const s = { ...section, startAngle: startAngleGap, endAngle };
                startAngle = endAngle + gapSize * scale;
                return s;
            });

            setSections(scaledSections);
        } else {
            setSections(newSections);
        }
    }, [sortedData, outerRadius, totalPortfolioValue, minSliceAngle]);

    useEffect(() => {
        if (sections.length > 0) {
            if (sections?.find(section => section.coinId === selectedSection?.details?.coinId) === undefined) {
                dispatch(
                    setSelectedSection({ details: sections[0], index: 0, color: sections[0].color })
                );
                return;
            }
            const lastTransactionSection = sections.find(section => section.coinId === lastTransaction?.coinId);

            const matchingSection = lastTransactionSection || sections[selectedSection?.index ?? 0];

            // If a matching section is found, dispatch setSelectedSection with its details
            if (matchingSection) {
                dispatch(
                    setSelectedSection({
                        details: matchingSection,
                        index: sections.indexOf(matchingSection),
                    })
                );
            }
        }
    }, [sections, lastTransaction]);

    useEffect(() => {
        setThickness(outerRadius * 0.3);
    }, [outerRadius]);

    const toggleDisplayMode = useCallback(() => {
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

    const getDisplayValue = useCallback(() => {
        if (displayMode === "percentage" && selectedSection?.details) {
            const percentage = ((selectedSection?.details?.currentPrice * selectedSection?.details?.quantity) / totalPortfolioValue) * 100;
            return `${percentage.toFixed(2)}%`;
        } else if (displayMode === "value" && selectedSection?.details?.currentPrice) {
            return formatCurrency(selectedSection?.details.currentPrice, currencyTicker);
        } else if (displayMode === "quantity" && selectedSection?.details?.quantity) {
            return formatQuantity(Number(selectedSection?.details.quantity));
        }
    }, [selectedSection, displayMode, totalPortfolioValue, refreshCount]);

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

    const pan = Gesture.Pan()
        .onChange((event) => {
            const { absoluteX: x, absoluteY: y } = event;
            sections.forEach((section, index) => {
                const pointIsInSection = isPointInSection(x, y, section);
                if (pointIsInSection) {
                    if (selectedSection?.details?.coinId === section.coinId) {
                        return;
                    } else {
                        dispatch(setSelectedSection({ details: section, index: index }));
                    }
                }
            });
        }).runOnJS(true);

    function isPointInSection(x: number, y: number, section: SectionFolioEntry): boolean {

        const innerRadius = outerRadius - thickness;

        const dx = x - centerX;
        const dy = y - (centerY + height / 4);

        if (dx * dx + dy * dy < innerRadius * innerRadius || dx * dx + dy * dy > outerRadius * outerRadius) {
            return false;
        }

        let angle = Math.atan2(dy, dx);

        // Normalize the angle to start at -Math.PI / 2
        angle -= -Math.PI / 2;

        // Ensure the angle is within the range [0, 2 * Math.PI]
        if (angle < 0) {
            angle += 2 * Math.PI;
        }

        // Check if the angle is within the range [-Math.PI / 2, 3 * Math.PI / 2]
        const normalizedStartAngle = section.startAngle - -Math.PI / 2;
        const normalizedEndAngle = section.endAngle - -Math.PI / 2;

        const isInSection = angle >= normalizedStartAngle && angle <= normalizedEndAngle;

        return isInSection;
    }

    const sliceDisplayWidth = 150;
    return (
        <GestureDetector gesture={pan}>
            <View
                style={styles.container}
                onLayout={() => {
                    setOuterRadius(Math.min(width, height) / 2.5 / 1.1);
                }}
            >
                <Svg width={width} height={height}>
                    <Defs>
                        <RadialGradient
                            id="grad"
                            cx="50%"
                            cy="50%"
                            r="50%"
                            fx="50%"
                            fy="50%"
                        >
                            <Stop offset="0%" stopColor={'white'} stopOpacity=".3" />
                            <AnimatedStop offset={stopOffset} stopColor={selectedSection?.details?.color} stopOpacity="0" />
                        </RadialGradient>
                        <RadialGradient
                            id="innerGrad"
                            cx="50%"
                            cy="50%"
                            r="50%"
                            fx="50%"
                            fy="50%"
                        >
                            <Stop offset={0.5} stopColor="black" stopOpacity="1" />
                            <Stop offset={1} stopColor="transparent" stopOpacity=".8" />
                        </RadialGradient>
                    </Defs>
                    <G x={width / 2} y={height / 2}>
                        <Circle
                            r={outerRadius + 200}
                            fill="url(#grad)"
                        />
                    </G>
                    <G x={width / 2} y={height / 2}>
                        {sections.map((section, index) => {
                            return (
                                <Section
                                    key={`${section.coinId}-${refreshCount}-${section.accumulatedValue}`}
                                    section={section}
                                    index={index}
                                    totalValue={totalPortfolioValue}
                                    outerRadius={outerRadius}
                                    color={section.color}
                                />
                            );
                        })}
                        <Circle
                            r={outerRadius - thickness}
                            fill="url(#innerGrad)"
                            onPressIn={toggleDisplayMode}
                        />
                        {selectedSection && (
                            <View style={[{ position: "absolute", top: height / 2 - 25, left: width / 2 - (sliceDisplayWidth / 2), width: sliceDisplayWidth, height: 50 }]}>
                                <Text style={styles.selectedSliceValue}>
                                    {getDisplayValue()}
                                </Text>
                                <View style={[{ flexDirection: "row", justifyContent: "center" }]}>
                                    {selectedSection.details?.image ? (
                                        <Image
                                            source={selectedSection.details.image}
                                            style={{ width: circleSize * 2, height: circleSize * 2 }}
                                            transition={100}
                                            priority={'high'}
                                        />
                                    ) : (
                                        <MaterialIcons style={[styles.selectedSliceCircle, {
                                            width: 20,
                                            height: 20,
                                            color: selectedSection?.details?.color
                                        }]} name={"circle"} size={20} />
                                    )}
                                    <Text style={styles.selectedSliceName}>
                                        {selectedSection.details?.name}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </G>
                </Svg>
            </View>
        </GestureDetector>
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
            textAlign: "center",
            textAlignVertical: "center",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: 20,
        },
        selectedSliceCircle: {
            textAlign: "center",
            textAlignVertical: "center",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
        },
        selectedSliceName: {
            paddingLeft: 5,
            color: "rgba(255, 255, 255, 0.6)",
            textAlign: "left",
            textAlignVertical: "center",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
        },
    });