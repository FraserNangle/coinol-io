import React, { useState, useEffect } from "react";
import {
    StyleSheet,
} from "react-native";
import { View } from "@/components/Themed";
import { useNavigation } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { CoinGraph } from "@/components/index/coinGraph/coinGraph";
import { FolioEntry } from "@/app/models/FolioEntry";
import { Button } from "react-native-paper";
import { lineDataItem } from "gifted-charts-core";
import { getHistoricalLineGraphDataForCoinId } from "@/app/services/coinHistoryService";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { TransactionHistoryTable } from "@/components/index/transactionHistoryTable/transactionHistoryTable";
import { UserTransaction } from "@/app/models/UserTransaction";
import { getTransactionListByCoinId } from "@/app/services/transactionService";
import { useSQLiteContext } from "expo-sqlite";

type RouteParams = {
    folioEntry: FolioEntry;
};

export default function CoinGraphScreen() {
    const [timeRange, setTimeRange] = useState("24H");
    const [historicalLineGraphData, setHistoricalLineGraphData] = useState<lineDataItem[]>([]);
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
                let days: number;

                if (timeRange === "24H") {
                    days = 1;
                } else if (timeRange === "7D") {
                    days = 7;
                } else if (timeRange === "1M") {
                    days = 30;
                } else if (timeRange === "1Y") {
                    days = 365;
                } else {
                    days = 365 * 20;
                }

                const currentDate = new Date();
                const endDate = currentDate.toISOString().split('T')[0];
                const startDate = new Date(currentDate);
                startDate.setDate(startDate.getDate() - days);
                const formattedStartDate = startDate.toISOString().split('T')[0];

                return await getHistoricalLineGraphDataForCoinId(folioEntry.coinId, formattedStartDate, endDate, timeRange, currencyType);
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
            buttonColor="hsl(0, 0%, 15%)"
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
                        <CoinGraph
                            data={historicalLineGraphData}
                            currencyType={currencyType}
                            folioEntry={folioEntry}
                        />
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
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    button: {
        margin: 5,
    },
    tableContainer: {
        flex: 1,
        justifyContent: "center",
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10,
    },
});