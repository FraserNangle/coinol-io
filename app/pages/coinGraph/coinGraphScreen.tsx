import React, { useState, useEffect } from "react";
import {
    Dimensions,
    StyleSheet,
} from "react-native";
import { View } from "@/components/Themed";
import { useNavigation } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { CoinGraph } from "@/components/index/coinGraph/coinGraph";
import { FolioEntry } from "@/app/models/FolioEntry";
import { Button } from "react-native-paper";
import { lineDataItem } from "gifted-charts-core";
import { getLineGraphDataForCoinId } from "@/app/services/coinHistoryService";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { TransactionHistoryTable } from "@/components/index/transactionHistoryTable/transactionHistoryTable";
import { UserTransaction } from "@/app/models/UserTransaction";
import { getTransactionListByCoinId } from "@/app/services/transactionService";
import { useSQLiteContext } from "expo-sqlite";
import { LineGraph } from "@/components/index/coinGraphScreen/lineGraph";
import { LineGraphDataItem } from "@/app/models/LineGraphDataItem";

type RouteParams = {
    folioEntry: FolioEntry;
};

export default function CoinGraphScreen() {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    const [timeRange, setTimeRange] = useState("24H");
    const [historicalLineGraphData, setHistoricalLineGraphData] = useState<LineGraphDataItem[]>([]);
    const [userTransactionData, setUserTransactionData] = useState<UserTransaction[]>([]);

    const route = useRoute();
    const { folioEntry }: { folioEntry: FolioEntry } = route.params as RouteParams;

    const navigation = useNavigation();
    const db = useSQLiteContext();

    const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';

    useEffect(() => {
        navigation.setOptions({ title: folioEntry.name });
    }, [navigation]);

    useEffect(() => {
        const fetchHistoricalLineGraphData = async () => {
            if (folioEntry) {
                const timeRangeToDays: { [key: string]: number } = {
                    "24H": 1,
                    "7D": 7,
                    "1M": 30,
                    "1Y": 365
                };

                let days: number = timeRangeToDays[timeRange] ?? 365 * 20;

                const currentDate = new Date();
                const endDate = currentDate.toISOString().split('T')[0];
                const startDate = new Date(currentDate);
                startDate.setDate(startDate.getDate() - days);
                const formattedStartDate = startDate.toISOString().split('T')[0];

                return await getLineGraphDataForCoinId(folioEntry.coinId, formattedStartDate, endDate, timeRange, screenWidth, screenHeight / 4);
            }
        };

        fetchHistoricalLineGraphData().then((data) => {
            setHistoricalLineGraphData(data || []);
        });

        getTransactionListByCoinId(db, folioEntry.coinId).then((data) => {
            setUserTransactionData(data || []);
        });

    }, [timeRange, folioEntry]);

    function timeRangeControlButton(value: string) {
        return <Button
            buttonColor="transparent"
            textColor={value === timeRange ? "white" : "hsl(0, 0%, 60%)"}
            style={[styles.button, value === timeRange ? { borderColor: 'white' } : { borderColor: 'hsl(0, 0%, 15%)' }]}
            onPress={() => setTimeRange(value)}
            mode="outlined">
            {value}
        </Button>;
    }

    return (
        <>
            {
                <View
                    style={styles.screenContainer}
                >
                    {historicalLineGraphData.length > 0 && (
                        <View style={styles.graphContainer}>
                            <LineGraph
                                data={historicalLineGraphData}
                                currencyType={currencyType}
                                folioEntry={folioEntry}
                                width={screenWidth}
                                height={screenHeight} >
                            </LineGraph>
                        </View>
                    )}
                    <View style={styles.buttonContainer}>
                        {timeRangeControlButton("24H")}
                        {timeRangeControlButton("7D")}
                        {timeRangeControlButton("1M")}
                        {timeRangeControlButton("1Y")}
                        {timeRangeControlButton("ALL")}
                    </View>
                    <View style={styles.tableContainer}>
                        <TransactionHistoryTable data={userTransactionData} />
                    </View>
                </View>
            }
        </>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        justifyContent: "flex-start",
        backgroundColor: "black",
    },
    buttonContainer: {
        backgroundColor: "transparent",
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    button: {
        margin: 5,
    },
    tableContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    graphContainer: {
        flex: 1,
        justifyContent: "center",
    },
});