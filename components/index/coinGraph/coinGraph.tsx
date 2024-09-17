import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { LineChart, lineDataItem } from "react-native-gifted-charts";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CoinGraphProps {
    data: lineDataItem[],
}

export const customDataPointLabelComponent = (value: number, max: boolean) => {
    return (
        //TODO: detect if component is out of screen bounds and move it accordingly
        <View style={styles.labelContainer}>
            {!max && <MaterialIcons name="keyboard-arrow-up" color={"white"} size={10} />}
            <Text style={styles.labelText}>{convertToCurrencyFormat(value)}</Text>
            {max && <MaterialIcons name="keyboard-arrow-down" color={"white"} size={10} />}
        </View>
    );
};

export const CoinGraph: React.FC<CoinGraphProps> = ({
    data,
}: CoinGraphProps) => {
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