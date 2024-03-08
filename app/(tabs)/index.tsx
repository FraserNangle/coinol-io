import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import { View } from "@/components/Themed";
import { FolioTable } from "../components/foliotable";
import { DonutChart } from "../components/donutChart";
import { mockCoinAPI, mockCoins } from "../mocks/chartData";

// Define the currency type
const CURRENCY_TYPE = "USD";

export default function TabOneScreen() {
  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPortfolioValue = mockCoins.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
  const formattedTotalPortfolioValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY_TYPE,
  }).format(totalPortfolioValue);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey(refreshKey + 1); // increment the refreshKey

    // Replace this with your actual data fetching function
    const fetchData = async () => {
      return new Promise((resolve) => setTimeout(resolve, 2000));
    };

    fetchData().then(() => {
      setRefreshing(false);
    });
  }, [refreshKey]);

  const styles = StyleSheet.create({
    screenContainer: {
      minHeight: screenHeight + 1,
      flex: 1,
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
  });

  return (
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
          data={mockCoins.map(({ name, quantity, price }) => ({
            name,
            quantity,
            value: quantity * price,
          }))}
          width={screenWidth * 0.95}
          backgroundColor={"black"}
          currencyTicker={CURRENCY_TYPE}
        />
      </View>
      <View style={styles.tableContainer}>
        <FolioTable data={mockCoins} apiData={mockCoinAPI} />
      </View>
    </ScrollView>
  );
}
