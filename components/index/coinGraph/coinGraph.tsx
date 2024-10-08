import { FolioEntry } from "@/app/models/FolioEntry";
import { DataPointLabelProps, setCoinGraphDataLabelPropsMax, setCoinGraphDataLabelPropsMin } from "@/app/slices/coinGraphDataLabelPropsSlice";
import store from "@/app/store/store";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { getPercentageChangeDisplay } from "@/app/utils/getPercentageChange";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { StyleSheet, View, Text, Dimensions, LayoutChangeEvent } from "react-native";
import { LineChart, lineDataItem } from "react-native-gifted-charts";
import { useDispatch } from "react-redux";

interface CoinGraphProps {
    data: lineDataItem[],
    currencyType: string,
    folioEntry: FolioEntry
}
interface DataPointLabelComponentProps {
    currencyType: string,
    dataPointLabelProps: DataPointLabelProps
}

export const DataPointLabelComponentLayoutSetter = (value: number, isMax: boolean, currencyType: string) => {
    const handleLayout = (event: LayoutChangeEvent) => {
        event.persist(); // Prevent the event from being reused
        event.currentTarget?.measure((x, y, width, height, pageX, pageY) => {
            if (isMax === true) {
                store.dispatch(setCoinGraphDataLabelPropsMax({ x, y, width, height, pageX, pageY, value, isMax }));
            } else if (isMax === false) {
                store.dispatch(setCoinGraphDataLabelPropsMin({ x, y, width, height, pageX, pageY, value, isMax }));
            }
        });
    };

    return (
        <View style={[styles.labelContainer]} onLayout={handleLayout}>
            {!isMax && <MaterialIcons name="keyboard-arrow-up" color={"white"} size={10} />}
            <Text style={styles.labelText}>{convertToCurrencyFormat(value, currencyType)}</Text>
            {isMax && <MaterialIcons name="keyboard-arrow-down" color={"white"} size={10} />}
        </View>
    );
};

const DataPointLabelComponent: React.FC<DataPointLabelComponentProps> = ({
    currencyType,
    dataPointLabelProps
}: DataPointLabelComponentProps) => {
    const screenWidth = Dimensions.get('window').width;
    let xAdjustment = 0;

    //TODO: if the label is going out of the screen because the data point is near the edge of the screen (but not past it),
    // then the label will still display a right arrow and point to the wrong data point.
    // need to fix this by adjusting the x position of only the text, if the halfway point of the label is not past the edge of the screen,
    // but otherwise adjusting both as normal
    if (dataPointLabelProps.pageX + (dataPointLabelProps.width) > screenWidth) {
        xAdjustment = screenWidth - (dataPointLabelProps.pageX + dataPointLabelProps.width);
        return (
            <View style={[styles.labelContainer,
            {
                start: dataPointLabelProps.pageX + xAdjustment,
                top: dataPointLabelProps.pageY - 154,
                flexDirection: "row",
                justifyContent: 'flex-end'
            }]}>
                <Text style={styles.labelText}>{convertToCurrencyFormat(dataPointLabelProps.value, currencyType)}</Text>
                {<MaterialIcons name="keyboard-arrow-right" color={"white"} size={10} />}
            </View>
        );

    } else if (dataPointLabelProps.pageX < 0) {
        xAdjustment = -dataPointLabelProps.pageX;
        return (
            <View style={[styles.labelContainer,
            {
                start: dataPointLabelProps.pageX + xAdjustment,
                top: dataPointLabelProps.pageY - 154,
                flexDirection: "row",
                justifyContent: 'flex-start',
            }]}>
                {<MaterialIcons name="keyboard-arrow-left" color={"white"} size={10} />}
                <Text style={styles.labelText}>{convertToCurrencyFormat(dataPointLabelProps.value, currencyType)}</Text>
            </View>
        );
    } else {
        return (
            <View style={[styles.labelContainer, { start: dataPointLabelProps.pageX + xAdjustment, top: dataPointLabelProps.pageY - 154, flexDirection: "column" }]}>
                {!dataPointLabelProps.isMax && <MaterialIcons name="keyboard-arrow-up" color={"white"} size={10} />}
                <Text style={styles.labelText}>{convertToCurrencyFormat(dataPointLabelProps.value, currencyType)}</Text>
                {dataPointLabelProps.isMax && <MaterialIcons name="keyboard-arrow-down" color={"white"} size={10} />}
            </View>
        );
    }
};

export const CoinGraph: React.FC<CoinGraphProps> = ({
    data,
    currencyType,
    folioEntry
}: CoinGraphProps) => {
    const [selectedDataPointValue, setSelectedDataPointValue] = useState<number>(0);

    const formatted24hChangeCoinValue = convertToCurrencyFormat(folioEntry.priceChange24h, currencyType);

    function handleDataPointSelect(dataPoint: lineDataItem) {
        setSelectedDataPointValue(dataPoint.value);
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <View style={styles.subtitleContainer}>
                    <Text style={styles.headerTitle}>
                        {convertToCurrencyFormat(selectedDataPointValue ?? folioEntry.currentPrice, currencyType)}
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
                //hideAxesAndRules
                //hideRules
                yAxisLabelWidth={0}
                xAxisLabelsHeight={0}
                xAxisIndicesWidth={0}
                xAxisThickness={0}
                noOfSectionsBelowXAxis={0}
                rulesType="dotted"
                rulesColor={"hsl(0, 0%, 15%)"}
                //curved
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
            {/* {dataLabelPropsMax && dataLabelPropsMin && (
                <>
                    <DataPointLabelComponent currencyType={currencyType} dataPointLabelProps={dataLabelPropsMax} />
                    <DataPointLabelComponent currencyType={currencyType} dataPointLabelProps={dataLabelPropsMin} />
                </>
            )} */}
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