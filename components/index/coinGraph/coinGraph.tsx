import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { FolioEntry } from "@/app/models/FolioEntry";
import { LineChart } from "react-native-gifted-charts";

interface CoinGraphProps {
    data: FolioEntry[],
    screenWidth: number
}

const customLabel = items => {
    return (
        <View
            style={{
                height: 90,
                width: 100,
                justifyContent: 'center',
                marginTop: -30,
                marginLeft: -40,
            }}>
            <Text style={{ color: 'white', fontSize: 14, marginBottom: 6, textAlign: 'center' }}>
                {items.value + '.0'}
            </Text>

            <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: 'white' }}>
                <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {'$' + items.value + '.0'}
                </Text>
            </View>
        </View>
    );
};

export const CoinGraph: React.FC<CoinGraphProps> = ({
    data,
    screenWidth
}: CoinGraphProps) => {
    const testData = [{ value: 15 }, { value: 30 }, { value: 26 }, { value: 50 }, { value: 15 }];
    return (
        <View style={[styles.container, { backgroundColor: 'black' }]}>
            <LineChart
                areaChart
                height={100}
                overflowTop={20}
                data={testData}
                color={'white'}
                thickness={3}
                adjustToWidth
                hideAxesAndRules
                hideDataPoints
                initialSpacing={5}
                spacing={screenWidth / testData.length}
                startFillColor="white"
                startOpacity={.2}
                endFillColor="white"
                endOpacity={0}
                isAnimated
                animationDuration={1200}
                pointerConfig={{
                    pointerStripHeight: 80,
                    pointerStripColor: 'lightgray',
                    pointerStripWidth: 2,
                    pointerColor: 'lightgray',
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 90,
                    autoAdjustPointerLabelPosition: false,
                    pointerLabelComponent: items => {
                        return (
                            <View
                                style={{
                                    height: 90,
                                    width: 100,
                                    justifyContent: 'center',
                                    marginTop: -30,
                                    marginLeft: -40,
                                }}>
                                <Text style={{ color: 'white', fontSize: 8, marginBottom: 6, textAlign: 'center' }}>
                                    {items[0].value}
                                </Text>

                                <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: 'white' }}>
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                        {'$' + items[0].value + '.0'}
                                    </Text>
                                </View>
                            </View>
                        );
                    },
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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