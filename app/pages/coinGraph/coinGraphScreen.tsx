import React, { useState, useCallback, useEffect } from "react";
import {
    ScrollView,
    StyleSheet,
    RefreshControl,
    Dimensions,
    Pressable,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { FolioTable } from "@/components/index/folioTable/foliotable";
import { Link, useNavigation } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";
import { RootState } from "@/app/store/store";
import { fetchUserFolio } from "@/app/services/folioService";
import { setUserFolio } from "@/app/slices/userFolioSlice";
import { useRoute } from "@react-navigation/native";
import { CoinGraph } from "@/components/index/coinGraph/coinGraph";
import { FolioEntry } from "@/app/models/FolioEntry";
import { convertToCurrencyFormat } from "@/app/utils/convertToCurrencyValue";
import { Button } from "react-native-paper";
import { getPercentageChangeDisplay } from "@/app/utils/getPercentageChange";

const CURRENCY_TYPE = "USD";

type RouteParams = {
    folioEntry: FolioEntry;
};

export default function CoinGraphScreen() {
    const [timeRange, setTimeRange] = useState("24H");

    const db = useSQLiteContext();

    const dispatch = useDispatch();

    const route = useRoute();
    const { folioEntry }: { folioEntry: FolioEntry } = route.params as RouteParams;

    let userFolio = useSelector((state: RootState) => state.userFolio.userFolio) || [];

    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({ title: folioEntry.name });
    }, [navigation]);

    useEffect(() => {
        fetchUserFolio(db).then((data) => {
            dispatch(setUserFolio(data));
        });
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchUserFolio(db).then((data) => {
            dispatch(setUserFolio(data));
            setRefreshing(false);
        });
    }, []);

    const formattedCoinValue = convertToCurrencyFormat(folioEntry.currentPrice * folioEntry.quantity, CURRENCY_TYPE);

    const formatted24hChangeCoinValue = convertToCurrencyFormat(folioEntry.priceChange24h, CURRENCY_TYPE);

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
                userFolio.length > 0 && (
                    <View
                        style={styles.screenContainer}
                    >
                        <View style={styles.titleContainer}>
                            <View style={styles.subtitleContainer}>
                                <Text style={styles.headerTitle}>
                                    {formattedCoinValue}
                                </Text>
                            </View>

                            <View style={styles.subtitleContainer}>
                                <Text
                                >
                                    {formatted24hChangeCoinValue}
                                </Text>
                                <Text style={[
                                    styles.percentageContainer,
                                    folioEntry.priceChangePercentage24h > 0 ? styles.positive : styles.negative,
                                ]}
                                >
                                    {getPercentageChangeDisplay(folioEntry.priceChangePercentage24h)}%
                                </Text>
                            </View>
                        </View>
                        <CoinGraph
                            data={userFolio}
                        />
                        <View style={styles.buttonContainer}>
                            {timeRangeControlButton("24H")}
                            {timeRangeControlButton("7D")}
                            {timeRangeControlButton("1M")}
                            {timeRangeControlButton("1Y")}
                            {timeRangeControlButton("ALL")}
                        </View>
                        <View style={styles.tableContainer}>
                            <FolioTable data={userFolio} />
                        </View>
                    </View>
                )
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
    titleContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        padding: 10,
    },
    subtitleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    button: {
        margin: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
    },
    tableContainer: {
        flex: 1,
        justifyContent: "center",
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10,
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        textAlign: "center",
    },
    percentageContainer: {
        borderRadius: 10,
        marginLeft: 10,
        padding: 5,
    },
    positive: {
        color: "#00ff00",
    },
    negative: {
        color: "red",
    },
});