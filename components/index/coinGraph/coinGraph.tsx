import { DataPointLabelProps, setCoinGraphDataLabelProps } from "@/app/slices/coinGraphDataLabelPropsSlice";
import { RootState } from "@/app/store/store";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { StyleSheet, View, Text, Dimensions, LayoutChangeEvent } from "react-native";
import { LineChart, lineDataItem } from "react-native-gifted-charts";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, UnknownAction } from "redux";

interface CoinGraphProps {
    data: lineDataItem[],
    currencyType: string
}
interface DataPointLabelComponentProps {
    currencyType: string,
    dataPointLabelProps: DataPointLabelProps
}

export const DataPointLabelComponentLayoutSetter = (value: number, isMax: boolean, dispatch: Dispatch<UnknownAction>) => {
    const screenWidth = Dimensions.get('window').width;
    let xAdjustment = -30;

    const handleLayout = (event: LayoutChangeEvent) => {
        event.target.measure((x, y, width, height, pageX, pageY) => {
            console.log('x: ' + x + ' y: ' + y + ' width: ' + width + ' height: ' + height + ' pageX: ' + pageX + ' pageY: ' + pageY);

            if (pageX + width > screenWidth) {
                xAdjustment = screenWidth - (pageX + width);
                console.log('Component is out of screen on the right, adjust position by', xAdjustment);
            } else if (pageX - width < 0) {
                xAdjustment = width;
                console.log('Component is out of screen on the left, adjust position by', xAdjustment);
            } else {
                xAdjustment = 0;
            }
            //TODO: this is setting the DataPointLabelProps in the redux store TWICE, once for the upper label and once for the lower label, so is overwriting the first one
            //     need to set the DataPointLabelProps separately for each label (could be done using isMax boolean)
            dispatch(setCoinGraphDataLabelProps({ x, y, width, height, pageX, pageY, value, isMax, xAdjustment }));
        });
    };

    return (
        <View style={[styles.labelContainer, { right: xAdjustment }]} onLayout={handleLayout}>
            {!isMax && <MaterialIcons name="keyboard-arrow-up" color={"white"} size={10} />}
            <Text style={styles.labelText}>TESTER</Text>
            {isMax && <MaterialIcons name="keyboard-arrow-down" color={"white"} size={10} />}
        </View>
    );
};

const UpperDataPointLabelComponent: React.FC<DataPointLabelComponentProps> = ({
    currencyType,
    dataPointLabelProps
}: DataPointLabelComponentProps) => {
    console.log('VISIBLE COMPONENT- x: ' + dataPointLabelProps.x + ' y: ' + dataPointLabelProps.y + ' width: ' + dataPointLabelProps.width + ' height: ' + dataPointLabelProps.height + ' pageX: ' + dataPointLabelProps.pageX + ' pageY: ' + dataPointLabelProps.pageY);

    return (
        <View style={[styles.labelContainer, { start: dataPointLabelProps.pageX /* + dataPointLabelProps.xAdjustment */, bottom: dataPointLabelProps.pageY - 92 }]}>
            {!dataPointLabelProps.isMax && <MaterialIcons name="keyboard-arrow-up" color={"white"} size={10} />}
            <Text style={styles.labelText}>{convertToCurrencyFormat(dataPointLabelProps.value, currencyType)}</Text>
            {dataPointLabelProps.isMax && <MaterialIcons name="keyboard-arrow-down" color={"white"} size={10} />}
        </View>
    );
};

const LowerDataPointLabelComponent: React.FC<DataPointLabelComponentProps> = ({
    currencyType,
    dataPointLabelProps
}: DataPointLabelComponentProps) => {
    console.log('VISIBLE COMPONENT- x: ' + dataPointLabelProps.x + ' y: ' + dataPointLabelProps.y + ' width: ' + dataPointLabelProps.width + ' height: ' + dataPointLabelProps.height + ' pageX: ' + dataPointLabelProps.pageX + ' pageY: ' + dataPointLabelProps.pageY);

    return (
        <View style={[styles.labelContainer, { end: dataPointLabelProps.pageX /* + dataPointLabelProps.xAdjustment */, bottom: dataPointLabelProps.pageY }]}>
            {!dataPointLabelProps.isMax && <MaterialIcons name="keyboard-arrow-up" color={"white"} size={10} />}
            <Text style={styles.labelText}>{convertToCurrencyFormat(dataPointLabelProps.value, currencyType)}</Text>
            {dataPointLabelProps.isMax && <MaterialIcons name="keyboard-arrow-down" color={"white"} size={10} />}
        </View>
    );
};

export const CoinGraph: React.FC<CoinGraphProps> = ({
    data,
    currencyType
}: CoinGraphProps) => {
    const dataLabelProps = useSelector((state: RootState) => state.coinGraphDataLabelProps.coinGraphDataLabelProps);

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
                yAxisColor={"black"}
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
            {dataLabelProps && (
                <>
                    <UpperDataPointLabelComponent currencyType={currencyType} dataPointLabelProps={dataLabelProps} />
                    <LowerDataPointLabelComponent currencyType={currencyType} dataPointLabelProps={dataLabelProps} />
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