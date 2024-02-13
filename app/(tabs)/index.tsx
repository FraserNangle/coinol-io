import React, { useState, useCallback } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, RefreshControl, Dimensions } from "react-native";
import { View } from "@/components/Themed";
import { FolioTable } from "../components/foliotable";
import { DonutChart } from "../components/donutChart";
import { mockCoins } from "../mocks/chartData";

// Define the currency type
const CURRENCY_TYPE = 'USD';

// Define a mapping from currency codes to symbols
const CURRENCY_SYMBOLS = {
  'USD': '$',
  // Add more currencies as needed
};

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenHeight = Dimensions.get('window').height;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPortfolioValue = mockCoins.reduce((total, item) => total + (item.quantity * item.price), 0);
  const formattedTotalPortfolioValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY_TYPE }).format(totalPortfolioValue);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey(refreshKey + 1); // increment the refreshKey
  
    // Replace this with your actual data fetching function
    const fetchData = async () => {
      return new Promise(resolve => setTimeout(resolve, 2000));
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
      justifyContent: "center",
      backgroundColor: isDark ? 'black' : 'white',
    },
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? 'black' : 'white',
    },
    textStyle: {
      color: isDark ? 'white' : 'black',
      fontSize: 24,
      fontWeight: 'bold',
      padding: 10,
      backgroundColor: isDark ? 'black' : 'white',
    },
    tableContainer: {
      flex: 1,
      justifyContent: "center",
      width: "100%",
      backgroundColor: isDark ? 'rgba(0,0,0)' : 'rgba(255,255,255)',
    },
  });

  return (
    <ScrollView
      contentContainerStyle={styles.screenContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      fadingEdgeLength={50}
      removeClippedSubviews={true}
    >
      <Text style={styles.textStyle}>{formattedTotalPortfolioValue}</Text>
      <View style={styles.container}>
        <DonutChart
          key={refreshKey}
          data={mockCoins.map(({ name, quantity, price }) => ({
            name,
            value: quantity * price,
          }))}
          backgroundColor={isDark ? 'black' : 'white'}
          Symbol={CURRENCY_SYMBOLS[CURRENCY_TYPE]}
        />
      </View>
      <View style={styles.tableContainer}>
        <FolioTable data={mockCoins} />
      </View>
    </ScrollView>
  );
}