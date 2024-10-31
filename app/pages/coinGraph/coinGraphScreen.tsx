import React, { useState, useEffect } from "react";
import {
    Dimensions,
    StyleSheet,
} from "react-native";
import { View } from "@/components/Themed";
import { useNavigation } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { FolioEntry } from "@/app/models/FolioEntry";
import { ActivityIndicator, Button } from "react-native-paper";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { TransactionHistoryTable } from "@/components/index/transactionHistoryTable/transactionHistoryTable";
import { UserTransaction } from "@/app/models/UserTransaction";
import { getTransactionListByCoinId } from "@/app/services/transactionService";
import { useSQLiteContext } from "expo-sqlite";
import { LineGraph } from "@/components/index/coinGraphScreen/lineGraph";
import { CoinMarketHistoricalDataPoint } from "@/app/models/CoinsMarkets";
import { getDaysFromTimeRange } from "@/app/utils/getDaysFromTimeRange";
import { getCoinHistoryDataPoints } from "@/app/services/coinHistoryService";

type RouteParams = {
    folioEntry: FolioEntry;
};

export default function CoinGraphScreen() {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    const [timeRange, setTimeRange] = useState("24H");
    const [historicalLineGraphData, setHistoricalLineGraphData] = useState<CoinMarketHistoricalDataPoint[]>([]);
    const [userTransactionData, setUserTransactionData] = useState<UserTransaction[]>([]);
    const [isLoadingHistoricalData, setIsLoadingHistoricalData] = useState(true);
    const [isLoadingTransactionData, setIsLoadingTransactionData] = useState(true);

    const route = useRoute();
    const { folioEntry }: { folioEntry: FolioEntry } = route.params as RouteParams;

    const navigation = useNavigation();
    const db = useSQLiteContext();

    const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';
    const refresh = useSelector((state: RootState) => state.coinGraphRefresh.refresh);


    useEffect(() => {
        navigation.setOptions({ title: folioEntry.name });
    }, [navigation]);

    const fetchHistoricalLineGraphData = async (folioEntry: FolioEntry) => {
        setIsLoadingHistoricalData(true);
        const historicalData = await getCoinHistoryDataPoints(db, folioEntry.coinId);
        setHistoricalLineGraphData(historicalData || []);
        setIsLoadingHistoricalData(false);
    };

    const filterHistoricalLineGraphDataByDate = (historicalData: CoinMarketHistoricalDataPoint[]) => {
        let days: number = getDaysFromTimeRange(timeRange);
        const currentDate = new Date();
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - days);

        return historicalData
            .filter((coin) => {
                const coinDate = new Date(coin.date);
                return coinDate >= startDate && coinDate <= currentDate;
            });

    };

    const fetchUserTransactionData = async (folioEntry: FolioEntry) => {
        setIsLoadingTransactionData(true);
        const transactionData = await getTransactionListByCoinId(db, folioEntry.coinId);
        setUserTransactionData(transactionData || []);
        setIsLoadingTransactionData(false);
    };

    useEffect(() => {
        if (folioEntry) {
            fetchHistoricalLineGraphData(folioEntry);
        }
    }, []);

    useEffect(() => {
        if (folioEntry) {
            fetchHistoricalLineGraphData(folioEntry);
        }
    }, [refresh]);

    useEffect(() => {
        if (folioEntry) {
            fetchUserTransactionData(folioEntry);
        }
    }, [folioEntry, refresh]);

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
        <View style={styles.screenContainer}>
            <>
                <View style={styles.graphContainer}>
                    {isLoadingHistoricalData ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="white" />
                        </View>
                    ) : (
                        <LineGraph
                            data={filterHistoricalLineGraphDataByDate(historicalLineGraphData)}
                            currencyType={currencyType}
                            width={screenWidth}
                            height={screenHeight}
                            timeRange={timeRange}
                        >
                        </LineGraph>
                    )}
                </View>
                <View style={styles.buttonContainer}>
                    {timeRangeControlButton("24H")}
                    {timeRangeControlButton("7D")}
                    {timeRangeControlButton("1M")}
                    {timeRangeControlButton("1Y")}
                    {timeRangeControlButton("ALL")}
                </View>
                <View style={styles.tableContainer}>
                    {isLoadingTransactionData ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="white" />
                        </View>
                    ) : (
                        <TransactionHistoryTable data={userTransactionData} />
                    )}
                </View>
            </>
        </View>
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
        borderRadius: 5,
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
});
