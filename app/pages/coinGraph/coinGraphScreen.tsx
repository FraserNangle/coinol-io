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
import { DonutChart } from "@/components/index/donutChart/donutChart";
import { useSQLiteContext } from "expo-sqlite";
import { RootState } from "@/app/store/store";
import { fetchUserFolio } from "@/app/services/folioService";
import { setUserFolio } from "@/app/slices/userFolioSlice";
import { useRoute } from "@react-navigation/native";
import { CoinGraph } from "@/components/index/coinGraph/coinGraph";

const CURRENCY_TYPE = "USD";

export default function CoinGraphScreen() {
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;
    const [refreshing, setRefreshing] = useState(false);

    const db = useSQLiteContext();

    const dispatch = useDispatch();

    const route = useRoute();
    const { folioEntry } = route.params;

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

    return (
        <>
            {
                userFolio.length === 0 && (
                    <View style={styles.container}>
                        <Link href="/plusMenu" asChild>
                            <Pressable>
                                {({ pressed }) => (
                                    <>
                                        <Text style={[styles.title, { opacity: pressed ? 0.5 : 1 }]}>
                                            You have no holdings yet!
                                        </Text>
                                        <Text style={[styles.title, { opacity: pressed ? 0.5 : 1 }]}>
                                            Tap here to get started.
                                        </Text>
                                    </>
                                )}
                            </Pressable>
                        </Link>
                    </View>
                )
            }
            {
                userFolio.length > 0 && (
                    <ScrollView
                        contentContainerStyle={styles.screenContainer}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        fadingEdgeLength={25}
                        removeClippedSubviews={true}
                    >
                        <View style={styles.donutContainer}>
                            <CoinGraph
                                data={userFolio}
                            />
                        </View>
                        <View style={styles.tableContainer}>
                            <FolioTable data={userFolio} />
                        </View>
                    </ScrollView>
                )
            }
        </>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        alignItems: "center",
        justifyContent: "flex-start", // Align items to the start of the screen
        backgroundColor: "black",
    },
    donutContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start", // Align items to the start of the container
        backgroundColor: "black",
    },
    tableContainer: {
        flex: 1,
        justifyContent: "center",
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10, // Rounded corners
    },
    tradeButtonContainer: {
        justifyContent: "center",
        width: "100%",
        backgroundColor: "black",
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
});
