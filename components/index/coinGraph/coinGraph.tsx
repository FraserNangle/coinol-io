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
                height={300}
                data={data}
                color={'white'}
                textColor1="white"
                textShiftX={10}
                textFontSize={12}
                customDataPoint={() => { return <></> }}
                thickness={1}
                initialSpacing={0}
                adjustToWidth
                hideYAxisText
                hideAxesAndRules
                hideOrigin
                startFillColor="white"
                startOpacity={.3}
                endFillColor="white"
                endOpacity={0}
                isAnimated
                animationDuration={1200}
                scrollToEnd
                pointerConfig={{
                    pointerStripColor: 'lightgray',
                    pointerStripWidth: 2,
                    pointerColor: 'lightgray',
                    radius: 3,
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