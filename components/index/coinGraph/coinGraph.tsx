import React, { useCallback, useMemo, useState } from "react";
import { Button, StyleSheet, View, Text } from "react-native";
import { FolioEntry } from "@/app/models/FolioEntry";
import { LineChart } from "react-native-gifted-charts";

interface CoinGraphProps {
    data: FolioEntry[],
    screenWidth: number
}

const customDataPoint = () => {
    return (
        <View
            style={{
                width: 20,
                height: 20,
                backgroundColor: 'white',
                borderWidth: 4,
                borderRadius: 10,
                borderColor: '#07BAD1',
            }}
        />
    );
};

const customLabel = val => {
    return (
        <View style={{ width: 70, marginLeft: 7 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{val}</Text>
        </View>
    );
};

export const CoinGraph: React.FC<CoinGraphProps> = ({
    data,
    screenWidth
}: CoinGraphProps) => {
    const testData = [{ value: 15 }, { value: 30 }, { value: 26 }, {
        value: 50,
        labelComponent: () => customLabel('24 Nov'),
        customDataPoint: customDataPoint,
        showStrip: true,
        stripHeight: 190,
        stripColor: 'white',
        dataPointLabelComponent: () => {
            return (
                <View
                    style={{
                        backgroundColor: 'white',
                        paddingHorizontal: 8,
                        paddingVertical: 5,
                        borderRadius: 4,
                    }}>
                    <Text style={{ color: 'white' }}>410</Text>
                </View>
            );
        },
        dataPointLabelShiftY: -70,
        dataPointLabelShiftX: -4,
    }, { value: 15 }];
    return (
        <View style={[styles.container, { backgroundColor: 'black' }]}>
            <LineChart
                areaChart
                data={testData}
                color={'white'}
                thickness={5}
                hideAxesAndRules
                hideDataPoints
                curved
                spacing={screenWidth / testData.length}
                startFillColor="white"
                startOpacity={.6}
                endFillColor="white"
                endOpacity={0}
                isAnimated
                animationDuration={1200}
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