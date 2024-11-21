import React, { useState, useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { useNavigation } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { FolioEntry } from "@/app/models/FolioEntry";
import { ActivityIndicator, Button } from "react-native-paper";
import { RootState } from "@/app/store/store";
import { useDispatch, useSelector } from "react-redux";
import { TransactionHistoryTable } from "@/components/coinGraphScreen/transactionHistoryTable";
import { UserTransaction } from "@/app/models/UserTransaction";
import { getTransactionListByCoinId } from "@/app/services/transactionService";
import { useSQLiteContext } from "expo-sqlite";
import { LineGraph } from "@/components/coinGraphScreen/lineGraph";
import { CoinMarketHistoricalDataPoint } from "@/app/models/CoinsMarkets";
import { getDaysFromTimeRange } from "@/app/utils/getDaysFromTimeRange";
import { getCoinHistoryDataPoints } from "@/app/services/coinHistoryService";
import { CoinStatsPanel } from "@/components/coinGraphScreen/coinStatsPanel";
import { Image } from "expo-image";
import { triggerRefresh } from "@/app/slices/refreshSlice";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type RouteParams = {
    folioEntry: FolioEntry;
};

export default function CoinGraphScreen() {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const dispatch = useDispatch();

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

    const rotateAnim = useRef(new Animated.Value(0)).current;

    const startAnimation = () => {
        rotateAnim.setValue(0);
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    useEffect(() => {
        navigation.setOptions({
            title: folioEntry.name,
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={{ uri: folioEntry.image }}
                        style={{ width: 30, height: 30, marginRight: 10 }}
                    />
                    <Text style={{ color: 'white', fontSize: 18 }}>{folioEntry.name}</Text>
                </View>
            ),
            headerRight: () => (
                <View style={[{ justifyContent: 'center' }]}>
                    <TouchableOpacity onPress={() => {
                        startAnimation();
                        dispatch(triggerRefresh());
                    }}>
                        <Animated.View style={{ transform: [{ rotate }] }}>
                            <MaterialIcons style={[{
                                color: 'white',
                            }]} name={"refresh"} size={30} />
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            ),
        });
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
            buttonColor="transparent"
            textColor={'white'}
            rippleColor={folioEntry.color}
            labelStyle={{ marginHorizontal: 0, marginVertical: 0, fontSize: 10 }}
            style={[styles.button, value === timeRange ? { opacity: 1, borderTopWidth: 2, borderColor: folioEntry.color } : { opacity: .5 }]}
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
                                    <ActivityIndicator size="large" color={folioEntry.color} />
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
                                    color={folioEntry.color}
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
                            <ActivityIndicator size="large" color={folioEntry.color} />
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
