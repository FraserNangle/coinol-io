import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function AddTransactionScreen() {
  const route = useRoute();

  // Retrieve the item parameter
  const { item } = route.params;

  return (
    <View style={styles.screenContainer}>
      <View style={styles.tableContainer}>
        <Text>{item.name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the start of the screen
    backgroundColor: "black",
  },
  tableContainer: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  searchBar: {
    backgroundColor: "black",
    fontWeight: "bold",
    color: "#fff",
  },
  ticker: {
    fontWeight: "200",
    color: "#fff",
  },
  bold: {
    fontWeight: "bold",
    color: "#fff",
  },
  normal: {
    color: "#fff",
  },
  rightAlign: {
    textAlign: "right",
  },
  leftAlign: {
    textAlign: "left",
  },
  column: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
  },
});
