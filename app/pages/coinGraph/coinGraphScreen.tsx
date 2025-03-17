import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet
} from "react-native";
import { View, Text } from "@/components/Themed";
import { useNavigation } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { ActivityIndicator, Button } from "react-native-paper";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import { TransactionHistoryTable } from "@/components/coinGraphScreen/transactionHistoryTable";
import { useSQLiteContext } from "expo-sqlite";
import { LineGraph } from "@/components/coinGraphScreen/lineGraph";
import { CoinsMarkets } from "@/app/models/CoinsMarkets";
import { CoinStatsPanel } from "@/components/coinGraphScreen/coinStatsPanel";
import { CoinHoldingsPanel } from "@/components/coinGraphScreen/coinHoldingsPanel";
import { refreshButton } from "@/components/refreshButton";
import { SvgCssUri } from 'react-native-svg/css';

type RouteParams = {
    coinId: string;
};

export default function CoinGraphScreen() {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    const [infoView, setInfoView] = useState("HOLDINGS");
    const [refresh, setRefresh] = useState(false);
    const [coinsMarket, setCoinsMarket] = useState<CoinsMarkets>();

    const route = useRoute();
    const { coinId }: { coinId: string } = route.params as RouteParams;

    const navigation = useNavigation();
    const db = useSQLiteContext();

    const allTransactions = useSelector((state: RootState) => state.allTransactions.transactions) || [];
    const currencyType = useSelector((state: RootState) => state.currencyType.currencyType) ?? '';
    const coinsMarketsList = useSelector((state: RootState) => state.allCoinData.coinsMarketsList) || [];

    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setCoinsMarket(coinsMarketsList.find((coin) => coin.id === coinId));
    }, [coinId, coinsMarketsList]);

    useEffect(() => {
        if (coinsMarket) {
            navigation.setOptions({
                title: coinsMarket?.name,
                headerTitle: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 30, height: 30, marginRight: 10 }}>
                            <SvgCssUri
                                width={30}
                                height={30}
                                uri={coinsMarket?.image}
                                onError={() => console.error("Error loading image", coinsMarket?.image)}
                            />
                        </View>
                        <Text style={{ color: 'white', fontSize: 18 }}>{coinsMarket?.name}</Text>
                    </View>
                ),
                headerRight: () => (
                    refreshButton(setRefresh, rotateAnim)
                ),
            });
        }
    }, [coinsMarket]);

    const memoizedLineGraph = useMemo(() => (
        <LineGraph
            coinsMarkets={coinsMarket ? [coinsMarket] : []}
            currencyType={currencyType}
            width={screenWidth}
            height={screenHeight / 2}
            refresh={setRefresh}
        />
    ), [coinsMarket, currencyType, screenWidth, screenHeight, refresh]);


    function infoViewControlButton(value: string) {
        return <Button
            buttonColor="transparent"
            textColor={'white'}
            rippleColor={coinsMarket?.color}
            labelStyle={{ marginHorizontal: 0, marginVertical: 5, fontSize: 15 }}
            style={[styles.modeButton, value === infoView ?
                { opacity: 1, borderBottomWidth: 1, borderColor: coinsMarket?.color }
                : { opacity: .5 }]}
            onPress={() => setInfoView(value)}
            mode="contained">
            {value}
        </Button>;
    }

    return (
        <View style={styles.screenContainer}>
            <View style={styles.graphContainer}>
                {memoizedLineGraph}
            </View>
            <View style={styles.tableContainer}>
                <View style={styles.modeButtonContainer}>
                    {infoViewControlButton("HOLDINGS")}
                    {infoViewControlButton("STATS")}
                </View>
                <ScrollView fadingEdgeLength={25}>
                    {infoView === "HOLDINGS" &&
                        <>
                            {coinsMarket && <CoinHoldingsPanel coinMarket={coinsMarket} />}
                            <TransactionHistoryTable
                                data={allTransactions.filter(transaction => {
                                    return transaction.coinId === coinsMarket?.id;
                                })}
                                db={db}
                            />
                        </>
                    }
                    {infoView === "STATS" && coinsMarket &&
                    <CoinStatsPanel coinsMarkets={coinsMarket} />}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        justifyContent: "flex-start",
        backgroundColor: "black",
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
        paddingTop: 10,
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
});
