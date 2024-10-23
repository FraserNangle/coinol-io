import React, { useState, useEffect } from "react";
import {
    Dimensions,
    StyleSheet,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { useNavigation } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { FolioEntry } from "@/app/models/FolioEntry";
import { Button } from "react-native-paper";
import { fetchHistoricalCoinData } from "@/app/services/coinHistoryService";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { TransactionHistoryTable } from "@/components/index/transactionHistoryTable/transactionHistoryTable";
import { UserTransaction } from "@/app/models/UserTransaction";
import { getTransactionListByCoinId } from "@/app/services/transactionService";
import { useSQLiteContext } from "expo-sqlite";
import { LineGraph } from "@/components/index/coinGraphScreen/lineGraph";
import { CoinMarketHistoricalDataPoint } from "@/app/models/CoinsMarkets";
import { getDaysFromTimeRange } from "@/app/utils/getDaysFromTimeRange";

type RouteParams = {
    folioEntry: FolioEntry;
};

export default function CoinGraphScreen() {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    const [timeRange, setTimeRange] = useState("24H");
    const [historicalLineGraphData, setHistoricalLineGraphData] = useState<CoinMarketHistoricalDataPoint[]>([]);
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
                let days: number = getDaysFromTimeRange(timeRange);

                const currentDate = new Date();
                const endDate = currentDate.toISOString().split('T')[0];
                const startDate = new Date(currentDate);
                startDate.setDate(startDate.getDate() - days);
                const formattedStartDate = startDate.toISOString().split('T')[0];

                return await fetchHistoricalCoinData(folioEntry.coinId, formattedStartDate, endDate, timeRange);
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
            textColor={"white"}
            rippleColor="white"
            style={[styles.button, value === timeRange ? { opacity: 1 } : { opacity: .5 }]}
            onPress={() => setTimeRange(value)}
            mode="outlined">
            {value}
        </Button>;
    }

    return (
        <>
            {historicalLineGraphData.length === 0 && (
                <View style={styles.errorText}>
                    <Text style={{ fontSize: 20, }}>
                        Unable to find your {folioEntry.name} history!
                    </Text>
                </View>
            )}
            {historicalLineGraphData.length > 0 && (
                <View
                    style={styles.screenContainer}
                >
                    <>
                        <View style={styles.graphContainer}>
                            <LineGraph
                                data={historicalLineGraphData}
                                currencyType={currencyType}
                                width={screenWidth}
                                height={screenHeight}
                                timeRange={timeRange}
                            >
                            </LineGraph>
                        </View>
                        <View style={styles.buttonContainer}>
                            {timeRangeControlButton("24H")}
                            {timeRangeControlButton("7D")}
                            {timeRangeControlButton("1M")}
                            {timeRangeControlButton("1Y")}
                            {timeRangeControlButton("ALL")}
                        </View><View style={styles.tableContainer}>
                            <TransactionHistoryTable data={userTransactionData} />
                        </View>
                    </>
                </View>
            )}
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
        borderColor: "white",
        borderRadius: 10,
        borderWidth: 2,
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
    errorText: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
    },
});
