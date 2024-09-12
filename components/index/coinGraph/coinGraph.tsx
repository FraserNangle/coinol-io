import React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart, lineDataItem } from "react-native-gifted-charts";

interface CoinGraphProps {
    data: lineDataItem[],
}

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
                textColor1="white"
                textFontSize={12}
                //TODO: Change this to a custom data point label so it can be centered and have an icon
                textShiftX={-10}
                customDataPoint={() => { return <></> }}
                thickness={1}
                initialSpacing={0}
                adjustToWidth
                yAxisColor={"black"}
                yAxisExtraHeight={0}
                yAxisTextStyle={{ color: 'white', fontSize: 8, textAlign: 'left' }}
                yAxisOffset={data.length > 0 ? data[0].value / 2 : 0}
                maxValue={data.length > 0 ? Math.max(...data.map(dataPoint => dataPoint.value)) : 0}
                hideYAxisText
                //hideAxesAndRules
                //hideRules
                yAxisLabelWidth={0}
                rulesType="dotted"
                rulesColor={"hsl(0, 0%, 15%)"}
                curved
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
    spacer: {
        flexGrow: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    graph: {
        alignSelf: 'center',
        width: '100%',
        aspectRatio: 2,
    },
    miniGraph: {
        width: 40,
        height: 35,
        marginLeft: 5,
    },
    controlsScrollView: {
        flexGrow: 1,
        paddingHorizontal: 15,
    },
    controlsScrollViewContent: {
        justifyContent: 'center',
    },
})