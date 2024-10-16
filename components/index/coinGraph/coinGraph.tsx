import { FolioEntry } from "@/app/models/FolioEntry";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { getPercentageChangeDisplay } from "@/app/utils/getPercentageChange";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { LineChart, lineDataItem } from "react-native-gifted-charts";

interface CoinGraphProps {
    data: lineDataItem[],
    currencyType: string,
    folioEntry: FolioEntry
}

export const DataPointLabelComponentLayoutSetter = (value: number, isMax: boolean, currencyType: string) => {
    return (
        <View style={[styles.labelContainer]}>
            {!isMax && <MaterialIcons name="keyboard-arrow-up" color={"white"} size={10} />}
            <Text style={styles.labelText}>{convertToCurrencyFormat(value, currencyType, true)}</Text>
            {isMax && <MaterialIcons name="keyboard-arrow-down" color={"white"} size={10} />}
        </View>
    );
};

export const CoinGraph: React.FC<CoinGraphProps> = ({
    data,
    currencyType,
    folioEntry
}: CoinGraphProps) => {
    const [selectedDataPointValue, setSelectedDataPointValue] = useState<number>(0);

    const formatted24hChangeCoinValue = convertToCurrencyFormat(folioEntry.priceChange24h, currencyType, true);

    function handleDataPointSelect(dataPoint: lineDataItem) {
        setSelectedDataPointValue(dataPoint.value);
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <View style={styles.subtitleContainer}>
                    <Text style={styles.headerTitle}>
                        {convertToCurrencyFormat(selectedDataPointValue ?? folioEntry.currentPrice, currencyType, false)}
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
            <LineChart
                areaChart
                color={"white"}
                backgroundColor={"transparent"}
                lineGradient
                height={300}
                data={data}
                customDataPoint={() => { return <></> }}
                thickness={1}
                initialSpacing={0}
                adjustToWidth
                yAxisColor={"transparent"}
                yAxisExtraHeight={0}
                yAxisOffset={data.length > 0 ? data[0].value / 2 : 0}
                maxValue={data.length > 0 ? Math.max(...data.map(dataPoint => dataPoint.value)) : 0}
                hideYAxisText
                yAxisLabelWidth={0}
                xAxisLabelsHeight={0}
                xAxisIndicesWidth={0}
                xAxisThickness={0}
                noOfSectionsBelowXAxis={0}
                rulesType="dotted"
                rulesColor={"hsl(0, 0%, 15%)"}
                startFillColor="white"
                startOpacity={.2}
                endFillColor="white"
                endOpacity={0}
                isAnimated
                animationDuration={600}
                pointerConfig={{
                    pointerStripUptoDataPoint: true,
                    strokeDashArray: [2, 5],
                    pointerStripColor: 'white',
                    pointerStripWidth: 2,
                    pointerColor: 'transparent',
                    pointerLabelComponent: (items: lineDataItem[]) => (handleDataPointSelect(items[0]), <></>)
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        justifyContent: "flex-start",
        backgroundColor: "black",
    },
    titleContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    subtitleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    button: {
        margin: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
    },
    tableContainer: {
        flex: 1,
        justifyContent: "center",
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10,
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
        //flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelContainer: {
        position: 'absolute',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60
    },
    labelText: {
        fontSize: 10,
        color: 'white',
    },
})