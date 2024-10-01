import { DataPointLabelProps, setCoinGraphDataLabelPropsMax, setCoinGraphDataLabelPropsMin } from "@/app/slices/coinGraphDataLabelPropsSlice";
import store, { RootState } from "@/app/store/store";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Dimensions, LayoutChangeEvent } from "react-native";
import { LineChart, lineDataItem } from "react-native-gifted-charts";
import { useSelector } from "react-redux";

interface CoinGraphProps {
    data: lineDataItem[],
    currencyType: string
}
interface DataPointLabelComponentProps {
    currencyType: string,
    dataPointLabelProps: DataPointLabelProps
}

export const DataPointLabelComponentLayoutSetter = (value: number, isMax: boolean) => {
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
        <View style={[styles.labelContainer, { opacity: 0 }]} onLayout={handleLayout}>
            {!isMax && <MaterialIcons name="keyboard-arrow-up" color={"transparent"} size={0} />}
            <Text style={[styles.labelText, { opacity: 0 }]}>SETTER</Text>
            {isMax && <MaterialIcons name="keyboard-arrow-down" color={"transparent"} size={0} />}
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
}: CoinGraphProps) => {
    const dataLabelPropsMax = useSelector((state: RootState) => state.coinGraphDataLabelProps?.coinGraphDataLabelPropsMax);
    const dataLabelPropsMin = useSelector((state: RootState) => state.coinGraphDataLabelProps?.coinGraphDataLabelPropsMin);

    return (
        <View style={[styles.container, { backgroundColor: 'black' }]}>
            <LineChart
                areaChart
                color={"white"}
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
                    pointerStripColor: 'white',
                    pointerStripWidth: 1,
                    pointerColor: 'white',
                    radius: 5,
                }}
            />
            {dataLabelPropsMax && dataLabelPropsMin && (
                <>
                    <DataPointLabelComponent currencyType={currencyType} dataPointLabelProps={dataLabelPropsMax} />
                    <DataPointLabelComponent currencyType={currencyType} dataPointLabelProps={dataLabelPropsMin} />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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