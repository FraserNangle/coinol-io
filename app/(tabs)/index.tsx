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
import { Link } from "expo-router";
import { fetchUserFolio } from "../services/folioService";
import { useDispatch, useSelector } from "react-redux";
import { setTotalPortfolioPercentageChange24hr, setTotalPortfolioValue } from "../slices/totalPortfolioValueSlice";
import { setUserFolio } from "../slices/userFolioSlice";
import { RootState } from "../store/store";
import { DonutChart } from "@/components/index/donutChart/donutChart";
import { useSQLiteContext } from "expo-sqlite";
import { UserTransaction } from "../models/UserTransaction";

const CURRENCY_TYPE = "USD";

export default function TabOneScreen() {
  const db = useSQLiteContext();
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  let userFolio = useSelector((state: RootState) => state.userFolio.userFolio) || [];
  let lastTransaction = useSelector((state: RootState) => state.lastTransaction.transaction);

  useEffect(() => {
    db.execAsync(
      `CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        coinId TEXT NOT NULL,
        quantity REAL NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL
      );`
    );
  }, []);

  useEffect(() => {
    const transactions = db.getAllAsync<UserTransaction>('SELECT * FROM transactions');
    transactions.then((data) => console.log(data));
  }, [db]);

  useEffect(() => {
    fetchUserFolio().then((data) => {
      dispatch(setUserFolio(data));
    });
  }, []);

  useEffect(() => {
    fetchUserFolio().then((data) => {
      dispatch(setUserFolio(data));
    });
  }, [lastTransaction]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserFolio().then((data) => {
      dispatch(setUserFolio(data));
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    const totalPortfolioValue = userFolio.reduce(
      (total, item) => total + item.quantity * item.currentPrice,
      0
    );
    const totalPortfolioPercentageChange24hr = userFolio.reduce(
      (sum, folioEntry) => sum + folioEntry.priceChangePercentage24h, 0
    ) / userFolio.length;
    dispatch(setTotalPortfolioValue(totalPortfolioValue));
    dispatch(setTotalPortfolioPercentageChange24hr(totalPortfolioPercentageChange24hr));
  }, [userFolio, dispatch]);

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
              <DonutChart
                data={userFolio}
                width={screenWidth * 0.95}
                height={screenHeight / 2}
                backgroundColor={"black"}
                currencyTicker={CURRENCY_TYPE}
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
