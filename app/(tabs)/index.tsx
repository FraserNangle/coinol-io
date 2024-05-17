import React, { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Pressable,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { FolioTable } from "../components/foliotable";
import { DonutChart } from "../components/donutChart";
import { Link } from "expo-router";
import { FolioEntry } from "../models/FolioEntry";
import { fetchUserFolio } from "../services/folioService";
import { useDispatch } from "react-redux";
import { setTotalPortfolioValue, setTotalPortfolioValue24h } from "../slices/totalPortfolioValueSlice";

// Define the currency type
const CURRENCY_TYPE = "USD";

export default function TabOneScreen() {
  const screenWidth = Dimensions.get("window").width;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userFolio, setUserFolio] = useState<FolioEntry[]>([]);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchUserFolio().then(data => setUserFolio(data));
  }, []);

  useEffect(() => {
    const totalPortfolioValue = userFolio.reduce(
      (total, item) => total + item.quantity * item.currentPrice,
      0
    );
    const totalPortfolioValue24hr = userFolio.reduce(
      (total, item) => total + item.quantity * item.price24h,
      0
    );
    dispatch(setTotalPortfolioValue(totalPortfolioValue));
    dispatch(setTotalPortfolioValue24h(totalPortfolioValue24hr));
  }, [userFolio, dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey(refreshKey + 1); // increment the refreshKey
    setRefreshing(false);
  }, [refreshKey]);

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
                key={refreshKey}
                data={userFolio.map(({ name, quantity, currentPrice }) => ({
                  name,
                  quantity,
                  value: quantity * currentPrice,
                }))}
                width={screenWidth * 0.95}
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
    borderRadius: 10, // Rounded rectangle
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
