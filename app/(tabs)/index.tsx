import { ScrollView, StyleSheet, Text, useColorScheme } from "react-native";
import React from "react";

import { View } from "@/components/Themed";
import { FolioTable } from "../components/foliotable";
import { DonutChart } from "../components/donutChart";
import { mockCoins } from "../mocks/chartData";

export default function TabOneScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const currencySymbol = "$";
  const totalPortfolioValue = mockCoins.reduce((total, item) => total + (item.quantity * item.price), 0);
  const formattedTotalPortfolioValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPortfolioValue);

  const styles = StyleSheet.create({
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
      contentContainerStyle={styles.container}
      fadingEdgeLength={50}
      removeClippedSubviews={true}
    >
      <Text style={styles.textStyle}>{formattedTotalPortfolioValue}</Text>
      <View style={styles.container}>
        <DonutChart
          data={mockCoins.map(({ name, quantity, price }) => ({
            name,
            value: quantity * price,
          }))}
          backgroundColor={isDark ? 'black' : 'white'}
          currencySymbol={currencySymbol}
        />
      </View>
      <View style={styles.tableContainer}>
        <FolioTable data={mockCoins} />
      </View>
    </ScrollView>
  );
}