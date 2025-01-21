import React, { useState, useEffect, useRef } from "react";
import {
    Animated,
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
import { useDispatch, useSelector } from "react-redux";
import { TransactionHistoryTable } from "@/components/coinGraphScreen/transactionHistoryTable";
import { useSQLiteContext } from "expo-sqlite";
import { LineGraph } from "@/components/coinGraphScreen/lineGraph";
import { CoinMarketHistoricalDataPoint } from "@/app/models/CoinsMarkets";
import { getDaysFromTimeRange } from "@/app/utils/getDaysFromTimeRange";
import { getCoinHistoryDataPoints } from "@/app/services/coinHistoryService";
import { CoinStatsPanel } from "@/components/coinGraphScreen/coinStatsPanel";
import { Image } from "expo-image";
import { CoinHoldingsPanel } from "@/components/coinGraphScreen/coinHoldingsPanel";
import { refreshButton } from "@/components/refreshButton";

type RouteParams = {
    coinId: string;
};

export default function CoinGraphScreen() {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    const [timeRange, setTimeRange] = useState("24H");
    const [infoView, setInfoView] = useState("HOLDINGS");
    const [historicalLineGraphData, setHistoricalLineGraphData] = useState<CoinMarketHistoricalDataPoint[]>([]);
    const [isLoadingHistoricalData, setIsLoadingHistoricalData] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const [folioEntry, setFolioEntry] = useState<FolioEntry>();

    const route = useRoute();
    const { coinId }: { coinId: string } = route.params as RouteParams;

    const navigation = useNavigation();
    const db = useSQLiteContext();

    const allTransactions = useSelector((state: RootState) => state.allTransactions.transactions) || [];
    const allFolioEntries = useSelector((state: RootState) => state.folioEntries.allFolioEntries) || [];
    const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';

    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setFolioEntry(allFolioEntries.find((folio) => folio.coinId === coinId));
    }, [coinId, allTransactions, allFolioEntries]);

    useEffect(() => {
        navigation.setOptions({
            title: folioEntry?.name,
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={{ uri: folioEntry?.image }}
                        style={{ width: 30, height: 30, marginRight: 10 }}
                    />
                    <Text style={{ color: 'white', fontSize: 18 }}>{folioEntry?.name}</Text>
                </View>
            ),
            headerRight: () => (
                refreshButton(setRefresh, rotateAnim)
            ),
        });
    }, [navigation, folioEntry]);

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

    useEffect(() => {
        if (folioEntry) {
            fetchHistoricalLineGraphData(folioEntry);
        }
    }, [refresh, folioEntry]);

    function timeRangeControlButton(value: string) {
        return <Button
            buttonColor="transparent"
            textColor={'white'}
            rippleColor={folioEntry?.color}
            labelStyle={{ marginHorizontal: 0, marginVertical: 0, fontSize: 10 }}
            style={[styles.button, value === timeRange ? { opacity: 1, borderTopWidth: 2, borderColor: folioEntry?.color } : { opacity: .5 }]}
            onPress={() => setTimeRange(value)}
            mode="contained">
            {value}
        </Button>;
    }

    function infoViewControlButton(value: string) {
        return <Button
            buttonColor="transparent"
            textColor={'white'}
            rippleColor={folioEntry?.color}
            labelStyle={{ marginHorizontal: 0, marginVertical: 5, fontSize: 15 }}
            style={[styles.modeButton, value === infoView ? { opacity: 1, borderBottomWidth: 1, borderColor: folioEntry?.color } : { opacity: .5 }]}
            onPress={() => setInfoView(value)}
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
                                    <ActivityIndicator size="large" color={folioEntry?.color} />
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
                                    color={folioEntry?.color ?? 'white'}
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
                    <View style={styles.modeButtonContainer}>
                        {infoViewControlButton("HOLDINGS")}
                        {infoViewControlButton("STATS")}
                    </View>
                    <ScrollView fadingEdgeLength={25}>
                        {infoView === "HOLDINGS" && folioEntry &&
                            <>
                                <CoinHoldingsPanel folioEntry={folioEntry} />
                                <TransactionHistoryTable data={allTransactions.filter(transaction => {
                                    return transaction.coinId === folioEntry?.coinId;
                                })} db={db} />
                            </>
                        }
                        {infoView === "STATS" && folioEntry && <CoinStatsPanel folioEntry={folioEntry} />}
                    </ScrollView>
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
        width: "20%",
        borderRadius: 5,
        borderWidth: 0,
        borderColor: "rgba(255, 255, 255, 1)",
    },
    modeButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "space-between",
        alignContent: "center",
        width: "90%",
    },
    modeButton: {
        width: "50%",
        justifyContent: "center",
        alignContent: "center",
        borderRadius: 5,
        borderWidth: 0,
        borderColor: "white",
    },
    tableContainer: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: "transparent",
    },
    graphContainer: {
        flex: 1.5,
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
