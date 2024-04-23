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
import { mockCoinAPI } from "../mocks/chartData";
import { Link } from "expo-router";
import { deleteAllHoldings, getHoldings } from "@/app/services/coinStorageService";

// Define the currency type
const CURRENCY_TYPE = "USD";

export default function TabOneScreen() {
  const screenWidth = Dimensions.get("window").width;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userHoldings, setUserHoldings] = useState([]);

  /*   const totalPortfolioValue = userHoldings.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
    const formattedTotalPortfolioValue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: CURRENCY_TYPE,
    }).format(totalPortfolioValue); */

  useEffect(() => {
    assignHoldingsState();
  }, []);

  async function assignHoldingsState() {
    const holdings = await getHoldings();
    console.log(holdings);
    //setUserHoldings(holdings);
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey(refreshKey + 1); // increment the refreshKey
    assignHoldingsState();
    setRefreshing(false);
  }, [refreshKey]);

  return (
    <>
      {
        userHoldings.length === 0 && (
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
        userHoldings.length > 0 && (
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
                data={userHoldings.map(({ name, quantity, price }) => ({
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
              <FolioTable data={userHoldings} apiData={mockCoinAPI} />
            </View>
          </ScrollView>
        )
      }
    </>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    minHeight: Dimensions.get("window").height + 1,
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
