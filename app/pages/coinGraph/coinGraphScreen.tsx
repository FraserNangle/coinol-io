import React, { useState, useEffect } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { useNavigation } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { FolioEntry } from "@/app/models/FolioEntry";
import { ActivityIndicator, Button } from "react-native-paper";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { TransactionHistoryTable } from "@/components/coinGraphScreen/transactionHistoryTable";
import { UserTransaction } from "@/app/models/UserTransaction";
import { getTransactionListByCoinId } from "@/app/services/transactionService";
import { useSQLiteContext } from "expo-sqlite";
import { LineGraph } from "@/components/coinGraphScreen/lineGraph";
import { CoinMarketHistoricalDataPoint } from "@/app/models/CoinsMarkets";
import { getDaysFromTimeRange } from "@/app/utils/getDaysFromTimeRange";
import { getCoinHistoryDataPoints } from "@/app/services/coinHistoryService";
import { CoinStatsPanel } from "@/components/coinGraphScreen/coinStatsPanel";

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
    const refresh = useSelector((state: RootState) => state.refresh.refresh);


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
    }, [refresh]);

    useEffect(() => {
        if (folioEntry) {
            fetchUserTransactionData(folioEntry);
        }
    }, [folioEntry, refresh]);

    function timeRangeControlButton(value: string) {
        return <Button
            buttonColor="black"
            textColor={"white"}
            rippleColor="white"
            labelStyle={{ marginHorizontal: 0, marginVertical: 0, fontSize: 10 }}
            style={[styles.button, value === timeRange ? { opacity: 1, borderTopWidth: 2 } : { opacity: .5 }]}
            onPress={() => setTimeRange(value)}
            mode="contained">
            {value}
        </Button>;
    }

    return (
        <View style={styles.screenContainer}>
            <>
                <View style={styles.graphContainer}>
                    {(() => {
                        if (isLoadingHistoricalData) {
                            return (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="white" />
                                </View>
                            );
                        } else if (historicalLineGraphData.length > 0) {
                            return (
                                <LineGraph
                                    data={filterHistoricalLineGraphDataByDate(historicalLineGraphData)}
                                    currencyType={currencyType}
                                    width={screenWidth}
                                    height={screenHeight}
                                    timeRange={timeRange}
                                >
                                </LineGraph>
                            );
                        } else {
                            return (
                                <View style={styles.errorText}>
                                    <Text>Failed to load chart data</Text>
                                </View>
                            );
                        }
                    })()}
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
                        <ScrollView fadingEdgeLength={25}>
                            <CoinStatsPanel folioEntry={folioEntry} />
                            <TransactionHistoryTable data={userTransactionData} />
                        </ScrollView>
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
    infoContainer: {
        justifyContent: "center",
        alignContent: "center",
        alignSelf: "center",
        width: "90%",
        paddingVertical: 10
    },
    holdingsContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: 20,
        borderRadius: 5,
        borderBottomWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.3)"
    },
    statsContainer: {
        justifyContent: 'space-between',
        flexDirection: 'column',
        padding: 20,
        borderRadius: 5,
        borderBottomWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.3)"
    },
    statsRow: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        flex: 1,
        marginBottom: 10,
    },
    bigText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "left",
        color: "white",
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        borderBottomWidth: 2,
        borderColor: 'white',
        marginBottom: 10,
        width: 80,
        textAlign: 'center',
        borderRadius: 5
    },
    smallText: {
        color: "white",
        textAlign: "left",
        textAlignVertical: "center",
    },
    dateLabelText: {
        color: "hsl(0, 0%, 80%)",
        textAlign: "right",
        textAlignVertical: "center",
        fontSize: 12,
    },
    infoText: {
        flex: 1,
        padding: 10,
        color: 'white',
    },
    button: {
        width: "20%",
        borderRadius: 5,
        borderWidth: 0,
        borderColor: "rgba(255, 255, 255, 1)",
    },
    tableContainer: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: "transparent",
        paddingTop: 20,
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
