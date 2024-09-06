import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { FolioEntry } from "@/app/models/FolioEntry";
import { LineChart } from "react-native-gifted-charts";

interface CoinGraphProps {
    data: FolioEntry[],
}

export const CoinGraph: React.FC<CoinGraphProps> = ({
    data,
}: CoinGraphProps) => {
    const testData = [
        { value: 15 }, { value: 18 }, { value: 22 }, { value: 20 }, { value: 25 },
        { value: 30 }, { value: 28 }, { value: 35 }, { value: 40 }, { value: 38 },
        { value: 45 }, { value: 50 }, { value: 48 }, { value: 55 }, { value: 60 },
        { value: 58 }, { value: 65 }, { value: 70 }, { value: 68 }, { value: 75 },
        { value: 80 }, { value: 78 }, { value: 85 }, { value: 90 }, { value: 88 },
        { value: 95 }, { value: 100, dataPointText: '100' }, { value: 98 }, { value: 95 }, { value: 90 },
        { value: 85 }, { value: 80 }, { value: 75 }, { value: 70 }, { value: 65 },
        { value: 60 }, { value: 55 }, { value: 50 }, { value: 45 }, { value: 40 },
        { value: 35 }, { value: 30 }, { value: 25 }, { value: 20 }, { value: 15 },
        { value: 10 }, { value: 5, dataPointText: '5' }, { value: 10 }, { value: 15 }, { value: 20 },
        { value: 25 }, { value: 30 }, { value: 35 }, { value: 40 }, { value: 45 }
    ];
    return (
        <View style={[styles.container, { backgroundColor: 'black' }]}>
            <LineChart
                areaChart
                height={300}
                data={testData}
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