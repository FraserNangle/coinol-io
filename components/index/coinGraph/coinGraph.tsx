import React, { useCallback, useMemo, useState } from "react";
import { Button, StyleSheet, View, Text } from "react-native";
import { FolioEntry } from "@/app/models/FolioEntry";
import { GraphPoint, LineGraph, SelectionDot } from 'react-native-graph'
import { GraphRange } from "react-native-graph/lib/typescript/LineGraphProps";


interface CoinGraphProps {
    data: FolioEntry[],
}

function generateRandomGraphData(length: number): GraphPoint[] {
    return Array<number>(length)
        .fill(0)
        .map((_, index) => ({
            date: new Date(
                new Date(2000, 0, 1).getTime() + 1000 * 60 * 60 * 24 * index
            ),
            value: Math.random(),
        }))
}

const POINT_COUNT = 70
const POINTS = generateRandomGraphData(POINT_COUNT)
const COLOR = '#6a7ee7'
const GRADIENT_FILL_COLORS = ['#7476df5D', '#7476df4D', '#7476df00']

export const CoinGraph: React.FC<CoinGraphProps> = ({
    data,
}: CoinGraphProps) => {

    const [isAnimated, setIsAnimated] = useState(true)
    const [enablePanGesture, setEnablePanGesture] = useState(true)
    const [enableFadeInEffect, setEnableFadeInEffect] = useState(false)
    const [enableCustomSelectionDot, setEnableCustomSelectionDot] =
        useState(false)
    const [enableGradient, setEnableGradient] = useState(true)
    const [enableRange, setEnableRange] = useState(false)
    const [enableIndicator, setEnableIndicator] = useState(true)
    const [indicatorPulsating, setIndicatorPulsating] = useState(true)

    const [points, setPoints] = useState(POINTS)

    const refreshData = useCallback(() => {
        setPoints(generateRandomGraphData(POINT_COUNT));
        //hapticFeedback('impactLight')
    }, [])

    const highestDate = useMemo(
        () =>
            points.length !== 0 && points[points.length - 1] != null
                ? points[points.length - 1]!.date
                : undefined,
        [points]
    )
    const range: GraphRange | undefined = useMemo(() => {
        // if range is disabled, default to infinite range (undefined)
        if (!enableRange) return undefined

        if (points.length !== 0 && highestDate != null) {
            return {
                x: {
                    min: points[0]!.date,
                    max: new Date(highestDate.getTime() + 50 * 1000 * 60 * 60 * 24),
                },
                y: {
                    min: -200,
                    max: 200,
                },
            }
        } else {
            return {
                y: {
                    min: -200,
                    max: 200,
                },
            }
        }
    }, [enableRange, highestDate, points])

    return (
        <View style={[styles.container, { backgroundColor: 'black' }]}>
            <LineGraph
                style={styles.graph}
                animated={isAnimated}
                color={COLOR}
                points={points}
                gradientFillColors={enableGradient ? GRADIENT_FILL_COLORS : undefined}
                enablePanGesture={enablePanGesture}
                enableFadeInMask={enableFadeInEffect}
                //onGestureStart={() => hapticFeedback('impactLight')}
                SelectionDot={enableCustomSelectionDot ? SelectionDot : undefined}
                range={range}
                enableIndicator={enableIndicator}
                horizontalPadding={enableIndicator ? 15 : 0}
                indicatorPulsating={indicatorPulsating}
                TopAxisLabel={() => <AxisLabel xPos={10} value={10} />}
                BottomAxisLabel={() => <AxisLabel xPos={40} value={40} />}
            />

            <Button title="Refresh" onPress={refreshData} />
        </View>
    );
};

interface AxisLabelProps {
    xPos: number,
    value: number,
}

export const AxisLabel: React.FC<AxisLabelProps> = ({
    xPos,
    value,
}: AxisLabelProps) => {
    return (
        <View style={{ position: 'absolute', left: xPos }}>
            <Text style={{ color: 'white' }}>{value}</Text>
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